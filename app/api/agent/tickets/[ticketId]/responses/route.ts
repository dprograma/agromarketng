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

    // Get response content from request
    const { content } = await req.json();
    if (!content) {
      return NextResponse.json({ error: "Response content is required" }, { status: 400 });
    }

    const ticketId = (await params).ticketId;

    // Verify ticket exists and agent is assigned to it
    const ticket = await prisma.supportTicket.findUnique({
      where: {
        id: ticketId,
        agentId: session.agentId
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found or not assigned to you" }, { status: 404 });
    }

    // Create response message
    const response = await prisma.supportMessage.create({
      data: {
        ticketId,
        senderId: session.userId,
        content,
        isAgentReply: true
      }
    });

    // Update ticket timestamp
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() }
    });

    // Transform response to match frontend expectations
    const transformedResponse = {
      id: response.id,
      content: response.content,
      ticketId: response.ticketId,
      createdAt: response.createdAt.toISOString(),
      createdBy: response.senderId,
      createdByType: "agent"
    };
    
    return NextResponse.json(transformedResponse);
  } catch (error) {
    console.error('Error creating response:', error);
    return NextResponse.json({ error: "Failed to create response" }, { status: 500 });
  }
}
