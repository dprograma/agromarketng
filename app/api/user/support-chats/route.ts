import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
            createdAt: 'asc'
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
    return NextResponse.json({ error: 'Failed to fetch support chats' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    const { category, priority } = await req.json();

    // Create a new support chat
    const supportChat = await prisma.supportChat.create({
      data: {
        userId,
        status: 'pending',
        category: category || 'general',
        priority: priority || 1,
        messages: {
          create: {
            content: 'I need help with my account',
            sender: userId,
            senderType: 'user',
            read: false
          }
        }
      },
      include: {
        messages: true,
        agent: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(supportChat);
  } catch (error) {
    console.error('Error creating support chat:', error);
    return NextResponse.json({ error: 'Failed to create support chat' }, { status: 500 });
  }
}
