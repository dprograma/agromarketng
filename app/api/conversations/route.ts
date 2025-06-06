import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';

// Helper function to validate user session
async function validateUser(req: NextRequest) {
  const token = req.cookies.get('next-auth.session-token')?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      id: string;
      role: string;
    };

    // Check if user is a regular user (not agent or admin)
    if (decoded.role !== 'user') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await validateUser(req);
    if (!session) {
      return apiErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const userId = session.id;

    // Fetch conversations where the user is either the buyer or the seller
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
      },
      include: {
        ad: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get only the last message
        },
      },
      orderBy: {
        updatedAt: 'desc', // Order by most recent message/update
      },
    });

    // Format the conversations to include the last message directly
    const formattedConversations = conversations.map(conversation => {
      const lastMessage = conversation.messages.length > 0 ? conversation.messages[0] : null;
      return {
        id: conversation.id,
        ad: conversation.ad,
        buyer: conversation.buyer,
        seller: conversation.seller,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          senderId: lastMessage.senderId,
          createdAt: lastMessage.createdAt,
        } : null,
        updatedAt: conversation.updatedAt,
      };
    });


    return NextResponse.json({ conversations: formattedConversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return apiErrorResponse(
      "Failed to fetch conversations",
      500,
      "FETCH_CONVERSATIONS_FAILED",
      error instanceof Error ? error.message : String(error)
    );
  }
}