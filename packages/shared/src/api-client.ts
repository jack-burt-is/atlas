export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiClientConfig {
  baseUrl: string;
  credentials?: RequestCredentials;
  getAuthHeader?: () => Promise<string | null>;
}

export function createApiClient(config: ApiClientConfig) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string>),
    };

    if (config.getAuthHeader) {
      const authHeader = await config.getAuthHeader();
      if (authHeader) headers["Authorization"] = authHeader;
    }

    const res = await fetch(`${config.baseUrl}${path}`, {
      ...init,
      credentials: config.credentials,
      headers,
    });

    if (!res.ok) {
      let message = "Request failed";
      try {
        const body = (await res.json()) as { error?: string };
        message = body.error ?? message;
      } catch {
        // ignore parse error
      }
      throw new ApiError(res.status, message);
    }

    return res.json() as Promise<T>;
  }

  return {
    get: <T>(path: string): Promise<T> => request<T>(path),
    post: <T>(path: string, body?: unknown): Promise<T> =>
      request<T>(path, {
        method: "POST",
        body: body !== undefined ? JSON.stringify(body) : undefined,
      }),
    patch: <T>(path: string, body?: unknown): Promise<T> =>
      request<T>(path, {
        method: "PATCH",
        body: body !== undefined ? JSON.stringify(body) : undefined,
      }),
    delete: <T>(path: string, body?: unknown): Promise<T> =>
      request<T>(path, {
        method: "DELETE",
        body: body !== undefined ? JSON.stringify(body) : undefined,
      }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
