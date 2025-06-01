// socketServer.ts - Standalone Socket Server
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const prisma = new PrismaClient();

// Track online users and agents
const onlineUsers = new Map();
const onlineAgents = new Map();
const activeSupportChats = new Map();

// Helper function to create notification
const createNotification = async (userId: string, type: string, message: string, time?: string) => {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        time: time || 'just now',
        read: false
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Helper function to update agent status in database
const updateAgentStatus = async (agentId: string, isOnline: boolean) => {
  try {
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        isOnline,
        lastActive: new Date()
      }
    });
  } catch (error) {
    console.error('Error updating agent status:', error);
  }
};

// Helper function to mark messages as read
const markMessagesAsRead = async (chatId: string, userId: string) => {
  try {
    await prisma.message.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        read: false
      },
      data: { read: true }
    });

    // Update unread count for the participant
    await prisma.chatParticipant.updateMany({
      where: {
        chatId,
        userId
      },
      data: { unreadCount: 0 }
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

// Helper function to mark support messages as read
const markSupportMessagesAsRead = async (chatId: string, senderType: string) => {
  try {
    await prisma.supportMessage.updateMany({
      where: {
        chatId,
        senderType: senderType === 'user' ? 'agent' : 'user',
        read: false
      },
      data: { read: true }
    });
  } catch (error) {
    console.error('Error marking support messages as read:', error);
  }
};

// Helper function to update unread count
const incrementUnreadCount = async (chatId: string, recipientId: string) => {
  try {
    await prisma.chatParticipant.updateMany({
      where: {
        chatId,
        userId: recipientId
      },
      data: {
        unreadCount: {
          increment: 1
        }
      }
    });
  } catch (error) {
    console.error('Error incrementing unread count:', error);
  }
};

// Create HTTP server
const server = createServer();

// Initialize Socket.IO server
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? [process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com']
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000, // 60 seconds
  pingInterval: 25000, // 25 seconds
  transports: ['websocket', 'polling']
});

// Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const role = socket.handshake.auth.role;
  
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    socket.data.user = decoded;
    socket.data.role = role;
    next();
  } catch (err) {
    console.error('Socket authentication error:', err);
    next(new Error('Authentication error: Invalid token'));
  }
});

// Handle connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  const userId = socket.data.user?.id;
  const userRole = socket.data.role;

  if (!userId) {
    socket.disconnect();
    return;
  }

  // Join user to their personal room
  socket.join(`user_${userId}`);

  // Handle user/agent specific connections
  if (userRole === 'agent') {
    const agentId = userId;
    onlineAgents.set(agentId, socket.id);
    socket.join('agents');

    // Update agent status in database
    updateAgentStatus(agentId, true);

    // Notify admin about agent connection
    io.to('admins').emit('agent_status_change', { agentId, isOnline: true });

    // Join agent to their specific room
    socket.join(`agent_${agentId}`);
  } else if (userRole === 'admin') {
    socket.join('admins');
  } else {
    // Regular user
    onlineUsers.set(userId, socket.id);
  }

  // Handle chat room joining
  socket.on('join_chat', (chatId: string) => {
    if (chatId) {
      socket.join(`chat_${chatId}`);
      console.log(`User ${userId} joined chat ${chatId}`);

      // Mark messages as read when joining a chat
      if (userId) {
        markMessagesAsRead(chatId, userId);
        // Emit typing stopped event when joining to reset any previous typing indicators
        socket.to(`chat_${chatId}`).emit('typing_stopped', { userId });
      }
    }
  });

  socket.on('leave_chat', (chatId: string) => {
    if (chatId) {
      socket.leave(`chat_${chatId}`);
      console.log(`User ${userId} left chat ${chatId}`);
      // Emit typing stopped event when leaving
      socket.to(`chat_${chatId}`).emit('typing_stopped', { userId });
    }
  });

  // Handle typing indicators
  socket.on('typing_started', (data: { chatId: string }) => {
    if (data?.chatId && userId) {
      socket.to(`chat_${data.chatId}`).emit('typing_started', { userId });
    }
  });

  socket.on('typing_stopped', (data: { chatId: string }) => {
    if (data?.chatId && userId) {
      socket.to(`chat_${data.chatId}`).emit('typing_stopped', { userId });
    }
  });

  // Handle new messages
  socket.on('new_message', async (data: { chatId: string; message: any; recipientId: string }) => {
    if (data?.chatId) {
      // Broadcast message to all users in the chat room
      io.to(`chat_${data.chatId}`).emit('message_received', data.message);

      // If recipient is not in the chat room, increment their unread count
      if (data.recipientId && !io.sockets.adapter.rooms.get(`chat_${data.chatId}`)?.has(onlineUsers.get(data.recipientId))) {
        incrementUnreadCount(data.chatId, data.recipientId);
      }
    }
  });

  // Handle support chat events
  socket.on('join_support_chat', (chatId: string) => {
    if (chatId) {
      socket.join(`support_${chatId}`);
      console.log(`${userRole} ${userId} joined support chat ${chatId}`);

      // Mark messages as read when joining a support chat
      if (userId) {
        markSupportMessagesAsRead(chatId, userRole);
      }

      // Track active support chats for agents
      if (userRole === 'agent') {
        activeSupportChats.set(chatId, userId);
      }
    }
  });

  socket.on('leave_support_chat', (chatId: string) => {
    if (chatId) {
      socket.leave(`support_${chatId}`);
      console.log(`${userRole} ${userId} left support chat ${chatId}`);

      // Remove from active support chats for agents
      if (userRole === 'agent' && activeSupportChats.get(chatId) === userId) {
        activeSupportChats.delete(chatId);
      }
    }
  });

  // Handle support messages
  socket.on('support_message', async (data) => {
    try {
      const { chatId, message, recipientId } = data;

      if (!chatId) {
        // New support request from user
        if (userRole !== 'agent' && userRole !== 'admin') {
          // Broadcast to all online agents
          if (onlineAgents.size > 0) {
            io.to('agents').emit('new_support_request', {
              userId,
              message: data.content,
              timestamp: new Date()
            });

            // Also notify admins
            io.to('admins').emit('new_support_request', {
              userId,
              message: data.content,
              timestamp: new Date()
            });

            // Create a new support chat in the database
            try {
              const supportChat = await prisma.supportChat.create({
                data: {
                  userId,
                  status: 'pending',
                  category: data.category || 'general',
                  priority: data.priority || 1,
                  messages: {
                    create: {
                      content: data.content || 'I need help with my account',
                      sender: userId,
                      senderType: 'user',
                      read: false
                    }
                  }
                },
                include: {
                  messages: true,
                  agent: {
                    include: {
                      user: {
                        select: {
                          name: true,
                          email: true
                        }
                      }
                    }
                  }
                }
              });

              // Emit the created chat back to the user
              socket.emit('support_chat_created', supportChat);

              // Notify all agents about the new chat
              io.to('agents').emit('new_support_chat', supportChat);

              // Create a notification for the user
              const notification = await createNotification(
                userId,
                'support',
                'Your support request has been received. An agent will assist you shortly.',
                'just now'
              );

              // Send notification to the user
              if (notification) {
                socket.emit('notification_received', notification);
              }
            } catch (dbError) {
              console.error('Error creating support chat:', dbError);
              socket.emit('error', { message: 'Failed to create support chat' });
            }
          } else {
            // No agents online, inform the user
            socket.emit('no_agents_available', {
              message: 'No support agents are currently available. Please try again later or submit a support ticket.'
            });

            // Create a notification for the user
            const notification = await createNotification(
              userId,
              'support',
              'No support agents are currently available. Please try again later.',
              'just now'
            );

            // Send notification to the user
            if (notification) {
              socket.emit('notification_received', notification);
            }
          }
        }
      } else {
        // Existing support chat logic here
        // ... (rest of the support chat handling code from your original file)
      }
    } catch (error) {
      console.error('Error handling support message:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    if (userRole === 'agent') {
      onlineAgents.delete(userId);
      updateAgentStatus(userId, false);

      // Notify admin about agent disconnection
      io.to('admins').emit('agent_status_change', { agentId: userId, isOnline: false });

      // Handle active chats for this agent
      for (const [chatId, agentId] of activeSupportChats.entries()) {
        if (agentId === userId) {
          // Optionally mark chat as pending again or notify admins
          io.to('admins').emit('agent_disconnected_from_chat', {
            chatId,
            agentId: userId
          });
        }
      }
    } else {
      onlineUsers.delete(userId);
    }
  });
});

// Start the server
const PORT = process.env.SOCKET_PORT || 3002;
server.listen(PORT, () => {
  console.log(`🚀 Socket server listening on port ${PORT}`);
  console.log(`🌐 CORS origin: ${process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL : 'http://localhost:3000'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Socket server shutting down...');
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Socket server shutting down...');
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});