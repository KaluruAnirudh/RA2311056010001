import { FormEvent, useState } from "react";
import { logFrontend } from "../utils/logger";

interface NotificationFormProps {
  submitting: boolean;
  onSubmit: (payload: { title: string; message: string }) => Promise<void>;
}

export function NotificationForm({
  submitting,
  onSubmit
}: NotificationFormProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await logFrontend("info", "component", "Notification form submitted");
    await onSubmit({ title, message });
    setTitle("");
    setMessage("");
  };

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="panel-header">
        <h2>Create notification</h2>
        <p>Share quick updates with candidates and recruiters.</p>
      </div>

      <label className="field">
        <span>Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          placeholder="Interview reminder"
          required
        />
      </label>

      <label className="field">
        <span>Message</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={500}
          rows={5}
          placeholder="Your coding round starts at 10:00 AM tomorrow."
          required
        />
      </label>

      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Create notification"}
      </button>
    </form>
  );
}
