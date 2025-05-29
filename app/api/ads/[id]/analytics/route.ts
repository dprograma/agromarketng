import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiErrorResponse } from '@/lib/errorHandling';

// Simple in-memory cache
const analyticsCache = new Map<string, { views: number; clicks: number; shares: number }>();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check cache first
        const cached = analyticsCache.get(id);
        if (cached) {
            return NextResponse.json(cached);
        }

        // If not in cache, fetch from database
        const ad = await prisma.ad.findUnique({
            where: { id },
            select: { views: true, clicks: true, shares: true }
        });

        if (!ad) {
            return apiErrorResponse(
                'Ad not found',
                404,
                'AD_NOT_FOUND'
            );
        }

        // Update cache
        analyticsCache.set(id, ad);

        return NextResponse.json(ad);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return apiErrorResponse(
            'Failed to fetch analytics',
            500,
            'ANALYTICS_FETCH_FAILED',
            error instanceof Error ? error.message : String(error)
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { type } = await request.json();
        const { id } = await params;

        if (!['views', 'clicks', 'shares'].includes(type)) {
            return apiErrorResponse(
                'Invalid analytics type',
                400,
                'INVALID_ANALYTICS_TYPE'
            );
        }

        // Update in database
        const ad = await prisma.ad.update({
            where: { id },
            data: { [type]: { increment: 1 } },
            select: { views: true, clicks: true, shares: true }
        });

        // Update cache
        analyticsCache.set(id, ad);

        return NextResponse.json(ad);
    } catch (error) {
        console.error('Error updating analytics:', error);
        return apiErrorResponse(
            'Failed to update analytics',
            500,
            'ANALYTICS_UPDATE_FAILED',
            error instanceof Error ? error.message : String(error)
        );
    }
}