import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { quickSend } from '@/lib/email';

const prisma = new PrismaClient();


// Function to send email notification for agent replies
async function sendAgentReplyEmail(userEmail: string, userName: string, ticketSubject: string, replyContent: string, ticketId: string) {
  try {
    const result = await quickSend.supportReply(
      userEmail,
      userName,
      ticketSubject,
      replyContent,
      ticketId,
      'open'
    );

    if (!result.success) {
      console.error('Failed to send agent reply email:', result.error);
    } else {
      console.log(`Agent reply email sent to ${userEmail}:`, result.messageId);
    }
  } catch (error) {
    console.error('Error sending agent reply email:', error);
  }
}


// Handle POST requests to add a new message to a support ticket
export async function POST(request: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { ticketId } = await params;
    const { content, isAgentReply = false } = await request.json(); // isAgentReply will be true for agent replies

    if (!content) {
      return NextResponse.json({ message: 'Message content is required' }, { status: 400 });
    }

    // Verify that the user is either the ticket owner or an agent
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { userId: true, subject: true }, // Select subject to include in email
    });

    if (!ticket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.userId !== session.user.id && session.user.role !== 'agent') {
      return NextResponse.json({ message: 'Unauthorized to add message to this ticket' }, { status: 403 });
    }

    const newMessage = await prisma.supportMessage.create({
      data: {
        ticketId,
        senderId: session.user.id,
        content,
        isAgentReply,
      },
    });

    // If the message is an agent reply, send an email notification to the user
    if (isAgentReply) {
      const user = await prisma.user.findUnique({ // Fetch user's email and name
        where: { id: ticket.userId },
        select: { email: true, name: true },
      });

      if (user?.email) {
        await sendAgentReplyEmail(user.email, user.name || 'User', ticket.subject, content, ticketId);
      }
    }

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error adding message to support ticket:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle GET requests to retrieve messages for a support ticket
export async function GET(request: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { ticketId } = await params;

    // Verify that the user is either the ticket owner or an agent
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { userId: true },
    });

    if (!ticket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.userId !== session.user.id && session.user.role !== 'agent') {
      return NextResponse.json({ message: 'Unauthorized to view messages for this ticket' }, { status: 403 });
    }

    const messages = await prisma.supportMessage.findMany({
      where: {
        ticketId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching support messages:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}