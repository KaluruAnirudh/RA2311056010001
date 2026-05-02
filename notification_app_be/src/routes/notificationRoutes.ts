import { Router } from "express";
import { NotificationController } from "../controller/notificationController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logBackend } from "../utils/logger.js";

export function createNotificationRouter(
  notificationController: NotificationController
) {
  const router = Router();

  router.use(asyncHandler(async (_request, _response, next) => {
    await logBackend("debug", "route", "Entered notification routes");
    next();
  }));

  router.get("/", asyncHandler(notificationController.getAll));
  router.post("/", asyncHandler(notificationController.create));
  router.patch("/:id/read", asyncHandler(notificationController.markAsRead));

  return router;
}
