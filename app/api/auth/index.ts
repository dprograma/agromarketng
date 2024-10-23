import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { SignUpRequest, SignInRequest } from '@/types';

// Helper functions for JSON response
const jsonResponse = (status: number, data: any) => new NextResponse(JSON.stringify(data), { status });

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

  return jsonResponse(201, { message: 'User created successfully', user });
}

// POST: SignIn Handler
export async function PUT(req: NextRequest) {
  const { email, password }: SignInRequest = await req.json();

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return jsonResponse(401, { error: 'Invalid email or password' });

  // Compare passwords
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return jsonResponse(401, { error: 'Invalid email or password' });

  // Generate JWT
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '1h' });

  return jsonResponse(200, { message: 'Login successful', token });
}
