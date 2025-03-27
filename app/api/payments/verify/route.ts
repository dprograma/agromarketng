import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { subscriptionPlans } from '@/constants';

export async function POST(req: NextRequest) {
  try {
    // Get and validate request data
    const { reference } = await req.json();
    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      );
    }

    // Get and validate token
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    try {
      // Verify payment with PayStack
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
        return NextResponse.json(
          { error: 'Payment verification failed' },
          { status: 400 }
        );
      }

      // Extract metadata from the transaction
      const { metadata } = paymentData.data;
      const { type, adId, boostType, boostDuration, planId } = metadata;

      if (type === 'boost') {
        // Calculate boost dates
        const boostStartDate = new Date();
        const boostEndDate = new Date();
        boostEndDate.setDate(boostEndDate.getDate() + boostDuration);

        // Update ad with boost information
        const updatedAd = await prisma.ad.update({
          where: { id: adId },
          data: {
            featured: true,
            status: 'Active',
            boostType,
            boostStartDate,
            boostEndDate,
            boostStatus: 'active',
            listingPriority: boostType
          }
        });

        return NextResponse.json({
          success: true,
          type: 'boost',
          ad: updatedAd
        });

      } else if (type === 'subscription') {
        // Handle subscription plan
        const planDetails = subscriptionPlans.find(p => p.id === planId);
        if (!planDetails) {
          return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        // Check for existing subscription
        const existingSubscription = await prisma.subscriptionPlan.findFirst({
          where: {
            users: {
              some: { id: userId }
            }
          }
        });

        if (existingSubscription) {
          // Update existing subscription
          const subscription = await prisma.subscriptionPlan.update({
            where: { id: existingSubscription.id },
            data: {
              name: planDetails.name,
              price: planDetails.price,
              duration: planDetails.duration,
              benefits: planDetails.benefits,
              features: planDetails.features,
              listingPriority: planDetails.features.listingPriority,
              expiryDate: new Date(Date.now() + planDetails.duration * 24 * 60 * 60 * 1000)
            }
          });

          // Update all user's ads with new subscription benefits
          await prisma.ad.updateMany({
            where: { userId, status: 'Active' },
            data: {
              listingPriority: planDetails.features.listingPriority,
              featuredOnHome: planDetails.features.featuredOnHome,
              topOfCategory: planDetails.features.topOfCategory,
              exclusivePlacement: planDetails.features.exclusivePlacement
            }
          });

          return NextResponse.json({
            success: true,
            type: 'subscription',
            subscription,
            message: 'Subscription updated successfully'
          });

        } else {
          // Create new subscription
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

          // Update all user's ads with subscription benefits
          await prisma.ad.updateMany({
            where: { userId, status: 'Active' },
            data: {
              listingPriority: planDetails.features.listingPriority,
              featuredOnHome: planDetails.features.featuredOnHome,
              topOfCategory: planDetails.features.topOfCategory,
              exclusivePlacement: planDetails.features.exclusivePlacement
            }
          });

          return NextResponse.json({
            success: true,
            type: 'subscription',
            subscription,
            message: 'Subscription created successfully'
          });
        }
      }

      return NextResponse.json(
        { error: 'Invalid payment type' },
        { status: 400 }
      );

    } catch (paymentError) {
      console.error('Payment verification failed:', paymentError);
      return NextResponse.json(
        {
          error: 'Payment verification failed',
          details: paymentError instanceof Error ? paymentError.message : 'Unknown error'
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}