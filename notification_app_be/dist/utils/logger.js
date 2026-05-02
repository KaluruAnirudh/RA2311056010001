import { createEvaluationAuthClient, createEvaluationLogger } from "@ra2311056010001/logging-middleware";
import { env } from "../config/env.js";
const authClient = createEvaluationAuthClient({
    registerUrl: env.EVALUATION_REGISTER_URL,
    authUrl: env.EVALUATION_AUTH_URL,
    registerPayload: {
        name: env.EVALUATION_NAME,
        email: env.EVALUATION_EMAIL,
        rollNo: env.EVALUATION_ROLL_NUMBER,
        accessCode: env.EVALUATION_ACCESS_CODE,
        mobileNo: env.EVALUATION_MOBILE,
        githubUsername: env.EVALUATION_GITHUB_USERNAME
    }
});
const evaluationLogger = createEvaluationLogger({
    authClient,
    logsUrl: env.EVALUATION_LOGS_URL,
    timeoutMs: 2500
});
function dispatchLog(stack, level, packageName, message) {
    void evaluationLogger(stack, level, packageName, message).catch((error) => {
        const fallbackMessage = error instanceof Error ? error.message : "Unknown logging failure";
        console.warn(`[logging-fallback] ${packageName}:${level} ${fallbackMessage}`);
    });
}
export async function logBackend(level, packageName, message) {
    dispatchLog("backend", level, packageName, message);
}
export async function logClientRelay(stack, level, packageName, message) {
    dispatchLog(stack, level, packageName, message);
}
