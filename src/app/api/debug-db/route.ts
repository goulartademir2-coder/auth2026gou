import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        await prisma.$connect();
        return NextResponse.json({
            success: true,
            message: 'Database connected successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: {
                message: error.message,
                code: error.code,
                meta: error.meta
            }
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
