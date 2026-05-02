import { appendFile } from "node:fs/promises";
import { createEvaluationLogger, createTokenProvider } from "@ra2311056010001/logging-middleware";
import { env } from "../config/env.js";

const tokenProvider = createTokenProvider({
  accessToken: env.EVALUATION_ACCESS_TOKEN
});

const remoteLog = createEvaluationLogger({
  logsUrl: `${env.EVALUATION_BASE_URL}/logs`,
  tokenProvider,
  timeoutMs: 4000
});

const fallbackLogPath = new URL("../../runtime/app.log", import.meta.url);

async function writeFallback(message: string) {
  try {
    await appendFile(fallbackLogPath, `${new Date().toISOString()} ${message}\n`, "utf-8");
  } catch {
    return;
  }
}

export async function Log(
  stack: "backend",
  level: "debug" | "info" | "warn" | "error" | "fatal",
  packageName:
    | "auth"
    | "cache"
    | "config"
    | "controller"
    | "cron_job"
    | "db"
    | "domain"
    | "handler"
    | "middleware"
    | "repository"
    | "route"
    | "service"
    | "utils",
  message: string
) {
  try {
    await remoteLog(stack, level, packageName, message);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown logging error";
    await writeFallback(`[${level}] [${packageName}] ${message} | fallback=${detail}`);
  }
}
