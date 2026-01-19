import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Get stats
        const [usersCount, keysCount, appsCount, sessionsCount] = await Promise.all([
            prisma.user.count(),
            prisma.key.count(),
            prisma.app.count(),
            prisma.session.count({
                where: { expiresAt: { gt: new Date() } }
            })
        ]);

        // Get active/inactive keys
        const [activeKeys, usedKeys] = await Promise.all([
            prisma.key.count({ where: { isActive: true, userId: null } }),
            prisma.key.count({ where: { userId: { not: null } } })
        ]);

        // Get user stats
        const [activeUsers, bannedUsers] = await Promise.all([
            prisma.user.count({
                where: {
                    isBanned: false,
                    subscriptionExpires: { gt: new Date() }
                }
            }),
            prisma.user.count({ where: { isBanned: true } })
        ]);

        // Recent activity
        const recentLogins = await prisma.loginLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { username: true } }
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                stats: {
                    users: usersCount,
                    keys: keysCount,
                    apps: appsCount,
                    activeSessions: sessionsCount
                },
                keys: {
                    available: activeKeys,
                    used: usedKeys
                },
                users: {
                    active: activeUsers,
                    banned: bannedUsers
                },
                recentActivity: recentLogins.map(log => ({
                    user: log.user?.username || 'Unknown',
                    action: log.action,
                    success: log.success,
                    ip: log.ip,
                    time: log.createdAt
                }))
            }
        });

    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json(
            { success: false, error: { message: 'Failed to get stats' } },
            { status: 500 }
        );
    }
}
