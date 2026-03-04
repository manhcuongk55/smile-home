import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotificationService } from '@/services/notification.service';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      create: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a notification for ADMIN', async () => {
      const input = {
        type: 'CONTRACT_UPLOADED',
        title: 'New Contract',
        message: 'A new contract is pending review',
        receiverRole: 'ADMIN' as const,
      };

      await NotificationService.createNotification(input);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...input,
          isRead: false,
        }),
      });
    });

    it('should create a notification for a specific USER', async () => {
      const input = {
        type: 'CONTRACT_APPROVED',
        title: 'Contract Approved',
        message: 'Your contract has been approved',
        receiverId: 'user_123',
        receiverRole: 'USER' as const,
      };

      await NotificationService.createNotification(input);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining(input),
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread count for ADMIN', async () => {
      (prisma.notification.count as any).mockResolvedValue(5);
      
      const count = await NotificationService.getUnreadCountByRole('ADMIN');
      
      expect(count).toBe(5);
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { receiverRole: 'ADMIN', isRead: false },
      });
    });

    it('should get unread count for USER', async () => {
      (prisma.notification.count as any).mockResolvedValue(3);
      
      const count = await NotificationService.getUnreadCountByUser('user_123');
      
      expect(count).toBe(3);
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { receiverId: 'user_123', receiverRole: 'USER', isRead: false },
      });
    });
  });

  describe('markAsRead', () => {
    const mockNotification = {
      id: 'notif_1',
      receiverRole: 'USER',
      receiverId: 'user_123',
    };

    it('should mark as read if user is the owner', async () => {
      (prisma.notification.findUnique as any).mockResolvedValue(mockNotification);
      
      await NotificationService.markAsRead('notif_1', { userId: 'user_123', role: 'USER' });

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif_1' },
        data: { isRead: true },
      });
    });

    it('should throw error if user is NOT the owner', async () => {
      (prisma.notification.findUnique as any).mockResolvedValue(mockNotification);
      
      await expect(
        NotificationService.markAsRead('notif_1', { userId: 'wrong_user', role: 'USER' })
      ).rejects.toThrow('Unauthorized');
    });

    it('should allow ADMIN to mark ADMIN notifications as read', async () => {
      const adminNotif = { id: 'notif_2', receiverRole: 'ADMIN', receiverId: null };
      (prisma.notification.findUnique as any).mockResolvedValue(adminNotif);
      
      await NotificationService.markAsRead('notif_2', { userId: 'admin_1', role: 'ADMIN' });

      expect(prisma.notification.update).toHaveBeenCalled();
    });
  });
});
