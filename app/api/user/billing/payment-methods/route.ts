import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Get payment methods
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Format payment methods for display
    const formattedPaymentMethods = paymentMethods.map(method => {
      const baseInfo = {
        id: method.id,
        type: method.type,
        provider: method.provider,
        isDefault: method.isDefault,
        createdAt: method.createdAt
      };

      // Add type-specific information
      if (method.type === 'card') {
        return {
          ...baseInfo,
          last4: method.last4,
          expiryMonth: method.expiryMonth,
          expiryYear: method.expiryYear,
          displayName: `${method.provider} •••• ${method.last4}`,
          expiryDisplay: method.expiryMonth && method.expiryYear ? 
            `${method.expiryMonth.toString().padStart(2, '0')}/${method.expiryYear % 100}` : 
            null
        };
      } else if (method.type === 'paypal') {
        return {
          ...baseInfo,
          email: method.email,
          displayName: `PayPal (${method.email})`
        };
      } else if (method.type === 'bank_account') {
        return {
          ...baseInfo,
          accountName: method.accountName,
          accountNumber: method.accountNumber,
          bankName: method.bankName,
          last4: method.last4,
          displayName: `${method.bankName} •••• ${method.last4}`
        };
      }

      return baseInfo;
    });

    return NextResponse.json({
      paymentMethods: formattedPaymentMethods,
      defaultMethod: formattedPaymentMethods.find(m => m.isDefault) || null
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    
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
          error: "Failed to fetch payment methods", 
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
    if (!data.type || !data.provider) {
      return NextResponse.json(
        { error: 'Missing required fields', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    // Validate type-specific fields
    if (data.type === 'card' && (!data.last4 || !data.expiryMonth || !data.expiryYear)) {
      return NextResponse.json(
        { error: 'Missing required card fields', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    } else if (data.type === 'paypal' && !data.email) {
      return NextResponse.json(
        { error: 'Missing required PayPal fields', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    } else if (data.type === 'bank_account' && (!data.accountName || !data.accountNumber || !data.bankName)) {
      return NextResponse.json(
        { error: 'Missing required bank account fields', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    // If this is the first payment method or isDefault is true, update all other methods
    if (data.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    } else {
      // Check if there are any existing payment methods
      const existingMethods = await prisma.paymentMethod.count({
        where: { userId }
      });
      
      // If this is the first method, make it default
      if (existingMethods === 0) {
        data.isDefault = true;
      }
    }

    // Create the payment method
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId,
        type: data.type,
        provider: data.provider,
        last4: data.last4,
        expiryMonth: data.type === 'card' ? data.expiryMonth : null,
        expiryYear: data.type === 'card' ? data.expiryYear : null,
        isDefault: data.isDefault || false,
        token: data.token,
        email: data.type === 'paypal' ? data.email : null,
        accountName: data.type === 'bank_account' ? data.accountName : null,
        accountNumber: data.type === 'bank_account' ? data.accountNumber : null,
        bankName: data.type === 'bank_account' ? data.bankName : null
      }
    });

    return NextResponse.json({
      success: true,
      paymentMethod: {
        id: paymentMethod.id,
        type: paymentMethod.type,
        provider: paymentMethod.provider,
        isDefault: paymentMethod.isDefault,
        createdAt: paymentMethod.createdAt
      }
    });
  } catch (error) {
    console.error("Error creating payment method:", error);
    
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
          error: "Failed to create payment method", 
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
