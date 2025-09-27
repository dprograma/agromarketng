import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import { apiErrorResponse } from '@/lib/errorHandling';
import { join } from 'path';

/**
 * POST - Upload user profile image
 */
export async function POST(req: NextRequest) {
  try {
    // Get token from cookies (try both development and production cookie names)
    const token = req.cookies.get('next-auth.session-token')?.value ||
                  req.cookies.get('__Secure-next-auth.session-token')?.value;
    if (!token) {
      return apiErrorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Get image file from form data
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return apiErrorResponse(
        'No image file provided',
        400,
        'NO_IMAGE_PROVIDED'
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return apiErrorResponse(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
        400,
        'INVALID_FILE_TYPE'
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return apiErrorResponse(
        'File size exceeds the 5MB limit',
        400,
        'FILE_TOO_LARGE'
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.type.split('/')[1];
    const filename = `${userId}-${timestamp}.${extension}`;

    // Save file to public directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const path = join(process.cwd(), 'public', 'uploads', 'profiles', filename);
    await writeFile(path, buffer);

    // Update user profile with new image URL
    const imageUrl = `/uploads/profiles/${filename}`;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    });

    return NextResponse.json({
      message: 'Profile image updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error uploading profile image:', error); // Log the actual error for debugging
    return apiErrorResponse(
      'Failed to upload profile image',
      500,
      'UPLOAD_PROFILE_IMAGE_FAILED',
      error instanceof Error ? error.message : String(error)
    );
  }
}
