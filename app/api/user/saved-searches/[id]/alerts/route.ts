import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';

// PUT - Toggle alerts for a saved search
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return apiErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Get the saved search ID
    const { id } = await params;
    if (!id) {
      return apiErrorResponse('Search ID is required', 400, 'MISSING_SEARCH_ID');
    }

    // Get alerts enabled status from request body
    const { alertsEnabled } = await req.json();
    if (typeof alertsEnabled !== 'boolean') {
      return apiErrorResponse(
        'alertsEnabled must be a boolean value',
        400,
        'INVALID_ALERTS_ENABLED'
      );
    }

    // Verify the search exists and belongs to the user
    const existingSearch = await prisma.savedSearch.findUnique({
      where: { id: id }
    });

    if (!existingSearch) {
      return apiErrorResponse('Saved search not found', 404, 'SEARCH_NOT_FOUND');
    }

    if (existingSearch.userId !== userId) {
      return apiErrorResponse(
        'Access denied. You can only modify your own saved searches',
        403,
        'ACCESS_DENIED'
      );
    }

    // Update the alerts setting
    const updatedSearch = await prisma.savedSearch.update({
      where: { id: id },
      data: {
        alertsEnabled: alertsEnabled,
        updatedAt: new Date()
      },
      select: {
        id: true,
        query: true,
        alertsEnabled: true,
        category: true,
        location: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `Search alerts ${alertsEnabled ? 'enabled' : 'disabled'} successfully`,
      savedSearch: updatedSearch
    });

  } catch (error) {
    console.error('Error updating search alerts:', error);
    return apiErrorResponse(
      'Failed to update search alerts',
      500,
      'UPDATE_ALERTS_FAILED',
      error instanceof Error ? error.message : String(error)
    );
  }
}