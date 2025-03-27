import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Check if user has an active subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptionPlan: true },
    });

    if (!user?.subscriptionPlan || user.subscriptionPlan.expiryDate < new Date()) {
      return NextResponse.json(
        { error: 'Active subscription required to feature ads. Please upgrade your plan.' },
        { status: 403 }
      );
    }

     // Check if the ad belongs to the user
     const ad = await prisma.ad.findUnique({
      where: { id: params.id },
    });

    if (!ad || ad.userId !== userId) {
      return NextResponse.json(
        { error: 'Ad not found or unauthorized' },
        { status: 404 }
      );
    }

    const updatedAd = await prisma.ad.update({
      where: { id: params.id },
      data: {
        status: 'Active',
        featured: true,
        subscriptionPlanId: user.subscriptionPlanId,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      ad: updatedAd,
      message: 'Ad featured successfully' 
    });
  } catch (error) {
    console.error('Error featuring ad:', error);
    return NextResponse.json(
      { error: 'Failed to feature ad' },
      { status: 500 }
    );
  }
}