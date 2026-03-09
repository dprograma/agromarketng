import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { adPostingRateLimiters } from '@/lib/rateLimit';
import { sanitizeAdFields } from '@/lib/sanitize';
import { validateFileMagicBytes } from '@/lib/fileValidation';

// Define the type for a user with their subscription plan
type UserWithSubscriptionPlan = Prisma.UserGetPayload<{
  include: { subscriptionPlan: true }
}>;

// Constants for file validation
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    // Rate limiting — prevent bot abuse
    const rateLimitResult = adPostingRateLimiters.postAd(req);
    if (!rateLimitResult.success) {
      return apiErrorResponse(
        'Too many ads posted. Please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED',
        `Try again after ${new Date(rateLimitResult.resetTime).toISOString()}`
      );
    }

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

    // Sanitize text inputs to prevent XSS/injection
    const sanitized = sanitizeAdFields({
      title: title || '',
      description: description || '',
      location: location || '',
      contact: contact || '',
      category,
      subcategory,
      section,
    });

    // Validate required fields (using sanitized values)
    const validationErrors: { field: string; message: string }[] = [];
    if (!sanitized.title || sanitized.title.length < 5 || sanitized.title.length > 100) {
      validationErrors.push({ field: 'title', message: 'Title must be between 5 and 100 characters.' });
    }
    if (!sanitized.category) {
      validationErrors.push({ field: 'category', message: 'Category is required.' });
    }
    if (!sanitized.location || sanitized.location.length < 3) {
      validationErrors.push({ field: 'location', message: 'Location must be at least 3 characters.' });
    }
    if (!sanitized.description || sanitized.description.length < 20 || sanitized.description.length > 5000) {
      validationErrors.push({ field: 'description', message: 'Description must be between 20 and 5000 characters.' });
    }
    if (!sanitized.contact || !/^\+?[0-9\s-()]{7,20}$/.test(sanitized.contact)) {
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

      // Validate image MIME type
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
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Validate file content via magic bytes — blocks executables disguised as images
        const magicByteResult = validateFileMagicBytes(buffer, image.type);
        if (!magicByteResult.isValid) {
          return apiErrorResponse(
            `Image rejected: ${image.name}. ${magicByteResult.error}`,
            400,
            'INVALID_FILE_CONTENT'
          );
        }

        // Upload to Cloudinary
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const result = await uploadToCloudinary(buffer, 'ads', filename);
        imageUrls.push(result.url);
      } catch (fileError) {
        console.error('Error uploading image:', image.name, fileError);
        return apiErrorResponse(
          `Failed to upload image: ${image.name}`,
          500,
          'UPLOAD_ERROR',
          fileError instanceof Error ? fileError.message : String(fileError)
        );
      }
    }

    // Create ad in database with sanitized inputs
    const ad = await prisma.ad.create({
      data: {
        title: sanitized.title,
        category: sanitized.category!,
        subcategory: sanitized.subcategory || null,
        section: sanitized.section || null,
        location: sanitized.location,
        price: price.toNumber(),
        description: sanitized.description,
        contact: sanitized.contact,
        images: imageUrls,
        userId,
        subscriptionPlanId: user.subscriptionPlanId || null,
        status: "Active",
        featured: true,
        boostMultiplier: 1.0,
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
