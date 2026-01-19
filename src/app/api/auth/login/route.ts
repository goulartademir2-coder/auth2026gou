import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashHwid } from '@/lib/crypto';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { successResponse, handleApiError, ApiError } from '@/lib/api-utils';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password, hwid, appId } = body;

        if (!username || !password || !hwid || !appId) {
            throw ApiError.badRequest('Missing required fields');
        }

        // Find app
        const app = await prisma.app.findUnique({ where: { id: appId } });
        if (!app || app.status !== 'ONLINE') {
            throw ApiError.notFound('App not found or inactive');
        }

        // Find user
        const user = await prisma.user.findFirst({
            where: { username, appId }
        });

        if (!user) {
            throw ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
        }

        // Check password
        if (!user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
            throw ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
        }

        // Check if banned
        if (user.isBanned) {
            throw ApiError.forbidden('User is banned', 'USER_BANNED');
        }

        // Check subscription
        if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
            throw ApiError.forbidden('Subscription expired', 'SUBSCRIPTION_EXPIRED');
        }

        // HWID check
        const hwidHash = hashHwid(hwid);
        if (app.hwidLock && user.hwid && user.hwid !== hwidHash) {
            throw ApiError.forbidden('HWID mismatch', 'HWID_MISMATCH');
        }

        // Update HWID if not set
        if (!user.hwid) {
            await prisma.user.update({
                where: { id: user.id },
                data: { hwid: hwidHash }
            });
        }

        // Create session
        const sessionId = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await prisma.session.create({
            data: {
                id: sessionId,
                userId: user.id,
                token: uuidv4(),
                hwid: hwidHash,
                ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                expiresAt
            }
        });

        // Generate tokens
        const token = generateAccessToken(user.id, sessionId);
        const refreshToken = generateRefreshToken(user.id, sessionId);

        // Log login
        await prisma.loginLog.create({
            data: {
                userId: user.id,
                appId,
                ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                hwid: hwidHash,
                success: true
            }
        });

        return successResponse({
            token,
            refreshToken,
            sessionId,
            expiresAt,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                expiresAt: user.expiresAt
            }
        });

    } catch (error) {
        return handleApiError(error);
    }
}
