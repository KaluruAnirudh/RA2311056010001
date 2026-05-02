import { createProtectedApiClient, createTokenProvider } from "@ra2311056010001/logging-middleware";
import { env } from "../config/env.js";
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
    extractArray(payload, preferredKey) {
        if (Array.isArray(payload)) {
            return payload;
        }
        if (payload && typeof payload === "object") {
            const record = payload;
            const preferred = record[preferredKey];
            if (Array.isArray(preferred)) {
                return preferred;
            }
            for (const value of Object.values(record)) {
                if (Array.isArray(value)) {
                    return value;
                }
            }
        }
        throw new Error(`Unexpected API shape while reading ${preferredKey}`);
    }
}
