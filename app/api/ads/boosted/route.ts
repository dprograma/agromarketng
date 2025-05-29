import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Fetch boosted ads for the user
    const boostedAds = await prisma.ad.findMany({
      where: {
        userId,
        featured: true,
        boostStatus: 'active',
        boostEndDate: {
          gt: new Date() // Only get active boosts
        }
      },
      orderBy: {
        boostEndDate: 'asc' // Sort by end date
      }
    });

    return NextResponse.json({
      ads: boostedAds
    });

  } catch (error) {
    console.error('Error fetching boosted ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boosted ads' },
      { status: 500 }
    );
  }
}