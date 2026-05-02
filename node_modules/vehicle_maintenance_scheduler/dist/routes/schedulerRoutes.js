import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
export function createSchedulerRouter(controller) {
    const router = Router();
    router.get("/", asyncHandler(controller.getSchedule));
    return router;
}
