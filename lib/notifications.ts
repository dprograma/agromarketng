import prisma from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { Server as SocketIOServer } from 'socket.io';

/**
 * Creates a new notification for a user
 */
export async function createNotification(
  userId: string,
  type: string,
  message: string,
  time?: string
) {
  try {
    const formattedTime = time || formatDistanceToNow(new Date(), { addSuffix: true });

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        time: formattedTime,
        read: false,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Creates an ad approval notification
 */
export async function createAdApprovalNotification(userId: string, adTitle: string) {
  return createNotification(
    userId,
    'ad',
    `🎉 Your ad '${adTitle}' has been approved!`
  );
}

/**
 * Creates a promotion expiry notification
 */
export async function createPromotionExpiryNotification(userId: string, daysLeft: number) {
  return createNotification(
    userId,
    'promotion',
    `⏳ Your featured ad boost expires in ${daysLeft} days!`
  );
}

/**
 * Creates a payment success notification
 */
export async function createPaymentSuccessNotification(userId: string, item: string) {
  return createNotification(
    userId,
    'payment',
    `✅ Payment for ${item} was successful.`
  );
}

/**
 * Creates a payment failure notification
 */
export async function createPaymentFailureNotification(userId: string, item: string) {
  return createNotification(
    userId,
    'payment-failed',
    `⚠️ Your payment for '${item}' failed.`
  );
}

/**
 * Marks notifications as read
 */
export async function markNotificationsAsRead(userId: string, notificationIds: string[]) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
        userId: userId,
      },
      data: {
        read: true,
      },
    });

    return result;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
}

/**
 * Gets unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: userId,
        read: false,
      },
    });

    return count;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    throw error;
  }
}

/**
 * Sends a real-time notification to a user
 * This function creates a notification in the database and emits a socket event
 */
export async function sendRealTimeNotification(
  io: SocketIOServer,
  userId: string,
  type: string,
  message: string,
  time?: string
) {
  try {
    // Create notification in database
    const notification = await createNotification(userId, type, message, time);

    // Emit to the specific user
    io.to(`user_${userId}`).emit('notification_received', notification);

    return notification;
  } catch (error) {
    console.error('Error sending real-time notification:', error);
    throw error;
  }
}

/**
 * Broadcasts a notification to multiple users
 */
export async function broadcastNotification(
  io: SocketIOServer,
  userIds: string[],
  type: string,
  message: string
) {
  try {
    const notifications = [];

    for (const userId of userIds) {
      // Create notification in database
      const notification = await createNotification(userId, type, message);

      // Emit to the specific user
      io.to(`user_${userId}`).emit('notification_received', notification);

      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    throw error;
  }
}
