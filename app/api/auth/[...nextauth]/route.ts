import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { NextRequest, NextResponse } from 'next/server';
import { checkLoginRateLimit, getClientIdentifier } from '@/lib/loginRateLimit';

const handler = NextAuth(authOptions);

// Wrapper for POST requests to apply rate limiting
async function POST(req: NextRequest) {
  const body = await req.clone().json().catch(() => ({}));

  // Only apply rate limiting to credentials sign-in attempts
  if (body?.method === 'credentials' || body?.email) {
    const identifier = getClientIdentifier(req);
    const rateLimitCheck = checkLoginRateLimit(identifier);

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: rateLimitCheck.message },
        { status: 429 }
      );
    }
  }

  return handler(req);
}

export { handler as GET, POST };
