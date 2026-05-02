import { Router } from "express";
import { SchedulerController } from "../controller/schedulerController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export function createSchedulerRouter(controller: SchedulerController) {
  const router = Router();
  router.get("/", asyncHandler(controller.getSchedule));
  return router;
}
