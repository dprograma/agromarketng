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
      role: string;
      exp?: number;
    };

    // Check token expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
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

    // Get current time for calculating stats
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch support ticket statistics for this agent
    const [
      activeChats,
      pendingChats,
      resolvedChats,
      totalAssignedTickets,
      recentActivity
    ] = await Promise.all([
      // Active chats/tickets assigned to this agent
      prisma.supportTicket.count({
        where: {
          agentId: session.agentId,
          status: 'active'
        }
      }),

      // Pending tickets (not yet assigned to any agent)
      prisma.supportTicket.count({
        where: {
          status: 'pending',
          agentId: null
        }
      }),

      // Resolved tickets by this agent in the last 30 days
      prisma.supportTicket.count({
        where: {
          agentId: session.agentId,
          status: 'closed',
          updatedAt: {
            gte: thirtyDaysAgo
          }
        }
      }),

      // Total tickets assigned to this agent
      prisma.supportTicket.count({
        where: {
          agentId: session.agentId
        }
      }),

      // Recent tickets for activity feed
      prisma.supportTicket.findMany({
        where: {
          agentId: session.agentId
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: 5,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ]);

    // Calculate resolution rate (resolved tickets / total tickets * 100)
    const resolutionRate = totalAssignedTickets > 0
      ? Math.round((resolvedChats / totalAssignedTickets) * 100)
      : 0;

    // Calculate average response time (mock data for now)
    const avgResponseTime = 45; // minutes - this would be calculated from actual message timestamps

    const stats = {
      activeChats,
      pendingChats,
      resolvedChats,
      activeTickets: activeChats, // Same as active chats for now
      pendingTickets: pendingChats, // Same as pending chats for now
      resolvedTickets: resolvedChats,
      avgResponseTime,
      resolutionRate,
      recentActivity: recentActivity.map(ticket => ({
        id: ticket.id,
        type: ticket.status === 'closed' ? 'resolved' : ticket.status === 'active' ? 'active' : 'assigned',
        subject: ticket.subject,
        customerName: ticket.user.name,
        updatedAt: ticket.updatedAt
      }))
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching agent stats:", error);
    return apiErrorResponse(
      "Failed to fetch agent statistics",
      500,
      "FETCH_AGENT_STATS_FAILED",
      error instanceof Error ? error.message : String(error)
    );
  }
}