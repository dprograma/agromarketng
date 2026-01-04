import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';

export async function GET(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Get user's saved searches from database
    const savedSearches = await prisma.savedSearch.findMany({
      where: {
        userId: userId
      },
      select: {
        id: true,
        query: true,
        alertsEnabled: true,
        category: true,
        location: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ savedSearches });
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    return apiErrorResponse(
      'Failed to fetch saved searches',
      500,
      'FETCH_SAVED_SEARCHES_FAILED',
      error instanceof Error ? error.message : String(error)
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Get data from request body
    const { query, category, location, priceMin, priceMax, alertsEnabled } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return apiErrorResponse(
        'Search query is required and must be a non-empty string',
        400,
        'INVALID_QUERY'
      );
    }

    // Validate query length
    if (query.trim().length > 255) {
      return apiErrorResponse(
        'Search query must be 255 characters or less',
        400,
        'QUERY_TOO_LONG'
      );
    }

    // Check if search already exists for this user
    const existingSearch = await prisma.savedSearch.findUnique({
      where: {
        userId_query: {
          userId: userId,
          query: query.trim()
        }
      }
    });

    if (existingSearch) {
      return apiErrorResponse(
        'Search already saved',
        409,
        'SEARCH_ALREADY_EXISTS'
      );
    }

    // Create new saved search
    const savedSearch = await prisma.savedSearch.create({
      data: {
        query: query.trim(),
        userId: userId,
        category: category || null,
        location: location || null,
        priceMin: priceMin ? parseFloat(priceMin) : null,
        priceMax: priceMax ? parseFloat(priceMax) : null,
        alertsEnabled: alertsEnabled || false
      },
      select: {
        id: true,
        query: true,
        alertsEnabled: true,
        category: true,
        location: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      savedSearch
    });
  } catch (error) {
    console.error('Error saving search:', error);
    return apiErrorResponse(
      'Failed to save search',
      500,
      'SAVE_SEARCH_FAILED',
      error instanceof Error ? error.message : String(error)
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Get search ID from URL
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || typeof id !== 'string') {
      return apiErrorResponse(
        'Search ID is required',
        400,
        'MISSING_SEARCH_ID'
      );
    }

    // Verify the search exists and belongs to the user
    const existingSearch = await prisma.savedSearch.findUnique({
      where: {
        id: id
      }
    });

    if (!existingSearch) {
      return apiErrorResponse(
        'Saved search not found',
        404,
        'SEARCH_NOT_FOUND'
      );
    }

    if (existingSearch.userId !== userId) {
      return apiErrorResponse(
        'Access denied. You can only delete your own saved searches',
        403,
        'ACCESS_DENIED'
      );
    }

    // Delete the saved search
    await prisma.savedSearch.delete({
      where: {
        id: id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Search deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('Error deleting search:', error);
    return apiErrorResponse(
      'Failed to delete search',
      500,
      'DELETE_SEARCH_FAILED',
      error instanceof Error ? error.message : String(error)
    );
  }
}
