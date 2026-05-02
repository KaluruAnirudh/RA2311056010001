import { z } from "zod";
import { NotificationRepository } from "../repository/notificationRepository.js";
import type { CreateNotificationInput } from "../domain/notification.js";
import { logBackend } from "../utils/logger.js";

const createNotificationSchema = z.object({
  title: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(500)
});

export class NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async getAllNotifications() {
    await logBackend("debug", "service", "Loading notifications");
    const notifications = await this.notificationRepository.findAll();
    await logBackend("info", "service", `Loaded ${notifications.length} notifications`);
    return notifications;
  }

  async createNotification(input: CreateNotificationInput) {
    await logBackend("debug", "service", "Validating notification creation request");
    const payload = createNotificationSchema.parse(input);
    const created = await this.notificationRepository.create(payload);
    await logBackend("info", "service", `Created notification ${created.id}`);
    return created;
  }

  async markNotificationAsRead(id: string) {
    await logBackend("debug", "service", `Marking notification ${id} as read in service`);
    const updated = await this.notificationRepository.markAsRead(id);

    if (!updated) {
      const error = new Error("Notification not found");
      (error as Error & { statusCode?: number }).statusCode = 404;
      await logBackend("warn", "service", `Notification ${id} was not found in service`);
      throw error;
    }

    await logBackend("info", "service", `Notification ${id} updated to read`);
    return updated;
  }
}
