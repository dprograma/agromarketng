import { NextRequest, NextResponse } from 'next/server';
import { SearchAlertsService } from '@/lib/searchAlertsService';
import { apiErrorResponse } from '@/lib/errorHandling';

export const dynamic = 'force-dynamic';

// POST - Process search alerts (called by cron job)
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.warn('CRON_SECRET not configured');
      return apiErrorResponse('Cron secret not configured', 500, 'CRON_SECRET_MISSING');
    }

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return apiErrorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }

    // Process search alerts
    await SearchAlertsService.processSearchAlerts();

    return NextResponse.json({
      success: true,
      message: 'Search alerts processed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in search alerts cron job:', error);
    return apiErrorResponse(
      'Failed to process search alerts',
      500,
      'SEARCH_ALERTS_CRON_FAILED',
      error instanceof Error ? error.message : String(error)
    );
  }
}

// GET - Manual trigger for testing (only in development)
export async function GET(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return apiErrorResponse('Not available in production', 403, 'FORBIDDEN');
    }

    // Process search alerts
    await SearchAlertsService.processSearchAlerts();

    return NextResponse.json({
      success: true,
      message: 'Search alerts processed successfully (manual trigger)',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in manual search alerts trigger:', error);
    return apiErrorResponse(
      'Failed to process search alerts',
      500,
      'SEARCH_ALERTS_MANUAL_FAILED',
      error instanceof Error ? error.message : String(error)
    );
  }
}