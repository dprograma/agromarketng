import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';
import { apiErrorResponse } from '@/lib/errorHandling';

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function POST(req: NextRequest) {
  const { type, email, token, newPassword } = await req.json();

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
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}">
          Reset Password
        </a>
      `,
    });

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