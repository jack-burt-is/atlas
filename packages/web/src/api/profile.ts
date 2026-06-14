import type {
  ProfileStatsResponse,
  ActivityHeatmapResponse,
  SuggestionsResponse,
} from "@atlas/shared";
import { apiGet } from "../lib/api-client";

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
  return apiGet("/profile/stats");
}

export function fetchActivityHeatmap(): Promise<ActivityHeatmapResponse> {
  return apiGet("/profile/activity-heatmap");
}

export function fetchSuggestions(): Promise<SuggestionsResponse> {
  return apiGet("/profile/suggestions");
}
