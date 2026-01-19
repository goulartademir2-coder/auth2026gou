import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiError } from '@/lib/api-utils';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, hwidLock = true, maxSessions = 1, minVersion } = body;

        if (!name) {
            throw ApiError.badRequest('App name is required');
        }

        const app = await prisma.app.create({
            data: {
                id: uuidv4(),
                name,
                secretKey: `sk_${uuidv4().replace(/-/g, '')}`,
                hwidLock,
                maxSessions,
                minVersion
            }
        });

        return successResponse({
            id: app.id,
            name: app.name,
            secretKey: app.secretKey,
            hwidLock: app.hwidLock,
            maxSessions: app.maxSessions
        });

    } catch (error) {
        return handleApiError(error);
    }
}

export async function GET(request: NextRequest) {
    try {
        const apps = await prisma.app.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { users: true, keys: true }
                }
            }
        });

        return successResponse({
            apps: apps.map(app => ({
                id: app.id,
                name: app.name,
                isActive: app.isActive,
                hwidLock: app.hwidLock,
                users: app._count.users,
                keys: app._count.keys,
                createdAt: app.createdAt
            }))
        });

    } catch (error) {
        return handleApiError(error);
    }
}
