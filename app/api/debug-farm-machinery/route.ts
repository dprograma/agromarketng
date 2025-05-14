import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { navigation } from '@/constants';

export async function GET(request: NextRequest) {
  try {
    // Get all Farm Machinery products
    const farmMachineryProducts = await prisma.ad.findMany({
      where: {
        OR: [
          { category: { contains: 'Farm Machinery', mode: 'insensitive' } },
          { subcategory: { contains: 'Tractor', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        title: true,
        category: true,
        subcategory: true,
        section: true,
        status: true,
        price: true,
        location: true,
        createdAt: true,
        images: true
      }
    });

    // Get all products with status = 'Active'
    const activeProducts = await prisma.ad.findMany({
      where: {
        status: 'Active'
      },
      select: {
        id: true,
        title: true,
        category: true,
        subcategory: true,
        status: true
      }
    });

    // Get all products
    const allProducts = await prisma.ad.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        subcategory: true,
        status: true
      }
    });

    // Get category counts
    const categoryCounts = await prisma.ad.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    });

    // Get subcategory counts
    const subcategoryCounts = await prisma.ad.groupBy({
      by: ['subcategory'],
      _count: {
        subcategory: true
      },
      orderBy: {
        _count: {
          subcategory: 'desc'
        }
      }
    });

    // Get status counts
    const statusCounts = await prisma.ad.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    // Get Farm Machinery category from navigation
    const farmMachineryCategory = navigation.categories.find(
      cat => cat.name === 'Farm Machinery'
    );

    // Test the exact query used in the featured-products API
    const testQuery = await prisma.ad.findMany({
      where: {
        status: 'Active',
        OR: [
          { category: { equals: 'Farm Machinery', mode: 'insensitive' } },
          { category: { contains: 'Farm Machinery', mode: 'insensitive' } },
          { category: { contains: 'Machinery', mode: 'insensitive' } },
          { subcategory: { equals: 'Tractors', mode: 'insensitive' } },
          { subcategory: { contains: 'Tractor', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        title: true,
        category: true,
        subcategory: true,
        status: true
      }
    });

    // Return the debug information
    return NextResponse.json({
      farmMachineryProducts,
      farmMachineryCount: farmMachineryProducts.length,
      activeProducts,
      activeCount: activeProducts.length,
      allProducts,
      allCount: allProducts.length,
      categoryCounts,
      subcategoryCounts,
      statusCounts,
      farmMachineryCategory,
      testQuery,
      testQueryCount: testQuery.length
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      {
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
