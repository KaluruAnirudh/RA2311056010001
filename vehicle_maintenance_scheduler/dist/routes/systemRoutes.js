import { Router } from "express";
export function createSystemRouter(controller) {
    const router = Router();
    router.get("/health", controller.health);
    return router;
}
