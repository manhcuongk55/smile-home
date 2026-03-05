import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') || 'ALL';
        const minAmount = searchParams.get('minAmount');
        const maxAmount = searchParams.get('maxAmount');
        const search = searchParams.get('search');
        const areas = searchParams.get('areas'); // Get areas filter
        
        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50'); // Larger limit for admin list
        const skip = (page - 1) * limit;

        const where: any = {};

        // 1. Filter by status
        if (status !== 'ALL') {
            if (status === 'APPROVED') {
                where.status = 'ACTIVE';
            } else {
                where.status = status;
            }
        }

        // 2. Filter by areas
        if (areas) {
            const areaList = areas.split(',').filter(Boolean);
            if (areaList.length > 0) {
                where.productArea = { in: areaList };
            }
        }

        // 3. Filter by money range
        if (minAmount !== null || maxAmount !== null) {
            where.monthlyRent = {};
            if (minAmount) where.monthlyRent.gte = parseFloat(minAmount);
            if (maxAmount) where.monthlyRent.lte = parseFloat(maxAmount);
        }

        // 4. Search keyword
        if (search) {
             where.OR = [
                 { id: { contains: search } },
                 { contractCode: { contains: search } },
                 { person: { name: { contains: search } } },
                 { person: { email: { contains: search } } },
                 { room: { number: { contains: search } } },
                 { room: { building: { name: { contains: search } } } },
                 { productName: { contains: search } },
                 { productArea: { contains: search } },
                 { type: { contains: search } }
             ];
        }

        const [contracts, total, pendingCount] = await Promise.all([
            prisma.contract.findMany({
                where,
                include: {
                    room: { include: { building: true } },
                    person: true,
                    documents: {
                        orderBy: { createdAt: 'desc' }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.contract.count({ where }),
            prisma.contract.count({
                where: {
                    status: 'PENDING'
                }
            })
        ]);

        return NextResponse.json({
            contracts,
            total,
            pendingCount,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('API admin contracts error:', error);
        return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
    }
}
