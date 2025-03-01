import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { MulterRequest } from "@/types";
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import multer from "multer";
import { NextApiRequest, NextApiResponse } from "next";

// Helper functions for JSON response
const jsonResponse = (status: number, data: any) => new NextResponse(JSON.stringify(data), { status });

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// POST: Forgot Password
export async function FORGOT(req: NextRequest) {
  const { email } = await req.json();

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return jsonResponse(404, { error: 'User not found' });

  // Generate a reset token
  const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

  // Send reset email
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `<p>Hi,</p>
           <p>You requested a password reset. Click the link below to reset your password:</p>
           <a href="${resetUrl}">Reset Password</a>
           <p>If you did not request this, please ignore this email.</p>`,
  });

  return jsonResponse(200, { message: 'Password reset link sent to your email' });
}

// POST: Reset Password
export async function RESET(req: NextRequest) {
  const { token, newPassword } = await req.json();

  try {
    // Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return jsonResponse(200, { message: 'Password reset successfully' });
  } catch (error) {
    return jsonResponse(400, { error: 'Invalid or expired token' });
  }
}

// Configure Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });
const uploadMiddleware = upload.single("image");

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: MulterRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await runMiddleware(req, res, uploadMiddleware);

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { email } = session.user;
  const { verified } = req.body;
  try {
    let imageUrl = undefined;

    // Upload image if provided
    if (req.file) {
      // Use a service like Cloudinary or S3 for image upload (this is a placeholder)
      imageUrl = `/uploads/${req.file.originalname}`; // Replace with real URL from your service
    }

    // Update user profile in the database
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        image: imageUrl,
        verified: verified || undefined,
      },
    });

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
}


export const config = {
  api: {
    bodyParser: false,
  },
};

