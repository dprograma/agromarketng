import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUserId, isAuthError } from '@/lib/auth';

// GET /api/conversations/[conversationId]/messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const authResult = await getAuthUserId(request);
    if (isAuthError(authResult)) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const userId = authResult.userId;
    const { conversationId } = await params;

    // Verify that the current user is a participant in the conversation
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
        OR: [
          { sellerId: userId },
          { buyerId: userId },
        ],
      },
    });

    if (!conversation) {
      return NextResponse.json({ message: 'Conversation not found or unauthorized' }, { status: 404 });
    }

    // Fetch messages for the conversation, ordered chronologically
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ message: 'Error fetching messages' }, { status: 500 });
  }
}

// POST /api/conversations/[conversationId]/messages
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const authResult = await getAuthUserId(request);
    if (isAuthError(authResult)) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const userId = authResult.userId;
    const { conversationId } = await params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ message: 'Message content is required' }, { status: 400 });
    }

    // Verify that the current user is a participant in the conversation
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
        OR: [
          { sellerId: userId },
          { buyerId: userId },
        ],
      },
    });

    if (!conversation) {
      return NextResponse.json({ message: 'Conversation not found or unauthorized' }, { status: 404 });
    }

    // Create the new message
    const newMessage = await prisma.message.create({
      data: {
        content: content,
        conversationId: conversationId,
        senderId: userId,
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ message: 'Error sending message' }, { status: 500 });
  }
}
