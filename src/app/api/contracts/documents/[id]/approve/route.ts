import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/services/notification.service';
import { SSEManager } from '@/lib/sse';

export const runtime = 'nodejs';

export async function PATCH(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const doc = await prisma.contractDocument.findUnique({ 
            where: { id },
            include: { contract: true }
        });

        if (!doc) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        await prisma.contractDocument.update({
            where: { id },
            data: {
                approvalStatus: 'APPROVED',
            },
        });

        // MVP Mode: Notify 'mock-user-1'
        const mockUserId = 'mock-user-1';
        const notification = await NotificationService.createNotification({
            type: 'CONTRACT_APPROVED',
            title: 'Hợp đồng đã được duyệt',
            message: `Hợp đồng của bạn cho file "${doc.originalName}" đã được phê duyệt.`,
            referenceId: doc.contractId,
            receiverRole: 'USER',
            receiverId: mockUserId,
        });

        SSEManager.emitToUser(mockUserId, 'contract_approved', {
            notificationId: notification.id,
            contractId: doc.contractId
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error approving contract document:', error);
        return NextResponse.json({ error: 'Failed to approve document' }, { status: 500 });
    }
}
