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
  { params }: { params: { ticketId: string } }
) {
  try {
    const session = await validateAgent(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a real implementation, this would be:
    // const ticket = await prisma.supportTicket.update({
    //   where: { 
    //     id: params.ticketId,
    //     assignedTo: session.agentId
    //   },
    //   data: {
    //     status: 'closed',
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
      id: params.ticketId,
      subject: "Payment not processing",
      message: "I've been trying to make a payment for the last hour but it keeps failing. Can you help?",
      priority: "high",
      category: "billing",
      status: "closed",
      attachments: [],
      userId: "user1",
      user: {
        name: "John Doe",
        email: "john@example.com"
      },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: session.agentId,
      responses: [
        {
          id: "resp1",
          content: "I'll look into this right away. Can you tell me what error message you're seeing?",
          ticketId: params.ticketId,
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          createdBy: session.agentId,
          createdByType: "agent"
        },
        {
          id: "resp2",
          content: "It says 'Payment method declined'. I've tried two different cards.",
          ticketId: params.ticketId,
          createdAt: new Date(Date.now() - 1700000).toISOString(),
          createdBy: "user1",
          createdByType: "user"
        },
        {
          id: "resp3",
          content: "I've fixed the issue with your payment processing. Please try again now.",
          ticketId: params.ticketId,
          createdAt: new Date().toISOString(),
          createdBy: session.agentId,
          createdByType: "agent"
        }
      ]
    };
    
    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error closing ticket:', error);
    return NextResponse.json({ error: "Failed to close ticket" }, { status: 500 });
  }
}
