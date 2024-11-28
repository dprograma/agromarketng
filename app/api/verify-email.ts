import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  // Use `nextUrl.searchParams` to get the token from the query string
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { message: 'Verification token is missing' },
      { status: 400 }
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (typeof decoded !== 'object' || !('userId' in decoded)) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 400 }
      );
    }

    const userId = decoded.userId;

    // Update the user to set verified as true
    await prisma.user.update({
      where: { id: userId },
      data: { verified: true },
    });

    return NextResponse.json(
      { message: 'Email verified successfully!' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Invalid or expired token' },
      { status: 400 }
    );
  }
}
