import { readFile, writeFile } from "node:fs/promises";
import { notificationStorePath } from "../config/paths.js";
import { Log } from "../utils/appLogger.js";
export async function readNotifications() {
    await Log("backend", "debug", "db", "Reading notifications from runtime store");
    const raw = await readFile(notificationStorePath, "utf-8");
    const items = JSON.parse(raw);
    await Log("backend", "info", "db", `Loaded ${items.length} notifications from runtime store`);
    return items;
}
export async function writeNotifications(notifications) {
    await Log("backend", "debug", "db", `Writing ${notifications.length} notifications to runtime store`);
    await writeFile(notificationStorePath, JSON.stringify(notifications, null, 2), "utf-8");
    await Log("backend", "info", "db", "Runtime notification store updated");
}
