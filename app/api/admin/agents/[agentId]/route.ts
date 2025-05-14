import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Helper function to validate admin session
async function validateAdmin(req: NextRequest) {
  const token = req.cookies.get('next-auth.session-token')?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      id: string;
      role: string;
    };

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const session = await validateAdmin(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma.agent.findUnique({
      where: { id: params.agentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Error fetching agent:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const session = await validateAdmin(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    
    // Validate data
    if (data.isAvailable !== undefined && typeof data.isAvailable !== 'boolean') {
      return NextResponse.json(
        { error: "Invalid isAvailable value" },
        { status: 400 }
      );
    }

    // Update agent
    const updatedAgent = await prisma.agent.update({
      where: { id: params.agentId },
      data: {
        isAvailable: data.isAvailable,
        // Add other fields that can be updated here
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error("Error updating agent:", error);
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const session = await validateAdmin(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: params.agentId },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Delete agent
    await prisma.agent.delete({
      where: { id: params.agentId },
    });

    return NextResponse.json({ message: "Agent deleted successfully" });
  } catch (error) {
    console.error("Error deleting agent:", error);
    return NextResponse.json(
      { error: "Failed to delete agent" },
      { status: 500 }
    );
  }
}
