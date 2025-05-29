import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';

export async function GET(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return apiErrorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Fetch all support chats for this user
    const supportChats = await prisma.supportChat.findMany({
      where: {
        userId
      },
      include: {
        agent: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(supportChats);
  } catch (error) {
    console.error('Error fetching support chats:', error);
    return apiErrorResponse(
      'Failed to fetch support chats',
      500,
      'FETCH_SUPPORT_CHATS_FAILED',
      error instanceof Error ? error.message : String(error)
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return apiErrorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    const { category, priority } = await req.json();

    // Create a new support chat
    const supportChat = await prisma.supportChat.create({
      data: {
        userId,
        status: 'open',
        category,
        priority,
        messages: {
          create: {
            content: 'Support chat created',
            sender: userId,
            senderType: 'system',
            read: true
          }
        }
      },
      include: {
        messages: true
      }
    });

    return NextResponse.json(supportChat);
  } catch (error) {
    console.error('Error creating support chat:', error);
    return apiErrorResponse(
      'Failed to create support chat',
      500,
      'CREATE_SUPPORT_CHAT_FAILED',
      error instanceof Error ? error.message : String(error)
    );
  }
}
