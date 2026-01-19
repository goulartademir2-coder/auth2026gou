import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { generalRateLimiter } from './middleware/rateLimit.middleware';
import { ApiError, errorResponse } from './utils/responses';
import { logger } from './utils/logger';
import { prisma } from './lib/prisma';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(generalRateLimiter);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });

    next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json(errorResponse(ApiError.notFound('Endpoint not found')));
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json(errorResponse(err));
    }

    // Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        return res.status(400).json(errorResponse(
            ApiError.badRequest('Database error', 'DATABASE_ERROR')
        ));
    }

    // Generic error
    res.status(500).json(errorResponse(
        ApiError.internal('Internal server error')
    ));
});

// Graceful shutdown
async function shutdown() {
    logger.info('Shutting down...');
    await prisma.$disconnect();
    process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
async function main() {
    try {
        // Test database connection
        await prisma.$connect();
        logger.info('Database connected');

        // Initialize super admin if not exists
        const { adminService } = await import('./services/admin.service');
        await adminService.initializeSuperAdmin();

        app.listen(PORT, () => {
            logger.info(`🚀 GOU Auth API running on port ${PORT}`);
            logger.info(`📚 Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

main();

export default app;
