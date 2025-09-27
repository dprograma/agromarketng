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

    const ticketId = (await params).ticketId;

    // Update the ticket to assign it to this agent and set status to active
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'active',
        agentId: session.agentId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    // Transform response to match frontend expectations
    const transformedTicket = {
      ...ticket,
      priority: ticket.priority === 3 ? 'high' : ticket.priority === 2 ? 'medium' : 'low',
      responses: (ticket as any).messages?.map((message: any) => ({
        id: message.id,
        content: message.content,
        ticketId: message.ticketId,
        createdAt: message.createdAt.toISOString(),
        createdBy: message.senderId,
        createdByType: message.isAgentReply ? 'agent' : 'user'
      })) || []
    };
    
    return NextResponse.json(transformedTicket);
  } catch (error) {
    console.error('Error accepting ticket:', error);
    return NextResponse.json({ error: "Failed to accept ticket" }, { status: 500 });
  }
}
