import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { promotionRateLimiters } from '@/lib/rateLimit';
import { apiErrorResponse } from '@/lib/errorHandling';
import { PromotionAuditLogger } from '@/lib/promotionAudit';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = promotionRateLimiters.promotions(request);
    if (!rateLimitResult.success) {
      return apiErrorResponse(
        'Rate limit exceeded. Too many requests.',
        429,
        'RATE_LIMIT_EXCEEDED',
        `Try again after ${new Date(rateLimitResult.resetTime).toISOString()}`
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

    // Get current date
    const now = new Date();

    try {
      
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

      // Log promotion view for analytics (non-blocking)
      if (boostedAds.length > 0 || subscription) {
        PromotionAuditLogger.logPromotionView(
          userId,
          'promotions_dashboard',
          'AD',
          request.headers.get('user-agent') || undefined,
          request.headers.get('x-forwarded-for')?.split(',')[0] || undefined
        ).catch(error => {
          // Don't fail the request if audit logging fails
          console.warn('Audit logging failed:', error);
        });
      }

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