export type NotificationStatus = "unread" | "read";

export interface Notification {
  id: string;
  title: string;
  message: string;
  status: NotificationStatus;
  createdAt: string;
}

export interface CreateNotificationInput {
  title: string;
  message: string;
}
