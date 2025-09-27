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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const session = await validateAgentOrAdmin(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const articleId = (await params).articleId;

    // Increment view count and get article
    const article = await prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: {
        views: {
          increment: 1
        }
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const session = await validateAgentOrAdmin(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const articleId = (await params).articleId;
    const { title, content, category, tags } = await req.json();

    // Update the article
    const article = await prisma.knowledgeArticle.update({
      where: { id: articleId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(category && { category }),
        ...(tags && { tags: Array.isArray(tags) ? tags : [] })
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const session = await validateAgentOrAdmin(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can delete articles
    if (session.role !== 'admin') {
      return NextResponse.json({ error: "Only administrators can delete articles" }, { status: 403 });
    }

    const articleId = (await params).articleId;

    await prisma.knowledgeArticle.delete({
      where: { id: articleId }
    });

    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}