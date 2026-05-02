import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { NotificationController } from "./controller/notificationController.js";
import { SystemController } from "./controller/systemController.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { NotificationRepository } from "./repository/notificationRepository.js";
import { createNotificationRouter } from "./routes/notificationRoutes.js";
import { createSystemRouter } from "./routes/systemRoutes.js";
import { NotificationService } from "./service/notificationService.js";
import { logBackend } from "./utils/logger.js";
export function createApp() {
    const app = express();
    app.use(cors({
        origin: env.FRONTEND_ORIGIN
    }));
    app.use(express.json());
    app.use(async (request, _response, next) => {
        await logBackend("info", "middleware", `Incoming request ${request.method} ${request.originalUrl}`);
        next();
    });
    const notificationRepository = new NotificationRepository();
    const notificationService = new NotificationService(notificationRepository);
    const notificationController = new NotificationController(notificationService);
    const systemController = new SystemController();
    app.get("/", (_request, response) => {
        response.status(200).send(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>notification_app_be</title>
          <style>
            body {
              margin: 0;
              font-family: "Segoe UI", Tahoma, sans-serif;
              background: linear-gradient(180deg, #f5f7fb, #ebf1fb);
              color: #1f2937;
            }
            .shell {
              max-width: 860px;
              margin: 56px auto;
              padding: 24px;
            }
            .card {
              background: white;
              border-radius: 20px;
              padding: 28px;
              box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
              border: 1px solid #dbe4f0;
            }
            h1 {
              margin: 0 0 10px;
              font-size: 2rem;
            }
            p {
              line-height: 1.6;
              color: #475467;
            }
            ul {
              padding-left: 18px;
            }
            code {
              background: #eef4ff;
              padding: 2px 6px;
              border-radius: 8px;
            }
            a {
              color: #1d4ed8;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <main class="shell">
            <section class="card">
              <h1>Notification backend is running</h1>
              <p>
                This server handles the API layer for the campus hiring evaluation project.
                The React frontend runs separately during development.
              </p>
              <ul>
                <li>Frontend dev app: <a href="http://localhost:5173">http://localhost:5173</a></li>
                <li>Health check: <a href="/api/system/health">/api/system/health</a></li>
                <li>Notifications API: <a href="/api/notifications">/api/notifications</a></li>
              </ul>
              <p>
                If the frontend is not open yet, start it with
                <code>npm run dev --workspace notification_app_fe</code>.
              </p>
            </section>
          </main>
        </body>
      </html>
    `);
    });
    app.use("/api/notifications", createNotificationRouter(notificationController));
    app.use("/api/system", createSystemRouter(systemController));
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}
