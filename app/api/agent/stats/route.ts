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

    // Get agent stats
    const agent = await prisma.agent.findUnique({
      where: { id: session.agentId },
      include: {
        SupportChat: true
      }
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Get active chats
    const activeChats = await prisma.supportChat.count({
      where: {
        agentId: session.agentId,
        status: 'active'
      }
    });

    // Get pending chats
    const pendingChats = await prisma.supportChat.count({
      where: {
        status: 'pending'
      }
    });

    // Get resolved chats
    const resolvedChats = await prisma.supportChat.count({
      where: {
        agentId: session.agentId,
        status: 'closed'
      }
    });

    // Get active tickets
    const activeTickets = await prisma.supportTicket.count({
      where: {
        assignedTo: session.agentId,
        status: 'active'
      }
    });

    // Get pending tickets
    const pendingTickets = await prisma.supportTicket.count({
      where: {
        status: 'pending'
      }
    });

    // Get resolved tickets
    const resolvedTickets = await prisma.supportTicket.count({
      where: {
        assignedTo: session.agentId,
        status: 'closed'
      }
    });

    // Calculate resolution rate
    const totalChats = activeChats + resolvedChats;
    const resolutionRate = totalChats > 0 
      ? Math.round((resolvedChats / totalChats) * 100) 
      : 0;

    // Calculate average response time
    const avgResponseTime = 3.5; // This would be calculated from actual message timestamps

    return NextResponse.json({
      activeChats,
      pendingChats,
      resolvedChats,
      activeTickets,
      pendingTickets,
      resolvedTickets,
      avgResponseTime,
      resolutionRate
    });
  } catch (error) {
    console.error("Error fetching agent stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent stats" },
      { status: 500 }
    );
  }
}
