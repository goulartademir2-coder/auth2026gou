import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/responses';

// General API rate limiter
export const generalRateLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        success: false,
        error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests, please try again later'
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Strict rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per 15 minutes
    message: {
        success: false,
        error: {
            code: 'AUTH_RATE_LIMITED',
            message: 'Too many authentication attempts, please try again in 15 minutes'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use IP + potential username for more precise limiting
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const username = req.body?.username || '';
        return `${ip}:${username}`;
    }
});

// Key generation rate limiter
export const keyGenRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 key generations per minute
    message: {
        success: false,
        error: {
            code: 'KEY_GEN_RATE_LIMITED',
            message: 'Too many key generation requests'
        }
    }
});
