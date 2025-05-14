import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
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

    const status = req.nextUrl.searchParams.get('status');
    
    const chats = await prisma.supportChat.findMany({
      where: {
        status: status || 'active',
        ...(status === 'active' ? { agentId: agent.id } : {})
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}