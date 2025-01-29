import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';
import { SignUpRequest } from '@/types';

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
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your account',
      html: `<p>Hi ${name},</p>
         <p>Thanks for signing up. Please verify your email by clicking the link below:</p>
         <a href="${verificationUrl}" style="color: #2d89ef; text-decoration: none;">Verify your account</a>`,
      text: `Hi ${name},\n\nThanks for signing up. Please verify your email by clicking the link below:\n\n${verificationUrl}`,
    });
  } catch (error: any) {
    return;
  }

  return jsonResponse(201, { message: 'User created successfully', user });
}