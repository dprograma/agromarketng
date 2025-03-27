import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Add console.log to debug
    console.log('Received request for promotions');

    // Get token from cookies
    const token = request.cookies.get('next-auth.session-token')?.value;
    console.log('Token exists:', !!token);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;
    console.log('User ID:', userId);

    // Get current date
    const now = new Date();

    try {
      // Debug database queries
      console.log('Fetching boosted ads and subscription');
      
      // Get active boosts with error handling
      const boostedAds = await prisma.ad.findMany({
        where: {
          userId,
          boostEndDate: { gt: now },
          boostStatus: 'active'
        },
        select: {
          id: true,
          title: true,
          boostType: true,
          boostStartDate: true,
          boostEndDate: true,
          views: true,
          clicks: true
        },
        orderBy: { boostEndDate: 'asc' }
      }).catch(error => {
        console.error('Error fetching boosted ads:', error);
        return [];
      });

      // Get active subscription with error handling
      const subscription = await prisma.subscriptionPlan.findFirst({
        where: {
          users: { some: { id: userId } },
          expiryDate: { gt: now }
        },
        select: {
          id: true,
          name: true,
          features: true,
          expiryDate: true,
          benefits: true
        }
      }).catch(error => {
        console.error('Error fetching subscription:', error);
        return null;
      });

      console.log('Data fetched successfully:', {
        boostsCount: boostedAds.length,
        hasSubscription: !!subscription
      });

      return NextResponse.json({
        boosts: boostedAds.map(ad => ({
          type: 'boost',
          id: ad.id,
          title: ad.title,
          startDate: ad.boostStartDate,
          endDate: ad.boostEndDate,
          metrics: {
            views: ad.views || 0,
            clicks: ad.clicks || 0
          },
          boostType: ad.boostType
        })),
        subscription: subscription ? {
          type: 'subscription',
          id: subscription.id,
          title: subscription.name,
          endDate: subscription.expiryDate,
          features: subscription.features,
          benefits: subscription.benefits
        } : null
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