import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const action = searchParams.get('action');
    const performedBy = searchParams.get('performedBy');
    const limit = parseInt(searchParams.get('limit') || '100');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: Record<string, unknown> = {};
    if (entityType) where.entityType = entityType;
    if (action) where.action = action;
    if (performedBy) where.performedBy = { contains: performedBy };
    if (from || to) {
        where.timestamp = {};
        if (from) (where.timestamp as Record<string, unknown>).gte = new Date(from);
        if (to) (where.timestamp as Record<string, unknown>).lte = new Date(to + 'T23:59:59');
    }

    const logs = await prisma.activityLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: Math.min(limit, 500),
    });

    return NextResponse.json(logs);
}

// POST: Manually create an activity log entry
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const log = await prisma.activityLog.create({
            data: {
                entityType: body.entityType,
                entityId: body.entityId,
                action: body.action,
                performedBy: body.performedBy || 'ADMIN',
                oldValue: body.oldValue || null,
                newValue: body.newValue || null,
                note: body.note || null,
            },
        });
        return NextResponse.json(log, { status: 201 });
    } catch (error) {
        console.error('Failed to create activity log:', error);
        return NextResponse.json({ error: 'Failed to create log' }, { status: 500 });
    }
}
