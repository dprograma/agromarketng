import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * POST - Request email change
 */
export async function POST(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value ||
                  req.cookies.get('__Secure-next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Get request data
    const { newEmail, password } = await req.json();

    if (!newEmail || !password) {
      return NextResponse.json(
        { error: 'New email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Get user and verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true,
        name: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if new email is same as current
    if (user.email === newEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'New email must be different from current email' },
        { status: 400 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 400 }
      );
    }

    // Check if new email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail.toLowerCase() },
      select: { id: true }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email address is already in use' },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store the email change request
    await prisma.user.update({
      where: { id: userId },
      data: {
        // We'll store this temporarily - you might want to create a separate table for this
        // For now, we'll use a simple approach with metadata or create a custom field
      }
    });

    // Create a verification token record
    await prisma.verificationToken.create({
      data: {
        identifier: `email-change-${userId}`,
        token: verificationToken,
        expires: tokenExpiry
      }
    });

    // In a real app, you would send an email here
    // For now, we'll return the token for testing
    return NextResponse.json({
      success: true,
      message: 'Email change verification sent. Please check your new email address.',
      // Remove this in production - only for testing
      verificationToken: verificationToken,
      verificationUrl: `${process.env.NEXTAUTH_URL}/verify-email-change?token=${verificationToken}&email=${encodeURIComponent(newEmail)}`
    });

  } catch (error) {
    console.error('Error requesting email change:', error);
    return NextResponse.json(
      { error: 'Failed to request email change' },
      { status: 500 }
    );
  }
}