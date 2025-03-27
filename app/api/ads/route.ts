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

    // Base where conditions
    const whereConditions = {
      status: 'Active',
      ...(category && { category }),
    };

    // Add boost condition only if there are boosted ads
    const boostedAdsExist = await prisma.ad.count({
      where: {
        ...whereConditions,
        boostEndDate: { gt: new Date() }
      }
    });

    const ads = await prisma.ad.findMany({
      where: {
        ...whereConditions,
        ...(boostedAdsExist && {
          boostEndDate: { gt: new Date() }
        })
      },
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

    // Get total count for pagination
    const total = await prisma.ad.count({ where: whereConditions });

    if (!ads) {
      return NextResponse.json({ 
        ads: [],
        total: 0,
        currentPage: page,
        totalPages: Math.ceil(0 / limit)
      });
    }

    return NextResponse.json({
      ads,
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