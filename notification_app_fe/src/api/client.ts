import { logFrontend } from "../utils/logger";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  await logFrontend("debug", "api", `Request started for ${init?.method ?? "GET"} ${path}`);

  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: "Request failed" }));
    await logFrontend(
      "error",
      "api",
      `Request failed for ${path} with status ${response.status}`
    );
    throw new Error(payload.message ?? "Request failed");
  }

  await logFrontend("info", "api", `Request completed for ${path}`);
  return response.json() as Promise<T>;
}
