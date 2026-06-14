import type { ActivityDetail, ActivitiesListResponse, Activity } from "@atlas/shared";
import { apiDelete, apiGet, apiPatch } from "../lib/api-client";

export type { Activity, ActivityDetail, ActivitiesListResponse } from "@atlas/shared";

export function fetchActivity(id: string): Promise<ActivityDetail> {
  return apiGet(`/activities/${id}`);
}

export function fetchActivities(limit = 20, offset = 0): Promise<ActivitiesListResponse> {
  return apiGet(`/activities?limit=${limit}&offset=${offset}`);
}

export function updateActivity(
  id: string,
  patch: { name?: string; startedAt?: string; endedAt?: string | null },
): Promise<{ activity: Activity }> {
  return apiPatch(`/activities/${id}`, patch);
}

export function deleteActivity(id: string): Promise<{ ok: boolean }> {
  return apiDelete(`/activities/${id}`);
}
