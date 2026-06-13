/**
 * Seed achievement definitions. Safe to re-run — conflicts on slug are ignored.
 * Run with: pnpm --filter @atlas/db seed:achievements
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { achievementDefinitions } from "../schema/index.js";

const DEFINITIONS: (typeof achievementDefinitions.$inferInsert)[] = [
  // ─── Peak count ──────────────────────────────────────────────────────────────
  {
    slug: "first-summit",
    name: "First Summit",
    description: "Reach the top of your first peak.",
    tier: "bronze",
    points: 25,
    iconName: "mountain",
    category: "peaks",
    ruleType: "peak_count",
    ruleParams: { count: 1 },
  },
  {
    slug: "ten-summits",
    name: "Ten Summits",
    description: "Summit 10 unique peaks.",
    tier: "bronze",
    points: 25,
    iconName: "mountain",
    category: "peaks",
    ruleType: "peak_count",
    ruleParams: { count: 10 },
  },
  {
    slug: "fifty-summits",
    name: "Fifty Summits",
    description: "Summit 50 unique peaks.",
    tier: "silver",
    points: 50,
    iconName: "mountain",
    category: "peaks",
    ruleType: "peak_count",
    ruleParams: { count: 50 },
  },
  {
    slug: "hundred-summits",
    name: "Hundred Summits",
    description: "Summit 100 unique peaks.",
    tier: "gold",
    points: 100,
    iconName: "mountain",
    category: "peaks",
    ruleType: "peak_count",
    ruleParams: { count: 100 },
  },

  // ─── Peak elevation ──────────────────────────────────────────────────────────
  {
    slug: "first-1000m",
    name: "Above the Clouds",
    description: "Summit a peak reaching 1,000 m or higher.",
    tier: "bronze",
    points: 25,
    iconName: "cloud",
    category: "peaks",
    ruleType: "peak_elevation",
    ruleParams: { metres: 1000 },
  },

  // ─── Multi-peak day ──────────────────────────────────────────────────────────
  {
    slug: "triple-800m-day",
    name: "Triple Crown",
    description: "Bag 3 peaks all above 800 m in a single outing.",
    tier: "silver",
    points: 50,
    iconName: "trophy",
    category: "peaks",
    ruleType: "multi_peak_day",
    ruleParams: { minElevationM: 800, count: 3 },
  },

  // ─── Activity distance ───────────────────────────────────────────────────────
  {
    slug: "hike-50km-day",
    name: "Ultra Distance",
    description: "Complete a single activity covering 50 km or more.",
    tier: "gold",
    points: 100,
    iconName: "route",
    category: "activities",
    ruleType: "activity_distance",
    ruleParams: { distanceM: 50000 },
  },

  // ─── Early start ─────────────────────────────────────────────────────────────
  {
    slug: "night-out",
    name: "Early Riser",
    description: "Start an activity before 5 am.",
    tier: "bronze",
    points: 25,
    iconName: "moon",
    category: "activities",
    ruleType: "early_start",
    ruleParams: { beforeHour: 5 },
  },

  // ─── Collection completions ──────────────────────────────────────────────────
  {
    slug: "complete-wainwrights",
    name: "Wainwright Completer",
    description: "Summit all 214 Wainwright fells in the Lake District.",
    tier: "platinum",
    points: 250,
    iconName: "star",
    category: "collections",
    ruleType: "collection_complete",
    ruleParams: { collectionSlug: "wainwrights" },
  },
  {
    slug: "complete-munros",
    name: "Munroist",
    description: "Summit all 282 Scottish Munros.",
    tier: "platinum",
    points: 250,
    iconName: "star",
    category: "collections",
    ruleType: "collection_complete",
    ruleParams: { collectionSlug: "munros" },
  },

  // ─── Trail completions ───────────────────────────────────────────────────────
  {
    slug: "complete-pennine-way",
    name: "Pennine Way Finisher",
    description: "Walk the full length of the Pennine Way.",
    tier: "gold",
    points: 100,
    iconName: "footprints",
    category: "trails",
    ruleType: "trail_complete",
    ruleParams: { trailSlug: "pennine-way" },
  },
  {
    slug: "complete-swcp",
    name: "SWCP Finisher",
    description: "Complete the entire South West Coast Path.",
    tier: "gold",
    points: 100,
    iconName: "footprints",
    category: "trails",
    ruleType: "trail_complete",
    ruleParams: { trailSlug: "south-west-coast-path" },
  },

  // ─── Landmarks ───────────────────────────────────────────────────────────────
  {
    slug: "hundred-landmarks",
    name: "Landmark Hunter",
    description: "Visit 100 unique landmarks.",
    tier: "silver",
    points: 50,
    iconName: "flag",
    category: "landmarks",
    ruleType: "landmark_count",
    ruleParams: { count: 100 },
  },

  // ─── Countries ───────────────────────────────────────────────────────────────
  {
    slug: "four-countries",
    name: "Four Nations",
    description: "Explore peaks or landmarks in 4 distinct countries.",
    tier: "gold",
    points: 100,
    iconName: "globe",
    category: "exploration",
    ruleType: "distinct_countries",
    ruleParams: { count: 4 },
  },

  // ─── Region coverage ─────────────────────────────────────────────────────────
  {
    slug: "explore-50pct-lake-district",
    name: "Lake District Explorer",
    description: "Explore 50% of the Lake District.",
    tier: "bronze",
    points: 25,
    iconName: "map",
    category: "regions",
    ruleType: "region_coverage",
    ruleParams: { regionSlug: "lake-district", pct: 50 },
  },
  {
    slug: "explore-100pct-lake-district",
    name: "Lake District Master",
    description: "Fully explore the Lake District.",
    tier: "gold",
    points: 100,
    iconName: "map",
    category: "regions",
    ruleType: "region_coverage",
    ruleParams: { regionSlug: "lake-district", pct: 100 },
  },
  {
    slug: "explore-50pct-scottish-highlands",
    name: "Highlands Explorer",
    description: "Explore 50% of the Scottish Highlands.",
    tier: "bronze",
    points: 25,
    iconName: "map",
    category: "regions",
    ruleType: "region_coverage",
    ruleParams: { regionSlug: "scottish-highlands", pct: 50 },
  },
  {
    slug: "explore-100pct-scottish-highlands",
    name: "Highlands Master",
    description: "Fully explore the Scottish Highlands.",
    tier: "gold",
    points: 100,
    iconName: "map",
    category: "regions",
    ruleType: "region_coverage",
    ruleParams: { regionSlug: "scottish-highlands", pct: 100 },
  },
];

export async function seed() {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) throw new Error("DATABASE_URL is required");

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  for (const def of DEFINITIONS) {
    await db.insert(achievementDefinitions).values(def).onConflictDoNothing();
  }

  await pool.end();
  console.log(`Seeded ${DEFINITIONS.length} achievement definitions.`);
}

import { fileURLToPath } from "url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
