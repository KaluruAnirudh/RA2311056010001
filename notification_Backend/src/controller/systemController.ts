import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { logClientRelay } from "../utils/logger.js";

export class SystemController {
  health(_request: Request, response: Response) {
    response.status(200).json({
      status: "ok",
      service: "notification_app_be"
    });
  }

  frontendConfig(_request: Request, response: Response) {
    response.status(200).json({
      data: {
        apiBaseUrl: `http://localhost:${env.PORT}/api`,
        loggingRelayUrl: `http://localhost:${env.PORT}/api/system/logs`
      }
    });
  }

  relayLog = async (request: Request, response: Response) => {
    const { stack, level, package: packageName, message } = request.body as {
      stack: "frontend" | "backend";
      level: "debug" | "info" | "warn" | "error" | "fatal";
      package: string;
      message: string;
    };

    await logClientRelay(stack, level, packageName, message);
    response.status(202).json({
      message: "Log accepted"
    });
  };
}
