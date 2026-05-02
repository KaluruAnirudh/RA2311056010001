import { ZodError } from "zod";
import { Log } from "../utils/appLogger.js";
export async function errorHandler(error, request, response, _next) {
    const statusCode = error.statusCode ?? (error instanceof ZodError ? 400 : 500);
    const details = error instanceof ZodError ? error.issues.map((issue) => issue.message) : undefined;
    await Log("backend", statusCode >= 500 ? "error" : "warn", "handler", `Request failed ${request.method.toLowerCase()} ${request.originalUrl.toLowerCase()} message=${error.message}`);
    response.status(statusCode).json({
        message: error.message,
        details
    });
}
