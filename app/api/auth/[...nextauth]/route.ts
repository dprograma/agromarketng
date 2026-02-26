import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { NextRequest, NextResponse } from 'next/server';
import { checkLoginRateLimit, getClientIdentifier } from '@/lib/loginRateLimit';

const handler = NextAuth(authOptions);

// NextAuth v4 App Router: handler must receive (req, { params }) where
// params.nextauth contains the catch-all route segments.
async function GET(req: NextRequest, context: { params: { nextauth: string[] } }) {
  return handler(req, context);
}

async function POST(req: NextRequest, context: { params: { nextauth: string[] } }) {
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

  return handler(req, context);
}

export { GET, POST };
