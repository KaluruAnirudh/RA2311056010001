import { createProtectedApiClient, createTokenProvider } from "@ra2311056010001/logging-middleware";
import { env } from "../config/env.js";
import type { JsonRecord } from "../types/evaluation-api.js";
import { Log } from "../utils/appLogger.js";

const tokenProvider = createTokenProvider({
  accessToken: env.EVALUATION_ACCESS_TOKEN
});

const apiClient = createProtectedApiClient({
  baseUrl: env.EVALUATION_BASE_URL,
  tokenProvider,
  timeoutMs: 5000
});

export class EvaluationApiService {
  async getDepots() {
    await Log("backend", "info", "service", "Starting protected depot fetch");
    const payload = await apiClient.getJson("/depots");
    await Log("backend", "info", "service", "Completed protected depot fetch");
    return this.extractArray(payload, "depots");
  }

  async getVehicles() {
    await Log("backend", "info", "service", "Starting protected vehicle fetch");
    const payload = await apiClient.getJson("/vehicles");
    await Log("backend", "info", "service", "Completed protected vehicle fetch");
    return this.extractArray(payload, "vehicles");
  }

  async getExternalNotifications() {
    await Log("backend", "info", "service", "Starting protected external notification fetch");
    const payload = await apiClient.getJson("/notifications");
    await Log("backend", "info", "service", "Completed protected external notification fetch");
    return this.extractArray(payload, "notifications");
  }

  private extractArray(payload: unknown, preferredKey: string) {
    if (Array.isArray(payload)) {
      return payload as JsonRecord[];
    }

    if (payload && typeof payload === "object") {
      const record = payload as Record<string, unknown>;
      const preferred = record[preferredKey];

      if (Array.isArray(preferred)) {
        return preferred as JsonRecord[];
      }

      for (const value of Object.values(record)) {
        if (Array.isArray(value)) {
          return value as JsonRecord[];
        }
      }
    }

    throw new Error(`Unexpected API shape while reading ${preferredKey}`);
  }
}
