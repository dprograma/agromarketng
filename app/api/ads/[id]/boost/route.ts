import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { boostOptions } from '@/constants';
import { apiErrorResponse } from '@/lib/errorHandling';
import { promotionRateLimiters } from '@/lib/rateLimit';
import { PromotionAuditLogger } from '@/lib/promotionAudit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = promotionRateLimiters.boost(request);
    if (!rateLimitResult.success) {
      return apiErrorResponse(
        'Rate limit exceeded. Too many boost attempts.',
        429,
        'RATE_LIMIT_EXCEEDED',
        `Try again after ${new Date(rateLimitResult.resetTime).toISOString()}`
      );
    }

    // Make sure id is valid
    const { id } = await params;
    if (!id) {
      return apiErrorResponse(
        'Invalid ad ID',
        400,
        'INVALID_AD_ID'
      );
    }

    // Parse request body
    let boostType: number, duration: number;
    try {
      const body = await request.json();
      ({ boostType, duration } = body);

      if (!boostType || !duration) {
        return apiErrorResponse(
          'Missing required fields: boostType and duration',
          400,
          'MISSING_FIELDS'
        );
      }

      // Validate boost type
      const validBoostType = boostOptions.some(opt => opt.id === boostType);
      if (!validBoostType) {
        return apiErrorResponse(
          'Invalid boost type',
          400,
          'INVALID_BOOST_TYPE'
        );
      }

      // Validate duration
      const validDuration = boostOptions.find(opt => opt.id === boostType)?.duration.includes(duration);
      if (!validDuration) {
        return apiErrorResponse(
          'Invalid duration for selected boost type',
          400,
          'INVALID_BOOST_DURATION'
        );
      }
    } catch (e) {
      return apiErrorResponse(
        'Invalid request body',
        400,
        'INVALID_REQUEST_BODY',
        e instanceof Error ? e.message : String(e)
      );
    }

    // Get token from cookies
    const token = request.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return apiErrorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Get user with subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptionPlan: true }
    });

    // If no active subscription, return available plans and redirect info
    if (!user?.subscriptionPlan || user.subscriptionPlan.expiryDate < new Date()) {
      const availablePlans = await prisma.subscriptionPlan.findMany({
        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
          benefits: true,
        }
      });

      return NextResponse.json({
        status: 'SUBSCRIPTION_REQUIRED',
        message: 'Active subscription required to boost ads',
        adId: id,
        subscriptionPlans: availablePlans,
        redirectUrl: '/dashboard/promotions' // Suggest redirect to promotions page
      }, { status: 403 });
    }

    // Get ad
    const ad = await prisma.ad.findUnique({
      where: { id }
    });

    if (!ad || ad.userId !== userId) {
      return apiErrorResponse(
        'Ad not found or unauthorized',
        404,
        'AD_NOT_FOUND_OR_UNAUTHORIZED'
      );
    }

    // Check if ad is already boosted
    if (ad.featured && ad.boostEndDate && new Date(ad.boostEndDate) > new Date()) {
      return apiErrorResponse(
        'Ad is already boosted',
        400,
        'AD_ALREADY_BOOSTED'
      );
    }

    // Check if ad is active
    if (ad.status !== 'Active') {
      return NextResponse.json(
        { error: 'Ad must be active before it can be boosted' },
        { status: 400 }
      );
    }

    // Calculate boost end date
    const boostEndDate = new Date();
    boostEndDate.setDate(boostEndDate.getDate() + duration);

    // Update ad - set higher boostMultiplier to prioritize in search and featured products
    const updatedAd = await prisma.ad.update({
      where: { id },
      data: {
        featured: true,
        boostType,
        boostEndDate,
        boostStartDate: new Date(),
        boostMultiplier: 2.0 // Higher multiplier ensures boosted ads rank first (1.0 for non-boosted)
      }
    });

    // Log audit event for boost creation
    await PromotionAuditLogger.logBoostCreated(
      userId,
      id,
      boostType,
      duration,
      request.headers.get('user-agent') || undefined,
      request.headers.get('x-forwarded-for')?.split(',')[0] || undefined
    );

    return NextResponse.json(updatedAd);
  } catch (error) {
    console.error('Error boosting ad:', error); // Log the actual error for debugging
    return apiErrorResponse(
      'Failed to boost ad',
      500,
      'BOOST_AD_FAILED',
      error instanceof Error ? error.message : String(error)
    );
  }
}