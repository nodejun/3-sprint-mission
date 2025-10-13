import { CreateNotificationData, MarkAsReadResponse, NotificationListResponse, NotificationResponse, UnreadCountResponse } from '../../types/notification';
import { findNotificationsByUserIdRp, countUnreadNotificationsByUserIdRp, updateNotificationAsReadRp, createNotificationRp, findUserIdFromNotificationIdRp } from '../repositories/notificationRepository';

export const getNotificationsByUserId = async (userId: string): Promise<NotificationListResponse> => {
    const notifications = await findNotificationsByUserIdRp(userId);
    const totalCount = notifications.length;
    return { notifications, totalCount } as NotificationListResponse;
};

export const getUnreadCountByUserId = async (userId: string): Promise<UnreadCountResponse> => {
    const unreadCount = await countUnreadNotificationsByUserIdRp(userId);
    return { unreadCount } as UnreadCountResponse;
};

export const markNotificationAsRead = async (notificationId: number, userId: string): Promise<MarkAsReadResponse> => {
    const confirmUserId = await findUserIdFromNotificationIdRp(notificationId);
    if (confirmUserId !== userId) {
        throw new Error("User not authorized to mark this notification as read");
    }
    await updateNotificationAsReadRp(notificationId);
    return { message: "알림을 읽음 처리했습니다" } as MarkAsReadResponse;
};

export const createNotification = async (userId: string, data: CreateNotificationData): Promise<NotificationResponse> => {
    const notification = await createNotificationRp(userId, data);
    return notification as NotificationResponse;
};