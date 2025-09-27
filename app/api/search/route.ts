import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { searchCache } from '@/lib/searchCache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const minPrice = Number(searchParams.get('minPrice')) || 0;
    const maxPrice = Number(searchParams.get('maxPrice')) || 1000000;
    const location = searchParams.get('location');
    const sort = searchParams.get('sort') || 'recent';

    // Pagination parameters
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const offset = (page - 1) * limit;

    // Create cache key from search parameters
    const cacheParams = {
      q, category, subcategory, minPrice, maxPrice, location, sort, page, limit
    };

    // Check cache first
    const cachedResult = searchCache.get(cacheParams);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    // Build where clause
    const where: any = {
      status: 'active',
      price: {
        gte: minPrice,
        lte: maxPrice
      }
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'views':
        orderBy = { views: 'desc' };
        break;
    }

    // Get total count for pagination info
    const totalCount = await prisma.ad.count({ where });

    const results = await prisma.ad.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const response = {
      results,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    };

    // Cache the result
    searchCache.set(cacheParams, response);

    // Track search analytics asynchronously (don't block response)
    if (q) {
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/search/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchTerm: q,
          userId: null, // Will be populated from session in production
          resultCount: totalCount,
          filters: { category, location, minPrice, maxPrice, sort },
          sessionId: request.headers.get('x-session-id') || 'anonymous'
        })
      }).catch(err => console.error('Analytics tracking failed:', err));
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}