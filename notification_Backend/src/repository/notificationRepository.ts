import { readNotifications, writeNotifications } from "../db/fileStore.js";
import type { CreateNotificationInput, Notification } from "../domain/notification.js";
import { createId } from "../utils/createId.js";
import { logBackend } from "../utils/logger.js";

export class NotificationRepository {
  async findAll() {
    await logBackend("debug", "repository", "Fetching all notifications");
    const items = await readNotifications();
    return [...items].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async create(input: CreateNotificationInput) {
    await logBackend("debug", "repository", "Creating a new notification record");

    const items = await readNotifications();
    const nextItem: Notification = {
      id: createId(),
      title: input.title.trim(),
      message: input.message.trim(),
      status: "unread",
      createdAt: new Date().toISOString()
    };

    items.push(nextItem);
    await writeNotifications(items);
    await logBackend("info", "repository", `Notification ${nextItem.id} created`);

    return nextItem;
  }

  async markAsRead(id: string) {
    await logBackend("debug", "repository", `Marking notification ${id} as read`);

    const items = await readNotifications();
    const match = items.find((item) => item.id === id);

    if (!match) {
      await logBackend("warn", "repository", `Notification ${id} was not found`);
      return null;
    }

    match.status = "read";
    await writeNotifications(items);
    await logBackend("info", "repository", `Notification ${id} marked as read`);

    return match;
  }
}
