import type { Request, Response } from "express";
import { SchedulerService } from "../service/schedulerService.js";
import { Log } from "../utils/appLogger.js";

export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  getSchedule = async (_request: Request, response: Response) => {
    await Log("backend", "info", "controller", "Schedule endpoint started");
    const result = await this.schedulerService.buildSchedule();
    await Log("backend", "info", "controller", "Schedule endpoint completed");
    response.status(200).json(result);
  };
}
