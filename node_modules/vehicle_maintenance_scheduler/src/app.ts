import express from "express";
import { NotificationController } from "./controller/notificationController.js";
import { SchedulerController } from "./controller/schedulerController.js";
import { SystemController } from "./controller/systemController.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { NotificationRepository } from "./repository/notificationRepository.js";
import { createNotificationRouter } from "./routes/notificationRoutes.js";
import { createSchedulerRouter } from "./routes/schedulerRoutes.js";
import { createSystemRouter } from "./routes/systemRoutes.js";
import { EvaluationApiService } from "./service/evaluationApiService.js";
import { NotificationService } from "./service/notificationService.js";
import { SchedulerService } from "./service/schedulerService.js";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(requestLogger);

  const evaluationApiService = new EvaluationApiService();
  const notificationRepository = new NotificationRepository();
  const schedulerService = new SchedulerService(evaluationApiService);
  const notificationService = new NotificationService(
    notificationRepository,
    evaluationApiService
  );

  const schedulerController = new SchedulerController(schedulerService);
  const notificationController = new NotificationController(notificationService);
  const systemController = new SystemController();

  app.get("/", (_request, response) => {
    response.status(200).json({
      service: "vehicle_maintenance_scheduler",
      endpoints: [
        "/health",
        "/schedule",
        "/notifications",
        "/notifications/unread",
        "/notifications/top"
      ]
    });
  });

  app.use("/schedule", createSchedulerRouter(schedulerController));
  app.use("/notifications", createNotificationRouter(notificationController));
  app.use("/", createSystemRouter(systemController));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
