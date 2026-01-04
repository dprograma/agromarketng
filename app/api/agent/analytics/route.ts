import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Helper function to validate agent session
async function validateAgent(req: NextRequest) {
  const token = req.cookies.get('next-auth.session-token')?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      id: string;
    };

    // Verify agent status
    const agent = await prisma.agent.findUnique({
      where: { userId: decoded.id }
    });

    if (!agent) {
      return null;
    }

    return { userId: decoded.id, agentId: agent.id };
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await validateAgent(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get time range from query params
    const timeRange = req.nextUrl.searchParams.get('timeRange') || '30days';
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Query tickets assigned to this agent within the time range
    const tickets = await prisma.supportTicket.findMany({
      where: {
        agentId: session.agentId,
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    // Query all tickets to get total interactions (treat tickets as "chats" for analytics)
    const allTickets = await prisma.supportTicket.findMany({
      where: {
        agentId: session.agentId,
        createdAt: {
          gte: startDate,
          lte: now
        }
      }
    });

    // Calculate performance metrics
    const totalChats = allTickets.length; // Treating tickets as chats
    const resolvedChats = allTickets.filter(ticket => ticket.status === 'closed').length; // Closed tickets = resolved chats
    const activeChats = allTickets.filter(ticket => ticket.status === 'active').length;
    const resolutionRate = totalChats > 0 ? Math.round((resolvedChats / totalChats) * 100) : 0;

    // Calculate average response time (in minutes) based on ticket messages
    let totalResponseTime = 0;
    let responseCount = 0;

    tickets.forEach(ticket => {
      const messages = ticket.messages;
      for (let i = 1; i < messages.length; i++) {
        const prevMessage = messages[i - 1];
        const currentMessage = messages[i];

        // Calculate response time if this is an agent response to a user message
        if (!prevMessage.isAgentReply && currentMessage.isAgentReply) {
          const responseTime = (new Date(currentMessage.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()) / (1000 * 60);
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
    });

    const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;

    // Generate chart data based on time range
    const chartLabels: string[] = [];
    const chatVolumeData: number[] = [];
    const responseTimeData: number[] = [];

    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      chartLabels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

      // Count tickets (chats) for this day
      const dayTickets = allTickets.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt).toISOString().split('T')[0];
        return ticketDate === dateStr;
      }).length;

      chatVolumeData.push(dayTickets);

      // Calculate average response time for this day
      let dayResponseTime = 0;
      let dayResponseCount = 0;

      tickets.forEach(ticket => {
        const ticketDate = new Date(ticket.createdAt).toISOString().split('T')[0];
        if (ticketDate === dateStr) {
          const messages = ticket.messages;
          for (let j = 1; j < messages.length; j++) {
            const prevMessage = messages[j - 1];
            const currentMessage = messages[j];

            if (!prevMessage.isAgentReply && currentMessage.isAgentReply) {
              const responseTime = (new Date(currentMessage.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()) / (1000 * 60);
              dayResponseTime += responseTime;
              dayResponseCount++;
            }
          }
        }
      });

      responseTimeData.push(dayResponseCount > 0 ? Math.round(dayResponseTime / dayResponseCount) : 0);
    }

    const analyticsData = {
      performanceMetrics: {
        totalChats,
        resolvedChats,
        resolutionRate,
        avgResponseTime
      },
      chatVolumeData: {
        labels: chartLabels,
        data: chatVolumeData
      },
      responseTimeData: {
        labels: chartLabels,
        data: responseTimeData
      }
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Error fetching agent analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
