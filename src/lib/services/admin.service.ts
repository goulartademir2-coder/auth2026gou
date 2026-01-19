import { prisma } from '../lib/prisma';
import { hashPassword } from '../utils/crypto';
import { generateAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/responses';
import { v4 as uuid } from 'uuid';

interface AdminLoginInput {
    username: string;
    password: string;
}

interface CreateAdminInput {
    username: string;
    email: string;
    password: string;
    isSuperAdmin?: boolean;
}

export class AdminService {
    // Admin login
    async login(input: AdminLoginInput) {
        const { username, password } = input;

        const admin = await prisma.admin.findFirst({
            where: {
                OR: [
                    { username },
                    { email: username }
                ]
            }
        });

        if (!admin) {
            throw ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
        }

        const { verifyPassword } = await import('../utils/crypto');
        const valid = await verifyPassword(password, admin.passwordHash);

        if (!valid) {
            throw ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
        }

        const sessionId = uuid();
        const token = generateAccessToken({
            userId: admin.id,
            appId: 'admin',
            sessionId
        });

        return {
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                isSuperAdmin: admin.isSuperAdmin
            }
        };
    }

    // Create new admin (super admin only)
    async createAdmin(input: CreateAdminInput, createdBy: string) {
        const { username, email, password, isSuperAdmin = false } = input;

        // Check if creator is super admin
        const creator = await prisma.admin.findUnique({
            where: { id: createdBy }
        });

        if (!creator?.isSuperAdmin) {
            throw ApiError.forbidden('Only super admins can create new admins', 'NOT_SUPER_ADMIN');
        }

        // Check duplicates
        const existing = await prisma.admin.findFirst({
            where: {
                OR: [{ username }, { email }]
            }
        });

        if (existing) {
            throw ApiError.conflict('Username or email already exists', 'ADMIN_EXISTS');
        }

        const passwordHash = await hashPassword(password);

        const admin = await prisma.admin.create({
            data: {
                username,
                email,
                passwordHash,
                isSuperAdmin
            }
        });

        return {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            isSuperAdmin: admin.isSuperAdmin
        };
    }

    // List all admins
    async listAdmins() {
        const admins = await prisma.admin.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                isSuperAdmin: true,
                createdAt: true,
                _count: {
                    select: { apps: true }
                }
            }
        });

        return admins;
    }

    // Get current admin profile
    async getProfile(adminId: string) {
        const admin = await prisma.admin.findUnique({
            where: { id: adminId },
            include: {
                _count: {
                    select: { apps: true }
                }
            }
        });

        if (!admin) {
            throw ApiError.notFound('Admin not found', 'ADMIN_NOT_FOUND');
        }

        return {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            isSuperAdmin: admin.isSuperAdmin,
            createdAt: admin.createdAt,
            appsCount: admin._count.apps
        };
    }

    // Update password
    async updatePassword(adminId: string, currentPassword: string, newPassword: string) {
        const admin = await prisma.admin.findUnique({
            where: { id: adminId }
        });

        if (!admin) {
            throw ApiError.notFound('Admin not found', 'ADMIN_NOT_FOUND');
        }

        const { verifyPassword } = await import('../utils/crypto');
        const valid = await verifyPassword(currentPassword, admin.passwordHash);

        if (!valid) {
            throw ApiError.unauthorized('Current password is incorrect', 'INVALID_PASSWORD');
        }

        const passwordHash = await hashPassword(newPassword);

        await prisma.admin.update({
            where: { id: adminId },
            data: { passwordHash }
        });

        return { success: true };
    }

    // Initialize first super admin
    async initializeSuperAdmin() {
        const adminExists = await prisma.admin.findFirst();

        if (adminExists) {
            return { exists: true, message: 'Admin already exists' };
        }

        const username = process.env.ADMIN_USERNAME || 'admin';
        const email = process.env.ADMIN_EMAIL || 'admin@gouauth.com';
        const password = process.env.ADMIN_PASSWORD || 'admin123';

        const passwordHash = await hashPassword(password);

        const admin = await prisma.admin.create({
            data: {
                username,
                email,
                passwordHash,
                isSuperAdmin: true
            }
        });

        return {
            created: true,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email
            }
        };
    }
}

export const adminService = new AdminService();
