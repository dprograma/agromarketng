import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get total number of active ads
    const totalAds = await prisma.ad.count({
      where: { status: 'active' }
    });

    // Get total number of users (farmers)
    const totalFarmers = await prisma.user.count({
      where: { role: 'user' }
    });

    // Get total number of states covered (unique locations)
    const locations = await prisma.ad.groupBy({
      by: ['location'],
      where: { status: 'active' }
    });
    const statesCovered = new Set(locations.map(loc => {
      // Extract state from location (assuming format like "City, State")
      const parts = loc.location.split(',');
      return parts.length > 1 ? parts[1].trim() : loc.location.trim();
    })).size;

    // Get total views across all ads
    const viewsResult = await prisma.ad.aggregate({
      _sum: { views: true }
    });
    const totalViews = viewsResult._sum.views || 0;

    // Get total clicks across all ads
    const clicksResult = await prisma.ad.aggregate({
      _sum: { clicks: true }
    });
    const totalClicks = clicksResult._sum.clicks || 0;

    // Calculate customer satisfaction (mock data for now)
    const customerSatisfaction = 98;

    // Get top categories
    const topCategories = await prisma.ad.groupBy({
      by: ['category'],
      where: { status: 'active' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    // Get recent activity (most recent ads)
    const recentActivity = await prisma.ad.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
        user: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      stats: {
        totalAds,
        totalFarmers,
        statesCovered,
        totalViews,
        totalClicks,
        customerSatisfaction
      },
      topCategories: topCategories.map(cat => ({
        name: cat.category,
        count: cat._count.id
      })),
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        title: activity.title,
        farmerName: activity.user.name,
        createdAt: activity.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching landing analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
