import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { format } from 'date-fns';

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

    // Get status filter from query params (default to all)
    const status = req.nextUrl.searchParams.get('status') || 'all';
    
    // Build where clause based on status filter
    const whereClause: any = { userId };
    if (status !== 'all') {
      whereClause.status = status;
    }

    // Get invoices
    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        subscriptionPlan: {
          select: {
            name: true
          }
        },
        transactions: {
          select: {
            id: true,
            status: true,
            reference: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format invoices for display
    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status,
      dueDate: invoice.dueDate,
      paidDate: invoice.paidDate,
      formattedDueDate: format(new Date(invoice.dueDate), 'MMM dd, yyyy'),
      formattedPaidDate: invoice.paidDate ? format(new Date(invoice.paidDate), 'MMM dd, yyyy') : null,
      items: invoice.items,
      subscriptionPlan: invoice.subscriptionPlan?.name || null,
      transactions: invoice.transactions,
      createdAt: invoice.createdAt,
      formattedCreatedAt: format(new Date(invoice.createdAt), 'MMM dd, yyyy'),
      downloadUrl: `/api/user/billing/invoices/${invoice.id}/download`
    }));

    // Calculate summary statistics
    const totalPaid = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + Number(i.amount), 0);
    
    const totalUnpaid = invoices
      .filter(i => i.status === 'unpaid')
      .reduce((sum, i) => sum + Number(i.amount), 0);
    
    const totalOverdue = invoices
      .filter(i => i.status === 'unpaid' && new Date(i.dueDate) < new Date())
      .reduce((sum, i) => sum + Number(i.amount), 0);

    return NextResponse.json({
      invoices: formattedInvoices,
      summary: {
        totalPaid,
        totalUnpaid,
        totalOverdue,
        count: invoices.length
      },
      status
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    
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
          error: "Failed to fetch invoices", 
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
