import prisma from "../lib/prisma";
import { CreateNotificationData } from "../../types/notification";

export const findNotificationsByUserIdRp = async (userId: string) => {
    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            type: true,
            title: true,
            message: true,
            relatedId: true,
            isRead: true,
            createdAt: true,
        },
    });
    return notifications;
}

export const countUnreadNotificationsByUserIdRp = async (userId: string) => {
    const count = await prisma.notification.count({
        where: { userId, isRead: false },
    });
    return count;
}

export const updateNotificationAsReadRp = async (notificationId: number) => {
    await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
    });
}

export const createNotificationRp = async (userId: string, data: CreateNotificationData) => {
    const notification = await prisma.notification.create({
        data: {
            userId,
            ...data
        },
        select: {
            id: true,
            type: true,
            title: true,
            message: true,
            relatedId: true,
            isRead: true,
            createdAt: true,
        }
    });
    return notification;
}

export const findUserIdFromNotificationIdRp = async (notificationId: number) => {
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        select: { userId: true },
    });
    if(!notification) {
        throw new Error("Notification not found");
    }
    return notification.userId;
}
