import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest, res: NextResponse): Promise<NextResponse>{
  const { id, title, category, location, price, description, contact, subscriptionPlanId } = await req.json();

  // Validate user subscription plan
  const user = await prisma.user.findUnique({
    where: { id: id },
    include: { subscriptionPlan: true },
  });

  if (!user.subscriptionPlan || user.subscriptionPlan.expiryDate < new Date()) {
    return NextResponse.json({ error: 'Please upgrade your subscription plan to post ads' }, { status: 402 });
  }

  // Check if user has reached the free upload limit
  const ads = await prisma.ad.findMany({
    where: { userId: id },
  });

  if (ads.length >= 10) {
    return NextResponse.json({ error: 'You have reached the free upload limit. Please upgrade your subscription plan to post more ads' }, { status: 402 });
  }

  // Create a new ad
  const ad = await prisma.ad.create({
    data: {
      title,
      category,
      location,
      price,
      description,
      contact,
      userId: id,
      subscriptionPlanId,
    },
  });

  return NextResponse.json({ error: 'Ad posted successfully!' }, { status: 201 });
};