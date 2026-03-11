import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
    const body = await request.json();
    const building = await prisma.building.create({
        data: {
            propertyId: body.propertyId,
            name: body.name,
            floors: body.floors || 1,
        },
    });
    return NextResponse.json(building, { status: 201 });
}
