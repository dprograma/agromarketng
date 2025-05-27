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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ticketId: string  }> }
) {
  try {
    const session = await validateAgent(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a real implementation, this would be:
    // const ticket = await prisma.supportTicket.update({
    //   where: { id: (await params).ticketId },
    //   data: {
    //     status: 'active',
    //     assignedTo: session.agentId
    //   },
    //   include: {
    //     user: {
    //       select: {
    //         name: true,
    //         email: true
    //       }
    //     },
    //     responses: true
    //   }
    // });
    
    // Mock response
    const ticket = {
      id: (await params).ticketId,
      subject: "Payment not processing",
      message: "I've been trying to make a payment for the last hour but it keeps failing. Can you help?",
      priority: "high",
      category: "billing",
      status: "active",
      attachments: [],
      userId: "user1",
      user: {
        name: "John Doe",
        email: "john@example.com"
      },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: session.agentId,
      responses: []
    };
    
    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error accepting ticket:', error);
    return NextResponse.json({ error: "Failed to accept ticket" }, { status: 500 });
  }
}
