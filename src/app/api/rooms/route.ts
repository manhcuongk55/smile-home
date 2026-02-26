import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const rooms = await prisma.room.findMany({
        include: {
            building: {
                include: {
                    property: {
                        select: { id: true, name: true },
                    },
                },
            },
        },
        orderBy: { number: 'asc' },
    });
    return NextResponse.json(rooms);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const room = await prisma.room.create({
        data: {
            buildingId: body.buildingId,
            number: body.number,
            type: body.type || 'STUDIO',
            status: body.status || 'VACANT',
            price: body.price || 0,
            area: body.area || 0,
        },
    });
    return NextResponse.json(room, { status: 201 });
}
