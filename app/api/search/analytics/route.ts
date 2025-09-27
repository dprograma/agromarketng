import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { searchTerm, userId, resultCount, filters, sessionId } = await request.json();

    // Track search analytics
    await prisma.searchAnalytics.create({
      data: {
        searchTerm: searchTerm || '',
        userId: userId || null,
        resultCount: resultCount || 0,
        filters: filters || {},
        sessionId: sessionId || '',
        timestamp: new Date(),
        userAgent: request.headers.get('user-agent') || '',
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || ''
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json({ error: 'Analytics tracking failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const period = searchParams.get('period') || '7d';
    const limit = Number(searchParams.get('limit')) || 10;

    let startDate = new Date();
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get popular search terms
    const popularSearches = await prisma.searchAnalytics.groupBy({
      by: ['searchTerm'],
      where: {
        timestamp: {
          gte: startDate
        },
        searchTerm: {
          not: ''
        }
      },
      _count: {
        searchTerm: true
      },
      orderBy: {
        _count: {
          searchTerm: 'desc'
        }
      },
      take: limit
    });

    // Get search trends
    const searchTrends = await prisma.searchAnalytics.findMany({
      where: {
        timestamp: {
          gte: startDate
        }
      },
      select: {
        searchTerm: true,
        resultCount: true,
        timestamp: true,
        filters: true
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100
    });

    // Get zero-result searches for improvement opportunities
    const zeroResultSearches = await prisma.searchAnalytics.groupBy({
      by: ['searchTerm'],
      where: {
        timestamp: {
          gte: startDate
        },
        resultCount: 0,
        searchTerm: {
          not: ''
        }
      },
      _count: {
        searchTerm: true
      },
      orderBy: {
        _count: {
          searchTerm: 'desc'
        }
      },
      take: limit
    });

    return NextResponse.json({
      popularSearches: popularSearches.map(search => ({
        term: search.searchTerm,
        count: search._count.searchTerm
      })),
      zeroResultSearches: zeroResultSearches.map(search => ({
        term: search.searchTerm,
        count: search._count.searchTerm
      })),
      trends: searchTrends,
      period
    });
  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json({ error: 'Analytics fetch failed' }, { status: 500 });
  }
}