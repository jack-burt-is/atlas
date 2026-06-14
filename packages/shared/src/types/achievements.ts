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
  unlockedAt: string | null;
  progress: { value: number; max: number } | null;
  rarity: number;
}

export interface AchievementsResponse {
  achievements: Achievement[];
}
