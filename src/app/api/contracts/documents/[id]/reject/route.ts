import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/services/notification.service';
import { SSEManager } from '@/lib/sse';

export const runtime = 'nodejs';

export async function PATCH(
    req: Request,
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

        const body = await req.json().catch(() => ({}));
        const rejectionReason = (body?.reason as string | undefined) ?? undefined;

        await prisma.contractDocument.update({
            where: { id },
            data: {
                approvalStatus: 'REJECTED',
            },
        });

        // MVP Mode: Notify 'mock-user-1'
        const mockUserId = 'mock-user-1';
        const notification = await NotificationService.createNotification({
            type: 'CONTRACT_REJECTED',
            title: 'Hợp đồng bị từ chối',
            message: `Hợp đồng của bạn cho file "${doc.originalName}" đã bị từ chối. ${rejectionReason ? 'Lý do: ' + rejectionReason : ''}`,
            referenceId: doc.contractId,
            receiverRole: 'USER',
            receiverId: mockUserId,
        });

        SSEManager.emitToUser(mockUserId, 'contract_rejected', {
            notificationId: notification.id,
            contractId: doc.contractId
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error rejecting contract document:', error);
        return NextResponse.json({ error: 'Failed to reject document' }, { status: 500 });
    }
}
