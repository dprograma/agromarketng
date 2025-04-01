import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { RouteContext } from '@/types';

export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = context.params;
        const { type } = await request.json();
        const validTypes = ['views', 'clicks', 'shares'];

        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: 'Invalid analytics type' },
                { status: 400 }
            );
        }

        const updatedAd = await prisma.ad.update({
            where: { id },
            data: {
                ...(type === 'view' ? {  views: { increment: 1 } } : {}),
                ...(type === 'click' ? {  clicks: { increment: 1 } } : {}),
                ...(type === 'share' ? {  shares: { increment: 1 } } : {}),
            },
        });

        return NextResponse.json({
            success: true,
            data: {
              views: updatedAd.views,
              clicks: updatedAd.clicks
            }
          });
          
    } catch (error) {
        console.error('Error updating analytics:', error);
        return NextResponse.json(
            { error: 'Failed to update analytics' },
            { status: 500 }
        );
    }
}