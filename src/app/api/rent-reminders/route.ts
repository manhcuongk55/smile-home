import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // OVERDUE, PENDING, ALL
    const buildingId = searchParams.get('buildingId');

    // Get all active contracts with their invoices, rooms, and persons
    const contracts = await prisma.contract.findMany({
        where: {
            status: 'ACTIVE',
            ...(buildingId ? { room: { buildingId } } : {}),
        },
        include: {
            room: {
                include: { building: true },
            },
            person: true,
            invoices: {
                orderBy: { dueDate: 'desc' },
                take: 3, // Last 3 invoices
            },
        },
        orderBy: { room: { number: 'asc' } },
    });

    const now = new Date();

    const reminders = contracts.map((contract) => {
        const latestInvoice = contract.invoices[0];
        const unpaidInvoices = contract.invoices.filter(
            (inv) => inv.status !== 'PAID' && inv.status !== 'VERIFIED' && inv.status !== 'CANCELLED'
        );
        const overdueInvoices = unpaidInvoices.filter(
            (inv) => new Date(inv.dueDate) < now
        );
        const totalOwed = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

        let paymentStatus = 'PAID'; // All good
        if (overdueInvoices.length > 0) paymentStatus = 'OVERDUE';
        else if (unpaidInvoices.length > 0) paymentStatus = 'PENDING';

        const daysSinceLastDue = latestInvoice
            ? Math.floor((now.getTime() - new Date(latestInvoice.dueDate).getTime()) / 86400000)
            : null;

        return {
            contractId: contract.id,
            roomNumber: contract.room.number,
            roomId: contract.room.id,
            buildingName: contract.room.building?.name || '',
            tenantName: contract.person.name,
            tenantPhone: contract.person.phone,
            tenantEmail: contract.person.email,
            monthlyRent: contract.monthlyRent,
            paymentStatus,
            totalOwed,
            overdueCount: overdueInvoices.length,
            unpaidCount: unpaidInvoices.length,
            daysSinceLastDue,
            latestInvoice: latestInvoice ? {
                id: latestInvoice.id,
                invoiceNumber: latestInvoice.invoiceNumber,
                amount: latestInvoice.amount,
                dueDate: latestInvoice.dueDate,
                status: latestInvoice.status,
            } : null,
        };
    });

    // Filter by status
    let filtered = reminders;
    if (status === 'OVERDUE') filtered = reminders.filter((r) => r.paymentStatus === 'OVERDUE');
    else if (status === 'PENDING') filtered = reminders.filter((r) => r.paymentStatus !== 'PAID');

    // Sort: overdue first, then pending, then paid
    const priority: Record<string, number> = { OVERDUE: 0, PENDING: 1, PAID: 2 };
    filtered.sort((a, b) => (priority[a.paymentStatus] ?? 2) - (priority[b.paymentStatus] ?? 2));

    // Summary stats
    const stats = {
        totalRooms: reminders.length,
        paidRooms: reminders.filter((r) => r.paymentStatus === 'PAID').length,
        pendingRooms: reminders.filter((r) => r.paymentStatus === 'PENDING').length,
        overdueRooms: reminders.filter((r) => r.paymentStatus === 'OVERDUE').length,
        totalOwed: reminders.reduce((sum, r) => sum + r.totalOwed, 0),
    };

    return NextResponse.json({ stats, reminders: filtered });
}
