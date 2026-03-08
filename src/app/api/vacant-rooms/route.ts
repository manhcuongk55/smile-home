import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const rooms = await prisma.room.findMany({
        where: { status: 'VACANT' },
        include: {
            building: {
                include: { property: true },
            },
        },
        orderBy: { price: 'asc' },
    });

    const result = rooms.map((room) => ({
        id: room.id,
        number: room.number,
        type: room.type,
        status: room.status,
        price: room.price,
        area: room.area,
        buildingName: room.building.name,
        address: room.building.property?.address || '',
        propertyName: room.building.property?.name || '',
    }));

    return NextResponse.json(result);
}
