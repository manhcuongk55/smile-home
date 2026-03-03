'use server';

import { prisma } from '@/lib/prisma';
import { emitContractChange } from '@/lib/events';
import crypto from 'crypto';

export async function approveContract(contractId: string, note?: string) {
    try {
        // Fetch current status for history
        const currentContract = await prisma.contract.findUnique({
            where: { id: contractId },
            select: { status: true }
        });
        const fromStatus = currentContract?.status || 'PENDING';

        // 1. Update the main contract document status
        await prisma.contractDocument.updateMany({
            where: {
                contractId: contractId,
            },
            data: {
                approvalStatus: 'APPROVED',
            },
        });

        // 2. Update the contract status itself
        await prisma.$executeRaw`
            UPDATE Contract 
            SET status = 'ACTIVE', 
                reviewedAt = ${new Date().toISOString()},
                reviewedBy = 'Admin'
            WHERE id = ${contractId}
        `;

        // 3. Create history record
        await prisma.$executeRaw`
            INSERT INTO ContractReviewHistory (id, contractId, fromStatus, toStatus, reviewedBy, reviewedAt, note)
            VALUES (${crypto.randomUUID()}, ${contractId}, ${fromStatus}, 'APPROVED', 'Admin', ${new Date().toISOString()}, ${note || null})
        `;

        emitContractChange();
        return { success: true };
    } catch (error) {
        console.error('Failed to approve contract:', error);
        return { success: false, error: 'Failed to approve contract' };
    }
}

export async function rejectContract(contractId: string, note: string) {
    try {
        // Fetch current status for history
        const currentContract = await prisma.contract.findUnique({
            where: { id: contractId },
            select: { status: true }
        });
        const fromStatus = currentContract?.status || 'PENDING';

        // 1. Update the main contract document status
        await prisma.contractDocument.updateMany({
            where: {
                contractId: contractId,
            },
            data: {
                approvalStatus: 'REJECTED',
            },
        });

        // 2. Update the contract status
        await prisma.$executeRaw`
            UPDATE Contract 
            SET status = 'REJECTED', 
                reviewNote = ${note}, 
                reviewedAt = ${new Date().toISOString()}, 
                reviewedBy = 'Admin'
            WHERE id = ${contractId}
        `;

        // 3. Create history record
        await prisma.$executeRaw`
            INSERT INTO ContractReviewHistory (id, contractId, fromStatus, toStatus, reviewedBy, reviewedAt, note)
            VALUES (${crypto.randomUUID()}, ${contractId}, ${fromStatus}, 'REJECTED', 'Admin', ${new Date().toISOString()}, ${note})
        `;

        emitContractChange();
        return { success: true };
    } catch (error) {
        console.error('Failed to reject contract:', error);
        return { success: false, error: 'Failed to reject contract' };
    }
}
