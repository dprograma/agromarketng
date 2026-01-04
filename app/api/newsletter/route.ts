import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { quickSend } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscriber = await prisma.newsletter.findUnique({
      where: { email }
    });

    if (existingSubscriber) {
      // If already confirmed, return success
      if (existingSubscriber.isConfirmed) {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed to our newsletter'
        });
      }

      // If not confirmed, generate new token and send confirmation email again
      const token = crypto.randomBytes(32).toString('hex');

      await prisma.newsletter.update({
        where: { email },
        data: { token }
      });

      await sendConfirmationEmail(email, name || '', token);

      return NextResponse.json({
        success: true,
        message: 'Confirmation email sent. Please check your inbox to complete subscription'
      });
    }

    // Generate confirmation token
    const token = crypto.randomBytes(32).toString('hex');

    // Create new newsletter subscription
    await prisma.newsletter.create({
      data: {
        email,
        name,
        token,
        isConfirmed: false
      }
    });

    // Send confirmation email
    await sendConfirmationEmail(email, name || '', token);

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing! Please check your email to confirm your subscription'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}

async function sendConfirmationEmail(email: string, name: string, token: string) {
  const confirmUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/newsletter/confirm?token=${token}`;

  try {
    const result = await quickSend.newsletterConfirmation(email, name, confirmUrl);

    if (!result.success) {
      throw new Error(result.error || 'Email delivery failed');
    }

    console.log('Newsletter confirmation email sent successfully:', result.messageId);
  } catch (error) {
    console.error('Failed to send newsletter confirmation email:', error);
    throw new Error('Email delivery failed');
  }
}