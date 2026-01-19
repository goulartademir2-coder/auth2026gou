import * as argon2 from 'argon2';
import { randomBytes, createHash } from 'crypto';

export async function hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
    });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
        return await argon2.verify(hash, password);
    } catch {
        return false;
    }
}

export function generateKey(prefix = 'GOU'): string {
    const segments = Array.from({ length: 3 }, () =>
        randomBytes(2).toString('hex').toUpperCase()
    );
    return `${prefix}-${segments.join('-')}`;
}

export function generateToken(length = 32): string {
    return randomBytes(length).toString('hex');
}

export function hashHwid(hwid: string): string {
    return createHash('sha256').update(hwid).digest('hex');
}
