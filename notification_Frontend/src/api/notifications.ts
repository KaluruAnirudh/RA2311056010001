import { apiRequest } from "./client";
import type { Notification } from "../types/notification";

interface NotificationEnvelope {
  data: Notification;
  message?: string;
}

interface NotificationListEnvelope {
  data: Notification[];
}

export function fetchNotifications() {
  return apiRequest<NotificationListEnvelope>("/notifications");
}

export function createNotification(payload: { title: string; message: string }) {
  return apiRequest<NotificationEnvelope>("/notifications", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function markNotificationAsRead(id: string) {
  return apiRequest<NotificationEnvelope>(`/notifications/${id}/read`, {
    method: "PATCH"
  });
}
