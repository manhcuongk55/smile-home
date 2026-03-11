import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const channel = searchParams.get('channel');

    const interactions = await prisma.interaction.findMany({
        where: channel ? { channel } : undefined,
        include: {
            person: {
                select: { id: true, name: true, email: true, phone: true },
            },
            room: {
                select: {
                    id: true,
                    number: true,
                    building: { select: { name: true } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
    return NextResponse.json(interactions);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const data: Record<string, unknown> = {
        channel: body.channel || 'APP',
        direction: body.direction || 'INBOUND',
        subject: body.subject || '',
        content: body.content || body.notes || '',
        tags: body.tags || '',
    };
    // personId is optional for anonymous feedback
    if (body.personId) data.personId = body.personId;
    if (body.roomId) data.roomId = body.roomId;
    if (body.contractId) data.contractId = body.contractId;
    if (body.invoiceId) data.invoiceId = body.invoiceId;

    try {
        const interaction = await prisma.interaction.create({
            data: data as any,
            include: {
                person: { select: { id: true, name: true } },
                room: {
                    select: {
                        id: true,
                        number: true,
                        building: { select: { name: true } },
                    },
                },
            },
        });
        return NextResponse.json(interaction, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
