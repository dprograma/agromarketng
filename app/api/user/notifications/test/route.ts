import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { initialNotifications } from '@/constants';

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

    // For testing, we'll return the initial notifications with the userId
    const notifications = initialNotifications.map(notification => ({
      ...notification,
      userId,
      read: Math.random() > 0.5, // 50% chance of being read
    }));

    return NextResponse.json({ 
      notifications,
      userId,
      message: 'This is a test endpoint. In production, notifications would be fetched from the database.'
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
