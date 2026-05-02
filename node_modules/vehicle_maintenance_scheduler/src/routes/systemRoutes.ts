import { Router } from "express";
import { SystemController } from "../controller/systemController.js";

export function createSystemRouter(controller: SystemController) {
  const router = Router();
  router.get("/health", controller.health);
  return router;
}
