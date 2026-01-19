import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/crypto';
import { generateAccessToken } from '@/lib/jwt';
import { successResponse, handleApiError, ApiError } from '@/lib/api-utils';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            throw ApiError.badRequest('Missing username or password');
        }

        // Find admin
        const admin = await prisma.admin.findUnique({ where: { username } });
        if (!admin) {
            throw ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
        }

        // Verify password
        if (!(await verifyPassword(password, admin.password))) {
            throw ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
        }

        // Generate token
        const sessionId = uuidv4();
        const token = generateAccessToken(admin.id, sessionId);

        // Update last login
        await prisma.admin.update({
            where: { id: admin.id },
            data: { lastLoginAt: new Date() }
        });

        return successResponse({
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                isSuperAdmin: admin.isSuperAdmin
            }
        });

    } catch (error) {
        return handleApiError(error);
    }
}
