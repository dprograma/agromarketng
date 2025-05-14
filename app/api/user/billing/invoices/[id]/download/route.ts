import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { format } from 'date-fns';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Find the invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        subscriptionPlan: {
          select: {
            name: true,
            price: true,
            duration: true
          }
        }
      }
    });

    // Check if invoice exists and belongs to the user
    if (!invoice || invoice.userId !== userId) {
      return NextResponse.json(
        { error: 'Invoice not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Generate HTML for the invoice
    const html = generateInvoiceHtml(invoice);

    // Return the HTML with appropriate headers
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.html"`
      }
    });
  } catch (error) {
    console.error("Error downloading invoice:", error);
    
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
          error: "Failed to download invoice", 
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

// Helper function to generate HTML for the invoice
function generateInvoiceHtml(invoice: any): string {
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const formattedDate = format(new Date(invoice.createdAt), 'MMMM dd, yyyy');
  const formattedDueDate = format(new Date(invoice.dueDate), 'MMMM dd, yyyy');
  const formattedPaidDate = invoice.paidDate ? format(new Date(invoice.paidDate), 'MMMM dd, yyyy') : 'Not paid yet';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #16a34a;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-details {
          margin-bottom: 30px;
        }
        .customer-details, .payment-details {
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        th {
          background-color: #f9fafb;
          font-weight: bold;
        }
        .total-row {
          font-weight: bold;
        }
        .status {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 12px;
        }
        .status-paid {
          background-color: #dcfce7;
          color: #16a34a;
        }
        .status-unpaid {
          background-color: #fee2e2;
          color: #dc2626;
        }
        .status-cancelled {
          background-color: #f3f4f6;
          color: #6b7280;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div class="logo">AgroMarket</div>
        <div class="invoice-info">
          <h2>INVOICE</h2>
          <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Due Date:</strong> ${formattedDueDate}</p>
          <p><strong>Status:</strong> 
            <span class="status status-${invoice.status}">
              ${invoice.status}
            </span>
          </p>
        </div>
      </div>
      
      <div class="invoice-details">
        <div class="customer-details">
          <h3>Bill To:</h3>
          <p><strong>Name:</strong> ${invoice.user.name}</p>
          <p><strong>Email:</strong> ${invoice.user.email}</p>
        </div>
        
        <div class="payment-details">
          <h3>Payment Details:</h3>
          <p><strong>Amount:</strong> ${invoice.currency} ${Number(invoice.amount).toFixed(2)}</p>
          <p><strong>Payment Status:</strong> ${invoice.status}</p>
          <p><strong>Paid Date:</strong> ${formattedPaidDate}</p>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item: any) => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>${invoice.currency} ${Number(item.unitPrice).toFixed(2)}</td>
              <td>${invoice.currency} ${Number(item.total).toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="3" style="text-align: right;">Total:</td>
            <td>${invoice.currency} ${Number(invoice.amount).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="footer">
        <p>Thank you for your business!</p>
        <p>If you have any questions, please contact support@agromarket.com</p>
      </div>
    </body>
    </html>
  `;
}
