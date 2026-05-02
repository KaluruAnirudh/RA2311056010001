import { useEffect, useState } from "react";
import {
  createNotification,
  fetchNotifications,
  markNotificationAsRead
} from "../api/notifications";
import type { Notification } from "../types/notification";
import { logFrontend } from "../utils/logger";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchNotifications();
      setNotifications(response.data);
      await logFrontend("info", "hook", "Notification list loaded on client");
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Unable to load notifications";
      setError(message);
      await logFrontend("error", "hook", `Loading notifications failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const submitNotification = async (payload: { title: string; message: string }) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await createNotification(payload);
      setNotifications((current) => [response.data, ...current]);
      await logFrontend("info", "hook", `Notification ${response.data.id} created on client`);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Unable to create notification";
      setError(message);
      await logFrontend("error", "hook", `Creating notification failed: ${message}`);
      throw submitError;
    } finally {
      setSubmitting(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await markNotificationAsRead(id);
      setNotifications((current) =>
        current.map((item) => (item.id === id ? response.data : item))
      );
      await logFrontend("info", "hook", `Notification ${id} marked as read on client`);
    } catch (updateError) {
      const message =
        updateError instanceof Error ? updateError.message : "Unable to update notification";
      setError(message);
      await logFrontend("error", "hook", `Marking notification as read failed: ${message}`);
      throw updateError;
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  return {
    notifications,
    loading,
    submitting,
    error,
    reload: loadNotifications,
    submitNotification,
    markAsRead
  };
}
