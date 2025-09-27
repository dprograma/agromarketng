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
          agentId: session.agentId,
          status: 'active'
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
          agentId: session.agentId,
          status: 'closed'
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
      };
    } else {
      // Default to all tickets assigned to this agent
      query = {
        where: {
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
      };
    }
    
    // Fetch tickets from database
    const tickets = await prisma.supportTicket.findMany(query);

    // Transform the data to match the frontend expectations
    const transformedTickets = tickets.map(ticket => ({
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
    }));

    return NextResponse.json(transformedTickets);
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
    
    // Convert priority string to int
    const priorityInt = priority === 'high' ? 3 : priority === 'medium' ? 2 : 1;

    // Create the ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        priority: priorityInt,
        category: category || "general",
        status: "active",
        userId,
        agentId: session.agentId,
        attachments: []
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

    // Create initial message if provided
    if (message) {
      await prisma.supportMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: userId,
          content: message,
          isAgentReply: false
        }
      });
    }

    // Transform response to match frontend expectations
    const transformedTicket = {
      ...ticket,
      priority: ticket.priority === 3 ? 'high' : ticket.priority === 2 ? 'medium' : 'low',
      responses: (ticket as any).messages?.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        ticketId: msg.ticketId,
        createdAt: msg.createdAt.toISOString(),
        createdBy: msg.senderId,
        createdByType: msg.isAgentReply ? 'agent' : 'user'
      })) || []
    };
    
    return NextResponse.json(transformedTicket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
