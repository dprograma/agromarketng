import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(
      new URL('/signin?alert=missing_token', req.nextUrl.origin)
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);

    if (typeof decoded !== 'object' || !('userId' in decoded)) {
      return NextResponse.redirect(
        new URL('/signin?alert=invalid_token', req.nextUrl.origin)
      );
    }

    const userId = decoded.userId;

    // Update the user to set verified as true
    await prisma.user.update({
      where: { id: userId },
      data: { verified: true },
    });

    return NextResponse.redirect(
      new URL('/signin?alert=success_token', req.nextUrl.origin)
    );
  } catch (error) {
    return NextResponse.redirect(
      new URL('/signin?alert=expired_token', req.nextUrl.origin)
    );
  }
}
