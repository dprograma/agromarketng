import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all products from the database
    const products = await prisma.ad.findMany({
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

    // Return the products
    return NextResponse.json({
      products,
      count: products.length
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
