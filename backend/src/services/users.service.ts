import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/responses';

interface UserFilters {
    appId: string;
    isBanned?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export class UserService {
    // List users with filters
    async listUsers(filters: UserFilters) {
        const { appId, isBanned, search, page = 1, limit = 50 } = filters;
        const skip = (page - 1) * limit;

        const where: any = { appId };

        if (isBanned !== undefined) {
            where.isBanned = isBanned;
        }

        if (search) {
            where.OR = [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    hwid: true,
                    isBanned: true,
                    banReason: true,
                    createdAt: true,
                    expiresAt: true,
                    _count: {
                        select: {
                            sessions: true,
                            keys: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.user.count({ where })
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // Get user details
    async getUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                keys: {
                    select: {
                        id: true,
                        keyValue: true,
                        keyType: true,
                        isActive: true,
                        expiresAt: true,
                        activatedAt: true
                    }
                },
                sessions: {
                    select: {
                        id: true,
                        ipAddress: true,
                        createdAt: true,
                        expiresAt: true
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                hwidLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                loginLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                }
            }
        });

        if (!user) {
            throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
        }

        return user;
    }

    // Ban user
    async banUser(userId: string, reason?: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
        }

        // Delete all active sessions
        await prisma.session.deleteMany({
            where: { userId }
        });

        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                isBanned: true,
                banReason: reason || 'Banned by admin'
            }
        });

        return updated;
    }

    // Unban user
    async unbanUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                isBanned: false,
                banReason: null
            }
        });

        return updated;
    }

    // Reset user HWID
    async resetHwid(userId: string, adminId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
        }

        const oldHwid = user.hwid;

        await prisma.user.update({
            where: { id: userId },
            data: { hwid: null }
        });

        await prisma.hwidLog.create({
            data: {
                userId,
                oldHwid,
                newHwid: 'RESET',
                resetBy: adminId,
                reason: 'Admin HWID reset'
            }
        });

        return { success: true, oldHwid };
    }

    // Delete user
    async deleteUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
        }

        await prisma.user.delete({
            where: { id: userId }
        });

        return { success: true };
    }

    // Extend user subscription
    async extendSubscription(userId: string, days: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
        }

        const currentExpiry = user.expiresAt || new Date();
        const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { expiresAt: newExpiry }
        });

        return { expiresAt: updated.expiresAt };
    }

    // Get user statistics for an app
    async getUserStats(appId: string) {
        const now = new Date();

        const [total, active, banned, expired, online] = await Promise.all([
            prisma.user.count({ where: { appId } }),
            prisma.user.count({
                where: {
                    appId,
                    isBanned: false,
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: now } }
                    ]
                }
            }),
            prisma.user.count({ where: { appId, isBanned: true } }),
            prisma.user.count({
                where: {
                    appId,
                    expiresAt: { lt: now }
                }
            }),
            prisma.session.count({
                where: {
                    user: { appId },
                    expiresAt: { gt: now }
                }
            })
        ]);

        return {
            total,
            active,
            banned,
            expired,
            online
        };
    }
}

export const userService = new UserService();
