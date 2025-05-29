import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { formatDistanceToNow } from 'date-fns';

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

    // Get time range from query params (default to all)
    const timeRange = req.nextUrl.searchParams.get('timeRange') || 'all';
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date(0); // Beginning of time
    
    if (timeRange !== 'all') {
      const days = parseInt(timeRange.replace('days', ''));
      if (!isNaN(days)) {
        startDate = new Date();
        startDate.setDate(now.getDate() - days);
      }
    }

    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate
        }
      },
      include: {
        subscriptionPlan: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format transactions for display
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      reference: transaction.reference,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      type: transaction.type,
      paymentMethod: transaction.paymentMethod,
      description: getTransactionDescription(transaction),
      date: transaction.createdAt,
      timeAgo: formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true }),
      metadata: transaction.metadata
    }));

    // Calculate summary statistics
    const totalSpent = transactions
      .filter(t => t.status === 'successful')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const subscriptionPayments = transactions
      .filter(t => t.status === 'successful' && t.type === 'subscription')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const boostPayments = transactions
      .filter(t => t.status === 'successful' && t.type === 'boost')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const refunds = transactions
      .filter(t => t.status === 'successful' && t.type === 'refund')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return NextResponse.json({
      transactions: formattedTransactions,
      summary: {
        totalSpent,
        subscriptionPayments,
        boostPayments,
        refunds
      },
      timeRange
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    
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
          error: "Failed to fetch transactions", 
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

// Helper function to generate a human-readable description for a transaction
function getTransactionDescription(transaction: any): string {
  switch (transaction.type) {
    case 'subscription':
      return `Subscription to ${transaction.subscriptionPlan?.name || 'Premium Plan'}`;
    case 'boost':
      if (transaction.metadata && transaction.metadata.adId) {
        return `Ad Boost (${transaction.metadata.boostType || 'Standard'})`;
      }
      return 'Ad Boost';
    case 'refund':
      return `Refund for ${transaction.metadata?.reason || 'payment'}`;
    default:
      return 'Payment';
  }
}
