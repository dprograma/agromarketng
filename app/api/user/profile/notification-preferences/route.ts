import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

/**
 * GET - Fetch user notification preferences
 */
export async function GET(req: NextRequest) {
  try {
    // Get token from cookies (try both development and production cookie names)
    const token = req.cookies.get('next-auth.session-token')?.value ||
                  req.cookies.get('__Secure-next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Fetch or create default notification preferences
    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
      select: {
        id: true,
        emailForAdActivity: true,
        emailForPromotions: true,
        smsForPromotions: true,
        emailForMessages: true,
        emailForPayments: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: {
          userId,
          emailForAdActivity: true,
          emailForPromotions: true,
          smsForPromotions: false,
          emailForMessages: true,
          emailForPayments: true,
        },
        select: {
          id: true,
          emailForAdActivity: true,
          emailForPromotions: true,
          smsForPromotions: true,
          emailForMessages: true,
          emailForPayments: true,
          createdAt: true,
          updatedAt: true,
        }
      });
    }

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update user notification preferences
 */
export async function PATCH(req: NextRequest) {
  try {
    // Get token from cookies (try both development and production cookie names)
    const token = req.cookies.get('next-auth.session-token')?.value ||
                  req.cookies.get('__Secure-next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Get update data from request
    const data = await req.json();

    // Validate data
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Extract allowed fields to update
    const {
      emailForAdActivity,
      emailForPromotions,
      smsForPromotions,
      emailForMessages,
      emailForPayments
    } = data;

    const updateData: any = {};

    // Validate boolean fields
    if (emailForAdActivity !== undefined) {
      if (typeof emailForAdActivity !== 'boolean') {
        return NextResponse.json(
          { error: 'emailForAdActivity must be a boolean' },
          { status: 400 }
        );
      }
      updateData.emailForAdActivity = emailForAdActivity;
    }

    if (emailForPromotions !== undefined) {
      if (typeof emailForPromotions !== 'boolean') {
        return NextResponse.json(
          { error: 'emailForPromotions must be a boolean' },
          { status: 400 }
        );
      }
      updateData.emailForPromotions = emailForPromotions;
    }

    if (smsForPromotions !== undefined) {
      if (typeof smsForPromotions !== 'boolean') {
        return NextResponse.json(
          { error: 'smsForPromotions must be a boolean' },
          { status: 400 }
        );
      }
      updateData.smsForPromotions = smsForPromotions;
    }

    if (emailForMessages !== undefined) {
      if (typeof emailForMessages !== 'boolean') {
        return NextResponse.json(
          { error: 'emailForMessages must be a boolean' },
          { status: 400 }
        );
      }
      updateData.emailForMessages = emailForMessages;
    }

    if (emailForPayments !== undefined) {
      if (typeof emailForPayments !== 'boolean') {
        return NextResponse.json(
          { error: 'emailForPayments must be a boolean' },
          { status: 400 }
        );
      }
      updateData.emailForPayments = emailForPayments;
    }

    // If no valid fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Upsert notification preferences
    const updatedPreferences = await prisma.notificationPreferences.upsert({
      where: { userId },
      create: {
        userId,
        emailForAdActivity: updateData.emailForAdActivity ?? true,
        emailForPromotions: updateData.emailForPromotions ?? true,
        smsForPromotions: updateData.smsForPromotions ?? false,
        emailForMessages: updateData.emailForMessages ?? true,
        emailForPayments: updateData.emailForPayments ?? true,
      },
      update: updateData,
      select: {
        id: true,
        emailForAdActivity: true,
        emailForPromotions: true,
        smsForPromotions: true,
        emailForMessages: true,
        emailForPayments: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      message: 'Notification preferences updated successfully',
      preferences: updatedPreferences
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}