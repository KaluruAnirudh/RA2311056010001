import { Router } from "express";
import { NotificationController } from "../controller/notificationController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export function createNotificationRouter(controller: NotificationController) {
  const router = Router();
  router.get("/", asyncHandler(controller.getAll));
  router.get("/unread", asyncHandler(controller.getUnread));
  router.get("/top", asyncHandler(controller.getTop));
  router.post("/", asyncHandler(controller.create));
  router.put("/:id/read", asyncHandler(controller.markAsRead));
  return router;
}
