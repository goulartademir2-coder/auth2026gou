import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateKey } from '@/lib/crypto';
import { successResponse, handleApiError, ApiError } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { appId, count = 1, keyType = 'TIME', durationDays = 30, maxActivations = 1, note } = body;

        if (!appId) {
            throw ApiError.badRequest('App ID is required');
        }

        // Verify app exists
        const app = await prisma.app.findUnique({ where: { id: appId } });
        if (!app) {
            throw ApiError.notFound('App not found');
        }

        // Generate keys
        const keys = [];
        const expiresAt = keyType === 'LIFETIME'
            ? null
            : new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

        for (let i = 0; i < Math.min(count, 100); i++) {
            const key = await prisma.key.create({
                data: {
                    keyValue: generateKey(),
                    appId,
                    keyType,
                    durationDays: keyType === 'LIFETIME' ? null : durationDays,
                    maxActivations,
                    expiresAt,
                    note
                }
            });
            keys.push(key);
        }

        return successResponse({
            generated: keys.length,
            keys: keys.map(k => ({
                id: k.id,
                key: k.keyValue,
                keyType: k.keyType,
                durationDays: k.durationDays,
                expiresAt: k.expiresAt
            }))
        });

    } catch (error) {
        return handleApiError(error);
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const appId = searchParams.get('appId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

        const where = appId ? { appId } : {};

        const [keys, total] = await Promise.all([
            prisma.key.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { username: true } } }
            }),
            prisma.key.count({ where })
        ]);

        return successResponse({
            keys: keys.map(k => ({
                id: k.id,
                key: k.keyValue,
                keyType: k.keyType,
                isActive: k.isActive,
                user: k.user?.username || null,
                expiresAt: k.expiresAt,
                createdAt: k.createdAt
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        return handleApiError(error);
    }
}
