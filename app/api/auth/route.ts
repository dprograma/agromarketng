import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { apiErrorResponse } from '@/lib/errorHandling';
import { authRateLimiters } from '@/lib/rateLimit';
import { quickSend } from '@/lib/email';


export async function POST(req: NextRequest) {
  const { type, email, token, newPassword } = await req.json();

  // Apply appropriate rate limiting based on request type
  let rateLimitResult;
  if (type === 'forgot-password') {
    rateLimitResult = authRateLimiters.forgotPassword(req);
  } else if (type === 'reset-password') {
    rateLimitResult = authRateLimiters.resetPassword(req);
  }

  if (rateLimitResult && !rateLimitResult.success) {
    return apiErrorResponse(
      'Too many requests. Please try again later.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  }

  switch (type) {
    case 'forgot-password':
      return handleForgotPassword(email);
    case 'reset-password':
      return handleResetPassword(token, newPassword);
    default:
      return apiErrorResponse('Invalid request type', 400, 'INVALID_REQUEST_TYPE');
  }
}

async function handleForgotPassword(email: string) {
  console.log("User email: ", email);
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    console.log("User found: ", user);
    if (!user) return apiErrorResponse('User not found', 404, 'USER_NOT_FOUND');

    // Generate a reset token
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '1h' }
    );

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    const result = await quickSend.passwordReset(email, user.name || 'User', resetUrl);

    if (!result.success) {
      throw new Error(result.error || 'Failed to send reset email');
    }

    return NextResponse.json({ message: 'Password reset link sent to your email' }, { status: 200 });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return apiErrorResponse(
      'Failed to send reset email',
      500,
      'EMAIL_SEND_FAILED',
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function handleResetPassword(token: string, newPassword: string) {
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { userId: string };
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in reset password:', error);
    return apiErrorResponse(
      'Invalid or expired token',
      400,
      'INVALID_OR_EXPIRED_TOKEN',
      error instanceof Error ? error.message : String(error)
    );
  }
}