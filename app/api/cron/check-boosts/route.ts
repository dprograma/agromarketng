import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Find ads with expired boosts
    const now = new Date();
    const expiredBoosts = await prisma.ad.findMany({
      where: {
        boostEndDate: {
          lt: now // Boost end date is in the past
        },
        featured: true // Only ads that have active boosts
      }
    });

    // Reset boost for expired ads
    if (expiredBoosts.length > 0) {
      await prisma.ad.updateMany({
        where: {
          boostEndDate: {
            lt: now
          },
          featured: true
        },
        data: {
          featured: false,
          boostMultiplier: 1.0, // Reset to default priority
          boostStatus: 'expired',
          boostEndDate: null,
          boostStartDate: null,
          boostType: null
        }
      });

      console.log(`Reset boost for ${expiredBoosts.length} expired ads`);
    }

    return NextResponse.json({ 
      success: true, 
      expiredBoostsCount: expiredBoosts.length 
    });
  } catch (error) {
    console.error('Error checking expired boosts:', error);
    return NextResponse.json(
      { error: 'Failed to check expired boosts', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
