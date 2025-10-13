import{createNotification} from './notificationService';
import { io } from '../server';
import { EventType } from '../../types/socket';
import { CreateNotificationData } from '../../types/notification';

export const sendRealtimeNotification = async (
    userId: string,
    notificationData: CreateNotificationData
  ) => {
    try {
      const notification = await createNotification(userId, notificationData);
      io.to(userId).emit(EventType.NOTIFICATION, {
        userId,
        ...notification
      });

      return notification;
    } catch (error) {
      console.error('실시간 알림 전송 실패:', error);
    }
  }