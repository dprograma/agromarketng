import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { SignUpRequest } from '@/types';
import { authRateLimiters } from '@/lib/rateLimit';
import { quickSend } from '@/lib/email';

// Helper functions for JSON response
const jsonResponse = (status: number, data: any) => new NextResponse(JSON.stringify(data), { status });

// Validation patterns
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const NAME_REGEX = /^[a-zA-Z0-9\s]{2,50}$/;
const PASSWORD_MIN_LENGTH = 8;

// Validation functions
function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) return { valid: false, error: 'Email is required' };
  if (!EMAIL_REGEX.test(email)) return { valid: false, error: 'Invalid email format' };
  return { valid: true };
}

function validateName(name: string): { valid: boolean; error?: string } {
  if (!name) return { valid: false, error: 'Name is required' };
  if (!NAME_REGEX.test(name)) {
    return { valid: false, error: 'Name must be 2-50 characters and contain only letters, numbers, and spaces' };
  }
  return { valid: true };
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character' };
  }
  return { valid: true };
}

function sanitizeInput(input: string): string {
  // Remove HTML tags and trim whitespace
  return input.replace(/<[^>]*>/g, '').trim();
}


// POST: SignUp Handler
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = authRateLimiters.signup(req);
    if (!rateLimitResult.success) {
      return jsonResponse(429, { error: 'Too many signup attempts. Please try again later.' });
    }

    const { name, email, password }: SignUpRequest = await req.json();

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    // Validate inputs
    const nameValidation = validateName(sanitizedName);
    if (!nameValidation.valid) {
      return jsonResponse(400, { error: nameValidation.error });
    }

    const emailValidation = validateEmail(sanitizedEmail);
    if (!emailValidation.valid) {
      return jsonResponse(400, { error: emailValidation.error });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return jsonResponse(400, { error: passwordValidation.error });
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: sanitizedEmail } });
    if (existingUser) return jsonResponse(400, { error: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword
      }
    });

    // Generate a verification token
    const verificationToken = jwt.sign({ userId: user.id }, process.env.NEXTAUTH_SECRET!, { expiresIn: '1d' });

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-email?token=${verificationToken}`;
    try {
      const result = await quickSend.verification(sanitizedEmail, sanitizedName, verificationUrl);

      if (!result.success) {
        console.error('Verification email failed:', result.error);
        // Continue with user creation even if email fails
      } else {
        console.log('Verification email sent successfully:', result.messageId);
      }
    } catch (error: any) {
      console.error('Email sending failed:', error);
      // Continue with user creation even if email fails
    }

    return jsonResponse(201, { message: 'User created successfully', user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    console.error('Signup error:', error);
    return jsonResponse(500, { error: 'Internal server error' });
  }
}