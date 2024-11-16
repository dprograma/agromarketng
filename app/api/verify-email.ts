// pages/api/verify-email.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { token } = req.query;

  if (!token) return new NextResponse('Verification token is missing', { status: 400 });

  try {
    const decoded = jwt.verify(token as string, process.env.JWT_SECRET!);

    if (typeof decoded !== 'object' || !decoded.userId) {
      return new NextResponse('Invalid token', { status: 400 });
    }

    const userId = decoded.userId;

    // Update the user to set verified as true
    await prisma.user.update({
      where: { id: userId },
      data: { verified: true },
    });

    return new NextResponse('Email verified successfully!', { status: 200 });
  } catch (error) {
    return new NextResponse('Invalid or expired token', { status: 400 });
  }
}
