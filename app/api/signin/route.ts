import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { authRateLimiters } from '@/lib/rateLimit';
import { logAuthEvent } from '@/lib/authLogger';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Apply rate limiting
  const rateLimitResult = authRateLimiters.signin(req);
  if (!rateLimitResult.success) {
    logAuthEvent.rateLimitExceeded(clientIp, 'signin');
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        }
      }
    );
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      logAuthEvent.loginAttempt(email || 'unknown', false, clientIp, 'Missing email or password');
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        Agent: true
      }
    });
    if (!user) {
      logAuthEvent.loginAttempt(email, false, clientIp, 'User not found');
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.verified) {
      logAuthEvent.loginAttempt(email, false, clientIp, 'Account not verified');
      return NextResponse.json({ error: 'Account not verified' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password || '');
    if (!isValidPassword) {
      logAuthEvent.loginAttempt(email, false, clientIp, 'Invalid password');
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Determine user role and include relevant data
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      isAgent: !!user.Agent,
      agentId: user.Agent?.id
    };

    console.log("user data from signin handler: ", userData)

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        isAgent: !!user.Agent,
        agentId: user.Agent?.id
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '7d' } // Match session duration
    );

    const response = NextResponse.json({
      message: 'Login successful',
      user: userData,
      token: token,
    });

    response.cookies.set('next-auth.session-token', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Log successful login
    logAuthEvent.loginAttempt(email, true, clientIp, undefined, {
      userId: user.id,
      userRole: user.role,
      isAgent: !!user.Agent
    });

    return response;
  } catch (error) {
    console.error('Error in sign-in handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
