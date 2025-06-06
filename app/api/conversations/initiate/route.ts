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

export async function POST(req: NextRequest) {
  try {
    const session = await validateUser(req);
    if (!session) {
      return apiErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const buyerId = session.id;
    const { adId, initialMessage } = await req.json();

    if (!adId || typeof adId !== 'string') {
      return apiErrorResponse("Ad ID is required", 400, "AD_ID_REQUIRED");
    }

    if (!initialMessage || typeof initialMessage !== 'string' || initialMessage.trim().length === 0) {
      return apiErrorResponse("Initial message content is required", 400, "INITIAL_MESSAGE_REQUIRED");
    }

    // Find the ad to get the sellerId
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      select: { userId: true }, // Select only the seller's user ID
    });

    if (!ad) {
      return apiErrorResponse("Ad not found", 404, "AD_NOT_FOUND");
    }

    const sellerId = ad.userId;

    // Prevent user from initiating a conversation with themselves
    if (buyerId === sellerId) {
      return apiErrorResponse("Cannot initiate conversation with yourself", 400, "SELF_CONVERSATION_FORBIDDEN");
    }

    // Check if a conversation already exists between this buyer and seller for this ad
    let conversation = await prisma.conversation.findUnique({
      where: {
        adId_buyerId: { // Use the composite unique constraint
          adId: adId,
          buyerId: buyerId,
        },
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
    });

    // If conversation doesn't exist, create a new one
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          adId: adId,
          buyerId: buyerId,
          sellerId: sellerId,
          messages: {
            create: {
              senderId: buyerId,
              content: initialMessage.trim(),
            },
          },
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
      });
    }

    // Format the conversation to include the last message directly
    const lastMessage = conversation.messages.length > 0 ? conversation.messages[0] : null;
    const formattedConversation = {
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


    return NextResponse.json({ conversation: formattedConversation });
  } catch (error) {
    console.error("Error initiating conversation:", error);
    return apiErrorResponse(
      "Failed to initiate conversation",
      500,
      "INITIATE_CONVERSATION_FAILED",
      error instanceof Error ? error.message : String(error)
    );
  }
}