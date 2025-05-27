import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return apiErrorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;
    const { id } = await params;

    // Check subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptionPlan: true }
    });

    if (!user?.subscriptionPlan || user.subscriptionPlan.expiryDate < new Date()) {
      return apiErrorResponse(
        'Active subscription required to feature ads. Please upgrade your plan.',
        403,
        'SUBSCRIPTION_REQUIRED'
      );
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

    // Update ad
    const updatedAd = await prisma.ad.update({
      where: { id },
      data: {
        featured: true
      }
    });

    return NextResponse.json({
      ad: updatedAd,
      message: 'Ad featured successfully'
    });
  } catch (error) {
    console.error('Error featuring ad:', error); // Log the actual error for debugging
    return apiErrorResponse(
      'Failed to feature ad',
      500,
      'FEATURE_AD_FAILED',
      error instanceof Error ? error.message : String(error)
    );
  }
}