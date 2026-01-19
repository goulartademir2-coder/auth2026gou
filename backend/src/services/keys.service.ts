import { prisma } from '../lib/prisma';
import { generateKey } from '../utils/crypto';
import { ApiError } from '../utils/responses';
import { KeyType } from '@prisma/client';

interface GenerateKeysInput {
    appId: string;
    count: number;
    keyType: KeyType;
    durationDays?: number;
    maxUses?: number;
    maxActivations?: number;
    note?: string;
}

interface KeyFilters {
    appId: string;
    isActive?: boolean;
    keyType?: KeyType;
    isUsed?: boolean;
    page?: number;
    limit?: number;
}

export class KeyService {
    // Generate new keys
    async generateKeys(input: GenerateKeysInput) {
        const { appId, count, keyType, durationDays, maxUses, maxActivations = 1, note } = input;

        // Validate app exists
        const app = await prisma.app.findUnique({
            where: { id: appId }
        });

        if (!app) {
            throw ApiError.notFound('App not found', 'APP_NOT_FOUND');
        }

        const keys: string[] = [];
        const generatedKeys = [];

        for (let i = 0; i < count; i++) {
            let keyValue: string;
            let attempts = 0;

            // Ensure unique key
            do {
                keyValue = generateKey('GOU');
                attempts++;
            } while (keys.includes(keyValue) && attempts < 10);

            keys.push(keyValue);

            generatedKeys.push({
                appId,
                keyValue,
                keyType,
                durationDays: keyType === 'TIME' ? durationDays : null,
                maxUses: keyType === 'USES' ? maxUses : null,
                maxActivations,
                note
            });
        }

        await prisma.key.createMany({
            data: generatedKeys
        });

        return {
            count: generatedKeys.length,
            keys: keys
        };
    }

    // List keys with filters
    async listKeys(filters: KeyFilters) {
        const { appId, isActive, keyType, isUsed, page = 1, limit = 50 } = filters;
        const skip = (page - 1) * limit;

        const where: any = { appId };

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        if (keyType) {
            where.keyType = keyType;
        }

        if (isUsed !== undefined) {
            where.userId = isUsed ? { not: null } : null;
        }

        const [keys, total] = await Promise.all([
            prisma.key.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            hwid: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.key.count({ where })
        ]);

        return {
            keys,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // Get key details
    async getKey(keyId: string) {
        const key = await prisma.key.findUnique({
            where: { id: keyId },
            include: {
                user: true,
                app: {
                    select: { id: true, name: true }
                }
            }
        });

        if (!key) {
            throw ApiError.notFound('Key not found', 'KEY_NOT_FOUND');
        }

        return key;
    }

    // Toggle key active status
    async toggleKey(keyId: string) {
        const key = await prisma.key.findUnique({
            where: { id: keyId }
        });

        if (!key) {
            throw ApiError.notFound('Key not found', 'KEY_NOT_FOUND');
        }

        const updated = await prisma.key.update({
            where: { id: keyId },
            data: { isActive: !key.isActive }
        });

        return updated;
    }

    // Reset HWID for key's user
    async resetHwid(keyId: string, adminId: string) {
        const key = await prisma.key.findUnique({
            where: { id: keyId },
            include: { user: true }
        });

        if (!key) {
            throw ApiError.notFound('Key not found', 'KEY_NOT_FOUND');
        }

        if (!key.user) {
            throw ApiError.badRequest('Key has no associated user', 'NO_USER');
        }

        const oldHwid = key.user.hwid;

        await prisma.user.update({
            where: { id: key.user.id },
            data: { hwid: null }
        });

        await prisma.hwidLog.create({
            data: {
                userId: key.user.id,
                oldHwid,
                newHwid: 'RESET',
                resetBy: adminId,
                reason: 'Admin HWID reset'
            }
        });

        return { success: true, oldHwid };
    }

    // Delete key
    async deleteKey(keyId: string) {
        const key = await prisma.key.findUnique({
            where: { id: keyId }
        });

        if (!key) {
            throw ApiError.notFound('Key not found', 'KEY_NOT_FOUND');
        }

        await prisma.key.delete({
            where: { id: keyId }
        });

        return { success: true };
    }

    // Bulk delete keys
    async bulkDeleteKeys(keyIds: string[]) {
        const result = await prisma.key.deleteMany({
            where: { id: { in: keyIds } }
        });

        return { deleted: result.count };
    }

    // Get key statistics
    async getKeyStats(appId: string) {
        const [total, active, used, expired] = await Promise.all([
            prisma.key.count({ where: { appId } }),
            prisma.key.count({ where: { appId, isActive: true, userId: null } }),
            prisma.key.count({ where: { appId, userId: { not: null } } }),
            prisma.key.count({
                where: {
                    appId,
                    keyType: 'TIME',
                    expiresAt: { lt: new Date() }
                }
            })
        ]);

        return {
            total,
            active,
            used,
            expired,
            available: active
        };
    }
}

export const keyService = new KeyService();
