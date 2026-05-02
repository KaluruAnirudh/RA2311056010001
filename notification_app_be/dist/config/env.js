import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();
const envSchema = z.object({
    PORT: z.coerce.number().default(4000),
    FRONTEND_ORIGIN: z.string().default("http://localhost:5173"),
    EVALUATION_REGISTER_URL: z
        .string()
        .url()
        .default("http://20.207.122.201/evaluation-service/register"),
    EVALUATION_AUTH_URL: z
        .string()
        .url()
        .default("http://20.207.122.201/evaluation-service/auth"),
    EVALUATION_LOGS_URL: z
        .string()
        .url()
        .default("http://20.207.122.201/evaluation-service/logs"),
    EVALUATION_NAME: z.string().min(1).default("Anirudh Kaluru"),
    EVALUATION_EMAIL: z.string().min(1).default("anirudh@example.com"),
    EVALUATION_ROLL_NUMBER: z.string().min(1).default("RA2311056010001"),
    EVALUATION_ACCESS_CODE: z.string().optional().default(""),
    EVALUATION_MOBILE: z.string().optional().default(""),
    EVALUATION_GITHUB_USERNAME: z.string().optional().default("")
});
export const env = envSchema.parse(process.env);
