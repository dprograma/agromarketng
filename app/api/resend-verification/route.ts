import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { quickSend } from '@/lib/email';
import { authRateLimiters } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  // Rate limit resend requests
  const rateLimitResult = authRateLimiters.signup(req);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find unverified user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, name: true, email: true, verified: true },
    });

    if (!user) {
      // Don't reveal whether the user exists
      return NextResponse.json({
        message: 'If an account exists with that email, a verification link has been sent.',
      });
    }

    if (user.verified) {
      return NextResponse.json({
        message: 'This account is already verified. You can sign in.',
      });
    }

    // Generate a fresh verification token (valid for 1 day)
    const verificationToken = jwt.sign(
      { userId: user.id },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '1d' }
    );

    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-email?token=${verificationToken}`;

    try {
      const result = await quickSend.verification(
        user.email,
        user.name || 'User',
        verificationUrl
      );

      if (!result.success) {
        console.error('Resend verification email failed:', result.error);
        return NextResponse.json(
          { error: 'Failed to send verification email. Please try again.' },
          { status: 500 }
        );
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification email sent! Please check your inbox.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
