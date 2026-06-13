import { apiDelete, apiGet, apiPatch } from "../lib/api-client";

export interface Activity {
  id: string;
  name: string;
  startedAt: string;
  endedAt: string | null;
  distanceM: number | null;
  elevationGainM: number | null;
  durationSeconds: number | null;
  processedAt: string | null;
  sourceType: string;
}

export interface ActivityDetail {
  activity: Activity;
  matchedPeaks: Array<{ peakId: string }>;
  matchedSections: Array<{ sectionId: string }>;
  matchedLandmarks: Array<{ landmarkId: string }>;
}

export interface ActivitiesListResponse {
  activities: Activity[];
}

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
