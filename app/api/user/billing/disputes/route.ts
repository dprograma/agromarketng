import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Get request body
    const data = await req.json();
    
    // Validate required fields
    if (!data.transactionId || !data.description) {
      return NextResponse.json(
        { error: 'Missing required fields', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    // Find the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: data.transactionId }
    });

    // Check if transaction exists and belongs to the user
    if (!transaction || transaction.userId !== userId) {
      return NextResponse.json(
        { error: 'Transaction not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Create a notification for the dispute
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: 'payment-dispute',
        message: `Dispute filed for transaction ${transaction.reference}. Our team will review it shortly.`,
        read: false
      }
    });

    // In a real application, you would also:
    // 1. Create a support ticket or dispute record in the database
    // 2. Notify administrators
    // 3. Potentially integrate with a payment gateway's dispute API

    // For now, we'll just return a success response
    return NextResponse.json({
      success: true,
      message: 'Dispute filed successfully. Our team will review it shortly.',
      notificationId: notification.id
    });
  } catch (error) {
    console.error("Error filing dispute:", error);
    
    // Provide more specific error messages based on the error type
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: "Invalid authentication token", code: "INVALID_TOKEN" },
        { status: 401 }
      );
    } else if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: "Authentication token expired", code: "TOKEN_EXPIRED" },
        { status: 401 }
      );
    } else if (error instanceof Error) {
      // Return a generic error message but with the specific error name for debugging
      return NextResponse.json(
        { 
          error: "Failed to file dispute", 
          code: "SERVER_ERROR",
          message: error.message,
          name: error.name
        },
        { status: 500 }
      );
    }
    
    // Fallback for unknown errors
    return NextResponse.json(
      { error: "An unexpected error occurred", code: "UNKNOWN_ERROR" },
      { status: 500 }
    );
  }
}
