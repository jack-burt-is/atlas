import { createApiClient } from "@atlas/shared";
import { getSessionToken } from "./auth-store";

const API_BASE = process.env["EXPO_PUBLIC_API_URL"] ?? "http://localhost:3000";

export const apiClient = createApiClient({
  baseUrl: API_BASE,
  getAuthHeader: async () => {
    const token = await getSessionToken();
    return token ? `Bearer ${token}` : null;
  },
});
