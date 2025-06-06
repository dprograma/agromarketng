import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';

// Helper function to validate admin session
async function validateAdmin(req: NextRequest) {
  const token = req.cookies.get('next-auth.session-token')?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      id: string;
      role: string;
    };

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await validateAdmin(req);
    if (!session) {
      return apiErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    // Get time range from query params
    const timeRange = req.nextUrl.searchParams.get('timeRange') || '7days';

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
        startDate.setDate(now.getDate() - 7);
    }

    // Get chat volume data
    const chatVolume = await getChatVolumeData(startDate);

    // Get response time data
    const responseTime = await getResponseTimeData(startDate);

    // Get resolution rate data
    const resolutionRate = await getResolutionRateData(startDate);

    // Get category distribution
    const categoryDistribution = await getCategoryDistributionData();

    // Get agent performance
    const agentPerformance = await getAgentPerformanceData(startDate);

    return NextResponse.json({
      chatVolume,
      responseTime,
      resolutionRate,
      categoryDistribution,
      agentPerformance
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return apiErrorResponse(
      "Failed to fetch analytics data",
      500,
      "ANALYTICS_FETCH_FAILED",
      error instanceof Error ? error.message : String(error)
    );
  }
}

// Helper functions to get analytics data
async function getChatVolumeData(startDate: Date) {
  const labels = [];
  const data = [];

  // Generate date labels for the past 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

    // Calculate the start and end of the day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Count chats created on this day
    const chatCount = await prisma.supportTicket.count({
      where: {
        createdAt: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    });

    data.push(chatCount);
  }

  return { labels, data };
}

async function getResponseTimeData(startDate: Date) {
  const labels = [];
  const data = [];

  // Generate date labels for the past 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

    // Calculate the start and end of the day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Get all support chats that were active on this day
    const chats = await prisma.supportTicket.findMany({
      where: {
        createdAt: {
          lte: dayEnd
        },
        status: {
          not: 'pending'
        }
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          take: 2 // Get first user message and first agent response
        }
      }
    });

    // Calculate average response time
    let totalResponseTime = 0;
    let responsesCount = 0;

    for (const chat of chats) {
      if (chat.messages.length >= 2) {
        // First message is from user, second is from agent
        const userMessage = chat.messages[0];
        const agentResponse = chat.messages[1];

        if (!userMessage.isAgentReply && agentResponse.isAgentReply) {
          const userMessageTime = new Date(userMessage.createdAt).getTime();
          const agentResponseTime = new Date(agentResponse.createdAt).getTime();

          // Calculate response time in minutes
          const responseTimeMinutes = (agentResponseTime - userMessageTime) / (1000 * 60);

          totalResponseTime += responseTimeMinutes;
          responsesCount++;
        }
      }
    }

    // Calculate average response time (in minutes)
    const avgResponseTime = responsesCount > 0
      ? Math.round((totalResponseTime / responsesCount) * 10) / 10
      : 0;

    data.push(avgResponseTime);
  }

  return { labels, data };
}

async function getResolutionRateData(startDate: Date) {
  const labels = [];
  const data = [];

  // Generate date labels for the past 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

    // Calculate the start and end of the day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Count total chats that were active on this day
    const totalChats = await prisma.supportTicket.count({
      where: {
        updatedAt: {
          gte: dayStart,
          lte: dayEnd
        },
        status: {
          not: 'pending'
        }
      }
    });

    // Count resolved chats on this day
    const resolvedChats = await prisma.supportTicket.count({
      where: {
        updatedAt: {
          gte: dayStart,
          lte: dayEnd
        },
        status: 'closed'
      }
    });

    // Calculate resolution rate
    const resolutionRate = totalChats > 0
      ? Math.round((resolvedChats / totalChats) * 100)
      : 0;

    data.push(resolutionRate);
  }

  return { labels, data };
}

async function getCategoryDistributionData() {
  // Get all distinct categories from the database
  const distinctCategories = await prisma.supportTicket.findMany({
    select: {
      category: true
    },
    distinct: ['category']
  });

  // Extract category names
  const categories = distinctCategories.map(c => c.category);

  // If no categories found, use default categories
  if (categories.length === 0) {
    return {
      labels: ['General', 'Product', 'Payment', 'Technical', 'Other'],
      data: [0, 0, 0, 0, 0]
    };
  }

  // Count chats for each category
  const categoryCounts = await Promise.all(
    categories.map(async (category) => {
      const count = await prisma.supportTicket.count({
        where: {
          category
        }
      });
      return count;
    })
  );

  // Calculate total chats
  const totalChats = categoryCounts.reduce((sum, count) => sum + count, 0);

  // Convert counts to percentages
  const data = totalChats > 0
    ? categoryCounts.map(count => Math.round((count / totalChats) * 100))
    : categoryCounts.map(() => 0);

  return { labels: categories, data };
}

async function getAgentPerformanceData(startDate: Date) {
  // Get all agents
  const agents = await prisma.agent.findMany({
    include: {
      user: {
        include: {
          supportTickets: {
            include: {
              messages: true
            }
          }
        }
      }
    },
    take: 5, // Limit to 5 agents for simplicity
  });

  const agentNames = agents.map(agent => agent.user.name);
  const responseTime = [];
  const resolutionRate = [];
  const satisfaction = [];

  // Calculate performance metrics for each agent
  for (const agent of agents) {
    // Calculate average response time
    let totalResponseTime = 0;
    let responsesCount = 0;

    for (const ticket of agent.user.supportTickets) {
      // Find pairs of user messages followed by agent responses
      const messages = ticket.messages;

      for (let i = 0; i < messages.length - 1; i++) {
        if (!messages[i].isAgentReply && messages[i + 1].isAgentReply) {
          const userMessageTime = new Date(messages[i].createdAt).getTime();
          const agentResponseTime = new Date(messages[i + 1].createdAt).getTime();

          // Calculate response time in minutes
          const responseTimeMinutes = (agentResponseTime - userMessageTime) / (1000 * 60);

          totalResponseTime += responseTimeMinutes;
          responsesCount++;
        }
      }
    }

    // Calculate average response time (in minutes)
    const avgResponseTime = responsesCount > 0
      ? Math.round((totalResponseTime / responsesCount) * 10) / 10
      : 0;

    // Calculate resolution rate
    const totalTickets = agent.user.supportTickets.length;
    const resolvedTickets = agent.user.supportTickets.filter((ticket: { status: string; }) => ticket.status === 'closed').length;

    const agentResolutionRate = totalTickets > 0
      ? Math.round((resolvedTickets / totalTickets) * 100)
      : 0;

    // For satisfaction, we don't have real data yet, so we'll use a placeholder
    // In a real app, you would calculate this from user ratings
    const avgSatisfaction = 4.5;

    responseTime.push(avgResponseTime);
    resolutionRate.push(agentResolutionRate);
    satisfaction.push(avgSatisfaction);
  }

  return {
    agents: agentNames,
    responseTime,
    resolutionRate,
    satisfaction
  };
}
