import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/users.service';
import { successResponse } from '../utils/responses';

export class UsersController {
    // GET /api/users
    async listUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const { appId, isBanned, search, page, limit } = req.query;

            const result = await userService.listUsers({
                appId: appId as string,
                isBanned: isBanned === 'true' ? true : isBanned === 'false' ? false : undefined,
                search: search as string | undefined,
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 50
            });

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // GET /api/users/:id
    async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const result = await userService.getUser(id);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/users/:id/ban
    async banUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const result = await userService.banUser(id, reason);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/users/:id/unban
    async unbanUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const result = await userService.unbanUser(id);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // POST /api/users/:id/reset-hwid
    async resetHwid(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const adminId = req.admin!.id;

            const result = await userService.resetHwid(id, adminId);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/users/:id
    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const result = await userService.deleteUser(id);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // POST /api/users/:id/extend
    async extendSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { days } = req.body;

            const result = await userService.extendSubscription(id, days);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // GET /api/users/stats
    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { appId } = req.query;

            const result = await userService.getUserStats(appId as string);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }
}

export const usersController = new UsersController();
