import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    const messages = await prisma.message.findMany({
      where: {
        chatId: params.chatId,
        chat: {
          participants: {
            some: {
              userId
            }
          }
        }
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}