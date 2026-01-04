import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * GET - Generate 2FA setup (secret and QR code)
 */
export async function GET(req: NextRequest) {
  try {
    // Get token from cookies (try both development and production cookie names)
    const token = req.cookies.get('next-auth.session-token')?.value ||
                  req.cookies.get('__Secure-next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        twoFactorEnabled: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled for this account' },
        { status: 400 }
      );
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `AgroMarket NG (${user.email})`,
      issuer: 'AgroMarket NG',
      length: 32
    });

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url!);

    return NextResponse.json({
      secret: secret.base32,
      qrCode: qrCodeDataURL,
      manualEntryKey: secret.base32,
    });
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}

/**
 * POST - Enable 2FA after verification
 */
export async function POST(req: NextRequest) {
  try {
    // Get token from cookies (try both development and production cookie names)
    const token = req.cookies.get('next-auth.session-token')?.value ||
                  req.cookies.get('__Secure-next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Get request data
    const { secret, token: userToken } = await req.json();

    if (!secret || !userToken) {
      return NextResponse.json(
        { error: 'Secret and verification token are required' },
        { status: 400 }
      );
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: userToken,
      window: 2
    });

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }

    // Enable 2FA for the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes: backupCodes
      },
      select: {
        id: true,
        twoFactorEnabled: true
      }
    });

    return NextResponse.json({
      success: true,
      backupCodes: backupCodes,
      message: '2FA has been enabled successfully'
    });
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    return NextResponse.json(
      { error: 'Failed to enable 2FA' },
      { status: 500 }
    );
  }
}