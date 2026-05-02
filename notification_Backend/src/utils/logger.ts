import {
  createEvaluationAuthClient,
  createEvaluationLogger
} from "@ra2311056010001/logging-middleware";
import { env } from "../config/env.js";

const authClient = createEvaluationAuthClient({
  registerUrl: env.EVALUATION_REGISTER_URL,
  authUrl: env.EVALUATION_AUTH_URL,
  registerPayload: {
    name: env.EVALUATION_NAME,
    email: env.EVALUATION_EMAIL,
    rollNo: env.EVALUATION_ROLL_NUMBER,
    accessCode: env.EVALUATION_ACCESS_CODE,
    mobileNo: env.EVALUATION_MOBILE,
    githubUsername: env.EVALUATION_GITHUB_USERNAME
  }
});

const evaluationLogger = createEvaluationLogger({
  authClient,
  logsUrl: env.EVALUATION_LOGS_URL,
  timeoutMs: 2500
});

function dispatchLog(
  stack: "backend" | "frontend",
  level: "debug" | "info" | "warn" | "error" | "fatal",
  packageName: string,
  message: string
) {
  void evaluationLogger(stack, level, packageName as never, message).catch((error) => {
    const fallbackMessage =
      error instanceof Error ? error.message : "Unknown logging failure";
    console.warn(`[logging-fallback] ${packageName}:${level} ${fallbackMessage}`);
  });
}

export async function logBackend(
  level: "debug" | "info" | "warn" | "error" | "fatal",
  packageName:
    | "controller"
    | "service"
    | "repository"
    | "db"
    | "handler"
    | "route"
    | "auth"
    | "config"
    | "middleware"
    | "utils"
    | "domain"
    | "cache"
    | "cron_job",
  message: string
) {
  dispatchLog("backend", level, packageName, message);
}

export async function logClientRelay(
  stack: "frontend" | "backend",
  level: "debug" | "info" | "warn" | "error" | "fatal",
  packageName: string,
  message: string
) {
  dispatchLog(stack, level, packageName, message);
}
