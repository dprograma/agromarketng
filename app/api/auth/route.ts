import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';
import { SignUpRequest, SignInRequest } from '@/types';

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

// POST: SignUp Handler
export async function POST(req: NextRequest) {
  const { name, email, password }: SignUpRequest = await req.json();

  // Check if the user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return jsonResponse(400, { error: 'User already exists' });

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword }
  });

  // Generate a verification token
  const verificationToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });

  // Send verification email
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-email?token=${verificationToken}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your account',
    html: `<p>Hi ${name},</p>
           <p>Thanks for signing up. Please verify your email by clicking the link below:</p>
           <a href="${verificationUrl}">Verify your account</a>`,
  });

  return jsonResponse(201, { message: 'User created successfully', user });
}

// POST: SignIn Handler
export async function PUT(req: NextRequest) {
  const { email, password }: SignInRequest = await req.json();

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || typeof user.verified === 'undefined' || !user.verified) {
    return jsonResponse(401, { error: 'Account not verified or invalid email/password' });
  }

  // Compare passwords
  const passwordMatch = await bcrypt.compare(password!, user.password!);
  if (!passwordMatch) return jsonResponse(401, { error: 'Invalid email or password' });


  // Generate JWT
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '1h' });

  return jsonResponse(200, { message: 'Login successful', token });
}

// POST: Forgot Password
export async function FORGOT(req: NextRequest) {
  const { email } = await req.json();

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return jsonResponse(404, { error: 'User not found' });

  // Generate a reset token
  const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

  // Send reset email
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `<p>Hi,</p>
           <p>You requested a password reset. Click the link below to reset your password:</p>
           <a href="${resetUrl}">Reset Password</a>
           <p>If you did not request this, please ignore this email.</p>`,
  });

  return jsonResponse(200, { message: 'Password reset link sent to your email' });
}

// POST: Reset Password
export async function RESET(req: NextRequest) {
  const { token, newPassword } = await req.json();

  try {
    // Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return jsonResponse(200, { message: 'Password reset successfully' });
  } catch (error) {
    return jsonResponse(400, { error: 'Invalid or expired token' });
  }
}
