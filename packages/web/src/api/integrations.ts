import { apiPost, apiDelete, apiGet } from "../lib/api-client";

export interface StravaStatus {
  connected: boolean;
  lastSyncAt?: string | null;
  activityCount?: number;
  isSyncing?: boolean;
}

export function fetchStravaStatus(): Promise<StravaStatus> {
  return apiGet("/integrations/strava/status");
}

export function triggerStravaSync(): Promise<{ ok: boolean; message: string }> {
  return apiPost("/integrations/strava/sync");
}

export function disconnectStrava(): Promise<{ ok: boolean }> {
  return apiDelete("/integrations/strava");
}
