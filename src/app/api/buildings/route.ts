import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const buildings = await prisma.building.findMany({
        include: {
            property: { select: { id: true, name: true } },
            _count: { select: { rooms: true } },
        },
        orderBy: { name: 'asc' },
    });
    return NextResponse.json(buildings);
}
