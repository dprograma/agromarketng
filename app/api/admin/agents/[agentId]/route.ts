import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';

// Helper function to validate admin session
async function validateAdmin(req: NextRequest) {
  // Try both development and production cookie names
  const token = req.cookies.get('next-auth.session-token')?.value ||
                req.cookies.get('__Secure-next-auth.session-token')?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      id: string;
      email: string;
      role: string;
      exp?: number;
    };

    // Check token expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return null;
    }

    // Check if user is admin by role
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
  context: { params: Promise<{ agentId: string }> }
) {
  try {
    const session = await validateAdmin(req);
    if (!session) {
      return apiErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const params = await context.params;
    const { agentId } = params;

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          },
        },
      },
    });

    if (!agent) {
      return apiErrorResponse("Agent not found", 404, "AGENT_NOT_FOUND");
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Error fetching agent:", error);
    return apiErrorResponse(
      "Failed to fetch agent",
      500,
      "FETCH_AGENT_FAILED",
      error instanceof Error ? error.message : String(error)
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ agentId: string }> }
) {
  try {
    const session = await validateAdmin(req);
    if (!session) {
      return apiErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const data = await req.json();
    const params = await context.params;
    const { agentId } = params;

    // Validate data
    if (data.isAvailable !== undefined && typeof data.isAvailable !== 'boolean') {
      return apiErrorResponse(
        "Invalid isAvailable value",
        400,
        "INVALID_INPUT"
      );
    }

    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          },
        },
      },
    });

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error("Error updating agent:", error);
    return apiErrorResponse(
      "Failed to update agent",
      500,
      "UPDATE_AGENT_FAILED",
      error instanceof Error ? error.message : String(error)
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ agentId: string }> }
) {
  try {
    const session = await validateAdmin(req);
    if (!session) {
      return apiErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const params = await context.params;
    const { agentId } = params;

    // Check if agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return apiErrorResponse("Agent not found", 404, "AGENT_NOT_FOUND");
    }

    // Delete agent
    await prisma.agent.delete({
      where: { id: agentId },
    });

    return NextResponse.json({ message: "Agent deleted successfully" });
  } catch (error) {
    console.error("Error deleting agent:", error);
    return apiErrorResponse(
      "Failed to delete agent",
      500,
      "DELETE_AGENT_FAILED",
      error instanceof Error ? error.message : String(error)
    );
  }
}
