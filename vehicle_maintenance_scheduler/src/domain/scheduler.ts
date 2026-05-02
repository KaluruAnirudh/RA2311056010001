export interface Depot {
  depotId: string;
  mechanicHours: number;
}

export interface VehicleTask {
  taskId: string;
  duration: number;
  impact: number;
  depotId?: string | null;
}

export interface ScheduleResult {
  depotId: string;
  selectedTasks: string[];
  totalDuration: number;
  totalImpact: number;
}
