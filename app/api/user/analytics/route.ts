import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { subDays, format, eachDayOfInterval, startOfDay, endOfDay } from 'date-fns';

// Helper function to validate user session
async function validateUser(req: NextRequest) {
  const token = req.cookies.get('next-auth.session-token')?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      id: string;
    };

    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await validateUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get time range from query params
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
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get user's ads performance data
    const adPerformance = await getAdPerformanceData(session.id, startDate);

    // Get user's financial data
    const financialData = await getFinancialData(session.id, startDate);

    // Get user's demographics data (this would typically come from analytics services)
    const demographics = await getDemographicsData(session.id);

    return NextResponse.json({
      adPerformance,
      financialData,
      demographics
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);

    // Provide more specific error messages based on the error type
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: "Invalid authentication token", code: "INVALID_TOKEN" },
        { status: 401 }
      );
    } else if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: "Authentication token expired", code: "TOKEN_EXPIRED" },
        { status: 401 }
      );
    } else if (error instanceof Error) {
      // Return a generic error message but with the specific error name for debugging
      return NextResponse.json(
        {
          error: "Failed to fetch analytics data",
          code: "SERVER_ERROR",
          message: error.message,
          name: error.name
        },
        { status: 500 }
      );
    }

    // Fallback for unknown errors
    return NextResponse.json(
      { error: "An unexpected error occurred", code: "UNKNOWN_ERROR" },
      { status: 500 }
    );
  }
}

// Helper functions to get analytics data
async function getAdPerformanceData(userId: string, startDate: Date) {
  // Get all ads for this user with more detailed information
  const ads = await prisma.ad.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate
      }
    },
    select: {
      id: true,
      title: true,
      views: true,
      clicks: true,
      shares: true,
      status: true,
      featured: true,
      category: true,
      createdAt: true,
      updatedAt: true,
      boostStartDate: true,
      boostEndDate: true,
      images: true,
      location: true
    },
    orderBy: {
      views: 'desc'
    }
  });

  // Calculate total metrics
  const totalViews = ads.reduce((sum, ad) => sum + ad.views, 0);
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
  const totalShares = ads.reduce((sum, ad) => sum + ad.shares, 0);

  // Calculate engagement rate
  const engagementRate = totalViews > 0
    ? Math.round((totalClicks / totalViews) * 100 * 10) / 10
    : 0;

  // Get performance by ad
  const adDetails = ads.map(ad => ({
    id: ad.id,
    title: ad.title,
    views: ad.views,
    clicks: ad.clicks,
    shares: ad.shares,
    engagementRate: ad.views > 0 ? Math.round((ad.clicks / ad.views) * 100 * 10) / 10 : 0,
    status: ad.status,
    featured: ad.featured,
    category: ad.category,
    createdAt: ad.createdAt,
    image: ad.images && ad.images.length > 0 ? ad.images[0] : null,
    location: ad.location
  }));

  // Calculate daily performance data for charts
  const dailyData = await getDailyPerformanceData(userId, startDate);

  // Calculate category performance
  const categoryPerformance = getCategoryPerformance(ads);

  // Calculate performance trends (week-over-week or month-over-month)
  const performanceTrends = await getPerformanceTrends(userId, startDate);

  return {
    totalViews,
    totalClicks,
    totalShares,
    engagementRate: `${engagementRate}%`,
    adDetails,
    dailyData,
    categoryPerformance,
    performanceTrends
  };
}

// Helper function to get daily performance data
async function getDailyPerformanceData(userId: string, startDate: Date) {
  const now = new Date();

  // Get all days in the interval
  const days = eachDayOfInterval({
    start: startDate,
    end: now
  });

  // Initialize arrays for chart data
  const labels = [];
  const viewsData = [];
  const clicksData = [];
  const sharesData = [];

  // For each day, calculate the total views, clicks, and shares
  for (const day of days) {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    // Format the day for the label (e.g., "Jan 1")
    labels.push(format(day, 'MMM d'));

    // In a real app, you would query a dedicated analytics table with daily stats
    // For now, we'll generate some realistic data based on the date
    const dayOfMonth = day.getDate();
    const multiplier = 0.5 + (Math.sin(dayOfMonth / 5) + 1) / 2; // Creates a wave pattern

    const dayViews = Math.floor(20 + 80 * multiplier);
    const dayClicks = Math.floor(5 + 15 * multiplier);
    const dayShares = Math.floor(1 + 5 * multiplier);

    viewsData.push(dayViews);
    clicksData.push(dayClicks);
    sharesData.push(dayShares);
  }

  return {
    labels,
    viewsData,
    clicksData,
    sharesData
  };
}

// Helper function to get category performance
function getCategoryPerformance(ads: any[]) {
  // Group ads by category
  const categoriesMap: Record<string, { views: number, clicks: number, shares: number, count: number }> = {};

  ads.forEach(ad => {
    const category = ad.category || 'Uncategorized';

    if (!categoriesMap[category]) {
      categoriesMap[category] = { views: 0, clicks: 0, shares: 0, count: 0 };
    }

    categoriesMap[category].views += ad.views;
    categoriesMap[category].clicks += ad.clicks;
    categoriesMap[category].shares += ad.shares;
    categoriesMap[category].count += 1;
  });

  // Convert to array and calculate engagement rates
  return Object.entries(categoriesMap).map(([category, data]) => ({
    category,
    views: data.views,
    clicks: data.clicks,
    shares: data.shares,
    count: data.count,
    engagementRate: data.views > 0 ? Math.round((data.clicks / data.views) * 100 * 10) / 10 : 0
  }));
}

// Helper function to get performance trends
async function getPerformanceTrends(userId: string, startDate: Date) {
  const now = new Date();
  const previousPeriodStart = new Date(startDate);
  const previousPeriodEnd = new Date(startDate);

  // Calculate the length of the current period in days
  const periodLength = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Set the previous period to be the same length, ending at the start of the current period
  previousPeriodStart.setDate(previousPeriodStart.getDate() - periodLength);
  previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);

  // Get current period stats
  const currentPeriodAds = await prisma.ad.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: now
      }
    },
    select: {
      views: true,
      clicks: true,
      shares: true
    }
  });

  // Get previous period stats
  const previousPeriodAds = await prisma.ad.findMany({
    where: {
      userId,
      createdAt: {
        gte: previousPeriodStart,
        lte: previousPeriodEnd
      }
    },
    select: {
      views: true,
      clicks: true,
      shares: true
    }
  });

  // Calculate totals for current period
  const currentViews = currentPeriodAds.reduce((sum, ad) => sum + ad.views, 0);
  const currentClicks = currentPeriodAds.reduce((sum, ad) => sum + ad.clicks, 0);
  const currentShares = currentPeriodAds.reduce((sum, ad) => sum + ad.shares, 0);

  // Calculate totals for previous period
  const previousViews = previousPeriodAds.reduce((sum, ad) => sum + ad.views, 0);
  const previousClicks = previousPeriodAds.reduce((sum, ad) => sum + ad.clicks, 0);
  const previousShares = previousPeriodAds.reduce((sum, ad) => sum + ad.shares, 0);

  // Calculate percentage changes
  const viewsChange = previousViews > 0
    ? Math.round(((currentViews - previousViews) / previousViews) * 100)
    : 100;

  const clicksChange = previousClicks > 0
    ? Math.round(((currentClicks - previousClicks) / previousClicks) * 100)
    : 100;

  const sharesChange = previousShares > 0
    ? Math.round(((currentShares - previousShares) / previousShares) * 100)
    : 100;

  return {
    views: {
      current: currentViews,
      previous: previousViews,
      change: viewsChange
    },
    clicks: {
      current: currentClicks,
      previous: previousClicks,
      change: clicksChange
    },
    shares: {
      current: currentShares,
      previous: previousShares,
      change: sharesChange
    }
  };
}
}

async function getFinancialData(userId: string, startDate: Date) {
  // Get user's subscription data with more details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptionPlan: true
    }
  });

  // Calculate subscription cost
  const subscriptionCost = user?.subscriptionPlan?.price || 0;

  // Calculate ad boost costs with more details
  const ads = await prisma.ad.findMany({
    where: {
      userId,
      boostStartDate: {
        gte: startDate
      }
    },
    include: {
      subscriptionPlan: true
    }
  });

  // Sum up all boost costs (this is simplified - in a real app you'd have a transactions table)
  let boostCosts = 0;
  const boostDetails = [];

  for (const ad of ads) {
    if (ad.boostType && ad.subscriptionPlan?.price) {
      const boostCost = Number(ad.subscriptionPlan.price);
      boostCosts += boostCost;

      boostDetails.push({
        adId: ad.id,
        adTitle: ad.title,
        boostType: ad.boostType,
        boostStartDate: ad.boostStartDate,
        boostEndDate: ad.boostEndDate,
        cost: boostCost
      });
    }
  }

  // Total spent
  const totalSpent = Number(subscriptionCost) + boostCosts;

  // In a real app, you'd calculate earnings from sales or other revenue
  // For now, we'll generate some realistic data
  const earnings = Math.floor(totalSpent * 1.5 + Math.random() * 1000);

  // Calculate monthly spending
  const monthlySpending = await getMonthlySpending(userId, startDate);

  return {
    subscriptionDetails: {
      name: user?.subscriptionPlan?.name || 'Free',
      cost: Number(subscriptionCost),
      features: user?.subscriptionPlan?.features || []
    },
    boostCosts,
    boostDetails,
    totalSpent,
    earnings,
    profit: earnings - totalSpent,
    roi: totalSpent > 0 ? Math.round((earnings / totalSpent - 1) * 100) : 0,
    monthlySpending
  };
}

// Helper function to calculate monthly spending
async function getMonthlySpending(userId: string, startDate: Date) {
  const now = new Date();
  const months = [];
  const spending = [];

  // Get the first day of the month for the start date
  const firstMonth = new Date(startDate);
  firstMonth.setDate(1);

  // Get the first day of the current month
  const currentMonth = new Date(now);
  currentMonth.setDate(1);

  // Generate monthly labels and spending data
  let currentDate = new Date(firstMonth);

  while (currentDate <= currentMonth) {
    // Format month label (e.g., "Jan 2023")
    const monthLabel = format(currentDate, 'MMM yyyy');
    months.push(monthLabel);

    // Calculate the last day of this month
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const lastDay = new Date(nextMonth);
    lastDay.setDate(0);

    // In a real app, you would query a transactions table
    // For now, generate some realistic data
    const monthIndex = currentDate.getMonth();
    const baseSpending = 1000 + (monthIndex % 3) * 500; // Creates a pattern
    const randomFactor = 0.8 + Math.random() * 0.4; // Random factor between 0.8 and 1.2

    spending.push(Math.floor(baseSpending * randomFactor));

    // Move to the next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return {
    months,
    spending
  };
}

async function getDemographicsData(userId: string) {
  // In a real app, this would come from analytics services like Google Analytics
  // For now, we'll return enhanced placeholder data

  // Get user's ads to analyze locations
  const ads = await prisma.ad.findMany({
    where: { userId },
    select: {
      location: true,
      category: true,
      views: true,
      clicks: true
    }
  });

  // Generate location data based on ad locations
  const locationMap: Record<string, number> = {
    "Nigeria": 0,
    "Kenya": 0,
    "Ghana": 0,
    "South Africa": 0,
    "Tanzania": 0,
    "Uganda": 0,
    "Ethiopia": 0,
    "Other": 0
  };

  // Count views by location
  ads.forEach(ad => {
    if (ad.location) {
      // Extract country from location (assuming format like "Lagos, Nigeria")
      const parts = ad.location.split(',');
      const country = parts.length > 1 ? parts[1].trim() : parts[0].trim();

      if (locationMap[country] !== undefined) {
        locationMap[country] += ad.views;
      } else {
        locationMap["Other"] += ad.views;
      }
    }
  });

  // Convert to percentage
  const totalViews = Object.values(locationMap).reduce((sum, views) => sum + views, 0);
  const topLocations = Object.entries(locationMap)
    .map(([country, views]) => ({
      country,
      views,
      percentage: totalViews > 0 ? Math.round((views / totalViews) * 100) : 0
    }))
    .filter(item => item.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  // Generate device data
  const devices = [
    { device: "Mobile", percentage: 65, count: Math.floor(totalViews * 0.65) },
    { device: "Desktop", percentage: 25, count: Math.floor(totalViews * 0.25) },
    { device: "Tablet", percentage: 10, count: Math.floor(totalViews * 0.1) }
  ];

  // Generate gender data
  const gender = [
    { gender: "Male", percentage: 55, count: Math.floor(totalViews * 0.55) },
    { gender: "Female", percentage: 45, count: Math.floor(totalViews * 0.45) }
  ];

  // Generate age group data
  const ageGroups = [
    { group: "18-24", percentage: 20, count: Math.floor(totalViews * 0.2) },
    { group: "25-34", percentage: 35, count: Math.floor(totalViews * 0.35) },
    { group: "35-44", percentage: 25, count: Math.floor(totalViews * 0.25) },
    { group: "45-54", percentage: 15, count: Math.floor(totalViews * 0.15) },
    { group: "55+", percentage: 5, count: Math.floor(totalViews * 0.05) }
  ];

  // Generate time of day data
  const timeOfDay = [
    { time: "Morning (6AM-12PM)", percentage: 25, count: Math.floor(totalViews * 0.25) },
    { time: "Afternoon (12PM-5PM)", percentage: 30, count: Math.floor(totalViews * 0.3) },
    { time: "Evening (5PM-9PM)", percentage: 35, count: Math.floor(totalViews * 0.35) },
    { time: "Night (9PM-6AM)", percentage: 10, count: Math.floor(totalViews * 0.1) }
  ];

  return {
    topLocations,
    devices,
    gender,
    ageGroups,
    timeOfDay,
    totalAudience: totalViews
  };
}
