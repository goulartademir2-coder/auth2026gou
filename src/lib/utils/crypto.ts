import argon2 from 'argon2';
import crypto from 'crypto';

// Password hashing with Argon2id (recommended)
export async function hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4
    });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
        return await argon2.verify(hash, password);
    } catch {
        return false;
    }
}

// Generate secure random key
export function generateKey(prefix: string = 'GOU'): string {
    const segments = [];
    for (let i = 0; i < 4; i++) {
        segments.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return `${prefix}-${segments.join('-')}`;
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

// Generate app secret key
export function generateAppSecret(): string {
    return crypto.randomBytes(32).toString('base64url');
}

// Simple hash for non-sensitive data (like HWID comparison)
export function hashHwid(hwid: string): string {
    return crypto.createHash('sha256').update(hwid).digest('hex');
}
