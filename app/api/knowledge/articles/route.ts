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

export async function GET(req: NextRequest) {
  try {
    const session = await validateAgentOrAdmin(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category');
    const searchTerm = searchParams.get('search');

    // Build the query
    let query: any = {
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    };

    // Add filters if provided
    if (category && category !== 'all') {
      query.where = { category };
    }

    if (searchTerm) {
      query.where = {
        ...query.where,
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { content: { contains: searchTerm, mode: 'insensitive' } },
          { tags: { has: searchTerm } }
        ]
      };
    }

    const articles = await prisma.knowledgeArticle.findMany(query);

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching knowledge articles:', error);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await validateAgentOrAdmin(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, category, tags } = await req.json();

    if (!title || !content || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create the article
    const article = await prisma.knowledgeArticle.create({
      data: {
        title,
        content,
        category,
        tags: Array.isArray(tags) ? tags : [],
        createdBy: session.userId
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
    console.error('Error creating article:', error);
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}