import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';
import nodemailer from 'nodemailer';

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  secure: process.env.EMAIL_SERVER_SECURE === 'true',
});

// Helper function to validate agent session
async function validateAgent(req: NextRequest) {
  const token = req.cookies.get('next-auth.session-token')?.value ||
                req.cookies.get('__Secure-next-auth.session-token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      id: string;
      email: string;
      role: string;
      exp?: number;
    };

    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return null;
    }

    if (decoded.role !== 'agent') {
      return null;
    }

    const agent = await prisma.agent.findUnique({
      where: { userId: decoded.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!agent) {
      return null;
    }

    return { userId: decoded.id, agentId: agent.id, agent };
  } catch (error) {
    return null;
  }
}

// Send email notification to customer when agent replies
async function sendAgentReplyEmail(userEmail: string, userName: string, chatSubject: string, replyContent: string, agentName: string) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: `Reply from ${agentName} - ${chatSubject}`,
      html: `
        <h2>New Reply from Support Agent</h2>
        <p>Hello ${userName},</p>
        <p>Your support agent <strong>${agentName}</strong> has replied to your chat about "<strong>${chatSubject}</strong>".</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #22c55e; margin: 20px 0;">
          <p><strong>Agent Reply:</strong></p>
          <p>${replyContent.replace(/\n/g, '<br>')}</p>
        </div>
        <p>You can continue the conversation by logging into your dashboard.</p>
        <p>Best regards,<br>Support Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Agent reply email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending agent reply email:', error);
  }
}

// GET: Retrieve messages for a chat
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await validateAgent(req);
    if (!session) {
      return apiErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { chatId } = await params;

    // Verify chat exists and agent has access
    const chat = await prisma.supportTicket.findUnique({
      where: { id: chatId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        agent: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      return apiErrorResponse("Chat not found", 404, "CHAT_NOT_FOUND");
    }

    // Agent can access if chat is assigned to them or if it's pending
    if (chat.agentId !== session.agentId && chat.status !== 'pending') {
      return apiErrorResponse("Access denied", 403, "ACCESS_DENIED");
    }

    // Get all messages for the chat
    const messages = await prisma.supportMessage.findMany({
      where: { ticketId: chatId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      chat,
      messages,
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return apiErrorResponse(
      "Failed to fetch messages",
      500,
      "FETCH_MESSAGES_FAILED",
      error instanceof Error ? error.message : String(error)
    );
  }
}

// POST: Send a message as an agent
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await validateAgent(req);
    if (!session) {
      return apiErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { chatId } = await params;
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return apiErrorResponse("Message content is required", 400, "MISSING_CONTENT");
    }

    // Verify chat exists and agent has access
    const chat = await prisma.supportTicket.findUnique({
      where: { id: chatId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!chat) {
      return apiErrorResponse("Chat not found", 404, "CHAT_NOT_FOUND");
    }

    // Agent must be assigned to this chat
    if (chat.agentId !== session.agentId) {
      return apiErrorResponse("Access denied - chat not assigned to you", 403, "ACCESS_DENIED");
    }

    // Create the message
    const message = await prisma.supportMessage.create({
      data: {
        ticketId: chatId,
        senderId: session.userId,
        content: content.trim(),
        isAgentReply: true,
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
    });

    // Update chat's updatedAt timestamp
    await prisma.supportTicket.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Send email notification to customer
    try {
      await sendAgentReplyEmail(
        chat.user.email,
        chat.user.name,
        chat.subject,
        content.trim(),
        session.agent.user.name
      );
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return apiErrorResponse(
      "Failed to send message",
      500,
      "SEND_MESSAGE_FAILED",
      error instanceof Error ? error.message : String(error)
    );
  }
}