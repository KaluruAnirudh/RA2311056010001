export type LogStack = "backend" | "frontend";
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
export type BackendPackage =
  | "cache"
  | "controller"
  | "cron_job"
  | "db"
  | "domain"
  | "handler"
  | "repository"
  | "route"
  | "service";
export type FrontendPackage =
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style";
export type CommonPackage = "auth" | "config" | "middleware" | "utils";
export type LogPackage = BackendPackage | FrontendPackage | CommonPackage;

export interface TokenProvider {
  getAccessToken(): string;
}

export function createTokenProvider(config: {
  accessToken: string;
}): TokenProvider;

export function createProtectedApiClient(
  config: {
    baseUrl: string;
    tokenProvider: TokenProvider;
    timeoutMs?: number;
  },
  fetchImpl?: typeof fetch
): {
  getJson(path: string): Promise<unknown>;
  postJson(path: string, payload: unknown): Promise<unknown>;
};

export function createEvaluationLogger(
  config: {
    logsUrl: string;
    tokenProvider: TokenProvider;
    timeoutMs?: number;
  },
  fetchImpl?: typeof fetch
): (
  stack: LogStack,
  level: LogLevel,
  packageName: LogPackage,
  message: string
) => Promise<void>;

export function getAllowedPackages(): {
  backend: string[];
  frontend: string[];
  common: string[];
};
