import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const invoices = await prisma.invoice.findMany({
            where: { status: 'PAID' },
            select: {
                amount: true,
                issuedDate: true,
            }
        });

        const expenses = await prisma.expense.findMany({
            where: { status: 'PAID' },
            select: {
                amount: true,
                date: true,
                category: true,
            }
        });

        const properties = await prisma.property.findMany({
            select: {
                valuation: true,
            }
        });

        // Group by month
        const revenueByMonth: Record<string, number> = {};
        let totalRevenue = 0;

        invoices.forEach((inv: { amount: number; issuedDate: Date }) => {
            const date = new Date(inv.issuedDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + inv.amount;
            totalRevenue += inv.amount;
        });

        // Convert to sorted array for charts
        const chartData = Object.entries(revenueByMonth)
            .map(([month, amount]) => ({ month, amount }))
            .sort((a, b) => a.month.localeCompare(b.month));

        // Get occupancy stats too
        const totalRooms = await prisma.room.count();
        const occupiedRooms = await prisma.room.count({ where: { status: 'OCCUPIED' } });

        // Get detailed invoice stats
        const allInvoices = await prisma.invoice.findMany({
            select: { status: true, amount: true, dueDate: true }
        });

        const statusCounts: Record<string, number> = {};
        const statusAmounts: Record<string, number> = {};
        let overdueAmount = 0;
        let overdueCount = 0;
        const now = new Date();

        allInvoices.forEach(inv => {
            let status = inv.status;
            if (status === 'PENDING' && new Date(inv.dueDate) < now) {
                status = 'OVERDUE';
                overdueAmount += inv.amount;
                overdueCount++;
            }
            statusCounts[status] = (statusCounts[status] || 0) + 1;
            statusAmounts[status] = (statusAmounts[status] || 0) + inv.amount;
        });

        const totalExpenses = expenses.reduce((sum: number, exp: { amount: number }) => sum + exp.amount, 0);
        const netIncome = totalRevenue - totalExpenses;

        const totalValuation = properties.reduce((sum: number, prop: { valuation: number }) => sum + prop.valuation, 0);
        const portfolioYield = totalValuation > 0 ? (netIncome / totalValuation) * 100 : 0;

        return NextResponse.json({
            totalRevenue,
            totalExpenses,
            netIncome,
            portfolioYield,
            totalValuation,
            totalInvoices: allInvoices.length,
            statusCounts,
            statusAmounts,
            pendingAmount: statusAmounts['PENDING'] || 0,
            overdueAmount,
            verifiedRevenue: statusAmounts['VERIFIED'] || 0,
            monthlyRevenue: chartData,
            occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0
        });
    } catch (error) {
        console.error('Financial report generation failed:', error);
        return NextResponse.json({ error: 'Failed to generate financial report' }, { status: 500 });
    }
}
