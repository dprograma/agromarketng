import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { quickSend } from '@/lib/email';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('next-auth.session-token')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const session = jwt.verify(sessionToken, process.env.NEXTAUTH_SECRET!) as { role?: string };
    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { subject, content } = await req.json();

    if (!subject?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Subject and content are required' }, { status: 400 });
    }

    // Fetch all verified users
    const users = await prisma.user.findMany({
      where: { verified: true },
      select: { id: true, name: true, email: true },
    });

    if (users.length === 0) {
      return NextResponse.json({ error: 'No verified users found' }, { status: 404 });
    }

    let sent = 0;
    let failed = 0;

    // Send in batches of 10 to avoid rate limits
    const BATCH_SIZE = 10;
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(
        batch.map(async (user) => {
          const firstName = user.name.split(' ')[0];
          const result = await quickSend.broadcast(user.email, firstName, subject, content);
          if (result.success) {
            sent++;
          } else {
            failed++;
            console.error(`Broadcast failed for ${user.email}:`, result.error);
          }
        })
      );
      // Small delay between batches
      if (i + BATCH_SIZE < users.length) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    return NextResponse.json({
      message: 'Broadcast complete',
      total: users.length,
      sent,
      failed,
    });
  } catch (error) {
    console.error('Broadcast email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
