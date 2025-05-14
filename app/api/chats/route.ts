import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId
          }
        }
      },
      include: {
        ad: {
          select: {
            title: true,
            images: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    const { adId, recipientId, message } = await req.json();

    // Add validation
    if (!adId || !recipientId || !message) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: { adId, recipientId, message }
      }, { status: 400 });
    }

    // Check if chat already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        AND: [
          { adId },
          {
            participants: {
              every: {
                userId: {
                  in: [userId, recipientId]
                }
              }
            }
          }
        ]
      },
      include: {
        messages: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        ad: {
          select: {
            title: true,
            images: true
          }
        }
      }
    });

    if (existingChat) {
      // Add new message to existing chat
      const newMessage = await prisma.message.create({
        data: {
          content: message,
          chatId: existingChat.id,
          senderId: userId
        }
      });

      return NextResponse.json({
        chat: {
          ...existingChat,
          messages: [...existingChat.messages, newMessage]
        }
      });
    }

    // Create new chat
    const chat = await prisma.chat.create({
      data: {
        adId,
        participants: {
          create: [
            { userId },
            { userId: recipientId }
          ]
        },
        messages: {
          create: {
            content: message,
            senderId: userId
          }
        }
      },
      include: {
        messages: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        ad: {
          select: {
            title: true,
            images: true
          }
        }
      }
    });

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json({
      error: 'Failed to create chat',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}