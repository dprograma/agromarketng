import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';
import { adPostingRateLimiters } from '@/lib/rateLimit';
import { sanitizeTextInput } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

// GET single ad for editing
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id: adId } = await params;

    const ad = await prisma.ad.findFirst({
      where: {
        id: adId,
        userId: userId // Ensure user can only edit their own ads
      }
    });

    if (!ad) {
      return apiErrorResponse('Ad not found or access denied', 404, 'AD_NOT_FOUND');
    }

    return NextResponse.json({ ad });
  } catch (error) {
    console.error('Error fetching ad:', error);
    return apiErrorResponse(
      'Failed to fetch ad',
      500,
      'FETCH_AD_FAILED',
      error instanceof Error ? error.message : String(error)
    );
  }
}

// PUT update ad
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Rate limiting
    const rateLimitResult = adPostingRateLimiters.updateAd(req);
    if (!rateLimitResult.success) {
      return apiErrorResponse(
        'Too many update requests. Please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED',
        `Try again after ${new Date(rateLimitResult.resetTime).toISOString()}`
      );
    }

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
    const { id: adId } = await params;
    const updateData = await req.json();

    // Verify the ad exists and belongs to the user
    const existingAd = await prisma.ad.findFirst({
      where: {
        id: adId,
        userId: userId
      }
    });

    if (!existingAd) {
      return apiErrorResponse('Ad not found or access denied', 404, 'AD_NOT_FOUND');
    }

    // Sanitize text inputs
    const updatedAd = await prisma.ad.update({
      where: { id: adId },
      data: {
        title: updateData.title ? sanitizeTextInput(updateData.title) : undefined,
        category: updateData.category ? sanitizeTextInput(updateData.category) : undefined,
        subcategory: updateData.subcategory ? sanitizeTextInput(updateData.subcategory) : undefined,
        section: updateData.section ? sanitizeTextInput(updateData.section) : undefined,
        location: updateData.location ? sanitizeTextInput(updateData.location) : undefined,
        price: updateData.price,
        description: updateData.description ? sanitizeTextInput(updateData.description) : undefined,
        contact: updateData.contact ? sanitizeTextInput(updateData.contact) : undefined,
        images: updateData.images,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      ad: updatedAd,
      message: 'Ad updated successfully'
    });
  } catch (error) {
    console.error('Error updating ad:', error);
    return apiErrorResponse(
      'Failed to update ad',
      500,
      'UPDATE_AD_FAILED',
      error instanceof Error ? error.message : String(error)
    );
  }
}

// DELETE ad
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id: adId } = await params;

    // Verify the ad exists and belongs to the user
    const existingAd = await prisma.ad.findFirst({
      where: {
        id: adId,
        userId: userId
      }
    });

    if (!existingAd) {
      return apiErrorResponse('Ad not found or access denied', 404, 'AD_NOT_FOUND');
    }

    // Permanently delete the ad
    await prisma.ad.delete({
      where: { id: adId }
    });

    return NextResponse.json({
      message: 'Ad deleted successfully',
      deletedId: adId
    });
  } catch (error) {
    console.error('Error deleting ad:', error);
    return apiErrorResponse(
      'Failed to delete ad',
      500,
      'DELETE_AD_FAILED',
      error instanceof Error ? error.message : String(error)
    );
  }
}