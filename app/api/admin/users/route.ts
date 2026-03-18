import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';

function validateAdmin(token: string | undefined) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
    if (decoded.role !== 'admin') return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * GET - List all users with filters
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get('next-auth.session-token')?.value ||
                req.cookies.get('__Secure-next-auth.session-token')?.value;
  const admin = validateAdmin(token);
  if (!admin) {
    return apiErrorResponse('Unauthorized', 401, 'UNAUTHORIZED');
  }

  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // all, unverified, verified
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filter === 'unverified') {
      where.verified = false;
    } else if (filter === 'verified') {
      where.verified = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          verified: true,
          role: true,
          createdAt: true,
          image: true,
          _count: { select: { ads: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const unverifiedCount = await prisma.user.count({ where: { verified: false } });

    return NextResponse.json({
      users,
      total,
      unverifiedCount,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return apiErrorResponse('Failed to fetch users', 500, 'FETCH_USERS_FAILED');
  }
}
