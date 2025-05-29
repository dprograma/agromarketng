import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    // Get and validate token
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token and get userId
    const session = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify agent status
    const agent = await prisma.agent.findUnique({
      where: { userId: session.id }
    });

    if (!agent) {
      return NextResponse.json({ error: "Not an agent" }, { status: 403 });
    }

    // Get status from request
    const { isAvailable } = await req.json();
    if (typeof isAvailable !== 'boolean') {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update agent status
    const updatedAgent = await prisma.agent.update({
      where: { id: agent.id },
      data: { 
        isAvailable,
        lastActive: new Date()
      }
    });

    return NextResponse.json({
      message: `Agent status updated to ${isAvailable ? 'available' : 'unavailable'}`,
      agent: updatedAgent
    });
  } catch (error) {
    console.error('Error updating agent status:', error);
    return NextResponse.json({ error: "Failed to update agent status" }, { status: 500 });
  }
}
