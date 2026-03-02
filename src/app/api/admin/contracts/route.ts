import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') || 'ALL';
        const minAmount = searchParams.get('minAmount');
        const maxAmount = searchParams.get('maxAmount');
        const search = searchParams.get('search');
        
        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50'); // Larger limit for admin list
        const skip = (page - 1) * limit;

        const where: any = {};

        // 1. Filter by status (linked to main document approvalStatus)
        if (status !== 'ALL') {
             where.documents = {
                 some: {
                     documentType: 'CONTRACT',
                     approvalStatus: status
                 }
             };
        }

        // 2. Filter by money range
        if (minAmount !== null || maxAmount !== null) {
            where.monthlyRent = {};
            if (minAmount) where.monthlyRent.gte = parseFloat(minAmount);
            if (maxAmount) where.monthlyRent.lte = parseFloat(maxAmount);
        }

        // 3. Search keyword
        if (search) {
             const keyword = search.toLowerCase();
             where.OR = [
                 { person: { name: { contains: keyword } } },
                 { person: { email: { contains: keyword } } },
                 { room: { number: { contains: keyword } } },
                 { room: { building: { name: { contains: keyword } } } },
                 { productName: { contains: keyword } },
                 { productArea: { contains: keyword } },
                 { type: { contains: keyword } }
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
                    documents: {
                        some: {
                            documentType: 'CONTRACT',
                            approvalStatus: 'PENDING'
                        }
                    }
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
