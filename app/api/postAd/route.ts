import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { apiErrorResponse } from '@/lib/errorHandling';

// Define the type for a user with their subscription plan
type UserWithSubscriptionPlan = Prisma.UserGetPayload<{
  include: { subscriptionPlan: true }
}>;

// Constants for file validation
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return apiErrorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    const session: any = decoded;
    const userId = session.id;

    // Check user and subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptionPlan: true }
    });

    if (!user) {
      return apiErrorResponse('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check upload limits
    const ads = await prisma.ad.findMany({ where: { userId } });
    if (ads.length >= 10 && (!user.subscriptionPlan || user.subscriptionPlan.expiryDate < new Date())) {
      return apiErrorResponse('Upload limit reached. Please upgrade your subscription.', 402, 'UPLOAD_LIMIT_REACHED');
    }

    // Parse form data
    const formData = await req.formData();
    const title = formData.get('title')?.toString();
    const category = formData.get('category')?.toString();
    const subcategory = formData.get('subcategory')?.toString();
    const section = formData.get('section')?.toString();
    const location = formData.get('location')?.toString();
    const priceStr = formData.get('price')?.toString();
    const description = formData.get('description')?.toString();
    const contact = formData.get('contact')?.toString();
    const images = formData.getAll('images');

    // Validate required fields
    const validationErrors: { field: string; message: string }[] = [];
    if (!title || title.length < 5 || title.length > 100) {
      validationErrors.push({ field: 'title', message: 'Title must be between 5 and 100 characters.' });
    }
    if (!category) {
      validationErrors.push({ field: 'category', message: 'Category is required.' });
    }
    if (!location || location.length < 3) {
      validationErrors.push({ field: 'location', message: 'Location must be at least 3 characters.' });
    }
    if (!description || description.length < 20 || description.length > 5000) {
      validationErrors.push({ field: 'description', message: 'Description must be between 20 and 5000 characters.' });
    }
    if (!contact || !/^\+?[0-9\s-()]{7,20}$/.test(contact)) {
      validationErrors.push({ field: 'contact', message: 'Valid contact information is required.' });
    }
    if (images.length === 0) {
      validationErrors.push({ field: 'images', message: 'At least one image is required.' });
    }
    if (images.length > 5) {
      validationErrors.push({ field: 'images', message: 'Maximum of 5 images allowed.' });
    }

    const numericPrice = parseFloat(priceStr || '');
    if (!priceStr || isNaN(numericPrice) || numericPrice <= 0) {
      validationErrors.push({ field: 'price', message: 'A valid positive price is required.' });
    }

    if (validationErrors.length > 0) {
      return apiErrorResponse(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        JSON.stringify(validationErrors)
      );
    }

    const price = new Prisma.Decimal(numericPrice.toFixed(2));

    // Process images
    const imageUrls: string[] = [];
    for (const image of images) {
      if (!(image instanceof File)) continue;

      // Validate image type and size
      if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
        return apiErrorResponse(
          `Invalid image type: ${image.name}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
          400,
          'INVALID_IMAGE_TYPE'
        );
      }
      if (image.size > MAX_FILE_SIZE) {
        return apiErrorResponse(
          `Image too large: ${image.name}. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          400,
          'IMAGE_TOO_LARGE'
        );
      }

      try {
        // Generate unique filename
        const ext = image.name.split('.').pop();
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const uploadPath = join(process.cwd(), 'public', 'uploads', filename);

        // Save file
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(uploadPath, buffer);

        // Store URL
        imageUrls.push(`/uploads/${filename}`);
      } catch (fileError) {
        console.error('Error processing file:', image.name, fileError);
        return apiErrorResponse(
          `Failed to process image: ${image.name}`,
          500,
          'FILE_PROCESSING_ERROR',
          fileError instanceof Error ? fileError.message : String(fileError)
        );
      }
    }

    // Create ad in database
    const ad = await prisma.ad.create({
      data: {
        title: title!, // Already validated
        category: category!, // Already validated
        subcategory: subcategory || null,
        section: section || null,
        location: location!, // Already validated
        price: price.toNumber(),
        description: description!, // Already validated
        contact: contact!, // Already validated
        images: imageUrls,
        userId,
        subscriptionPlanId: user.subscriptionPlanId || null,
        status: "Active", // Auto-activate ads on posting
      },
    });

    return NextResponse.json({ message: 'Ad posted successfully!', ad }, { status: 201 });
  } catch (error) {
    console.error('Error creating ad:', error);
    return apiErrorResponse(
      'Failed to create ad',
      500,
      'INTERNAL_SERVER_ERROR',
      error instanceof Error ? error.message : String(error)
    );
  }
}

