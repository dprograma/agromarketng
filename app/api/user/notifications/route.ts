import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { formatDistanceToNow } from 'date-fns';
import { initialNotifications } from '@/constants';
import { markNotificationsAsRead } from '@/lib/notifications';
import { Notification } from '@/types';

/**
 * GET - Fetch all notifications for the current user
 */
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

    // Query the database for user notifications
    const notifications = await prisma.$queryRaw`
      SELECT * FROM "Notification"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
    `;

    // Format the time for each notification
    const formattedNotifications = (notifications as Notification[]).map((notification: Notification) => ({
      ...notification,
      time: notification.time || formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }),
    }));

    return NextResponse.json({ notifications: formattedNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);

    // Check if it's a Prisma error related to missing table
    if (error instanceof Error && error.message.includes('does not exist')) {
      // If the table doesn't exist, try to create notifications for the user
      try {
        const token = req.cookies.get('next-auth.session-token')?.value;
        if (!token) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
        const userId = decoded.id;

        // Try to create the notifications in the database
        const notifications = [];

        for (const notification of initialNotifications) {
          try {
            const newNotification = await prisma.notification.create({
              data: {
                userId,
                type: notification.type,
                message: notification.message,
                read: false,
                time: notification.time
              }
            });
            notifications.push(newNotification);
          } catch (createError) {
            console.error('Error creating notification:', createError);
          }
        }

        if (notifications.length > 0) {
          return NextResponse.json({ notifications });
        }

        // If we couldn't create notifications, return an empty array
        return NextResponse.json({ notifications: [] });
      } catch (innerError) {
        console.error('Error creating notifications:', innerError);
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST - Mark notifications as read
 */
export async function POST(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Get notification IDs to mark as read
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Update the database to mark notifications as read
    const updateResult = await markNotificationsAsRead(userId, ids);

    return NextResponse.json({
      success: true,
      message: `Marked ${updateResult.count} notifications as read`
    });
  } catch (error) {
    console.error('Error updating notifications:', error);

    // Check if it's a Prisma error related to missing table
    if (error instanceof Error && error.message.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        message: 'Notification table does not exist yet. Please run migrations.'
      });
    }

    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete notifications
 */
export async function DELETE(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Get notification IDs to delete
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Delete the notifications
    const deleteResult = await prisma.$executeRaw`
      DELETE FROM "Notification"
      WHERE "id" IN (${ids.join(',')})
      AND "userId" = ${userId}
    `;

    // Count how many were deleted (deleteResult is the number of rows affected)
    const deletedCount = deleteResult as number;

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} notifications`
    });
  } catch (error) {
    console.error('Error deleting notifications:', error);

    // Check if it's a Prisma error related to missing table
    if (error instanceof Error && error.message.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        message: 'Notification table does not exist yet. Please run migrations.'
      });
    }

    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
}
