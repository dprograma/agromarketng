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

    const status = req.nextUrl.searchParams.get('status');
    
    // Define the query based on status
    let query: any = {};
    
    if (status === 'active') {
      query = {
        where: {
          assignedTo: session.agentId,
          status: 'active'
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          responses: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      };
    } else if (status === 'pending') {
      query = {
        where: {
          status: 'pending'
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      };
    } else if (status === 'closed') {
      query = {
        where: {
          assignedTo: session.agentId,
          status: 'closed'
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          responses: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      };
    } else {
      // Default to all tickets assigned to this agent
      query = {
        where: {
          assignedTo: session.agentId
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          responses: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      };
    }
    
    // For now, return mock data since we don't have the actual SupportTicket model yet
    // In a real implementation, this would be: const tickets = await prisma.supportTicket.findMany(query);
    
    const mockTickets = [
      {
        id: "ticket1",
        subject: "Payment not processing",
        message: "I've been trying to make a payment for the last hour but it keeps failing. Can you help?",
        priority: "high",
        category: "billing",
        status: status || "active",
        attachments: [],
        userId: "user1",
        user: {
          name: "John Doe",
          email: "john@example.com"
        },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
        assignedTo: session.agentId,
        responses: [
          {
            id: "resp1",
            content: "I'll look into this right away. Can you tell me what error message you're seeing?",
            ticketId: "ticket1",
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            createdBy: session.agentId,
            createdByType: "agent"
          },
          {
            id: "resp2",
            content: "It says 'Payment method declined'. I've tried two different cards.",
            ticketId: "ticket1",
            createdAt: new Date(Date.now() - 1700000).toISOString(),
            createdBy: "user1",
            createdByType: "user"
          }
        ]
      },
      {
        id: "ticket2",
        subject: "Can't access my account",
        message: "I'm trying to log in but it says my password is incorrect. I've reset it twice already.",
        priority: "medium",
        category: "technical",
        status: status || "active",
        attachments: [],
        userId: "user2",
        user: {
          name: "Jane Smith",
          email: "jane@example.com"
        },
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        assignedTo: session.agentId,
        responses: []
      }
    ];
    
    // Filter based on status if needed
    let tickets = mockTickets;
    if (status) {
      tickets = mockTickets.filter(ticket => ticket.status === status);
    }
    
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await validateAgent(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, subject, message, priority, category } = await req.json();
    
    if (!userId || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // In a real implementation, this would be:
    // const ticket = await prisma.supportTicket.create({
    //   data: {
    //     subject,
    //     message,
    //     priority: priority || "medium",
    //     category: category || "general",
    //     status: "active",
    //     userId,
    //     assignedTo: session.agentId
    //   },
    //   include: {
    //     user: {
    //       select: {
    //         name: true,
    //         email: true
    //       }
    //     }
    //   }
    // });
    
    // Mock response
    const ticket = {
      id: "ticket" + Date.now(),
      subject,
      message,
      priority: priority || "medium",
      category: category || "general",
      status: "active",
      attachments: [],
      userId,
      user: {
        name: "Customer Name",
        email: "customer@example.com"
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: session.agentId,
      responses: []
    };
    
    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
