import { sign, verify, Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'fallback-secret-change-me';

interface TokenPayload {
    userId: string;
    sessionId: string;
    type: 'access' | 'refresh';
}

export function generateAccessToken(userId: string, sessionId: string): string {
    const options: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any
    };

    return sign(
        { userId, sessionId, type: 'access' },
        JWT_SECRET,
        options
    );
}

export function generateRefreshToken(userId: string, sessionId: string): string {
    const options: SignOptions = {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any
    };

    return sign(
        { userId, sessionId, type: 'refresh' },
        JWT_SECRET,
        options
    );
}

export function verifyToken(token: string): TokenPayload | null {
    try {
        return verify(token, JWT_SECRET) as TokenPayload;
    } catch {
        return null;
    }
}
