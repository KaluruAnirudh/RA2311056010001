import { Log } from "../utils/appLogger.js";
export async function requestLogger(request, response, next) {
    const startedAt = Date.now();
    await Log("backend", "info", "middleware", `Request started ${request.method.toLowerCase()} ${request.originalUrl.toLowerCase()}`);
    response.on("finish", () => {
        void Log("backend", "info", "middleware", `Request finished ${request.method.toLowerCase()} ${request.originalUrl.toLowerCase()} status=${response.statusCode} duration_ms=${Date.now() - startedAt}`);
    });
    next();
}
