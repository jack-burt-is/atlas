import type {
  ProfileStatsResponse,
  ActivityHeatmapResponse,
  SuggestionsResponse,
} from "@atlas/shared";
import { apiClient } from "./client";

export type {
  ProfileStats,
  RecentUnlock,
  ProfileStatsResponse,
  HeatmapEntry,
  ActivityHeatmapResponse,
  Suggestion,
  SuggestionsResponse,
} from "@atlas/shared";

export function fetchProfileStats(): Promise<ProfileStatsResponse> {
  return apiClient.get("/profile/stats");
}

export function fetchActivityHeatmap(): Promise<ActivityHeatmapResponse> {
  return apiClient.get("/profile/activity-heatmap");
}

export function fetchSuggestions(): Promise<SuggestionsResponse> {
  return apiClient.get("/profile/suggestions");
}
