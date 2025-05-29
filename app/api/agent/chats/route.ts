import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';

export async function GET(req: NextRequest) {
  try {
    // Get and validate token
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return apiErrorResponse(
        'Unauthorized',
        401,
        'UNAUTHORIZED'
      );
    }

    // Verify token and get userId
    const session = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    if (!session) {
      return apiErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    // Verify agent status
    const agent = await prisma.agent.findUnique({
      where: { userId: session.id }
    });

    if (!agent) {
      return apiErrorResponse("Not an agent", 403, "NOT_AN_AGENT");
    }

    const chats = await prisma.supportChat.findMany({
      where: {
        agentId: agent.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
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

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error); // Log the actual error for debugging
    return apiErrorResponse(
      "Failed to fetch chats",
      500,
      "FETCH_CHATS_FAILED",
      error instanceof Error ? error.message : String(error)
    );
  }
}