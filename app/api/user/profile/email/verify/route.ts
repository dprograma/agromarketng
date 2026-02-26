import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST - Verify email change
 */
export async function POST(req: NextRequest) {
  try {
    const { token, newEmail } = await req.json();

    if (!token || !newEmail) {
      return NextResponse.json(
        { error: 'Verification token and email are required' },
        { status: 400 }
      );
    }

    // Find the verification token by token value alone, then validate identifier
    const verificationRecord = await prisma.verificationToken.findFirst({
      where: { token }
    });

    if (!verificationRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (verificationRecord.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationRecord.identifier,
            token: token
          }
        }
      });

      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Extract userId from identifier
    const userId = verificationRecord.identifier.replace('email-change-', '');

    // Check if new email is still available
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail.toLowerCase() },
      select: { id: true }
    });

    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json(
        { error: 'Email address is no longer available' },
        { status: 400 }
      );
    }

    // Update user email
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail.toLowerCase(),
        emailVerified: new Date() // Mark as verified
      }
    });

    // Delete the verification token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationRecord.identifier,
          token: token
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Email address updated successfully'
    });

  } catch (error) {
    console.error('Error verifying email change:', error);
    return NextResponse.json(
      { error: 'Failed to verify email change' },
      { status: 500 }
    );
  }
}