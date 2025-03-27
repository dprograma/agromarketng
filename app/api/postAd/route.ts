import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Define the type for a user with their subscription plan
type UserWithSubscriptionPlan = Prisma.UserGetPayload<{
  include: { subscriptionPlan: true };
}>;

// Define a type for the request body
interface PostAdRequestBody {
  title: string;
  category: string;
  location: string;
  price: number;
  description: string;
  contact: string;
  subscriptionPlanId?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    const session: any = decoded;
    const userId = session.id;

    // Check user and subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptionPlan: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check upload limits
    const ads = await prisma.ad.findMany({ where: { userId } });
    if (ads.length >= 10 && (!user.subscriptionPlan || user.subscriptionPlan.expiryDate < new Date())) {
      return NextResponse.json(
        { error: 'Upload limit reached. Please upgrade your subscription.' },
        { status: 402 }
      );
    }

    // Process form data
    const formData = await req.formData();
    const title = formData.get('title')?.toString();
    const category = formData.get('category')?.toString();
    const location = formData.get('location')?.toString();
    const priceStr = formData.get('price')?.toString();
    const description = formData.get('description')?.toString();
    const contact = formData.get('contact')?.toString();
    const images = formData.getAll('images');

    // Validate required fields
    if (!title || !category || !location || !priceStr || !description || !contact || images.length === 0) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Process price
    try {
      // First convert string to number
      const numericPrice = parseFloat(priceStr || '0');

      // Validate the numeric value
      if (isNaN(numericPrice) || numericPrice <= 0) {
        return NextResponse.json(
          { error: 'Invalid price value' },
          { status: 400 }
        );
      }

      // Convert to Prisma.Decimal with exact string representation
      const price = new Prisma.Decimal(numericPrice.toFixed(2));

      // Process images
      const imageUrls: string[] = [];
      for (const image of images) {
        if (!(image instanceof File)) continue;

        // Generate unique filename
        const ext = image.name.split('.').pop();
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const path = join(process.cwd(), 'public', 'uploads', filename);

        // Save file
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(path, buffer);

        // Store URL
        imageUrls.push(`/uploads/${filename}`);
      }

      // Create ad in database
      const ad = await prisma.ad.create({
        data: {
          title,
          category,
          location,
          price: price.toNumber(), 
          description,
          contact,
          images: imageUrls,
          userId,
          subscriptionPlanId: user.subscriptionPlanId || null,
        },
      });

      return NextResponse.json({ message: 'Ad posted successfully!', ad }, { status: 201 });
    } catch (error) {
      console.error('Error creating ad:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to create ad' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create ad' },
      { status: 500 }
    );
  }
}

