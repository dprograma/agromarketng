import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { type } = await req.json();
        const validTypes = ['views', 'clicks', 'shares'];

        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: 'Invalid analytics type' },
                { status: 400 }
            );
        }

        const updateData = {
            [type]: {
                increment: 1
            }
        };

        const updatedAd = await prisma.ad.update({
            where: { id: params.id },
            data: updateData,
        });

        return NextResponse.json({ ad: updatedAd });
    } catch (error) {
        console.error('Error updating analytics:', error);
        return NextResponse.json(
            { error: 'Failed to update analytics' },
            { status: 500 }
        );
    }
}