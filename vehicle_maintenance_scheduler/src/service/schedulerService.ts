import type { Depot, ScheduleResult, VehicleTask } from "../domain/scheduler.js";
import type { JsonRecord } from "../types/evaluation-api.js";
import { Log } from "../utils/appLogger.js";
import { EvaluationApiService } from "./evaluationApiService.js";

function readString(record: JsonRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
    if (typeof value === "number") {
      return String(value);
    }
  }
  return null;
}

function readNumber(record: JsonRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

export class SchedulerService {
  constructor(private readonly evaluationApiService: EvaluationApiService) {}

  async buildSchedule() {
    await Log("backend", "info", "service", "Starting schedule generation");
    const [rawDepots, rawVehicles] = await Promise.all([
      this.evaluationApiService.getDepots(),
      this.evaluationApiService.getVehicles()
    ]);

    const depots = this.normalizeDepots(rawDepots);
    const tasks = this.normalizeTasks(rawVehicles);

    const results: ScheduleResult[] = [];
    for (const depot of depots) {
      await Log(
        "backend",
        "debug",
        "service",
        `Running knapsack for depot ${depot.depotId} with mechanic hours ${depot.mechanicHours}`
      );
      const scopedTasks = this.tasksForDepot(tasks, depot.depotId);
      results.push(this.solveKnapsack(depot, scopedTasks));
    }

    await Log("backend", "info", "service", `Schedule generation finished for ${results.length} depots`);
    return { results };
  }

  private normalizeDepots(items: JsonRecord[]): Depot[] {
    return items
      .map((item) => {
        const depotId = readString(item, ["id", "ID", "depotId", "DepotID"]);
        const mechanicHours = readNumber(item, ["mechanicHours", "MechanicHours", "hours"]);

        if (!depotId || mechanicHours === null) {
          return null;
        }

        return {
          depotId,
          mechanicHours
        };
      })
      .filter((item): item is Depot => item !== null);
  }

  private normalizeTasks(items: JsonRecord[]): VehicleTask[] {
    const normalized: VehicleTask[] = [];

    for (const item of items) {
      const taskId = readString(item, ["taskId", "TaskID", "id", "ID"]);
      const duration = readNumber(item, ["duration", "Duration"]);
      const impact = readNumber(item, ["impact", "Impact"]);
      const depotId = readString(item, ["depotId", "DepotID"]);

      if (!taskId || duration === null || impact === null) {
        continue;
      }

      normalized.push({
        taskId,
        duration,
        impact,
        depotId: depotId ?? undefined
      });
    }

    return normalized;
  }

  private tasksForDepot(tasks: VehicleTask[], depotId: string) {
    const filtered = tasks.filter((task) => !task.depotId || task.depotId === depotId);
    return filtered.length > 0 ? filtered : tasks;
  }

  private solveKnapsack(depot: Depot, tasks: VehicleTask[]): ScheduleResult {
    const capacity = Math.max(0, Math.floor(depot.mechanicHours));
    const dp = Array.from({ length: tasks.length + 1 }, () =>
      Array.from({ length: capacity + 1 }, () => 0)
    );

    for (let itemIndex = 1; itemIndex <= tasks.length; itemIndex += 1) {
      const task = tasks[itemIndex - 1];
      const weight = Math.max(0, Math.floor(task.duration));
      const value = task.impact;

      for (let currentCapacity = 0; currentCapacity <= capacity; currentCapacity += 1) {
        dp[itemIndex][currentCapacity] = dp[itemIndex - 1][currentCapacity];
        if (weight <= currentCapacity) {
          const candidate = dp[itemIndex - 1][currentCapacity - weight] + value;
          if (candidate > dp[itemIndex][currentCapacity]) {
            dp[itemIndex][currentCapacity] = candidate;
          }
        }
      }
    }

    const selectedTasks: string[] = [];
    let remainingCapacity = capacity;
    let totalDuration = 0;
    for (let itemIndex = tasks.length; itemIndex > 0; itemIndex -= 1) {
      if (dp[itemIndex][remainingCapacity] !== dp[itemIndex - 1][remainingCapacity]) {
        const task = tasks[itemIndex - 1];
        selectedTasks.push(task.taskId);
        remainingCapacity -= Math.max(0, Math.floor(task.duration));
        totalDuration += task.duration;
      }
    }

    const result = {
      depotId: depot.depotId,
      selectedTasks: selectedTasks.reverse(),
      totalDuration,
      totalImpact: dp[tasks.length][capacity]
    };

    void Log(
      "backend",
      "debug",
      "service",
      `Knapsack result for depot ${depot.depotId}: impact=${result.totalImpact}, duration=${result.totalDuration}`
    );
    return result;
  }
}
