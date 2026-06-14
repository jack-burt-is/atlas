import type { AchievementsResponse } from "@atlas/shared";
import { apiClient } from "./client";

export type { AchievementTier, Achievement, AchievementsResponse } from "@atlas/shared";

export function fetchAchievements(): Promise<AchievementsResponse> {
  return apiClient.get("/achievements");
}
