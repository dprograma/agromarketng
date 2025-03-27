import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';

// Define params interface
interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const id = params?.id;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid ad ID' },
        { status: 400 }
      );
    }

    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rest of your code remains the same
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    const { status } = await req.json();
    const validStatuses = ['Active', 'Pending', 'Inactive', 'Sold'];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Verify ad ownership
    const ad = await prisma.ad.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!ad || ad.userId !== userId) {
      return NextResponse.json(
        { error: 'Ad not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update ad status
    const updatedAd = await prisma.ad.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date()
      },
    });

    return NextResponse.json({
      ad: updatedAd,
      message: `Ad status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating ad status:', error);
    return NextResponse.json(
      { error: 'Failed to update ad status' },
      { status: 500 }
    );
  }
}