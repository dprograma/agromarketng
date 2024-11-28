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
