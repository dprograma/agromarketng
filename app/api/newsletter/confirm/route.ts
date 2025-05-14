import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/newsletter-error?message=missing_token', req.nextUrl.origin)
      );
    }

    // Find subscription with this token
    const subscription = await prisma.newsletter.findUnique({
      where: { token }
    });

    if (!subscription) {
      return NextResponse.redirect(
        new URL('/newsletter-error?message=invalid_token', req.nextUrl.origin)
      );
    }

    // If already confirmed, redirect to success page
    if (subscription.isConfirmed) {
      return NextResponse.redirect(
        new URL('/newsletter-success?status=already_confirmed', req.nextUrl.origin)
      );
    }

    // Update subscription to confirmed
    await prisma.newsletter.update({
      where: { id: subscription.id },
      data: {
        isConfirmed: true,
        token: null // Clear token after confirmation for security
      }
    });

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/newsletter-success', req.nextUrl.origin)
    );
  } catch (error) {
    console.error('Newsletter confirmation error:', error);
    return NextResponse.redirect(
      new URL('/newsletter-error?message=server_error', req.nextUrl.origin)
    );
  }
}
