import { Server as NetServer } from 'http';
import prisma from "@/lib/prisma";
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { createNotification } from '@/lib/notifications';

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

// Track online users and agents
const onlineUsers = new Map();
const onlineAgents = new Map();
const activeSupportChats = new Map();

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

export const initSocket = (server: NetServer) => {
  if (!(server as any).io) {
    console.log('*First use, starting socket.io');

    const io = new SocketIOServer(server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? process.env.NEXT_PUBLIC_BASE_URL
          : ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000, // 60 seconds
      pingInterval: 25000, // 25 seconds
    });

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
                  socket.emit('notification_received', notification);
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
                socket.emit('notification_received', notification);
              }
            }
          } else {
            // Existing support chat
            // Get the chat to check its status
            const chat = await prisma.supportChat.findUnique({
              where: { id: chatId },
              select: { status: true, userId: true, agentId: true }
            });

            if (!chat) {
              socket.emit('error', { message: 'Support chat not found' });
              return;
            }

            // Don't allow messages if chat is closed
            if (chat.status === 'closed') {
              socket.emit('error', { message: 'Cannot send messages to a closed chat' });
              return;
            }

            // Create the message in database first
            let newMessage;
            try {
              newMessage = await prisma.supportMessage.create({
                data: {
                  chatId,
                  content: message.content,
                  sender: userId,
                  senderType: userRole === 'agent' ? 'agent' : 'user',
                  read: false
                }
              });

              // Update chat timestamp and status if needed
              const updateData: any = { updatedAt: new Date() };

              // If chat is pending and an agent is sending a message, mark it as active
              if (chat.status === 'pending' && userRole === 'agent') {
                updateData.status = 'active';
                updateData.agentId = userId;
              }

              await prisma.supportChat.update({
                where: { id: chatId },
                data: updateData
              });
            } catch (dbError) {
              console.error('Error storing support message:', dbError);
              socket.emit('error', { message: 'Failed to save message' });
              return;
            }

            // Now broadcast the message
            if (recipientId) {
              // Direct message to specific recipient
              const recipientRoom = userRole === 'user' ? `agent_${recipientId}` : `user_${recipientId}`;
              io.to(recipientRoom).emit('support_message', {
                chatId,
                message: newMessage,
                senderId: userId,
                senderType: userRole === 'agent' ? 'agent' : 'user'
              });

              // Create a notification for the recipient
              const notification = await createNotification(
                recipientId,
                'support',
                `New message in support chat: ${message.content.substring(0, 30)}${message.content.length > 30 ? '...' : ''}`,
                'just now'
              );

              // Send notification to the recipient
              io.to(recipientRoom).emit('notification_received', notification);
            } else {
              // Broadcast to all participants in the support chat
              io.to(`support_${chatId}`).emit('support_message', {
                chatId,
                message: newMessage,
                senderId: userId,
                senderType: userRole === 'agent' ? 'agent' : 'user'
              });

              // Create notifications for other participants
              if (userRole === 'user' && chat.agentId) {
                // Notify the agent
                const notification = await createNotification(
                  chat.agentId,
                  'support',
                  `New message from user: ${message.content.substring(0, 30)}${message.content.length > 30 ? '...' : ''}`,
                  'just now'
                );

                io.to(`agent_${chat.agentId}`).emit('notification_received', notification);
              } else if (userRole === 'agent' && chat.userId) {
                // Notify the user
                const notification = await createNotification(
                  chat.userId,
                  'support',
                  `New message from agent: ${message.content.substring(0, 30)}${message.content.length > 30 ? '...' : ''}`,
                  'just now'
                );

                io.to(`user_${chat.userId}`).emit('notification_received', notification);
              }
            }
          }
        } catch (error) {
          console.error('Error handling support message:', error);
          socket.emit('error', { message: 'Failed to process message' });
        }
      });

      // Handle closing a support chat
      socket.on('close_support_chat', async (data: { chatId: string, reason?: string }) => {
        try {
          if (!data.chatId) return;

          // Check if user has permission to close this chat
          const chat = await prisma.supportChat.findUnique({
            where: { id: data.chatId },
            select: { userId: true, agentId: true, status: true }
          });

          if (!chat) {
            socket.emit('error', { message: 'Support chat not found' });
            return;
          }

          // Only the assigned agent, the user who created the chat, or an admin can close it
          if (userRole !== 'admin' && userId !== chat.userId && userId !== chat.agentId) {
            socket.emit('error', { message: 'You do not have permission to close this chat' });
            return;
          }

          // Don't close already closed chats
          if (chat.status === 'closed') {
            socket.emit('error', { message: 'This chat is already closed' });
            return;
          }

          // Update the chat status to closed
          await prisma.supportChat.update({
            where: { id: data.chatId },
            data: {
              status: 'closed',
              updatedAt: new Date()
            }
          });

          // Create a system message about the chat being closed
          const closeMessage = await prisma.supportMessage.create({
            data: {
              chatId: data.chatId,
              content: data.reason
                ? `Chat closed by ${userRole}: ${data.reason}`
                : `Chat closed by ${userRole}`,
              sender: userId,
              senderType: userRole === 'agent' ? 'agent' : 'user',
              read: true
            }
          });

          // Notify all participants
          io.to(`support_${data.chatId}`).emit('support_chat_closed', {
            chatId: data.chatId,
            closedBy: userId,
            closedByRole: userRole,
            reason: data.reason,
            message: closeMessage
          });

          // If closed by agent, decrement their active chats count
          if (userRole === 'agent' && chat.agentId === userId) {
            await prisma.agent.update({
              where: { id: userId },
              data: {
                activeChats: {
                  decrement: 1
                },
                lastActive: new Date()
              }
            });
          }

          // Remove from active support chats
          activeSupportChats.delete(data.chatId);

          // Create notifications for participants
          if (userRole === 'agent' || userRole === 'admin') {
            // Notify the user
            const notification = await createNotification(
              chat.userId,
              'support',
              `Your support chat has been closed${data.reason ? `: ${data.reason}` : ''}`,
              'just now'
            );

            io.to(`user_${chat.userId}`).emit('notification_received', notification);
          } else if (userRole === 'user' && chat.agentId) {
            // Notify the agent
            const notification = await createNotification(
              chat.agentId,
              'support',
              `Support chat closed by user${data.reason ? `: ${data.reason}` : ''}`,
              'just now'
            );

            io.to(`agent_${chat.agentId}`).emit('notification_received', notification);
          }

          // Notify admins
          io.to('admins').emit('support_chat_closed', {
            chatId: data.chatId,
            closedBy: userId,
            closedByRole: userRole,
            reason: data.reason
          });
        } catch (error) {
          console.error('Error closing support chat:', error);
          socket.emit('error', { message: 'Failed to close support chat' });
        }
      });

      // Handle agent accepting a support chat
      socket.on('accept_support_chat', async (data: { chatId: string }) => {
        try {
          if (userRole !== 'agent' || !data.chatId) return;

          const agentId = userId;

          // Check if the chat is already assigned to another agent
          const existingChat = await prisma.supportChat.findUnique({
            where: { id: data.chatId },
            select: { agentId: true, status: true, userId: true }
          });

          if (!existingChat) {
            socket.emit('error', { message: 'Support chat not found' });
            return;
          }

          if (existingChat.agentId && existingChat.agentId !== agentId && existingChat.status === 'active') {
            socket.emit('error', { message: 'This chat is already assigned to another agent' });
            return;
          }

          // Update the chat in the database
          const updatedChat = await prisma.supportChat.update({
            where: { id: data.chatId },
            data: {
              agentId,
              status: 'active',
              updatedAt: new Date()
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
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

          // Join the agent to the support chat room
          socket.join(`support_${data.chatId}`);

          // Create a welcome message from the agent
          const welcomeMessage = await prisma.supportMessage.create({
            data: {
              chatId: data.chatId,
              content: `Hello! I'm ${socket.data.user.name}, and I'll be assisting you today. How can I help?`,
              sender: agentId,
              senderType: 'agent',
              read: false
            }
          });

          // Notify the user that an agent has accepted their chat
          io.to(`user_${updatedChat.userId}`).emit('agent_accepted', {
            chatId: data.chatId,
            agentId,
            agentName: socket.data.user.name,
            message: welcomeMessage
          });

          // Also send the welcome message to all participants
          io.to(`support_${data.chatId}`).emit('support_message', {
            chatId: data.chatId,
            message: welcomeMessage,
            senderId: agentId,
            senderType: 'agent'
          });

          // Create a notification for the user
          const notification = await createNotification(
            updatedChat.userId,
            'support',
            `Agent ${socket.data.user.name} has accepted your support request`,
            'just now'
          );

          // Send notification to the user
          io.to(`user_${updatedChat.userId}`).emit('notification_received', notification);

          // Notify admins about the assignment
          io.to('admins').emit('support_chat_assigned', {
            chatId: data.chatId,
            agentId,
            userId: updatedChat.userId
          });

          // Track this chat as active for this agent
          activeSupportChats.set(data.chatId, agentId);

          // Update agent's active chats count
          await prisma.agent.update({
            where: { id: agentId },
            data: {
              activeChats: {
                increment: 1
              },
              lastActive: new Date()
            }
          });
        } catch (error) {
          console.error('Error accepting support chat:', error);
          socket.emit('error', { message: 'Failed to accept support chat' });
        }
      });

      // Handle notification events
      socket.on('send_notification', async (data: { userId: string, type: string, message: string, time?: string }) => {
        try {
          const { userId, type, message, time } = data;

          if (!userId || !type || !message) {
            socket.emit('error', { message: 'Invalid notification data' });
            return;
          }

          // Create notification in database
          const notification = await createNotification(userId, type, message, time);

          // Emit to the specific user
          io.to(`user_${userId}`).emit('notification_received', notification);

          console.log(`Notification sent to user ${userId}: ${message}`);
        } catch (error) {
          console.error('Error sending notification:', error);
          socket.emit('error', { message: 'Failed to send notification' });
        }
      });

      // Handle broadcast notifications (admin only)
      socket.on('broadcast_notification', async (data: { type: string, message: string, userIds?: string[] }) => {
        try {
          // Only admins can broadcast notifications
          if (userRole !== 'admin') {
            socket.emit('error', { message: 'Unauthorized: Only admins can broadcast notifications' });
            return;
          }

          const { type, message, userIds } = data;

          if (!type || !message) {
            socket.emit('error', { message: 'Invalid notification data' });
            return;
          }

          // If specific userIds are provided, send to those users only
          if (userIds && Array.isArray(userIds) && userIds.length > 0) {
            for (const userId of userIds) {
              // Create notification in database
              const notification = await createNotification(userId, type, message);

              // Emit to the specific user
              io.to(`user_${userId}`).emit('notification_received', notification);
            }
            console.log(`Notifications sent to ${userIds.length} users`);
          } else {
            // Broadcast to all users
            const users = await prisma.user.findMany({
              select: { id: true }
            });

            for (const user of users) {
              // Create notification in database
              const notification = await createNotification(user.id, type, message);

              // Emit to the specific user
              io.to(`user_${user.id}`).emit('notification_received', notification);
            }
            console.log(`Notifications broadcast to all users: ${message}`);
          }
        } catch (error) {
          console.error('Error broadcasting notification:', error);
          socket.emit('error', { message: 'Failed to broadcast notification' });
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

    (server as any).io = io;
  }
  return (server as any).io;
};

