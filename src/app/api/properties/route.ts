import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const properties = await prisma.property.findMany({
        include: {
            buildings: {
                include: {
                    rooms: {
                        select: { id: true, status: true, number: true, type: true, price: true },
                    },
                    _count: { select: { rooms: true } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(properties);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    // Create property + auto-create default building
    const property = await prisma.property.create({
        data: {
            name: body.name,
            address: body.address,
            type: body.type || 'RESIDENTIAL',
            tenantId: body.tenantId || 'default',
            buildings: {
                create: {
                    name: body.buildingName || `${body.name} - Tòa chính`,
                    floors: body.floors || 1,
                },
            },
        },
        include: { buildings: true },
    });
    return NextResponse.json(property, { status: 201 });
}
