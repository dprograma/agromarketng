import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';
import { cache } from '@/lib/cache';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{chatId: string  }> }
) {
    try {
        const token = req.cookies.get('next-auth.session-token')?.value;
        if (!token) {
            return apiErrorResponse('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
        const userId = decoded.id;

        return await cache.getOrSet(`chat-${(await params).chatId}-messages`, async () => {
            const chat = await prisma.supportTicket.findUnique({
                where: { id: (await params).chatId },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' }
                    }
                }
            });

            if (!chat || chat.userId !== userId) {
                return apiErrorResponse('Chat not found or unauthorized', 404, 'CHAT_NOT_FOUND');
            }

            return NextResponse.json(chat.messages);
        }, 15000); // 15 second TTL for chat messages
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        return apiErrorResponse(
            'Failed to fetch chat messages',
            500,
            'FETCH_CHAT_MESSAGES_FAILED',
            error instanceof Error ? error.message : String(error)
        );
    }
} 