import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';
import { cache } from '@/lib/cache';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('next-auth.session-token')?.value;
        if (!token) {
            return apiErrorResponse('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
        const userId = decoded.id;

        return await cache.getOrSet(`user-${userId}-notifications`, async () => {
            const notifications = await prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 50
            });

            return NextResponse.json(notifications);
        }, 30000); // 30 second TTL for notifications
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return apiErrorResponse(
            'Failed to fetch notifications',
            500,
            'FETCH_NOTIFICATIONS_FAILED',
            error instanceof Error ? error.message : String(error)
        );
    }
} 