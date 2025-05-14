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

    // Get response content from request
    const { content } = await req.json();
    if (!content) {
      return NextResponse.json({ error: "Response content is required" }, { status: 400 });
    }

    // In a real implementation, this would be:
    // // Verify ticket exists and agent is assigned to it
    // const ticket = await prisma.supportTicket.findUnique({
    //   where: { 
    //     id: params.ticketId,
    //     assignedTo: session.agentId
    //   }
    // });
    //
    // if (!ticket) {
    //   return NextResponse.json({ error: "Ticket not found or not assigned to you" }, { status: 404 });
    // }
    //
    // // Create response
    // const response = await prisma.ticketResponse.create({
    //   data: {
    //     ticketId: params.ticketId,
    //     content,
    //     createdBy: session.agentId,
    //     createdByType: 'agent'
    //   }
    // });
    //
    // // Update ticket timestamp
    // await prisma.supportTicket.update({
    //   where: { id: params.ticketId },
    //   data: { updatedAt: new Date() }
    // });
    
    // Mock response
    const response = {
      id: "resp" + Date.now(),
      content,
      ticketId: params.ticketId,
      createdAt: new Date().toISOString(),
      createdBy: session.agentId,
      createdByType: "agent"
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating response:', error);
    return NextResponse.json({ error: "Failed to create response" }, { status: 500 });
  }
}
