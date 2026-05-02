import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logBackend } from "./utils/logger.js";
const app = createApp();
app.listen(env.PORT, async () => {
    await logBackend("info", "config", `Backend started on port ${env.PORT}`);
    console.log(`notification_app_be is running on http://localhost:${env.PORT}`);
});
