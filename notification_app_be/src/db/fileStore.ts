import { promises as fs } from "node:fs";
import { notificationsFilePath } from "../config/paths.js";
import type { Notification } from "../domain/notification.js";
import { logBackend } from "../utils/logger.js";

export async function readNotifications(): Promise<Notification[]> {
  await logBackend("debug", "db", "Reading notifications from file store");

  try {
    const raw = await fs.readFile(notificationsFilePath, "utf-8");
    const parsed = JSON.parse(raw) as Notification[];
    await logBackend("info", "db", `Loaded ${parsed.length} notifications from file store`);
    return parsed;
  } catch (error) {
    await logBackend("error", "db", "Failed to read notification file");
    throw error;
  }
}

export async function writeNotifications(notifications: Notification[]) {
  await logBackend("debug", "db", `Persisting ${notifications.length} notifications to file store`);

  try {
    await fs.writeFile(
      notificationsFilePath,
      JSON.stringify(notifications, null, 2),
      "utf-8"
    );
    await logBackend("info", "db", "Notification file updated successfully");
  } catch (error) {
    await logBackend("error", "db", "Failed to write notification file");
    throw error;
  }
}
