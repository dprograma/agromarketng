import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


export async function GET() {
    try {
      // Find expired subscriptions
      const expiredSubscriptions = await prisma.subscriptionPlan.findMany({
        where: {
          expiryDate: {
            lt: new Date()
          }
        },
        include: {
          users: true,
          ads: true
        }
      });
  
      // Reset benefits for expired subscriptions
      for (const subscription of expiredSubscriptions) {
        // Reset all ads under this subscription
        await prisma.ad.updateMany({
          where: {
            subscriptionPlanId: subscription.id
          },
          data: {
            featured: false,
            listingPriority: 0,
            featuredOnHome: false,
            topOfCategory: false,
            exclusivePlacement: false,
            boostMultiplier: 1.0,
            subscriptionPlanId: null
          }
        });
  
        // Remove subscription from users
        await prisma.user.updateMany({
          where: {
            subscriptionPlanId: subscription.id
          },
          data: {
            subscriptionPlanId: null
          }
        });
      }
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Subscription check error:', error);
      return NextResponse.json({ error: 'Failed to check subscriptions' }, { status: 500 });
    }
  }