import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

interface RouteParams {
  params: Promise<{id: string;
   }>;
}

// DELETE - Remove a payment method
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Find the payment method
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id }
    });

    // Check if payment method exists and belongs to the user
    if (!paymentMethod || paymentMethod.userId !== userId) {
      return NextResponse.json(
        { error: 'Payment method not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the payment method
    await prisma.paymentMethod.delete({
      where: { id }
    });

    // If this was the default payment method, set another one as default
    if (paymentMethod.isDefault) {
      const anotherMethod = await prisma.paymentMethod.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      if (anotherMethod) {
        await prisma.paymentMethod.update({
          where: { id: anotherMethod.id },
          data: { isDefault: true }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    
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
          error: "Failed to delete payment method", 
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

// PATCH - Update a payment method (e.g., set as default)
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
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

    // Find the payment method
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id }
    });

    // Check if payment method exists and belongs to the user
    if (!paymentMethod || paymentMethod.userId !== userId) {
      return NextResponse.json(
        { error: 'Payment method not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // If setting as default, update all other methods
    if (data.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { 
          userId,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    // Update the payment method
    const updatedMethod = await prisma.paymentMethod.update({
      where: { id },
      data: {
        isDefault: data.isDefault !== undefined ? data.isDefault : paymentMethod.isDefault,
        // Add other fields that can be updated here
      }
    });

    return NextResponse.json({
      success: true,
      paymentMethod: {
        id: updatedMethod.id,
        type: updatedMethod.type,
        provider: updatedMethod.provider,
        isDefault: updatedMethod.isDefault,
        updatedAt: updatedMethod.updatedAt
      }
    });
  } catch (error) {
    console.error("Error updating payment method:", error);
    
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
          error: "Failed to update payment method", 
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
