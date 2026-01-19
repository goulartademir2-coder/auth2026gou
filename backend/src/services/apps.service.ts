import { prisma } from '../lib/prisma';
import { generateAppSecret } from '../utils/crypto';
import { ApiError } from '../utils/responses';
import { AppStatus } from '@prisma/client';

interface CreateAppInput {
    adminId: string;
    name: string;
    hwidLock?: boolean;
    maxSessions?: number;
}

interface UpdateAppInput {
    name?: string;
    status?: AppStatus;
    minVersion?: string;
    hwidLock?: boolean;
    maxSessions?: number;
}

export class AppService {
    // Create new app
    async createApp(input: CreateAppInput) {
        const { adminId, name, hwidLock = true, maxSessions = 1 } = input;

        const secretKey = generateAppSecret();

        const app = await prisma.app.create({
            data: {
                adminId,
                name,
                secretKey,
                hwidLock,
                maxSessions,
                settings: {
                    create: {}
                }
            },
            include: { settings: true }
        });

        return app;
    }

    // List apps for admin
    async listApps(adminId: string) {
        const apps = await prisma.app.findMany({
            where: { adminId },
            include: {
                _count: {
                    select: {
                        users: true,
                        keys: true
                    }
                },
                settings: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return apps;
    }

    // Get app details
    async getApp(appId: string, adminId: string) {
        const app = await prisma.app.findFirst({
            where: {
                id: appId,
                adminId
            },
            include: {
                settings: true,
                _count: {
                    select: {
                        users: true,
                        keys: true
                    }
                }
            }
        });

        if (!app) {
            throw ApiError.notFound('App not found', 'APP_NOT_FOUND');
        }

        return app;
    }

    // Update app
    async updateApp(appId: string, adminId: string, input: UpdateAppInput) {
        const app = await prisma.app.findFirst({
            where: { id: appId, adminId }
        });

        if (!app) {
            throw ApiError.notFound('App not found', 'APP_NOT_FOUND');
        }

        const updated = await prisma.app.update({
            where: { id: appId },
            data: input,
            include: { settings: true }
        });

        return updated;
    }

    // Update app settings
    async updateAppSettings(appId: string, adminId: string, settings: any) {
        const app = await prisma.app.findFirst({
            where: { id: appId, adminId }
        });

        if (!app) {
            throw ApiError.notFound('App not found', 'APP_NOT_FOUND');
        }

        const updated = await prisma.appSettings.update({
            where: { appId },
            data: settings
        });

        return updated;
    }

    // Regenerate secret key
    async regenerateSecret(appId: string, adminId: string) {
        const app = await prisma.app.findFirst({
            where: { id: appId, adminId }
        });

        if (!app) {
            throw ApiError.notFound('App not found', 'APP_NOT_FOUND');
        }

        const newSecret = generateAppSecret();

        await prisma.app.update({
            where: { id: appId },
            data: { secretKey: newSecret }
        });

        return { secretKey: newSecret };
    }

    // Delete app
    async deleteApp(appId: string, adminId: string) {
        const app = await prisma.app.findFirst({
            where: { id: appId, adminId }
        });

        if (!app) {
            throw ApiError.notFound('App not found', 'APP_NOT_FOUND');
        }

        await prisma.app.delete({
            where: { id: appId }
        });

        return { success: true };
    }

    // Get app statistics
    async getAppStats(appId: string, adminId: string) {
        const app = await prisma.app.findFirst({
            where: { id: appId, adminId }
        });

        if (!app) {
            throw ApiError.notFound('App not found', 'APP_NOT_FOUND');
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            activeUsers,
            totalKeys,
            usedKeys,
            onlineSessions,
            loginsToday,
            loginsWeek,
            loginsMonth
        ] = await Promise.all([
            prisma.user.count({ where: { appId } }),
            prisma.user.count({
                where: {
                    appId,
                    isBanned: false,
                    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }]
                }
            }),
            prisma.key.count({ where: { appId } }),
            prisma.key.count({ where: { appId, userId: { not: null } } }),
            prisma.session.count({
                where: { user: { appId }, expiresAt: { gt: now } }
            }),
            prisma.loginLog.count({
                where: {
                    appId,
                    success: true,
                    createdAt: { gt: new Date(now.setHours(0, 0, 0, 0)) }
                }
            }),
            prisma.loginLog.count({
                where: { appId, success: true, createdAt: { gt: sevenDaysAgo } }
            }),
            prisma.loginLog.count({
                where: { appId, success: true, createdAt: { gt: thirtyDaysAgo } }
            })
        ]);

        return {
            users: {
                total: totalUsers,
                active: activeUsers
            },
            keys: {
                total: totalKeys,
                used: usedKeys,
                available: totalKeys - usedKeys
            },
            sessions: {
                online: onlineSessions
            },
            logins: {
                today: loginsToday,
                week: loginsWeek,
                month: loginsMonth
            }
        };
    }

    // Validate app secret (for SDK authentication)
    async validateAppSecret(appId: string, secretKey: string) {
        const app = await prisma.app.findUnique({
            where: { id: appId }
        });

        if (!app || app.secretKey !== secretKey) {
            throw ApiError.unauthorized('Invalid app credentials', 'INVALID_APP_CREDENTIALS');
        }

        return {
            valid: true,
            appId: app.id,
            name: app.name,
            status: app.status
        };
    }
}

export const appService = new AppService();
