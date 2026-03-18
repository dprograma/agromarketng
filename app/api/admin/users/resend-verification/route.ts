import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';
import { quickSend } from '@/lib/email';

function validateAdmin(token: string | undefined) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
    if (decoded.role !== 'admin') return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * POST - Resend verification emails
 * Body: { userIds: string[] } — specific users, or { all: true } for all unverified
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get('next-auth.session-token')?.value ||
                req.cookies.get('__Secure-next-auth.session-token')?.value;
  const admin = validateAdmin(token);
  if (!admin) {
    return apiErrorResponse('Unauthorized', 401, 'UNAUTHORIZED');
  }

  try {
    const body = await req.json();
    const { userIds, all } = body;

    // Find users to send verification emails to
    let users;
    if (all) {
      users = await prisma.user.findMany({
        where: { verified: false },
        select: { id: true, name: true, email: true },
      });
    } else if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      users = await prisma.user.findMany({
        where: { id: { in: userIds }, verified: false },
        select: { id: true, name: true, email: true },
      });
    } else {
      return apiErrorResponse('Provide userIds array or set all: true', 400, 'INVALID_REQUEST');
    }

    if (users.length === 0) {
      return NextResponse.json({ message: 'No unverified users found.', sent: 0, failed: 0 });
    }

    const results: { email: string; status: string; error?: string }[] = [];

    for (const user of users) {
      try {
        // Generate a fresh token valid for 7 days
        const verificationToken = jwt.sign(
          { userId: user.id },
          process.env.NEXTAUTH_SECRET!,
          { expiresIn: '7d' }
        );

        const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-email?token=${verificationToken}`;

        const result = await quickSend.verification(
          user.email,
          user.name || 'User',
          verificationUrl
        );

        if (result.success) {
          results.push({ email: user.email, status: 'sent' });
        } else {
          results.push({ email: user.email, status: 'failed', error: String(result.error) });
        }

        // Small delay to avoid Resend rate limits
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        results.push({
          email: user.email,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const sent = results.filter(r => r.status === 'sent').length;
    const failed = results.filter(r => r.status === 'failed').length;

    return NextResponse.json({
      message: `Verification emails: ${sent} sent, ${failed} failed.`,
      sent,
      failed,
      details: results,
    });
  } catch (error) {
    console.error('Error resending verification emails:', error);
    return apiErrorResponse('Failed to resend verification emails', 500, 'RESEND_FAILED');
  }
}
