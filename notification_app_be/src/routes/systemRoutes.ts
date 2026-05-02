import { Router } from "express";
import { SystemController } from "../controller/systemController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export function createSystemRouter(systemController: SystemController) {
  const router = Router();

  router.get("/health", systemController.health);
  router.get("/frontend-config", systemController.frontendConfig);
  router.post("/logs", asyncHandler(systemController.relayLog));

  return router;
}
