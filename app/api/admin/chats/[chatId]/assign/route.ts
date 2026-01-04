import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';

// Helper function to validate admin session
async function validateAdmin(req: NextRequest) {
  // Try both development and production cookie names
  const token = req.cookies.get('next-auth.session-token')?.value ||
                req.cookies.get('__Secure-next-auth.session-token')?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      id: string;
      email: string;
      role: string;
      exp?: number;
    };

    // Check token expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return null;
    }

    // Check if user is admin by role
    if (decoded.role !== 'admin') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await validateAdmin(req);
    if (!session) {
      return apiErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const params = await context.params;
    const { chatId } = params;
    const { agentId } = await req.json();

    if (!agentId) {
      return apiErrorResponse("Agent ID is required", 400, "MISSING_AGENT_ID");
    }

    // Verify the agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return apiErrorResponse("Agent not found", 404, "AGENT_NOT_FOUND");
    }

    // Assign the agent to the support ticket
    const updatedChat = await prisma.supportTicket.update({
      where: { id: chatId },
      data: {
        agentId,
        status: 'active', // Change status to active when assigned
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        agent: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Update agent's active chats count
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        activeChats: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(updatedChat);
  } catch (error) {
    console.error("Error assigning agent to chat:", error);
    return apiErrorResponse(
      "Failed to assign agent to chat",
      500,
      "ASSIGN_AGENT_FAILED",
      error instanceof Error ? error.message : String(error)
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await validateAdmin(req);
    if (!session) {
      return apiErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const params = await context.params;
    const { chatId } = params;

    // Get the current chat to find the agent
    const chat = await prisma.supportTicket.findUnique({
      where: { id: chatId },
      select: { agentId: true },
    });

    if (!chat || !chat.agentId) {
      return apiErrorResponse("Chat not found or not assigned", 404, "CHAT_NOT_ASSIGNED");
    }

    // Unassign the agent from the support ticket
    const updatedChat = await prisma.supportTicket.update({
      where: { id: chatId },
      data: {
        agentId: null,
        status: 'pending', // Change status back to pending when unassigned
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update agent's active chats count
    await prisma.agent.update({
      where: { id: chat.agentId },
      data: {
        activeChats: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json(updatedChat);
  } catch (error) {
    console.error("Error unassigning agent from chat:", error);
    return apiErrorResponse(
      "Failed to unassign agent from chat",
      500,
      "UNASSIGN_AGENT_FAILED",
      error instanceof Error ? error.message : String(error)
    );
  }
}