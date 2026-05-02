import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();
const envSchema = z.object({
    PORT: z.coerce.number().default(4000),
    EVALUATION_BASE_URL: z
        .string()
        .url()
        .default("http://20.207.122.201/evaluation-service"),
    EVALUATION_ACCESS_TOKEN: z.string().min(1),
    TOP_NOTIFICATION_LIMIT: z.coerce.number().int().positive().default(10)
});
export const env = envSchema.parse(process.env);
