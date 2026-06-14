import type { AchievementsResponse } from "@atlas/shared";
import { apiGet } from "../lib/api-client";

export type { AchievementTier, Achievement, AchievementsResponse } from "@atlas/shared";

export function fetchAchievements(): Promise<AchievementsResponse> {
  return apiGet("/achievements");
}
