import {getNotificationsByUserId, getUnreadCountByUserId, markNotificationAsRead} from '../services/notificationService';
import { Request, Response, NextFunction} from 'express';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const notifications = await getNotificationsByUserId(userId);
        res.status(200).json(notifications);
    } catch (error) {
        next(error);
    }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const unreadCount = await getUnreadCountByUserId(userId);
        res.status(200).json(unreadCount);
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const notificationId = parseInt(req.params.notificationId, 10);
        const result = await markNotificationAsRead(notificationId, userId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};