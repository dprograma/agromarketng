import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';
import emailService from '@/lib/email/emailService';

function validateAdmin(token: string | undefined) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
    if (decoded.role !== 'admin') return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * GET - List all ads with filters for admin management
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get('next-auth.session-token')?.value ||
                req.cookies.get('__Secure-next-auth.session-token')?.value;
  const admin = validateAdmin(token);
  if (!admin) {
    return apiErrorResponse('Unauthorized', 401, 'UNAUTHORIZED');
  }

  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: any = {};

    if (filter !== 'all') {
      where.status = filter === 'active' ? 'Active'
        : filter === 'suspended' ? 'Suspended'
        : filter === 'deactivated' ? 'Deactivated'
        : filter === 'pending' ? 'Pending'
        : undefined;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [ads, total] = await Promise.all([
      prisma.ad.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          category: true,
          location: true,
          price: true,
          status: true,
          featured: true,
          images: true,
          views: true,
          clicks: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.ad.count({ where }),
    ]);

    // Get status counts
    const [activeCount, suspendedCount, deactivatedCount, pendingCount] = await Promise.all([
      prisma.ad.count({ where: { status: 'Active' } }),
      prisma.ad.count({ where: { status: 'Suspended' } }),
      prisma.ad.count({ where: { status: 'Deactivated' } }),
      prisma.ad.count({ where: { status: 'Pending' } }),
    ]);

    return NextResponse.json({
      ads,
      total,
      statusCounts: {
        all: activeCount + suspendedCount + deactivatedCount + pendingCount,
        active: activeCount,
        suspended: suspendedCount,
        deactivated: deactivatedCount,
        pending: pendingCount,
      },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return apiErrorResponse('Failed to fetch ads', 500, 'FETCH_ADS_FAILED');
  }
}

/**
 * POST - Perform admin actions on ads (deactivate, suspend, activate, delete)
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get('next-auth.session-token')?.value ||
                req.cookies.get('__Secure-next-auth.session-token')?.value;
  const admin = validateAdmin(token);
  if (!admin) {
    return apiErrorResponse('Unauthorized', 401, 'UNAUTHORIZED');
  }

  try {
    const { adIds, action, reason } = await req.json();

    if (!adIds || !Array.isArray(adIds) || adIds.length === 0) {
      return apiErrorResponse('Ad IDs are required', 400, 'MISSING_AD_IDS');
    }

    if (!['activate', 'deactivate', 'suspend', 'delete'].includes(action)) {
      return apiErrorResponse('Invalid action', 400, 'INVALID_ACTION');
    }

    // Fetch ads with user info for email notifications
    const ads = await prisma.ad.findMany({
      where: { id: { in: adIds } },
      select: {
        id: true,
        title: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (ads.length === 0) {
      return apiErrorResponse('No ads found', 404, 'ADS_NOT_FOUND');
    }

    let updatedCount = 0;

    if (action === 'delete') {
      const result = await prisma.ad.deleteMany({
        where: { id: { in: adIds } },
      });
      updatedCount = result.count;
    } else {
      const statusMap: Record<string, string> = {
        activate: 'Active',
        deactivate: 'Deactivated',
        suspend: 'Suspended',
      };

      const result = await prisma.ad.updateMany({
        where: { id: { in: adIds } },
        data: { status: statusMap[action] },
      });
      updatedCount = result.count;
    }

    // Send email notifications to affected users
    const actionLabels: Record<string, { past: string; description: string }> = {
      activate: { past: 'reactivated', description: 'Your ad is now live and visible to buyers again.' },
      deactivate: { past: 'deactivated', description: 'Your ad has been taken offline and is no longer visible to buyers.' },
      suspend: { past: 'suspended', description: 'Your ad has been temporarily suspended pending review.' },
      delete: { past: 'removed', description: 'Your ad has been permanently removed from AgroMarket.' },
    };

    const label = actionLabels[action];
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://agromarketng.com';

    for (const ad of ads) {
      try {
        await emailService.send({
          to: ad.user.email,
          subject: `Your ad "${ad.title}" has been ${label.past}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #166534; margin: 0;">AgroMarket</h1>
              </div>

              <p style="font-size: 16px; line-height: 1.6; color: #333;">Hello ${ad.user.name || 'there'},</p>

              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                We're writing to let you know that your ad <strong>"${ad.title}"</strong> has been <strong>${label.past}</strong> by our team.
              </p>

              <div style="background-color: ${action === 'activate' ? '#f0fdf4' : '#fef2f2'}; padding: 20px; border-left: 4px solid ${action === 'activate' ? '#16a34a' : '#dc2626'}; margin: 20px 0;">
                <p style="margin: 0; color: #333;"><strong>Status:</strong> ${label.past.charAt(0).toUpperCase() + label.past.slice(1)}</p>
                ${reason ? `<p style="margin: 10px 0 0 0; color: #333;"><strong>Reason:</strong> ${reason}</p>` : ''}
              </div>

              <p style="font-size: 16px; line-height: 1.6; color: #333;">${label.description}</p>

              ${action !== 'delete' ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/dashboard/my-ads" style="background-color: #166534; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  View My Ads
                </a>
              </div>
              ` : ''}

              <p style="font-size: 14px; color: #666;">
                If you believe this action was taken in error, please contact our support team at
                <a href="mailto:support@agromarketng.com" style="color: #166534;">support@agromarketng.com</a>
              </p>

              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
                <p>&copy; ${new Date().getFullYear()} AgroMarket. All rights reserved.</p>
              </div>
            </div>
          `,
          text: `Hello ${ad.user.name || 'there'},\n\nYour ad "${ad.title}" has been ${label.past}.\n\n${reason ? `Reason: ${reason}\n\n` : ''}${label.description}\n\nIf you believe this was in error, contact support@agromarketng.com\n\n© ${new Date().getFullYear()} AgroMarket.`,
        });
      } catch (emailError) {
        console.error(`Failed to send email for ad ${ad.id}:`, emailError);
      }
    }

    return NextResponse.json({
      message: `Successfully ${label.past} ${updatedCount} ad(s)`,
      updatedCount,
    });
  } catch (error) {
    console.error('Error performing ad action:', error);
    return apiErrorResponse('Failed to perform action', 500, 'AD_ACTION_FAILED');
  }
}
