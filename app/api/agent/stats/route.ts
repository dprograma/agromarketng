import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';
import { cache } from '@/lib/cache';

// Helper function to validate agent session
async function validateAgent(req: NextRequest) {
  const token = req.cookies.get('next-auth.session-token')?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      id: string;
      role: string;
    };

    // Check if user is agent
    if (decoded.role !== 'agent') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await validateAgent(req);
    if (!session) {
      return apiErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    return await cache.getOrSet(`agent-${session.id}-stats`, async () => {
      const agent = await prisma.agent.findUnique({
        where: { id: session.id },
        include: {
          SupportChat: true
        }
      });

      if (!agent) {
        return apiErrorResponse("Agent not found", 404, "AGENT_NOT_FOUND");
      }

      const activeChats = agent.SupportChat.filter(chat => chat.status === 'active').length;
      const responseTimes = agent.SupportChat
        .filter(chat => chat.status !== 'pending')
        .map(chat => {
          const responseTime = new Date(chat.updatedAt).getTime() - new Date(chat.createdAt).getTime();
          return responseTime / (1000 * 60);
        });

      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

      const totalChats = agent.SupportChat.length;
      const resolvedChats = agent.SupportChat.filter(chat => chat.status === 'resolved').length;
      const resolutionRate = totalChats > 0
        ? Math.round((resolvedChats / totalChats) * 100)
        : 0;

      return NextResponse.json({
        activeChats,
        avgResponseTime,
        resolutionRate
      });
    });
  } catch (error) {
    console.error("Error fetching agent stats:", error);
    return apiErrorResponse(
      "Failed to fetch agent stats",
      500,
      "FETCH_AGENT_STATS_FAILED",
      error instanceof Error ? error.message : String(error)
    );
  }
}
