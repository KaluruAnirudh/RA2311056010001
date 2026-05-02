import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { NotificationService } from "../service/notificationService.js";
import { Log } from "../utils/appLogger.js";

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  getAll = async (_request: Request, response: Response) => {
    await Log("backend", "info", "controller", "Notifications endpoint started");
    const data = await this.notificationService.getAllNotifications();
    await Log("backend", "info", "controller", "Notifications endpoint completed");
    response.status(200).json({ data });
  };

  getUnread = async (_request: Request, response: Response) => {
    await Log("backend", "info", "controller", "Unread notifications endpoint started");
    const data = await this.notificationService.getUnreadNotifications();
    await Log("backend", "info", "controller", "Unread notifications endpoint completed");
    response.status(200).json({ data });
  };

  create = async (request: Request, response: Response) => {
    await Log("backend", "info", "controller", "Create notification endpoint started");
    const data = await this.notificationService.createNotification(request.body);
    await Log("backend", "info", "controller", `Create notification endpoint completed for ${data.id}`);
    response.status(201).json({ data });
  };

  markAsRead = async (request: Request, response: Response) => {
    const id = String(request.params.id);
    await Log("backend", "info", "controller", `Read notification endpoint started for ${id}`);
    const data = await this.notificationService.markAsRead(id);
    await Log("backend", "info", "controller", `Read notification endpoint completed for ${id}`);
    response.status(200).json({ data });
  };

  getTop = async (request: Request, response: Response) => {
    const limit = Number(request.query.limit ?? env.TOP_NOTIFICATION_LIMIT);
    await Log("backend", "info", "controller", `Top notifications endpoint started with limit ${limit}`);
    const data = await this.notificationService.getTopNotifications(limit);
    await Log("backend", "info", "controller", "Top notifications endpoint completed");
    response.status(200).json(data);
  };
}
