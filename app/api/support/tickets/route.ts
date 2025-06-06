import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions'; // Assuming you have authOptions defined here

const prisma = new PrismaClient();

// Handle POST requests to create a new support ticket
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { subject, message, priority, category, attachments } = await request.json();

    if (!subject || !message || !priority || !category) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newTicket = await prisma.supportTicket.create({
      data: {
        subject,
        priority,
        category,
        attachments: attachments || [],
        userId: session.user.id, // Use session.user.id
        status: 'open',
      },
    });

    // Create the initial support message linked to the ticket
    await prisma.supportMessage.create({
      data: {
        ticketId: newTicket.id,
        senderId: session.user.id, // Use session.user.id
        content: message,
        isAgentReply: false, // Initial message is from the user
      },
    });

    // TODO: Send email notification to agent(s) about the new ticket

    return NextResponse.json(newTicket, { status: 201 });

  } catch (error) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle GET requests to retrieve support tickets
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Agents can view all tickets, users can only view their own
    if (session.user.role === 'agent') {
      const tickets = await prisma.supportTicket.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          messages: true, // Include messages for each ticket
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return NextResponse.json(tickets);
    } else {
      const userTickets = await prisma.supportTicket.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
           messages: true, // Include messages for each ticket
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return NextResponse.json(userTickets);
    }

  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
