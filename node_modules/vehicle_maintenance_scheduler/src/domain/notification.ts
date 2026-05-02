export type NotificationType = "Event" | "Result" | "Placement";

export interface NotificationRecord {
  id: string;
  studentId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}
