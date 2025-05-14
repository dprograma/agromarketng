import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
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

    const agent = await prisma.agent.findUnique({
      where: { userId: session.id }
    });

    if (!agent) {
      return NextResponse.json({ error: "Not an agent" }, { status: 403 });
    }

    const chat = await prisma.supportChat.update({
      where: { id: params.chatId },
      data: {
        status: 'active',
        agentId: agent.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        messages: true
      }
    });

    // Update agent stats
    await prisma.agent.update({
      where: { id: agent.id },
      data: {
        activeChats: {
          increment: 1
        },
        lastActive: new Date()
      }
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error accepting chat:', error);
    return NextResponse.json({ error: "Failed to accept chat" }, { status: 500 });
  }
}