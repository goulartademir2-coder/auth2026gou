import { Request, Response, NextFunction } from 'express';
import { keyService } from '../services/keys.service';
import { successResponse } from '../utils/responses';
import { KeyType } from '@prisma/client';

export class KeysController {
    // POST /api/keys/generate
    async generateKeys(req: Request, res: Response, next: NextFunction) {
        try {
            const { appId, count, keyType, durationDays, maxUses, maxActivations, note } = req.body;

            const result = await keyService.generateKeys({
                appId,
                count: Math.min(count, 100), // Max 100 keys at once
                keyType: keyType as KeyType,
                durationDays,
                maxUses,
                maxActivations,
                note
            });

            res.status(201).json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // GET /api/keys
    async listKeys(req: Request, res: Response, next: NextFunction) {
        try {
            const { appId, isActive, keyType, isUsed, page, limit } = req.query;

            const result = await keyService.listKeys({
                appId: appId as string,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                keyType: keyType as KeyType | undefined,
                isUsed: isUsed === 'true' ? true : isUsed === 'false' ? false : undefined,
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 50
            });

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // GET /api/keys/:id
    async getKey(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const result = await keyService.getKey(id);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/keys/:id/toggle
    async toggleKey(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const result = await keyService.toggleKey(id);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // POST /api/keys/:id/reset-hwid
    async resetHwid(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const adminId = req.admin!.id;

            const result = await keyService.resetHwid(id, adminId);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/keys/:id
    async deleteKey(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const result = await keyService.deleteKey(id);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // POST /api/keys/bulk-delete
    async bulkDelete(req: Request, res: Response, next: NextFunction) {
        try {
            const { keyIds } = req.body;

            const result = await keyService.bulkDeleteKeys(keyIds);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // GET /api/keys/stats
    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { appId } = req.query;

            const result = await keyService.getKeyStats(appId as string);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }
}

export const keysController = new KeysController();
