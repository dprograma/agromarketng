import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';

// Helper function to validate agent session
async function validateAgent(req: NextRequest) {
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

    // Check if user is agent
    if (decoded.role !== 'agent') {
      return null;
    }

    // Verify agent exists and get their data
    const agent = await prisma.agent.findUnique({
      where: { userId: decoded.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!agent) {
      return null;
    }

    return { userId: decoded.id, agentId: agent.id, agent };
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await validateAgent(req);
    if (!session) {
      return apiErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const status = req.nextUrl.searchParams.get('status');

    // Build query based on status and agent assignment
    let whereClause: any = {};

    if (status === 'pending') {
      // Pending chats are unassigned and available for agents to pick up
      whereClause = {
        status: 'pending',
        agentId: null
      };
    } else if (status === 'active') {
      // Active chats assigned to this agent
      whereClause = {
        status: 'active',
        agentId: session.agentId
      };
    } else if (status === 'closed') {
      // Closed chats that were handled by this agent
      whereClause = {
        status: 'closed',
        agentId: session.agentId
      };
    } else {
      // All chats assigned to this agent (active and closed)
      whereClause = {
        agentId: session.agentId
      };
    }

    // Fetch chats with relations
    const chats = await prisma.supportTicket.findMany({
      where: whereClause,
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
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get latest message for preview
          include: {
            sender: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching agent chats:", error);
    return apiErrorResponse(
      "Failed to fetch chats",
      500,
      "FETCH_CHATS_FAILED",
      error instanceof Error ? error.message : String(error)
    );
  }
}

// Accept a pending chat
export async function POST(req: NextRequest) {
  try {
    const session = await validateAgent(req);
    if (!session) {
      return apiErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { chatId, action } = await req.json();

    if (!chatId || !action) {
      return apiErrorResponse("Missing chatId or action", 400, "MISSING_PARAMS");
    }

    if (action === 'accept') {
      // Accept a pending chat
      const chat = await prisma.supportTicket.update({
        where: {
          id: chatId,
          status: 'pending',
          agentId: null // Ensure it's not already assigned
        },
        data: {
          status: 'active',
          agentId: session.agentId,
          updatedAt: new Date()
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
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 5,
            include: {
              sender: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json(chat);
    } else if (action === 'close') {
      // Close an active chat
      const chat = await prisma.supportTicket.update({
        where: {
          id: chatId,
          status: 'active',
          agentId: session.agentId // Ensure agent owns this chat
        },
        data: {
          status: 'closed',
          updatedAt: new Date()
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
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              sender: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json(chat);
    } else {
      return apiErrorResponse("Invalid action", 400, "INVALID_ACTION");
    }
  } catch (error) {
    console.error("Error processing chat action:", error);
    return apiErrorResponse(
      "Failed to process chat action",
      500,
      "CHAT_ACTION_FAILED",
      error instanceof Error ? error.message : String(error)
    );
  }
}