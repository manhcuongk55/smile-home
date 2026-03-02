import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const reviewedBy = searchParams.get('reviewedBy');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const search = searchParams.get('search');
        const minAmount = searchParams.get('minAmount');
        const maxAmount = searchParams.get('maxAmount');
        const sortBy = searchParams.get('sortBy') || 'reviewedAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        // Base Query
        let query = `
            SELECT 
                h.*,
                c.productName,
                c.productArea,
                c.monthlyRent,
                p.name as personName
            FROM ContractReviewHistory h
            JOIN Contract c ON h.contractId = c.id
            JOIN Person p ON c.personId = p.id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (status && status !== 'ALL') {
            query += ` AND h.toStatus = ?`;
            params.push(status);
        }

        if (reviewedBy && reviewedBy !== 'ALL') {
            query += ` AND h.reviewedBy = ?`;
            params.push(reviewedBy);
        }

        if (minAmount) {
            query += ` AND c.monthlyRent >= ?`;
            params.push(parseFloat(minAmount));
        }

        if (maxAmount) {
            query += ` AND c.monthlyRent <= ?`;
            params.push(parseFloat(maxAmount));
        }

        if (startDate) {
            query += ` AND h.reviewedAt >= ?`;
            params.push(new Date(startDate).toISOString());
        }

        if (endDate) {
            const eDate = new Date(endDate);
            eDate.setHours(23, 59, 59, 999);
            query += ` AND h.reviewedAt <= ?`;
            params.push(eDate.toISOString());
        }

        if (search) {
            query += ` AND (c.productName LIKE ? OR p.name LIKE ? OR h.contractId LIKE ?)`;
            const s = `%${search}%`;
            params.push(s, s, s);
        }

        // Clone for count before adding order/limit
        const countQuery = `SELECT COUNT(*) as count FROM (${query}) as sub`;
        
        let orderByClause = '';
        if (sortBy === 'monthlyRent') {
            orderByClause = `ORDER BY c.monthlyRent ${sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
        } else {
            orderByClause = `ORDER BY h.reviewedAt ${sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
        }

        query += ` ${orderByClause} LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [historyRaw, countRaw, reviewersRaw] = await Promise.all([
            prisma.$queryRawUnsafe(query, ...params),
            prisma.$queryRawUnsafe(countQuery, ...params.slice(0, params.length - 2)),
            prisma.$queryRaw`SELECT DISTINCT reviewedBy FROM ContractReviewHistory`
        ]);

        const total = Number((countRaw as any)[0].count);
        const history = (historyRaw as any[]).map(item => ({
            ...item,
            contract: {
                productName: item.productName,
                productArea: item.productArea,
                monthlyRent: item.monthlyRent,
                person: {
                    name: item.personName
                }
            }
        }));

        return NextResponse.json({
            history,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            reviewers: (reviewersRaw as any[]).map(r => r.reviewedBy)
        });
    } catch (error) {
        console.error('API history error:', error);
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}
