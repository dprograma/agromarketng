import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');

    // Build where conditions
    const whereConditions: any = {};

    if (category) {
      whereConditions.category = {
        contains: category,
        mode: 'insensitive'
      };
    }

    if (subcategory) {
      whereConditions.subcategory = {
        contains: subcategory,
        mode: 'insensitive'
      };
    }

    // Get all products from the database
    const products = await prisma.ad.findMany({
      where: whereConditions,
      select: {
        id: true,
        title: true,
        category: true,
        subcategory: true,
        section: true,
        status: true,
        price: true,
        location: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get Farm Machinery products specifically
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

    // Return the products and stats
    return NextResponse.json({
      products,
      count: products.length,
      farmMachineryProducts,
      farmMachineryCount: farmMachineryProducts.length,
      categoryCounts,
      subcategoryCounts
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
