import express from "express";
import {getNotifications, getUnreadCount, markAsRead} from '../controllers/notificationController';
import { verifyAccessToken } from "../middlewares/auth";
import asyncHandler from  '../utils/asyncHandler';
import { validate, getNotificationByIdSchema } from "../middlewares/validationMiddleware";

const notificationRouter = express.Router();

notificationRouter.route('/')
    .get(verifyAccessToken, asyncHandler(getNotifications));

notificationRouter.route('/count')
    .get(verifyAccessToken, asyncHandler(getUnreadCount));

notificationRouter.route('/:notificationId/read')
    .patch(verifyAccessToken, validate(getNotificationByIdSchema, 'params'), asyncHandler(markAsRead));

export default notificationRouter;