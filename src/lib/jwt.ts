import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

interface TokenPayload {
    userId: string;
    sessionId: string;
    type: 'access' | 'refresh';
}

export function generateAccessToken(userId: string, sessionId: string): string {
    return jwt.sign(
        { userId, sessionId, type: 'access' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

export function generateRefreshToken(userId: string, sessionId: string): string {
    return jwt.sign(
        { userId, sessionId, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
}

export function verifyToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
        return null;
    }
}
