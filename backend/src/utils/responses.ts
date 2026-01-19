export class ApiError extends Error {
    statusCode: number;
    code: string;
    details?: Record<string, unknown>;

    constructor(
        statusCode: number,
        code: string,
        message: string,
        details?: Record<string, unknown>
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = 'ApiError';
    }

    static badRequest(message: string, code: string = 'BAD_REQUEST', details?: Record<string, unknown>) {
        return new ApiError(400, code, message, details);
    }

    static unauthorized(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED') {
        return new ApiError(401, code, message);
    }

    static forbidden(message: string = 'Forbidden', code: string = 'FORBIDDEN') {
        return new ApiError(403, code, message);
    }

    static notFound(message: string = 'Not found', code: string = 'NOT_FOUND') {
        return new ApiError(404, code, message);
    }

    static conflict(message: string, code: string = 'CONFLICT') {
        return new ApiError(409, code, message);
    }

    static tooManyRequests(message: string = 'Too many requests', code: string = 'RATE_LIMITED') {
        return new ApiError(429, code, message);
    }

    static internal(message: string = 'Internal server error', code: string = 'INTERNAL_ERROR') {
        return new ApiError(500, code, message);
    }
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}

export function successResponse<T>(data: T): ApiResponse<T> {
    return {
        success: true,
        data
    };
}

export function errorResponse(error: ApiError): ApiResponse {
    return {
        success: false,
        error: {
            code: error.code,
            message: error.message,
            details: error.details
        }
    };
}
