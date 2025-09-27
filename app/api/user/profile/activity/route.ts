import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

/**
 * GET - Fetch user activity logs
 */
export async function GET(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value ||
                  req.cookies.get('__Secure-next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Max 100 items per page
    const activity = searchParams.get('activity'); // Optional filter by activity type

    // Build where clause
    const whereClause: any = {
      userId: userId
    };

    if (activity) {
      whereClause.activity = activity;
    }

    // Get total count
    const totalCount = await prisma.activityLog.count({
      where: whereClause
    });

    // Get activity logs with pagination
    const activityLogs = await prisma.activityLog.findMany({
      where: whereClause,
      select: {
        id: true,
        activity: true,
        description: true,
        ipAddress: true,
        userAgent: true,
        deviceInfo: true,
        location: true,
        success: true,
        metadata: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      activityLogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPreviousPage,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}

/**
 * POST - Log a new activity (for internal use)
 */
export async function POST(req: NextRequest) {
  try {
    // This endpoint is for internal logging, so we'll accept the userId in the request body
    // In a production app, you might want to restrict this endpoint or use it differently
    const {
      userId,
      activity,
      description,
      ipAddress,
      userAgent,
      deviceInfo,
      location,
      success,
      metadata
    } = await req.json();

    if (!userId || !activity) {
      return NextResponse.json(
        { error: 'User ID and activity type are required' },
        { status: 400 }
      );
    }

    // Create activity log entry
    const activityLog = await prisma.activityLog.create({
      data: {
        userId,
        activity,
        description: description || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        deviceInfo: deviceInfo || null,
        location: location || null,
        success: success !== undefined ? success : true,
        metadata: metadata || null
      }
    });

    return NextResponse.json({
      success: true,
      activityLog
    });

  } catch (error) {
    console.error('Error creating activity log:', error);
    return NextResponse.json(
      { error: 'Failed to create activity log' },
      { status: 500 }
    );
  }
}