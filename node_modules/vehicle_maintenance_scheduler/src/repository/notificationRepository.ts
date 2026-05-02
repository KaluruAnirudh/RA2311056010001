import { readNotifications, writeNotifications } from "../db/notificationStore.js";
import type { NotificationRecord } from "../domain/notification.js";
import { createId } from "../utils/createId.js";
import { Log } from "../utils/appLogger.js";

export class NotificationRepository {
  async findAll() {
    await Log("backend", "debug", "repository", "Fetching all notifications from repository");
    return readNotifications();
  }

  async findUnread() {
    await Log("backend", "debug", "repository", "Fetching unread notifications from repository");
    const notifications = await readNotifications();
    return notifications.filter((item) => !item.isRead);
  }

  async create(input: Omit<NotificationRecord, "id" | "isRead" | "createdAt">) {
    await Log("backend", "debug", "repository", "Creating notification in repository");
    const notifications = await readNotifications();
    const created: NotificationRecord = {
      id: createId("n"),
      studentId: input.studentId,
      type: input.type,
      message: input.message,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    notifications.unshift(created);
    await writeNotifications(notifications);
    await Log("backend", "info", "repository", `Notification ${created.id} persisted`);
    return created;
  }

  async markAsRead(id: string) {
    await Log("backend", "debug", "repository", `Updating notification ${id} to read`);
    const notifications = await readNotifications();
    const target = notifications.find((item) => item.id === id);

    if (!target) {
      await Log("backend", "warn", "repository", `Notification ${id} not found in repository`);
      return null;
    }

    target.isRead = true;
    await writeNotifications(notifications);
    await Log("backend", "info", "repository", `Notification ${id} marked as read`);
    return target;
  }
}
