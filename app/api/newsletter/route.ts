import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

// Configure Resend
const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { data, error } = await resend.emails.send({
      from: 'AgroMarket <onboarding@resend.dev>',
      to: [email],
      subject: 'Confirm Your AgroMarket Newsletter Subscription',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #166534; margin: 0;">AgroMarket</h1>
          </div>
          <h2 style="color: #166534; text-align: center;">Confirm Your Newsletter Subscription</h2>
          <p>Hello ${name || 'there'},</p>
          <p>Thank you for subscribing to the AgroMarket newsletter! To complete your subscription, please click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" style="background-color: #166534; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Confirm Subscription</a>
          </div>
          <p>If you did not request this subscription, you can safely ignore this email.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} AgroMarket. All rights reserved.</p>
            <p>You're receiving this email because you signed up for the AgroMarket newsletter.</p>
          </div>
        </div>
      `,
      text: `
        Hello ${name || 'there'},

        Thank you for subscribing to the AgroMarket newsletter! To complete your subscription, please click the link below:

        ${confirmUrl}

        If you did not request this subscription, you can safely ignore this email.

        © ${new Date().getFullYear()} AgroMarket. All rights reserved.
      `
    });

    if (error) {
      throw error;
    }

    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Failed to send email with Resend:', error);
    throw new Error('Email delivery failed');
  }
}