import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    try {
      // Get user's subscription status
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscriptionPlan: true }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Fetch ads with proper order based on subscription
      const ads = await prisma.ad.findMany({
        where: { 
          userId 
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        include: {
          subscriptionPlan: {
            select: {
              name: true,
              features: true,
              expiryDate: true
            }
          }
        }
      });

      // Return ads with user's subscription info
      return NextResponse.json({
        ads: ads || [], // Ensure we always return an array
        subscription: user.subscriptionPlan || null,
        maxFreeAds: 5 // Default free tier limit
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}