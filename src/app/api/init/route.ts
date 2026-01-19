import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/crypto';

export async function POST() {
    try {
        // Check if super admin exists
        const existingAdmin = await prisma.admin.findFirst({
            where: { isSuperAdmin: true }
        });

        if (existingAdmin) {
            return NextResponse.json({
                success: true,
                data: { message: 'Super admin already exists' }
            });
        }

        // Create super admin from env
        const username = process.env.ADMIN_USERNAME || 'admin';
        const email = process.env.ADMIN_EMAIL || 'admin@gouauth.com';
        const password = process.env.ADMIN_PASSWORD || 'admin123';

        const hashedPassword = await hashPassword(password);

        await prisma.admin.create({
            data: {
                username,
                email,
                passwordHash: hashedPassword,
                isSuperAdmin: true
            }
        });

        return NextResponse.json({
            success: true,
            data: { message: 'Super admin created successfully' }
        });

    } catch (error) {
        console.error('Init error:', error);
        return NextResponse.json(
            { success: false, error: { message: 'Failed to initialize' } },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const adminExists = await prisma.admin.findFirst({
            where: { isSuperAdmin: true }
        });

        return NextResponse.json({
            success: true,
            data: { initialized: !!adminExists }
        });
    } catch {
        return NextResponse.json({
            success: true,
            data: { initialized: false }
        });
    }
}
