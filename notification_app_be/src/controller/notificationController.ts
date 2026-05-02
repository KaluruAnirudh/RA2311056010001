import type { Request, Response } from "express";
import { NotificationService } from "../service/notificationService.js";
import { logBackend } from "../utils/logger.js";

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  getAll = async (_request: Request, response: Response) => {
    await logBackend("info", "controller", "Handling get all notifications request");
    const notifications = await this.notificationService.getAllNotifications();
    response.status(200).json({
      data: notifications
    });
  };

  create = async (request: Request, response: Response) => {
    await logBackend("info", "controller", "Handling create notification request");
    const notification = await this.notificationService.createNotification(request.body);
    response.status(201).json({
      data: notification,
      message: "Notification created successfully"
    });
  };

  markAsRead = async (request: Request, response: Response) => {
    const notificationId = String(request.params.id);
    await logBackend("info", "controller", `Handling mark-as-read for ${notificationId}`);
    const notification = await this.notificationService.markNotificationAsRead(
      notificationId
    );
    response.status(200).json({
      data: notification,
      message: "Notification marked as read"
    });
  };
}
