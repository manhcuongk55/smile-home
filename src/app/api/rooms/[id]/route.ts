import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    context: any
) {
    const { id } = await context.params;
    const room = await prisma.room.findUnique({
        where: { id },
        include: {
            building: { include: { property: true } },
            contracts: {
                include: { person: true },
                orderBy: { startDate: 'desc' },
            },
            maintenanceTickets: {
                include: { reportedBy: true },
                orderBy: { createdAt: 'desc' },
            },
            meters: {
                include: { readings: { orderBy: { readingDate: 'desc' }, take: 1 } }
            }
        }
    });

    if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json(room);
}

export async function PATCH(
    request: NextRequest,
    context: any
) {
    const { id } = await context.params;
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
