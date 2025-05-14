import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';

// Helper functions for JSON response
const jsonResponse = (status: number, data: any) => new NextResponse(JSON.stringify(data), { status });

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: NextRequest) {
  const { type, email, token, newPassword } = await req.json();

  switch (type) {
    case 'forgot-password':
      return handleForgotPassword(email);
    case 'reset-password':
      return handleResetPassword(token, newPassword);
    default:
      return jsonResponse(400, { error: 'Invalid request type' });
  }
}

async function handleForgotPassword(email: string) {
  console.log("User email: ", email);
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    console.log("User found: ", user);
    if (!user) return jsonResponse(404, { error: 'User not found' });

    // Generate a reset token
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '1h' }
    );

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/resetPassword?token=${resetToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #166534;">Password Reset Request</h2>
          <p>Hi ${user.name || 'there'},</p>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #166534; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">If you did not request this, please ignore this email.</p>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        </div>
      `,
    });

    return jsonResponse(200, { message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return jsonResponse(500, { error: 'Failed to send reset email' });
  }
}

async function handleResetPassword(token: string, newPassword: string) {
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    return jsonResponse(200, { message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error in reset password:', error);
    return jsonResponse(400, { error: 'Invalid or expired token' });
  }
}