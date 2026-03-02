import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Get token from different possible sources
    const sessionToken = req.cookies.get('next-auth.session-token')?.value ||
                        req.cookies.get('__Secure-next-auth.session-token')?.value;
                        
    if (!sessionToken) {
      return apiErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
    }

    let decoded;
    try {
      decoded = jwt.verify(sessionToken, process.env.NEXTAUTH_SECRET!) as { id: string };
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return apiErrorResponse('Invalid authentication token', 401, 'INVALID_TOKEN');
    }

    const userId = decoded.id;

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

    // Add headers to prevent caching issues
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Error fetching user ads:', error);
    return apiErrorResponse(
      'Failed to fetch ads',
      500,
      'FETCH_ADS_FAILED',
      error instanceof Error ? error.message : String(error)
    );
  }
}