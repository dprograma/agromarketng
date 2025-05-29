import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { initialNotifications } from '@/constants';

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

    // Check if user already has notifications
    const existingNotifications = await prisma.notification.count({
      where: {
        userId: userId,
      },
    });

    if (existingNotifications > 0) {
      return NextResponse.json({ 
        message: 'User already has notifications',
        count: existingNotifications
      });
    }

    // Create initial notifications for the user
    const notificationsToCreate = initialNotifications.map(notification => ({
      userId: userId,
      type: notification.type,
      message: notification.message,
      time: notification.time,
      read: false,
    }));

    const createdNotifications = await prisma.notification.createMany({
      data: notificationsToCreate,
    });

    return NextResponse.json({ 
      success: true,
      message: `Created ${createdNotifications.count} notifications for user`,
      count: createdNotifications.count
    });
  } catch (error) {
    console.error('Error seeding notifications:', error);
    return NextResponse.json(
      { error: 'Failed to seed notifications' },
      { status: 500 }
    );
  }
}
