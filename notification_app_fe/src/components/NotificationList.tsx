import type { Notification } from "../types/notification";
import { logFrontend } from "../utils/logger";

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => Promise<void>;
}

export function NotificationList({
  notifications,
  onMarkAsRead
}: NotificationListProps) {
  return (
    <section className="panel list-panel">
      <div className="panel-header">
        <h2>Recent notifications</h2>
        <p>Unread updates stay highlighted until you mark them as read.</p>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <strong>No notifications yet</strong>
          <span>Create the first one from the form.</span>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`notification-card ${
                notification.status === "read" ? "is-read" : "is-unread"
              }`}
            >
              <div className="card-row">
                <div>
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                </div>
                <span className="status-chip">{notification.status}</span>
              </div>

              <div className="card-footer">
                <time>{new Date(notification.createdAt).toLocaleString()}</time>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={notification.status === "read"}
                  onClick={async () => {
                    await logFrontend(
                      "info",
                      "component",
                      `Mark as read clicked for ${notification.id}`
                    );
                    await onMarkAsRead(notification.id);
                  }}
                >
                  {notification.status === "read" ? "Already read" : "Mark as read"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
