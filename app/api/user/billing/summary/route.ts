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

    // Get user with subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptionPlan: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get payment methods
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get unpaid invoices
    const unpaidInvoices = await prisma.invoice.findMany({
      where: { 
        userId,
        status: 'unpaid'
      },
      orderBy: { dueDate: 'asc' }
    });

    // Calculate billing summary
    const currentDate = new Date();
    
    // Calculate total spent in the current month
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const totalSpentThisMonth = await prisma.transaction.aggregate({
      where: {
        userId,
        status: 'successful',
        createdAt: {
          gte: firstDayOfMonth
        }
      },
      _sum: {
        amount: true
      }
    });

    // Calculate total spent overall
    const totalSpentOverall = await prisma.transaction.aggregate({
      where: {
        userId,
        status: 'successful'
      },
      _sum: {
        amount: true
      }
    });

    // Format subscription data
    const subscriptionData = user.subscriptionPlan ? {
      name: user.subscriptionPlan.name,
      price: user.subscriptionPlan.price,
      expiryDate: user.subscriptionPlan.expiryDate,
      isActive: new Date(user.subscriptionPlan.expiryDate) > currentDate,
      daysRemaining: Math.max(0, Math.ceil((new Date(user.subscriptionPlan.expiryDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))),
      features: user.subscriptionPlan.features,
      benefits: user.subscriptionPlan.benefits
    } : null;

    // Format default payment method
    const defaultPaymentMethod = paymentMethods.find(method => method.isDefault);
    let formattedDefaultMethod = null;
    
    if (defaultPaymentMethod) {
      formattedDefaultMethod = {
        id: defaultPaymentMethod.id,
        type: defaultPaymentMethod.type,
        provider: defaultPaymentMethod.provider
      };
      
      if (defaultPaymentMethod.type === 'card') {
        formattedDefaultMethod.displayName = `${defaultPaymentMethod.provider} •••• ${defaultPaymentMethod.last4}`;
      } else if (defaultPaymentMethod.type === 'paypal') {
        formattedDefaultMethod.displayName = `PayPal (${defaultPaymentMethod.email})`;
      } else if (defaultPaymentMethod.type === 'bank_account') {
        formattedDefaultMethod.displayName = `${defaultPaymentMethod.bankName} •••• ${defaultPaymentMethod.last4}`;
      }
    }

    return NextResponse.json({
      subscription: subscriptionData,
      paymentMethod: formattedDefaultMethod,
      billing: {
        totalSpentThisMonth: totalSpentThisMonth._sum.amount || 0,
        totalSpentOverall: totalSpentOverall._sum.amount || 0,
        unpaidInvoicesCount: unpaidInvoices.length,
        nextPaymentDue: unpaidInvoices.length > 0 ? unpaidInvoices[0].dueDate : null,
        nextPaymentAmount: unpaidInvoices.length > 0 ? unpaidInvoices[0].amount : null
      },
      recentTransactions: recentTransactions.map(transaction => ({
        id: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        type: transaction.type,
        createdAt: transaction.createdAt
      }))
    });
  } catch (error) {
    console.error("Error fetching billing summary:", error);
    
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
          error: "Failed to fetch billing summary", 
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
