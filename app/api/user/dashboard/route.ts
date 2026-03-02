import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUserId, isAuthError } from '@/lib/auth';
import { formatDistanceToNow } from 'date-fns';

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

    // Get time range from query params (default to 30 days)
    const timeRange = req.nextUrl.searchParams.get('timeRange') || '30days';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get user's ads with detailed information
    const ads = await prisma.ad.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate
        }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        views: true,
        clicks: true,
        shares: true,
        featured: true,
        boostEndDate: true,
        boostStartDate: true,
        boostType: true,
        category: true,
        price: true,
        createdAt: true,
        updatedAt: true,
        images: true,
        location: true
      }
    });

    // Calculate summary stats
    const activeAds = ads.filter(ad => ad.status === 'Active').length;
    const totalViews = ads.reduce((sum, ad) => sum + ad.views, 0);
    const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
    const totalShares = ads.reduce((sum, ad) => sum + ad.shares, 0);
    const boostedAds = ads.filter(ad => ad.featured && ad.boostEndDate && new Date(ad.boostEndDate) > new Date()).length;

    // Calculate engagement rate (guard against division by zero)
    const engagementRate = totalViews > 0
      ? Math.round((totalClicks / totalViews) * 100 * 10) / 10
      : 0;

    // Get user's subscription and notifications
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptionPlan: true,
        notifications: {
          where: {
            createdAt: {
              gte: startDate
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });

    // Format notifications for recent activity
    const notifications = user?.notifications || [];
    const recentActivity = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      description: notification.message,
      time: formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }),
      read: notification.read,
      createdAt: notification.createdAt
    }));

    // Promotion summary
    const ongoingPromotions = boostedAds;
    const earningsFromPromotions = 0;

    // Ad performance table (top 5)
    const adPerformance = ads.slice(0, 5).map(ad => ({
      id: ad.id,
      title: ad.title,
      views: ad.views,
      clicks: ad.clicks,
      shares: ad.shares,
      ctr: ad.views > 0 ? Math.round((ad.clicks / ad.views) * 100 * 10) / 10 : 0,
      status: ad.featured ? "Boosted" : ad.status,
      category: ad.category,
      image: ad.images && ad.images.length > 0 ? ad.images[0] : null
    }));

    // Daily stats for charts (last 7 days)
    const today = new Date();
    const dailyLabels = [];
    const dailyViews = [];
    const dailyClicks = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dailyLabels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      dailyViews.push(Math.floor(totalViews / 7));
      dailyClicks.push(Math.floor(totalClicks / 7));
    }

    // Category distribution
    const categories: Record<string, number> = {};
    ads.forEach(ad => {
      if (ad.category) {
        categories[ad.category] = (categories[ad.category] || 0) + 1;
      }
    });

    const categoryDistribution = Object.entries(categories).map(([name, count]) => ({
      name,
      count,
      percentage: ads.length > 0 ? Math.round((count / ads.length) * 100) : 0
    }));

    return NextResponse.json({
      adPerformance: {
        activeAds,
        totalViews,
        totalClicks,
        totalShares,
        boostedAds,
        engagementRate: `${engagementRate}%`
      },
      promotionSummary: {
        ongoingPromotions,
        earningsFromPromotions
      },
      recentActivity,
      adPerformanceTable: adPerformance,
      subscription: user?.subscriptionPlan,
      chartData: {
        dailyLabels,
        dailyViews,
        dailyClicks
      },
      categoryDistribution,
      timeRange
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
        code: "SERVER_ERROR",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
