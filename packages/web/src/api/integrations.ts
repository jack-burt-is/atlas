import type { StravaStatus } from "@atlas/shared";
import { apiPost, apiDelete, apiGet } from "../lib/api-client";

export type { StravaStatus } from "@atlas/shared";

export function fetchStravaStatus(): Promise<StravaStatus> {
  return apiGet("/integrations/strava/status");
}

export function triggerStravaSync(): Promise<{ ok: boolean; message: string }> {
  return apiPost("/integrations/strava/sync");
}

export function disconnectStrava(): Promise<{ ok: boolean }> {
  return apiDelete("/integrations/strava");
}
