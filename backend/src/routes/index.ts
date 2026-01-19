import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { keysController } from '../controllers/keys.controller';
import { usersController } from '../controllers/users.controller';
import { appsController } from '../controllers/apps.controller';
import { adminController } from '../controllers/admin.controller';
import { authenticateUser, authenticateAdmin, requireSuperAdmin } from '../middleware/auth.middleware';
import { authRateLimiter, keyGenRateLimiter } from '../middleware/rateLimit.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

// ==================== Validation Schemas ====================
const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
    hwid: z.string().optional(),
    appId: z.string().uuid()
});

const keyLoginSchema = z.object({
    key: z.string().min(1),
    hwid: z.string().optional(),
    appId: z.string().uuid()
});

const registerSchema = z.object({
    username: z.string().min(3).max(32),
    password: z.string().min(6),
    email: z.string().email().optional(),
    appId: z.string().uuid()
});

const generateKeysSchema = z.object({
    appId: z.string().uuid(),
    count: z.number().min(1).max(100),
    keyType: z.enum(['TIME', 'LIFETIME', 'USES']),
    durationDays: z.number().optional(),
    maxUses: z.number().optional(),
    maxActivations: z.number().optional(),
    note: z.string().optional()
});

const adminLoginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1)
});

const createAdminSchema = z.object({
    username: z.string().min(3).max(32),
    email: z.string().email(),
    password: z.string().min(6),
    isSuperAdmin: z.boolean().optional()
});

const createAppSchema = z.object({
    name: z.string().min(1).max(100),
    hwidLock: z.boolean().optional(),
    maxSessions: z.number().optional()
});

// ==================== Auth Routes (Public for SDK) ====================
router.post('/auth/login', authRateLimiter, validateBody(loginSchema), authController.login);
router.post('/auth/key', authRateLimiter, validateBody(keyLoginSchema), authController.keyLogin);
router.post('/auth/register', authRateLimiter, validateBody(registerSchema), authController.register);

// Auth Routes (Protected)
router.post('/auth/activate', authenticateUser, authController.activateKey);
router.post('/auth/logout', authenticateUser, authController.logout);
router.get('/auth/session', authenticateUser, authController.validateSession);

// ==================== Admin Auth Routes ====================
router.post('/admin/login', authRateLimiter, validateBody(adminLoginSchema), adminController.login);
router.post('/admin/init', adminController.initializeSuperAdmin);

// Admin Routes (Protected)
router.get('/admin/profile', authenticateAdmin, adminController.getProfile);
router.put('/admin/password', authenticateAdmin, adminController.updatePassword);
router.post('/admin/create', authenticateAdmin, requireSuperAdmin, validateBody(createAdminSchema), adminController.createAdmin);
router.get('/admin/list', authenticateAdmin, requireSuperAdmin, adminController.listAdmins);

// ==================== Apps Routes (Admin) ====================
router.post('/apps', authenticateAdmin, validateBody(createAppSchema), appsController.createApp);
router.get('/apps', authenticateAdmin, appsController.listApps);
router.get('/apps/:id', authenticateAdmin, appsController.getApp);
router.put('/apps/:id', authenticateAdmin, appsController.updateApp);
router.put('/apps/:id/settings', authenticateAdmin, appsController.updateSettings);
router.post('/apps/:id/regenerate-secret', authenticateAdmin, appsController.regenerateSecret);
router.delete('/apps/:id', authenticateAdmin, appsController.deleteApp);
router.get('/apps/:id/stats', authenticateAdmin, appsController.getStats);
router.post('/apps/validate', appsController.validateApp); // For SDK validation

// ==================== Keys Routes (Admin) ====================
router.post('/keys/generate', authenticateAdmin, keyGenRateLimiter, validateBody(generateKeysSchema), keysController.generateKeys);
router.get('/keys', authenticateAdmin, keysController.listKeys);
router.get('/keys/stats', authenticateAdmin, keysController.getStats);
router.get('/keys/:id', authenticateAdmin, keysController.getKey);
router.put('/keys/:id/toggle', authenticateAdmin, keysController.toggleKey);
router.post('/keys/:id/reset-hwid', authenticateAdmin, keysController.resetHwid);
router.delete('/keys/:id', authenticateAdmin, keysController.deleteKey);
router.post('/keys/bulk-delete', authenticateAdmin, keysController.bulkDelete);

// ==================== Users Routes (Admin) ====================
router.get('/users', authenticateAdmin, usersController.listUsers);
router.get('/users/stats', authenticateAdmin, usersController.getStats);
router.get('/users/:id', authenticateAdmin, usersController.getUser);
router.put('/users/:id/ban', authenticateAdmin, usersController.banUser);
router.put('/users/:id/unban', authenticateAdmin, usersController.unbanUser);
router.post('/users/:id/reset-hwid', authenticateAdmin, usersController.resetHwid);
router.post('/users/:id/extend', authenticateAdmin, usersController.extendSubscription);
router.delete('/users/:id', authenticateAdmin, usersController.deleteUser);

export default router;
