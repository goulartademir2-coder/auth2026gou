import { Request, Response, NextFunction } from 'express';
import { appService } from '../services/apps.service';
import { successResponse } from '../utils/responses';

export class AppsController {
    // POST /api/apps
    async createApp(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.id;
            const { name, hwidLock, maxSessions } = req.body;

            const result = await appService.createApp({
                adminId,
                name,
                hwidLock,
                maxSessions
            });

            res.status(201).json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // GET /api/apps
    async listApps(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.id;

            const result = await appService.listApps(adminId);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // GET /api/apps/:id
    async getApp(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.id;
            const { id } = req.params;

            const result = await appService.getApp(id, adminId);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/apps/:id
    async updateApp(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.id;
            const { id } = req.params;
            const { name, status, minVersion, hwidLock, maxSessions } = req.body;

            const result = await appService.updateApp(id, adminId, {
                name,
                status,
                minVersion,
                hwidLock,
                maxSessions
            });

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/apps/:id/settings
    async updateSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.id;
            const { id } = req.params;
            const settings = req.body;

            const result = await appService.updateAppSettings(id, adminId, settings);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // POST /api/apps/:id/regenerate-secret
    async regenerateSecret(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.id;
            const { id } = req.params;

            const result = await appService.regenerateSecret(id, adminId);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/apps/:id
    async deleteApp(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.id;
            const { id } = req.params;

            const result = await appService.deleteApp(id, adminId);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // GET /api/apps/:id/stats
    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.id;
            const { id } = req.params;

            const result = await appService.getAppStats(id, adminId);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // POST /api/apps/validate (for SDK)
    async validateApp(req: Request, res: Response, next: NextFunction) {
        try {
            const { appId, secretKey } = req.body;

            const result = await appService.validateAppSecret(appId, secretKey);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }
}

export const appsController = new AppsController();
