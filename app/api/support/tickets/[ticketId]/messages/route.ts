import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions'; // Assuming you have authOptions defined here
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Configure Nodemailer transporter (replace with your actual configuration)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  secure: process.env.EMAIL_SERVER_SECURE === 'true', // true for 465, false for other ports
});

// Function to send email notification for agent replies
async function sendAgentReplyEmail(userEmail: string, ticketSubject: string, replyContent: string) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Sender address
      to: userEmail, // Recipient address
      subject: `Reply to your support ticket: ${ticketSubject}`, // Subject line
      text: `An agent has replied to your support ticket "${ticketSubject}".\n\nReply: ${replyContent}\n\nPlease log in to your dashboard to view the full conversation.`, // Plain text body
      html: `<p>An agent has replied to your support ticket "<strong>${ticketSubject}</strong>".</p><p><strong>Reply:</strong> ${replyContent}</p><p>Please log in to your dashboard to view the full conversation.</p>`, // HTML body
    };

    await transporter.sendMail(mailOptions);
    console.log(`Agent reply email sent to ${userEmail}`);
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
      const user = await prisma.user.findUnique({ // Fetch user's email
        where: { id: ticket.userId },
        select: { email: true },
      });

      if (user?.email) {
        await sendAgentReplyEmail(user.email, ticket.subject, content);
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