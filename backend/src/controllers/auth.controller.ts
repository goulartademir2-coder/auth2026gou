import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { successResponse, ApiError, errorResponse } from '../utils/responses';

export class AuthController {
    // POST /api/auth/login
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password, hwid, appId } = req.body;
            const ipAddress = req.ip || req.socket.remoteAddress;

            const result = await authService.login({
                username,
                password,
                hwid,
                appId,
                ipAddress
            });

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // POST /api/auth/key
    async keyLogin(req: Request, res: Response, next: NextFunction) {
        try {
            const { key, hwid, appId } = req.body;
            const ipAddress = req.ip || req.socket.remoteAddress;

            const result = await authService.keyLogin({
                key,
                hwid,
                appId,
                ipAddress
            });

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // POST /api/auth/register
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password, email, appId } = req.body;

            const result = await authService.register({
                username,
                password,
                email,
                appId
            });

            res.status(201).json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // POST /api/auth/activate
    async activateKey(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { key } = req.body;

            const result = await authService.activateKey(userId, key);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // POST /api/auth/logout
    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const sessionId = req.user!.sessionId;

            const result = await authService.logout(sessionId);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    // GET /api/auth/session
    async validateSession(req: Request, res: Response, next: NextFunction) {
        try {
            const sessionId = req.user!.sessionId;

            const result = await authService.validateSession(sessionId);

            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();
