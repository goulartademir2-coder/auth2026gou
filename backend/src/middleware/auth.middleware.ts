import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { ApiError } from '../utils/responses';
import { prisma } from '../lib/prisma';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
            admin?: {
                id: string;
                username: string;
                isSuperAdmin: boolean;
            };
        }
    }
}

// Authenticate user sessions (for client SDK)
export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw ApiError.unauthorized('No token provided', 'NO_TOKEN');
        }

        const token = authHeader.substring(7);
        const payload = verifyToken(token);

        if (!payload) {
            throw ApiError.unauthorized('Invalid or expired token', 'INVALID_TOKEN');
        }

        if (payload.type !== 'access') {
            throw ApiError.unauthorized('Invalid token type', 'INVALID_TOKEN_TYPE');
        }

        // Verify session still exists
        const session = await prisma.session.findUnique({
            where: { id: payload.sessionId }
        });

        if (!session || session.expiresAt < new Date()) {
            throw ApiError.unauthorized('Session expired', 'SESSION_EXPIRED');
        }

        req.user = payload;
        next();
    } catch (error) {
        next(error);
    }
}

// Authenticate admin users (for dashboard)
export async function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw ApiError.unauthorized('No token provided', 'NO_TOKEN');
        }

        const token = authHeader.substring(7);
        const payload = verifyToken(token);

        if (!payload) {
            throw ApiError.unauthorized('Invalid or expired token', 'INVALID_TOKEN');
        }

        // For admin tokens, userId refers to admin id
        const admin = await prisma.admin.findUnique({
            where: { id: payload.userId }
        });

        if (!admin) {
            throw ApiError.unauthorized('Admin not found', 'ADMIN_NOT_FOUND');
        }

        req.admin = {
            id: admin.id,
            username: admin.username,
            isSuperAdmin: admin.isSuperAdmin
        };

        next();
    } catch (error) {
        next(error);
    }
}

// Require super admin privileges
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.admin?.isSuperAdmin) {
        return next(ApiError.forbidden('Super admin access required', 'SUPER_ADMIN_REQUIRED'));
    }
    next();
}
