import { apiGet } from "../lib/api-client";

export interface ProfileStats {
  outdoorScore: number;
  level: number;
  levelProgress: number; // 0–1
  toNextLevel: number;
  totalActivities: number;
  totalDistanceM: number;
  totalElevationGainM: number;
  totalSummits: number;
  totalDaysOut: number;
  totalCountries: number;
  updatedAt: string | null;
}

export interface RecentUnlock {
  achievementId: string;
  unlockedAt: string;
  slug: string;
  name: string;
  description: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  points: number;
  iconName: string;
}

export interface ProfileStatsResponse {
  stats: ProfileStats;
  recentUnlocks: RecentUnlock[];
  streaks: { currentStreak: number; longestStreak: number };
}

export interface HeatmapEntry {
  date: string;
  count: number;
}

export interface ActivityHeatmapResponse {
  data: HeatmapEntry[];
}

export interface Suggestion {
  itemType: string;
  id: string;
  name: string;
  slug: string;
  elevation: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface SuggestionsResponse {
  suggestions: Suggestion[];
}

export function fetchProfileStats(): Promise<ProfileStatsResponse> {
  return apiGet("/profile/stats");
}

export function fetchActivityHeatmap(): Promise<ActivityHeatmapResponse> {
  return apiGet("/profile/activity-heatmap");
}

export function fetchSuggestions(): Promise<SuggestionsResponse> {
  return apiGet("/profile/suggestions");
}
