import { Log } from "../utils/appLogger.js";
export class SchedulerController {
    schedulerService;
    constructor(schedulerService) {
        this.schedulerService = schedulerService;
    }
    getSchedule = async (_request, response) => {
        await Log("backend", "info", "controller", "Schedule endpoint started");
        const result = await this.schedulerService.buildSchedule();
        await Log("backend", "info", "controller", "Schedule endpoint completed");
        response.status(200).json(result);
    };
}
