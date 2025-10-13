import { NotificationType } from "@prisma/client";

export interface CreateNotificationData {
    type: NotificationType;
    title: string;
    message: string;
    relatedId?: string;
};

export interface NotificationResponse {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    relatedId?: string;
    isRead: boolean;
    createdAt: Date;
};

export interface NotificationListResponse {
    notifications: NotificationResponse[];
    totalCount: number;
};

export interface UnreadCountResponse {
    unreadCount: number;
};

export interface MarkAsReadResponse {
    message: string;
};