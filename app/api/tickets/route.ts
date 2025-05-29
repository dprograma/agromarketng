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

        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string; role: string };
        const userId = decoded.id;

        return await cache.getOrSet(`user-${userId}-tickets`, async () => {
            const tickets = await prisma.supportTicket.findMany({
                where: {
                    userId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' }
            });

            return NextResponse.json(tickets);
        }, 60000); // 1 minute TTL for tickets
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return apiErrorResponse(
            'Failed to fetch tickets',
            500,
            'FETCH_TICKETS_FAILED',
            error instanceof Error ? error.message : String(error)
        );
    }
} 