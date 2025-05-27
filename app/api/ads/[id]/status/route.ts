import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';
import { apiErrorResponse } from '@/lib/errorHandling';

// Define params interface
interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return apiErrorResponse(
        'Invalid ad ID',
        400,
        'INVALID_AD_ID'
      );
    }

    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return apiErrorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }

    // Rest of your code remains the same
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    const { status } = await req.json();
    const validStatuses = ['Active', 'Pending', 'Inactive', 'Sold'];

    if (!validStatuses.includes(status)) {
      return apiErrorResponse(
        'Invalid status value',
        400,
        'INVALID_STATUS_VALUE'
      );
    }

    // Verify ad ownership
    const ad = await prisma.ad.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!ad || ad.userId !== userId) {
      return apiErrorResponse(
        'Ad not found or unauthorized',
        404,
        'AD_NOT_FOUND_OR_UNAUTHORIZED'
      );
    }

    // Update ad status
    const updatedAd = await prisma.ad.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date()
      },
    });

    return NextResponse.json({
      ad: updatedAd,
      message: `Ad status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating ad status:', error); // Log the actual error for debugging
    return apiErrorResponse(
      'Failed to update ad status',
      500,
      'UPDATE_AD_STATUS_FAILED',
      error instanceof Error ? error.message : String(error)
    );
  }
}