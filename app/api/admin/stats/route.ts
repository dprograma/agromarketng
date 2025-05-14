import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total agents count
    const totalAgents = await prisma.agent.count();

    // Get active agents (agents with isOnline = true)
    const activeAgents = await prisma.agent.count({
      where: { isAvailable: true }
    });

    // Get active chats count
    const activeChats = await prisma.supportChat.count({
      where: { status: 'active' }
    });

    // Calculate average response time (in minutes)
    // This is a simplified calculation - in a real app, you'd track message timestamps
    const avgResponseTime = 2.5; // Placeholder for now

    // Calculate resolution rate (percentage of closed tickets)
    const totalTickets = await prisma.supportTicket.count();
    const resolvedTickets = await prisma.supportTicket.count({
      where: { status: 'closed' }
    });
    
    const resolutionRate = totalTickets > 0 
      ? Math.round((resolvedTickets / totalTickets) * 100) 
      : 0;

    return NextResponse.json({
      totalAgents,
      activeAgents,
      activeChats,
      avgResponseTime,
      resolutionRate
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
}
