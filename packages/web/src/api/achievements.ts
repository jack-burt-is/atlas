import { apiGet } from "../lib/api-client";

export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  tier: AchievementTier;
  points: number;
  iconName: string;
  category: string;
  unlocked: boolean;
  unlockedAt: string | null; // ISO date string e.g. "2026-04-15"
  progress: { value: number; max: number } | null;
  rarity: number; // percentage of explorers who have this
}

export interface AchievementsResponse {
  achievements: Achievement[];
}

export function fetchAchievements(): Promise<AchievementsResponse> {
  return apiGet("/achievements");
}
