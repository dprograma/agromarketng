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

    // Get agent's performance metrics
    const performanceMetrics = await getAgentPerformanceMetrics(session.agentId, startDate);
    
    // Get agent's chat volume data
    const chatVolumeData = await getAgentChatVolumeData(session.agentId, startDate);
    
    // Get agent's response time data
    const responseTimeData = await getAgentResponseTimeData(session.agentId, startDate);

    return NextResponse.json({
      performanceMetrics,
      chatVolumeData,
      responseTimeData
    });
  } catch (error) {
    console.error("Error fetching agent analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}

// Helper functions to get analytics data
async function getAgentPerformanceMetrics(agentId: string, startDate: Date) {
  // Get agent with their chats
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: {
      SupportChat: {
        where: {
          createdAt: {
            gte: startDate
          }
        },
        include: {
          messages: true
        }
      }
    }
  });
  
  if (!agent) {
    return {
      totalChats: 0,
      resolvedChats: 0,
      resolutionRate: 0,
      avgResponseTime: 0
    };
  }
  
  // Calculate total chats
  const totalChats = agent.SupportChat.length;
  
  // Calculate resolved chats
  const resolvedChats = agent.SupportChat.filter(chat => chat.status === 'closed').length;
  
  // Calculate resolution rate
  const resolutionRate = totalChats > 0 
    ? Math.round((resolvedChats / totalChats) * 100) 
    : 0;
  
  // Calculate average response time
  let totalResponseTime = 0;
  let responsesCount = 0;
  
  for (const chat of agent.SupportChat) {
    // Find pairs of user messages followed by agent responses
    const messages = chat.messages;
    
    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].senderType === 'user' && messages[i+1].senderType === 'agent') {
        const userMessageTime = new Date(messages[i].createdAt).getTime();
        const agentResponseTime = new Date(messages[i+1].createdAt).getTime();
        
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
  
  return {
    totalChats,
    resolvedChats,
    resolutionRate,
    avgResponseTime
  };
}

async function getAgentChatVolumeData(agentId: string, startDate: Date) {
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
    
    // Count chats created on this day for this agent
    const chatCount = await prisma.supportChat.count({
      where: {
        agentId,
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

async function getAgentResponseTimeData(agentId: string, startDate: Date) {
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
    
    // Get all support chats for this agent on this day
    const chats = await prisma.supportChat.findMany({
      where: {
        agentId,
        createdAt: {
          lte: dayEnd
        },
        status: {
          not: 'pending'
        }
      },
      include: {
        messages: {
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
    
    // Calculate average response time for this day
    let totalResponseTime = 0;
    let responsesCount = 0;
    
    for (const chat of chats) {
      // Find pairs of user messages followed by agent responses
      const messages = chat.messages;
      
      for (let i = 0; i < messages.length - 1; i++) {
        if (messages[i].senderType === 'user' && messages[i+1].senderType === 'agent') {
          const userMessageTime = new Date(messages[i].createdAt).getTime();
          const agentResponseTime = new Date(messages[i+1].createdAt).getTime();
          
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
