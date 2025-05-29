import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{chatId: string  }> }
) {
  try {
    // Get and validate token
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token and get userId
    const session = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify agent status
    const agent = await prisma.agent.findUnique({
      where: { userId: session.id }
    });

    if (!agent) {
      return NextResponse.json({ error: "Not an agent" }, { status: 403 });
    }

    // Get message content from request
    const { content } = await req.json();
    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    // Verify chat exists and agent is assigned to it
    const chat = await prisma.supportChat.findUnique({
      where: { 
        id: (await params).chatId,
        agentId: agent.id
      }
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found or not assigned to you" }, { status: 404 });
    }

    // Create message
    const message = await prisma.supportMessage.create({
      data: {
        chatId: (await params).chatId,
        content,
        sender: agent.id,
        senderType: 'agent'
      }
    });

    // Update chat timestamp
    await prisma.supportChat.update({
      where: { id: (await params).chatId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
