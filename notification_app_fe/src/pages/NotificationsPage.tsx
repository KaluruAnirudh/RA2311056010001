import { NotificationForm } from "../components/NotificationForm";
import { NotificationList } from "../components/NotificationList";
import { useNotifications } from "../hooks/useNotifications";

export function NotificationsPage() {
  const {
    notifications,
    loading,
    submitting,
    error,
    submitNotification,
    markAsRead
  } = useNotifications();

  return (
    <main className="layout">
      <section className="hero">
        <div>
          <span className="eyebrow">Campus hiring evaluation</span>
          <h1>Notification console</h1>
          <p>
            A small full-stack workspace for sending updates, reviewing
            status, and verifying end-to-end logging.
          </p>
        </div>
      </section>

      {error ? <div className="error-banner">{error}</div> : null}

      <section className="content-grid">
        <NotificationForm
          submitting={submitting}
          onSubmit={submitNotification}
        />

        {loading ? (
          <section className="panel list-panel">
            <div className="empty-state">
              <strong>Loading notifications...</strong>
            </div>
          </section>
        ) : (
          <NotificationList
            notifications={notifications}
            onMarkAsRead={markAsRead}
          />
        )}
      </section>
    </main>
  );
}
