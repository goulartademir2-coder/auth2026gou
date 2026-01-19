import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword, hashHwid } from '../utils/crypto';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { ApiError } from '../utils/responses';
import { v4 as uuid } from 'uuid';

interface LoginInput {
    username: string;
    password: string;
    hwid?: string;
    appId: string;
    ipAddress?: string;
}

interface KeyLoginInput {
    key: string;
    hwid?: string;
    appId: string;
    ipAddress?: string;
}

interface RegisterInput {
    username: string;
    password: string;
    email?: string;
    appId: string;
}

export class AuthService {
    // Login with username and password
    async login(input: LoginInput) {
        const { username, password, hwid, appId, ipAddress } = input;

        // Check app exists and is online
        const app = await prisma.app.findUnique({
            where: { id: appId },
            include: { settings: true }
        });

        if (!app) {
            throw ApiError.notFound('App not found', 'APP_NOT_FOUND');
        }

        if (app.status === 'OFFLINE') {
            throw ApiError.forbidden('App is currently offline', 'APP_OFFLINE');
        }

        if (app.status === 'MAINTENANCE') {
            throw ApiError.forbidden('App is under maintenance', 'APP_MAINTENANCE');
        }

        // Find user
        const user = await prisma.user.findFirst({
            where: {
                appId,
                username
            }
        });

        if (!user || !user.passwordHash) {
            await this.logLogin(null, appId, ipAddress, hwid, false, 'Invalid credentials');
            throw ApiError.unauthorized('Invalid username or password', 'INVALID_CREDENTIALS');
        }

        // Check if banned
        if (user.isBanned) {
            await this.logLogin(user.id, appId, ipAddress, hwid, false, 'User banned');
            throw ApiError.forbidden(`Account banned: ${user.banReason || 'No reason provided'}`, 'USER_BANNED');
        }

        // Verify password
        const validPassword = await verifyPassword(password, user.passwordHash);
        if (!validPassword) {
            await this.logLogin(user.id, appId, ipAddress, hwid, false, 'Invalid password');
            throw ApiError.unauthorized('Invalid username or password', 'INVALID_CREDENTIALS');
        }

        // Check subscription expiration
        if (user.expiresAt && user.expiresAt < new Date()) {
            await this.logLogin(user.id, appId, ipAddress, hwid, false, 'Subscription expired');
            throw ApiError.forbidden('Your subscription has expired', 'SUBSCRIPTION_EXPIRED');
        }

        // HWID validation
        if (app.hwidLock && hwid) {
            if (user.hwid && user.hwid !== hwid) {
                await this.logLogin(user.id, appId, ipAddress, hwid, false, 'HWID mismatch');
                throw ApiError.forbidden('HWID mismatch. Please contact support to reset.', 'HWID_MISMATCH');
            }

            // Set HWID if not set
            if (!user.hwid) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { hwid }
                });

                await prisma.hwidLog.create({
                    data: {
                        userId: user.id,
                        oldHwid: null,
                        newHwid: hwid,
                        reason: 'First login HWID registration'
                    }
                });
            }
        }

        // Check concurrent sessions
        const activeSessions = await prisma.session.count({
            where: {
                userId: user.id,
                expiresAt: { gt: new Date() }
            }
        });

        if (activeSessions >= app.maxSessions) {
            // Delete oldest session
            const oldestSession = await prisma.session.findFirst({
                where: { userId: user.id },
                orderBy: { createdAt: 'asc' }
            });

            if (oldestSession) {
                await prisma.session.delete({ where: { id: oldestSession.id } });
            }
        }

        // Create session
        const session = await this.createSession(user.id, appId, hwid, ipAddress);

        await this.logLogin(user.id, appId, ipAddress, hwid, true, null);

        return {
            token: session.accessToken,
            refreshToken: session.refreshToken,
            sessionId: session.id,
            expiresAt: session.expiresAt,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                subscriptionExpires: user.expiresAt,
                createdAt: user.createdAt
            }
        };
    }

    // Login/activate with key
    async keyLogin(input: KeyLoginInput) {
        const { key, hwid, appId, ipAddress } = input;

        // Check app
        const app = await prisma.app.findUnique({
            where: { id: appId }
        });

        if (!app) {
            throw ApiError.notFound('App not found', 'APP_NOT_FOUND');
        }

        if (app.status !== 'ONLINE') {
            throw ApiError.forbidden('App is not available', 'APP_UNAVAILABLE');
        }

        // Find key
        const licenseKey = await prisma.key.findFirst({
            where: {
                keyValue: key,
                appId
            },
            include: { user: true }
        });

        if (!licenseKey) {
            await this.logLogin(null, appId, ipAddress, hwid, false, 'Invalid key');
            throw ApiError.unauthorized('Invalid license key', 'INVALID_KEY');
        }

        if (!licenseKey.isActive) {
            await this.logLogin(null, appId, ipAddress, hwid, false, 'Key disabled');
            throw ApiError.forbidden('This license key has been disabled', 'KEY_DISABLED');
        }

        // Check expiration for TIME type
        if (licenseKey.keyType === 'TIME' && licenseKey.expiresAt && licenseKey.expiresAt < new Date()) {
            await this.logLogin(licenseKey.userId, appId, ipAddress, hwid, false, 'Key expired');
            throw ApiError.forbidden('This license key has expired', 'KEY_EXPIRED');
        }

        // Check uses for USES type
        if (licenseKey.keyType === 'USES' && licenseKey.maxUses && licenseKey.currentUses >= licenseKey.maxUses) {
            throw ApiError.forbidden('This license key has no remaining uses', 'KEY_NO_USES');
        }

        let user = licenseKey.user;

        // If key is not activated yet
        if (!user) {
            if (licenseKey.currentActivations >= licenseKey.maxActivations) {
                throw ApiError.forbidden('This key has reached maximum activations', 'MAX_ACTIVATIONS');
            }

            // Create user from key
            user = await prisma.user.create({
                data: {
                    appId,
                    username: `key_${key.substring(0, 8)}`,
                    hwid: hwid || null,
                    expiresAt: licenseKey.keyType === 'TIME' && licenseKey.durationDays
                        ? new Date(Date.now() + licenseKey.durationDays * 24 * 60 * 60 * 1000)
                        : licenseKey.keyType === 'LIFETIME' ? null : null
                }
            });

            // Link key to user
            await prisma.key.update({
                where: { id: licenseKey.id },
                data: {
                    userId: user.id,
                    activatedAt: new Date(),
                    currentActivations: { increment: 1 },
                    expiresAt: licenseKey.keyType === 'TIME' && licenseKey.durationDays
                        ? new Date(Date.now() + licenseKey.durationDays * 24 * 60 * 60 * 1000)
                        : null
                }
            });

            if (hwid) {
                await prisma.hwidLog.create({
                    data: {
                        userId: user.id,
                        oldHwid: null,
                        newHwid: hwid,
                        reason: 'Key activation HWID registration'
                    }
                });
            }
        } else {
            // Key already activated - validate HWID
            if (app.hwidLock && hwid && user.hwid && user.hwid !== hwid) {
                await this.logLogin(user.id, appId, ipAddress, hwid, false, 'HWID mismatch');
                throw ApiError.forbidden('HWID mismatch', 'HWID_MISMATCH');
            }
        }

        // Increment uses for USES type
        if (licenseKey.keyType === 'USES') {
            await prisma.key.update({
                where: { id: licenseKey.id },
                data: { currentUses: { increment: 1 } }
            });
        }

        // Create session
        const session = await this.createSession(user.id, appId, hwid, ipAddress);

        await this.logLogin(user.id, appId, ipAddress, hwid, true, null);

        return {
            token: session.accessToken,
            refreshToken: session.refreshToken,
            sessionId: session.id,
            expiresAt: session.expiresAt,
            user: {
                id: user.id,
                username: user.username,
                subscriptionExpires: user.expiresAt,
                keyType: licenseKey.keyType
            }
        };
    }

    // Register new user
    async register(input: RegisterInput) {
        const { username, password, email, appId } = input;

        // Check app
        const app = await prisma.app.findUnique({
            where: { id: appId }
        });

        if (!app) {
            throw ApiError.notFound('App not found', 'APP_NOT_FOUND');
        }

        // Check if username exists
        const existingUser = await prisma.user.findFirst({
            where: { appId, username }
        });

        if (existingUser) {
            throw ApiError.conflict('Username already taken', 'USERNAME_EXISTS');
        }

        // Check email if provided
        if (email) {
            const emailExists = await prisma.user.findFirst({
                where: { appId, email }
            });

            if (emailExists) {
                throw ApiError.conflict('Email already registered', 'EMAIL_EXISTS');
            }
        }

        // Create user (without subscription - needs to activate key)
        const passwordHash = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                appId,
                username,
                email,
                passwordHash
            }
        });

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt
        };
    }

    // Activate key for existing user
    async activateKey(userId: string, keyValue: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
        }

        const key = await prisma.key.findFirst({
            where: {
                keyValue,
                appId: user.appId,
                userId: null // Not activated
            }
        });

        if (!key) {
            throw ApiError.notFound('Invalid or already used key', 'INVALID_KEY');
        }

        if (!key.isActive) {
            throw ApiError.forbidden('Key is disabled', 'KEY_DISABLED');
        }

        if (key.currentActivations >= key.maxActivations) {
            throw ApiError.forbidden('Key has reached maximum activations', 'MAX_ACTIVATIONS');
        }

        const expiresAt = key.keyType === 'TIME' && key.durationDays
            ? new Date(Date.now() + key.durationDays * 24 * 60 * 60 * 1000)
            : key.keyType === 'LIFETIME' ? null : user.expiresAt;

        // Update user expiration
        await prisma.user.update({
            where: { id: userId },
            data: { expiresAt }
        });

        // Link key
        await prisma.key.update({
            where: { id: key.id },
            data: {
                userId,
                activatedAt: new Date(),
                currentActivations: { increment: 1 },
                expiresAt
            }
        });

        return {
            success: true,
            expiresAt,
            keyType: key.keyType
        };
    }

    // Logout
    async logout(sessionId: string) {
        await prisma.session.delete({
            where: { id: sessionId }
        }).catch(() => { });

        return { success: true };
    }

    // Validate session
    async validateSession(sessionId: string) {
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: { user: true }
        });

        if (!session) {
            throw ApiError.unauthorized('Session not found', 'SESSION_NOT_FOUND');
        }

        if (session.expiresAt < new Date()) {
            await prisma.session.delete({ where: { id: sessionId } });
            throw ApiError.unauthorized('Session expired', 'SESSION_EXPIRED');
        }

        return {
            valid: true,
            user: {
                id: session.user.id,
                username: session.user.username,
                expiresAt: session.user.expiresAt
            },
            sessionExpiresAt: session.expiresAt
        };
    }

    // Private helpers
    private async createSession(userId: string, appId: string, hwid?: string, ipAddress?: string) {
        const sessionId = uuid();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const accessToken = generateAccessToken({ userId, appId, sessionId });
        const refreshToken = generateRefreshToken({ userId, appId, sessionId });

        await prisma.session.create({
            data: {
                id: sessionId,
                userId,
                token: accessToken,
                hwid,
                ipAddress,
                expiresAt
            }
        });

        return {
            id: sessionId,
            accessToken,
            refreshToken,
            expiresAt
        };
    }

    private async logLogin(
        userId: string | null,
        appId: string,
        ipAddress?: string,
        hwid?: string,
        success: boolean = false,
        failureReason?: string | null
    ) {
        await prisma.loginLog.create({
            data: {
                userId,
                appId,
                ipAddress,
                hwid,
                success,
                failureReason
            }
        });
    }
}

export const authService = new AuthService();
