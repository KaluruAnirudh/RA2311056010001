import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
export function createSystemRouter(systemController) {
    const router = Router();
    router.get("/health", systemController.health);
    router.get("/frontend-config", systemController.frontendConfig);
    router.post("/logs", asyncHandler(systemController.relayLog));
    return router;
}
