import type { Request, Response } from "express";

export class SystemController {
  health(_request: Request, response: Response) {
    response.status(200).json({
      status: "ok",
      service: "vehicle_maintenance_scheduler"
    });
  }
}
