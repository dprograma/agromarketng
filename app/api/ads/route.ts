// import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';


// export async function GET(request: NextRequest) {
//     const { searchParams } = new URL(request.url);
//     const category = searchParams.get('category');
//     const page = parseInt(searchParams.get('page') || '1');
//     const limit = parseInt(searchParams.get('limit') || '10');
  
//     try {
//       const ads = await prisma.ad.findMany({
//         where: {
//           status: 'Active',
//           ...(category && { category }),
//           boostEndDate: {
//             gt: new Date() // Only active boosts
//           }
//         },
//         orderBy: [
//           { exclusivePlacement: 'desc' }, // Platinum benefits first
//           { listingPriority: 'desc' }, // Then by subscription priority
//           { topOfCategory: 'desc' }, // Then top of category
//           { featuredOnHome: 'desc' }, // Then featured
//           { updatedAt: 'desc' } // Finally by date
//         ],
//         skip: (page - 1) * limit,
//         take: limit,
//         include: {
//           user: {
//             select: {
//               name: true,
//               subscriptionPlan: true
//             }
//           }
//         }
//       });
  
//       return NextResponse.json({ ads });
//     } catch (error) {
//       console.error('Error fetching ads:', error);
//       return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
//     }
//   }

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Base where conditions - show ALL active ads
    const whereConditions = {
      status: 'Active',
      ...(category && { category }),
    };

    // Fetch all active ads, but we'll sort boosted ones to the top
    const ads = await prisma.ad.findMany({
      where: whereConditions,
      orderBy: [
        { exclusivePlacement: 'desc' },
        { listingPriority: 'desc' },
        { topOfCategory: 'desc' },
        { featuredOnHome: 'desc' },
        { updatedAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            subscriptionPlan: true
          }
        }
      }
    });

    // Sort ads to prioritize boosted ones (active boosts first)
    const now = new Date();
    const sortedAds = ads.sort((a, b) => {
      const aIsBoosted = a.boostEndDate && new Date(a.boostEndDate) > now;
      const bIsBoosted = b.boostEndDate && new Date(b.boostEndDate) > now;

      // Boosted ads come first
      if (aIsBoosted && !bIsBoosted) return -1;
      if (!aIsBoosted && bIsBoosted) return 1;

      // If both boosted or both not boosted, maintain existing order
      return 0;
    });

    // Get total count for pagination
    const total = await prisma.ad.count({ where: whereConditions });

    if (!sortedAds || sortedAds.length === 0) {
      return NextResponse.json({
        ads: [],
        total: 0,
        currentPage: page,
        totalPages: Math.ceil(0 / limit)
      });
    }

    return NextResponse.json({
      ads: sortedAds,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching ads:', error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch ads',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}