import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { successResponse } from '../utils/responses';

export class AdminController {
    // POST /api/admin/login
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password } = req.body;

            const result = await adminService.login({ username, password });

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // POST /api/admin/create
    async createAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const createdBy = req.admin!.id;
            const { username, email, password, isSuperAdmin } = req.body;

            const result = await adminService.createAdmin({
                username,
                email,
                password,
                isSuperAdmin
            }, createdBy);

            res.status(201).json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // GET /api/admin/list
    async listAdmins(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminService.listAdmins();

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // GET /api/admin/profile
    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.id;

            const result = await adminService.getProfile(adminId);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/admin/password
    async updatePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.id;
            const { currentPassword, newPassword } = req.body;

            const result = await adminService.updatePassword(adminId, currentPassword, newPassword);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // POST /api/admin/init
    async initializeSuperAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminService.initializeSuperAdmin();

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }
}

export const adminController = new AdminController();
