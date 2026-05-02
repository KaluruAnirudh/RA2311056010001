import { createRelayLogger } from "@ra2311056010001/logging-middleware";

const relayUrl =
  import.meta.env.VITE_LOGGING_RELAY_URL ?? "http://localhost:4000/api/system/logs";

const relayLogger = createRelayLogger({
  relayUrl
});

export async function logFrontend(
  level: "debug" | "info" | "warn" | "error" | "fatal",
  packageName:
    | "api"
    | "component"
    | "hook"
    | "page"
    | "state"
    | "style"
    | "auth"
    | "config"
    | "middleware"
    | "utils",
  message: string
) {
  try {
    await relayLogger("frontend", level, packageName, message);
  } catch (error) {
    const fallback = error instanceof Error ? error.message : "Unknown client log failure";
    console.warn(`[frontend-log-fallback] ${packageName}:${level} ${fallback}`);
  }
}
