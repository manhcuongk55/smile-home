import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type CreateNotificationInput = {
  type: string;
  title: string;
  message: string;
  referenceId?: string | null;
  receiverId?: string | null;
  receiverRole: 'ADMIN' | 'USER';
  metadata?: Prisma.JsonValue;
};

export const NotificationService = {
  /**
   * Create a new notification
   */
  async createNotification(data: CreateNotificationInput) {
    const { metadata, ...rest } = data;
    return prisma.notification.create({
      data: {
        ...rest,
        isRead: false,
        ...(metadata ? { metadata: metadata as Prisma.InputJsonValue } : {}),
      },
    });
  },

  /**
   * Get unread count for a role (standard notifications)
   */
  async getUnreadCountByRole(role: string = 'ADMIN') {
    return prisma.notification.count({
      where: {
        receiverRole: role,
        isRead: false,
      },
    });
  },

  /**
   * Get count of pending contracts for Admin
   */
  async getPendingTasksCount() {
    return prisma.contract.count({
      where: {
        documents: {
          some: {
            documentType: 'CONTRACT',
            approvalStatus: 'PENDING'
          }
        }
      }
    });
  },

  /**
   * Get unread count for specific USER
   */
  async getUnreadCountByUser(userId: string) {
    return prisma.notification.count({
      where: {
        receiverId: userId,
        receiverRole: 'USER',
        isRead: false,
      },
    });
  },

  /**
   * Get paginated notifications for ADMIN
   */
  async getNotificationsForRole(role: string = 'ADMIN', limit: number = 20, offset: number = 0) {
    return prisma.notification.findMany({
      where: {
        receiverRole: role,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  },

  /**
   * Get paginated notifications for specific USER
   */
  async getNotificationsForUser(userId: string, limit: number = 20, offset: number = 0) {
    return prisma.notification.findMany({
      where: {
        receiverId: userId,
        receiverRole: 'USER',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  },

  /**
   * Mark a single notification as read with owner validation
   */
  async markAsRead(notificationId: string, currentUser: { userId: string; role: 'ADMIN' | 'USER' }) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    // Security check: Verify the recipient
    const isOwner =
      (currentUser.role === 'ADMIN' && notification.receiverRole === 'ADMIN') ||
      (currentUser.role === 'USER' && notification.receiverId === currentUser.userId);

    if (!isOwner) {
      throw new Error('Unauthorized Access: You cannot mark others\' notifications as read');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  },

  /**
   * Mark all notifications as read for a role
   */
  async markAllAsReadByRole(role: string = 'ADMIN') {
    return prisma.notification.updateMany({
      where: {
        receiverRole: role,
        isRead: false,
      },
      data: { isRead: true },
    });
  },

  /**
   * Mark all notifications as read for a specific user
   */
  async markAllAsReadByUser(userId: string) {
    return prisma.notification.updateMany({
      where: {
        receiverId: userId,
        receiverRole: 'USER',
        isRead: false,
      },
      data: { isRead: true },
    });
  },
};
