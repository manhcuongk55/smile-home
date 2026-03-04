'use server';

import { prisma } from '@/lib/prisma';
import { emitContractChange } from '@/lib/events';
import crypto from 'crypto';
import { NotificationService } from '@/services/notification.service';
import { SSEManager } from '@/lib/sse';

export async function approveContract(contractId: string, note?: string) {
    try {
        // Fetch current status and personId for history and notification
        const currentContract = await prisma.contract.findUnique({
            where: { id: contractId },
            select: { status: true, personId: true, contractCode: true }
        }) as any;
        const fromStatus = currentContract?.status || 'PENDING';
        const personId = currentContract?.personId;

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

        // 4. Create Notification for User (MVP Mode: Always use 'mock-user-1')
        const mockUserId = 'mock-user-1';
        const notification = await NotificationService.createNotification({
            type: 'CONTRACT_APPROVED',
            title: 'Hợp đồng đã được duyệt',
            message: `Hợp đồng có mã ${currentContract?.contractCode || contractId.substring(0, 8)} của bạn đã được quản trị viên phê duyệt thành công.`,
            referenceId: contractId,
            receiverRole: 'USER',
            receiverId: mockUserId,
        });

        // 5. Emit SSE to User
        SSEManager.emitToUser(mockUserId, 'contract_approved', {
            notificationId: notification.id,
            contractId: contractId,
        });

        // 6. Emit SSE to all Admins to refresh their pending count badge
        SSEManager.emitToAdmins('contract_approved', {
            contractId: contractId,
            status: 'APPROVED'
        });

        emitContractChange();
        return { success: true };
    } catch (error) {
        console.error('Failed to approve contract:', error);
        return { success: false, error: 'Failed to approve contract' };
    }
}

export async function rejectContract(contractId: string, note: string) {
    try {
        // Fetch current status and personId for history and notification
        const currentContract = await prisma.contract.findUnique({
            where: { id: contractId },
            select: { status: true, personId: true, contractCode: true }
        }) as any;
        const fromStatus = currentContract?.status || 'PENDING';
        const personId = currentContract?.personId;

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

        // 4. Create Notification for User (MVP Mode: Always use 'mock-user-1')
        const mockUserId = 'mock-user-1';
        const notification = await NotificationService.createNotification({
            type: 'CONTRACT_REJECTED',
            title: 'Hợp đồng bị từ chối',
            message: `Hợp đồng có mã ${currentContract?.contractCode || contractId.substring(0, 8)} của bạn đã bị từ chối. Lý do: ${note}`,
            referenceId: contractId,
            receiverRole: 'USER',
            receiverId: mockUserId,
        });

        // 5. Emit SSE to User
        SSEManager.emitToUser(mockUserId, 'contract_rejected', {
            notificationId: notification.id,
            contractId: contractId,
            note: note
        });

        // 6. Emit SSE to all Admins to refresh their pending count badge
        SSEManager.emitToAdmins('contract_rejected', {
            contractId: contractId,
            status: 'REJECTED'
        });

        emitContractChange();
        return { success: true };
    } catch (error) {
        console.error('Failed to reject contract:', error);
        return { success: false, error: 'Failed to reject contract' };
    }
}
