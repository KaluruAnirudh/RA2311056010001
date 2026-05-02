const BACKEND_PACKAGES = [
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service"
];

const FRONTEND_PACKAGES = [
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style"
];

const COMMON_PACKAGES = ["auth", "config", "middleware", "utils"];
const ALLOWED_PACKAGES = new Set([
  ...BACKEND_PACKAGES,
  ...FRONTEND_PACKAGES,
  ...COMMON_PACKAGES
]);
const ALLOWED_LEVELS = new Set(["debug", "info", "warn", "error", "fatal"]);
const ALLOWED_STACKS = new Set(["backend", "frontend"]);

function assertLogPayload(stack, level, packageName, message) {
  if (!ALLOWED_STACKS.has(stack)) {
    throw new Error(`Unsupported stack: ${stack}`);
  }

  if (!ALLOWED_LEVELS.has(level)) {
    throw new Error(`Unsupported log level: ${level}`);
  }

  if (!ALLOWED_PACKAGES.has(packageName)) {
    throw new Error(`Unsupported package: ${packageName}`);
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    throw new Error("Log message must be a non-empty string");
  }
}

async function fetchWithTimeout(url, init, fetchImpl, timeoutMs = 4000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetchImpl(url, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

export function createTokenProvider(config) {
  return {
    getAccessToken() {
      if (!config?.accessToken || config.accessToken.trim().length === 0) {
        throw new Error("A bearer access token is required");
      }

      return config.accessToken.trim();
    }
  };
}

export function createProtectedApiClient(config, fetchImpl = fetch) {
  if (!config?.baseUrl) {
    throw new Error("baseUrl is required");
  }

  if (!config?.tokenProvider) {
    throw new Error("tokenProvider is required");
  }

  async function request(path, init = {}) {
    const token = config.tokenProvider.getAccessToken();
    const response = await fetchWithTimeout(
      `${config.baseUrl}${path}`,
      {
        ...init,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          ...(init.headers ?? {})
        }
      },
      fetchImpl,
      config.timeoutMs
    );

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      throw new Error(
        `Protected API request failed with status ${response.status}${bodyText ? `: ${bodyText}` : ""}`
      );
    }

    return response;
  }

  return {
    async getJson(path) {
      const response = await request(path, { method: "GET" });
      return response.json();
    },
    async postJson(path, payload) {
      const response = await request(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      return response.json();
    }
  };
}

export function createEvaluationLogger(config, fetchImpl = fetch) {
  if (!config?.logsUrl) {
    throw new Error("logsUrl is required");
  }

  if (!config?.tokenProvider) {
    throw new Error("tokenProvider is required");
  }

  return async function Log(stack, level, packageName, message) {
    assertLogPayload(stack, level, packageName, message);

    const token = config.tokenProvider.getAccessToken();
    const response = await fetchWithTimeout(
      config.logsUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          stack,
          level,
          package: packageName,
          message
        })
      },
      fetchImpl,
      config.timeoutMs
    );

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      throw new Error(
        `Log request failed with status ${response.status}${bodyText ? `: ${bodyText}` : ""}`
      );
    }
  };
}

export function getAllowedPackages() {
  return {
    backend: [...BACKEND_PACKAGES],
    frontend: [...FRONTEND_PACKAGES],
    common: [...COMMON_PACKAGES]
  };
}
