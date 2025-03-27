import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { subscriptionPlans } from '@/constants';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { planId, reference } = await req.json();
    const token = req.cookies.get('next-auth.session-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Verify payment with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const paymentData = await verifyResponse.json();

    if (!paymentData.status || paymentData.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Get plan details
    const planDetails = subscriptionPlans.find(p => p.id === planId);
    if (!planDetails) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Create subscription
    const subscription = await prisma.subscriptionPlan.create({
      data: {
        name: planDetails.name,
        price: planDetails.price,
        duration: planDetails.duration,
        benefits: planDetails.benefits,
        features: planDetails.features,
        listingPriority: planDetails.features.listingPriority,
        expiryDate: new Date(Date.now() + planDetails.duration * 24 * 60 * 60 * 1000),
        users: {
          connect: { id: userId }
        }
      }
    });

    // Update all user's active ads with subscription benefits
    await prisma.ad.updateMany({
      where: {
        userId,
        status: 'Active'
      },
      data: {
        featured: true,
        listingPriority: planDetails.features.listingPriority,
        featuredOnHome: planDetails.features.featuredOnHome,
        topOfCategory: planDetails.features.topOfCategory,
        exclusivePlacement: planDetails.features.exclusivePlacement,
        boostMultiplier: 1 + (planDetails.features.adBoostDiscount / 100)
      }
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}