import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, ApiError } from '@/lib/api-utils';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, hwidLock = true, maxSessions = 1, minVersion, adminId } = body;

        if (!name) {
            throw ApiError.badRequest('App name is required');
        }

        // Get first admin if adminId not provided
        let finalAdminId = adminId;
        if (!finalAdminId) {
            const admin = await prisma.admin.findFirst();
            if (!admin) {
                throw ApiError.badRequest('No admin found. Initialize the system first.');
            }
            finalAdminId = admin.id;
        }

        const app = await prisma.app.create({
            data: {
                id: uuidv4(),
                adminId: finalAdminId,
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

export async function GET() {
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
                status: app.status,
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
