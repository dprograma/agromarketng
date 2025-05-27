import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';

export async function POST(req: NextRequest) {
  try {
    const { email, password, specialties } = await req.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return apiErrorResponse('Email already registered', 400, 'EMAIL_ALREADY_REGISTERED');
    }

    // Create user with agent role
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: email.split('@')[0],
        role: 'agent',
        verified: true // Agents are auto-verified
      }
    });

    // Create agent profile
    const agent = await prisma.agent.create({
      data: {
        userId: user.id,
        specialties,
        isAvailable: true
      }
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'agent' },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '1h' }
    );

    const response = NextResponse.json({
      message: 'Agent account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAgent: true,
        agentId: agent.id
      },
      token
    });

    response.cookies.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60
    });

    return response;
  } catch (error) {
    console.error('Error in agent signup:', error);
    return apiErrorResponse(
      'Failed to create agent account',
      500,
      'AGENT_SIGNUP_FAILED',
      error instanceof Error ? error.message : String(error)
    );
  }
}