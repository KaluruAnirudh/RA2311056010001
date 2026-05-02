import { z } from "zod";
import type { NotificationRecord, NotificationType } from "../domain/notification.js";
import { MinPriorityQueue } from "../utils/priorityQueue.js";
import { Log } from "../utils/appLogger.js";
import { NotificationRepository } from "../repository/notificationRepository.js";
import { EvaluationApiService } from "./evaluationApiService.js";

const createNotificationSchema = z.object({
  studentId: z.string().trim().min(1).max(64),
  type: z.enum(["Event", "Result", "Placement"]),
  message: z.string().trim().min(1).max(500)
});

const typeWeights: Record<NotificationType, number> = {
  Placement: 100,
  Result: 60,
  Event: 20
};

export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly evaluationApiService: EvaluationApiService
  ) {}

  async getAllNotifications() {
    await Log("backend", "info", "service", "Fetching all local notifications");
    return this.notificationRepository.findAll();
  }

  async getUnreadNotifications() {
    await Log("backend", "info", "service", "Fetching unread local notifications");
    return this.notificationRepository.findUnread();
  }

  async createNotification(payload: unknown) {
    await Log("backend", "debug", "service", "Validating create notification request");
    const parsed = createNotificationSchema.parse(payload);
    const created = await this.notificationRepository.create(parsed);
    await Log("backend", "info", "service", `Created local notification ${created.id}`);
    return created;
  }

  async markAsRead(id: string) {
    await Log("backend", "debug", "service", `Marking local notification ${id} as read`);
    const updated = await this.notificationRepository.markAsRead(id);

    if (!updated) {
      const error = new Error("Notification not found");
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }

    await Log("backend", "info", "service", `Notification ${id} updated to read`);
    return updated;
  }

  async getTopNotifications(limit: number) {
    await Log("backend", "info", "service", `Fetching external notifications for top ${limit}`);
    const items = await this.evaluationApiService.getExternalNotifications();
    const queue = new MinPriorityQueue<RankedNotification>();
    const now = Date.now();

    for (const rawItem of items) {
      const candidate = this.normalizeExternalNotification(rawItem);
      if (!candidate) {
        continue;
      }

      const score = this.computeScore(candidate, now);
      await Log("backend", "debug", "service", `Computed priority score ${score.toFixed(2)} for ${candidate.id}`);
      queue.push({ ...candidate, score }, score);

      if (queue.size > limit) {
        queue.pop();
      }
    }

    const results = queue.toSortedDescending().map(({ item }) => item);

    await Log("backend", "info", "service", `Prepared ${results.length} priority notifications`);
    return {
      limit,
      results
    };
  }

  private normalizeExternalNotification(record: Record<string, unknown>) {
    const id = this.readString(record, ["id", "ID", "notificationId"]);
    const type = this.readString(record, ["type", "Type"]);
    const message = this.readString(record, ["message", "Message"]);
    const timestamp = this.readString(record, ["timestamp", "Timestamp", "createdAt"]);

    if (!id || !message || !timestamp) {
      return null;
    }

    if (!this.isNotificationType(type)) {
      return null;
    }

    return {
      id,
      type,
      message,
      timestamp,
      createdAt: timestamp,
      isRead: false,
      studentId: "external"
    };
  }

  private computeScore(
    notification: { type: NotificationType; timestamp: string },
    now: number
  ) {
    const ageMs = Math.max(0, now - new Date(notification.timestamp).getTime());
    const ageHours = ageMs / (1000 * 60 * 60);
    const recencyFactor = Math.max(0, 24 - ageHours) / 24;
    return typeWeights[notification.type] + recencyFactor;
  }

  private readString(record: Record<string, unknown>, keys: string[]) {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
      }
      if (typeof value === "number") {
        return String(value);
      }
    }

    return null;
  }

  private isNotificationType(value: string | null): value is NotificationType {
    return value === "Placement" || value === "Result" || value === "Event";
  }
}
interface RankedNotification extends NotificationRecord {
  timestamp: string;
  score: number;
}
