import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { Log } from "./utils/appLogger.js";
const app = createApp();
app.listen(env.PORT, () => {
    void Log("backend", "info", "config", `Server started on port ${env.PORT}`);
});
