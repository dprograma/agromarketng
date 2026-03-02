import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUserId, isAuthError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Unified auth: handles both custom JWT and NextAuth sessions
    const authResult = await getAuthUserId(req);
    if (isAuthError(authResult)) {
      return NextResponse.json(
        { error: authResult.error, code: authResult.code },
        { status: authResult.status }
      );
    }

    const userId = authResult.userId;

    const [ads, user] = await Promise.all([
      prisma.ad.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        include: { subscriptionPlan: true }
      })
    ]);

    const response = NextResponse.json({
      ads,
      subscription: user?.subscriptionPlan,
      maxFreeAds: 5
    });

    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Error fetching user ads:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch ads',
        code: 'FETCH_ADS_FAILED',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
