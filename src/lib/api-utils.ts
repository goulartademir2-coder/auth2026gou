import { NextResponse } from 'next/server';

export class ApiError extends Error {
    statusCode: number;
    code: string;
    details?: Record<string, any>;

    constructor(message: string, statusCode: number, code: string, details?: Record<string, any>) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }

    static badRequest(message: string, code = 'BAD_REQUEST', details?: Record<string, any>) {
        return new ApiError(message, 400, code, details);
    }

    static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED') {
        return new ApiError(message, 401, code);
    }

    static forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
        return new ApiError(message, 403, code);
    }

    static notFound(message = 'Not found', code = 'NOT_FOUND') {
        return new ApiError(message, 404, code);
    }

    static conflict(message: string, code = 'CONFLICT') {
        return new ApiError(message, 409, code);
    }

    static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
        return new ApiError(message, 500, code);
    }
}

export function successResponse<T>(data: T, message?: string) {
    return NextResponse.json({
        success: true,
        data,
        ...(message && { message }),
    });
}

export function errorResponse(error: ApiError | Error) {
    if (error instanceof ApiError) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: error.code,
                    message: error.message,
                    ...(error.details && { details: error.details }),
                },
            },
            { status: error.statusCode }
        );
    }

    return NextResponse.json(
        {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Internal server error',
                stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
            },
        },
        { status: 500 }
    );
}

export function handleApiError(error: unknown) {
    console.error('API Error:', error);

    if (error instanceof ApiError) {
        return errorResponse(error);
    }

    return errorResponse(ApiError.internal());
}
