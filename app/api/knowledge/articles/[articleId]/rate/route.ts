import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Helper function to validate agent session
async function validateAgentOrAdmin(req: NextRequest) {
  const token = req.cookies.get('next-auth.session-token')?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      id: string;
      role: string;
    };

    // Verify user exists and has appropriate role
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || (user.role !== 'agent' && user.role !== 'admin')) {
      return null;
    }

    return { userId: decoded.id, role: user.role };
  } catch (error) {
    return null;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const session = await validateAgentOrAdmin(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const articleId = (await params).articleId;
    const { isHelpful } = await req.json();

    if (typeof isHelpful !== 'boolean') {
      return NextResponse.json({ error: "isHelpful must be a boolean" }, { status: 400 });
    }

    // Update the rating
    const article = await prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: {
        helpful: isHelpful ? { increment: 1 } : undefined,
        notHelpful: !isHelpful ? { increment: 1 } : undefined
      }
    });

    return NextResponse.json({
      message: "Rating submitted successfully",
      helpful: article.helpful,
      notHelpful: article.notHelpful
    });
  } catch (error) {
    console.error('Error rating article:', error);
    return NextResponse.json({ error: "Failed to rate article" }, { status: 500 });
  }
}