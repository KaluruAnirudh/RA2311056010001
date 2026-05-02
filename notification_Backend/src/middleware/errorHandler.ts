import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logBackend } from "../utils/logger.js";

export async function errorHandler(
  error: Error & { statusCode?: number },
  request: Request,
  response: Response,
  _next: NextFunction
) {
  const statusCode = error.statusCode ?? (error instanceof ZodError ? 400 : 500);
  const details =
    error instanceof ZodError
      ? error.issues.map((issue) => issue.message)
      : undefined;

  await logBackend(
    statusCode >= 500 ? "error" : "warn",
    "handler",
    `Request failed for ${request.method} ${request.originalUrl}: ${error.message}`
  );

  response.status(statusCode).json({
    message: error.message,
    details
  });
}
