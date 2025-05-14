import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Verify the chat belongs to this user
    const chat = await prisma.supportChat.findUnique({
      where: {
        id: params.chatId,
        userId
      }
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Fetch messages
    const messages = await prisma.supportMessage.findMany({
      where: {
        chatId: params.chatId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Mark all agent messages as read
    await prisma.supportMessage.updateMany({
      where: {
        chatId: params.chatId,
        senderType: 'agent',
        read: false
      },
      data: {
        read: true
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Verify the chat belongs to this user
    const chat = await prisma.supportChat.findUnique({
      where: {
        id: params.chatId,
        userId
      }
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Don't allow messages if chat is closed
    if (chat.status === 'closed') {
      return NextResponse.json({ error: 'Cannot send messages to a closed chat' }, { status: 400 });
    }

    // Get message content from request
    const { content } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Create message
    const message = await prisma.supportMessage.create({
      data: {
        chatId: params.chatId,
        content,
        sender: userId,
        senderType: 'user',
        read: false
      }
    });

    // Update chat timestamp
    await prisma.supportChat.update({
      where: { id: params.chatId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
