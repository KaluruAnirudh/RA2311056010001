export interface Notification {
  id: string;
  title: string;
  message: string;
  status: "unread" | "read";
  createdAt: string;
}
