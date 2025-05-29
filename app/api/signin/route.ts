import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        Agent: true
      }
    });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.verified) {
      return NextResponse.json({ error: 'Account not verified' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password || '');
    if (!isValidPassword) {
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
      { expiresIn: '1h' }
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
      maxAge: 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Error in sign-in handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
