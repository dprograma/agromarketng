import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(
  request: NextRequest,
  {params}: { params: { id: string } }
) {
  try {
    // Make sure id is valid
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'Invalid ad ID' },
        { status: 400 }
      );
    }
    // Parse request body
    let boostType, duration;
    try {
      const body = await request.json();
      ({ boostType, duration } = body);

      if (!boostType || !duration) {
        return NextResponse.json(
          { error: 'Missing required fields: boostType and duration' },
          { status: 400 }
        );
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Get token from cookies
    const token = request.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Check if user has active subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptionPlan: true }
    });


    // If no subscription, return available plans and redirect info
    if (!user?.subscriptionPlan || user.subscriptionPlan.expiryDate < new Date()) {
      const availablePlans = await prisma.subscriptionPlan.findMany({
        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
          benefits: true
        }
      });

      return NextResponse.json({
        error: 'Subscription required',
        status: 'SUBSCRIPTION_REQUIRED',
        message: 'Active subscription required to boost ads',
        adId: id,
        subscriptionPlans: availablePlans,
        redirectUrl: '/dashboard/promotions'
      }, { status: 403 });
    }

    // Verify ad ownership
    const ad = await prisma.ad.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!ad || ad.userId !== userId) {
      return NextResponse.json(
        { error: 'Ad not found or unauthorized' },
        { status: 404 }
      );
    }

    // Calculate boost dates
    const boostStartDate = new Date();
    const boostEndDate = new Date();
    boostEndDate.setDate(boostEndDate.getDate() + duration);

    // Update ad with boost information
    const updatedAd = await prisma.ad.update({
      where: { id },
      data: {
        featured: true,
        status: 'Active',
        subscriptionPlanId: user.subscriptionPlanId,
        boostType,
        boostStartDate,
        boostEndDate,
        boostStatus: 'active'
      },
    });

    return NextResponse.json({
      ad: updatedAd,
      message: 'Ad boosted successfully'
    });
  } catch (error) {
    console.error('Error boosting ad:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to boost ad' },
      { status: 500 }
    );
  }
}