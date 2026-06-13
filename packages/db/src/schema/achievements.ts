import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  timestamp,
  numeric,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./auth.js";
import { activities } from "./progress.js";

export const achievementTierEnum = pgEnum("achievement_tier", [
  "bronze",
  "silver",
  "gold",
  "platinum",
]);

export const achievementDefinitions = pgTable(
  "achievement_definitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    tier: achievementTierEnum("tier").notNull(),
    points: integer("points").notNull(),
    iconName: text("icon_name"),
    category: text("category"),
    ruleType: text("rule_type").notNull(),
    ruleParams: jsonb("rule_params").notNull().default({}),
    rarity: numeric("rarity", { precision: 5, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("achievement_definitions_slug_idx").on(table.slug),
    tierIdx: index("achievement_definitions_tier_idx").on(table.tier),
  }),
);

export const userAchievements = pgTable(
  "user_achievements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementId: uuid("achievement_id")
      .notNull()
      .references(() => achievementDefinitions.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull(),
    triggerActivityId: uuid("trigger_activity_id").references(
      () => activities.id,
      { onDelete: "set null" },
    ),
  },
  (table) => ({
    uniqueUserAchievement: uniqueIndex(
      "user_achievements_user_achievement_idx",
    ).on(table.userId, table.achievementId),
    userIdx: index("user_achievements_user_id_idx").on(table.userId),
  }),
);

export const userStats = pgTable("user_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  outdoorScore: integer("outdoor_score").notNull().default(0),
  level: integer("level").notNull().default(1),
  totalActivities: integer("total_activities").notNull().default(0),
  totalDistanceM: integer("total_distance_m").notNull().default(0),
  totalElevationGainM: integer("total_elevation_gain_m").notNull().default(0),
  totalSummits: integer("total_summits").notNull().default(0),
  totalDaysOut: integer("total_days_out").notNull().default(0),
  totalCountries: integer("total_countries").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
