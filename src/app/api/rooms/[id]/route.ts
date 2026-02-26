import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();
    const room = await prisma.room.update({
        where: { id },
        data: {
            ...(body.status && { status: body.status }),
            ...(body.price !== undefined && { price: body.price }),
            ...(body.type && { type: body.type }),
        },
    });
    return NextResponse.json(room);
}
