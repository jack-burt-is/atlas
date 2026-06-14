import { createApiClient } from "@atlas/shared";

const _client = createApiClient({
  baseUrl: import.meta.env["VITE_API_URL"] ?? "/api",
  credentials: "include",
});

export const apiGet = <T>(path: string): Promise<T> => _client.get<T>(path);
export const apiPost = <T>(path: string, body?: unknown): Promise<T> => _client.post<T>(path, body);
export const apiPatch = <T>(path: string, body?: unknown): Promise<T> => _client.patch<T>(path, body);
export const apiDelete = <T>(path: string, body?: unknown): Promise<T> => _client.delete<T>(path, body);
