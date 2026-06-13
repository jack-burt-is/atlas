import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { getDb } from "@atlas/db";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const router = new Hono<AppEnv>();

router.get("/stats", requireAuth, async (c) => {
  const user = c.get("user");
  const db = getDb();

  const [statsResult, recentUnlocksResult, activityDatesResult] = await Promise.all([
    db.execute<{
      outdoor_score: number;
      level: number;
      total_activities: number;
      total_distance_m: number;
      total_elevation_gain_m: number;
      total_summits: number;
      total_days_out: number;
      total_countries: number;
      updated_at: string;
    }>(sql`
      SELECT outdoor_score, level, total_activities, total_distance_m,
             total_elevation_gain_m, total_summits, total_days_out,
             total_countries, updated_at
      FROM user_stats WHERE user_id = ${user.id}::uuid LIMIT 1
    `),

    db.execute<{
      achievement_id: string;
      unlocked_at: string;
      slug: string;
      name: string;
      description: string;
      tier: string;
      points: number;
      icon_name: string | null;
    }>(sql`
      SELECT ua.achievement_id, ua.unlocked_at,
             ad.slug, ad.name, ad.description, ad.tier, ad.points, ad.icon_name
      FROM user_achievements ua
      JOIN achievement_definitions ad ON ad.id = ua.achievement_id
      WHERE ua.user_id = ${user.id}::uuid
      ORDER BY ua.unlocked_at DESC
      LIMIT 3
    `),

    db.execute<{ activity_date: string }>(sql`
      SELECT DISTINCT DATE(started_at AT TIME ZONE 'UTC')::text AS activity_date
      FROM activities
      WHERE user_id = ${user.id}::uuid
        AND started_at >= NOW() - INTERVAL '90 days'
      ORDER BY activity_date DESC
    `),
  ]);

  const stats = statsResult.rows[0];
  const score = stats?.outdoor_score ?? 0;
  const level = stats?.level ?? 1;
  const levelProgress = Math.floor(Math.sqrt(score / 100)) + 1 === level
    ? (score % (level * 100)) / (level * 100)
    : 0;

  const streaks = computeStreaks(activityDatesResult.rows.map((r) => r.activity_date));

  return c.json({
    stats: stats
      ? {
          outdoorScore: score,
          level,
          levelProgress,
          toNextLevel: level * level * 100 - score,
          totalActivities: stats.total_activities,
          totalDistanceM: stats.total_distance_m,
          totalElevationGainM: stats.total_elevation_gain_m,
          totalSummits: stats.total_summits,
          totalDaysOut: stats.total_days_out,
          totalCountries: stats.total_countries,
          updatedAt: stats.updated_at,
        }
      : {
          outdoorScore: 0,
          level: 1,
          levelProgress: 0,
          toNextLevel: 100,
          totalActivities: 0,
          totalDistanceM: 0,
          totalElevationGainM: 0,
          totalSummits: 0,
          totalDaysOut: 0,
          totalCountries: 0,
          updatedAt: null,
        },
    recentUnlocks: recentUnlocksResult.rows.map((r) => ({
      achievementId: r.achievement_id,
      unlockedAt: r.unlocked_at,
      slug: r.slug,
      name: r.name,
      description: r.description,
      tier: r.tier,
      points: r.points,
      iconName: r.icon_name,
    })),
    streaks,
  });
});

router.get("/activity-heatmap", requireAuth, async (c) => {
  const user = c.get("user");
  const db = getDb();

  const result = await db.execute<{ date: string; count: string }>(sql`
    SELECT
      gs.d::date::text AS date,
      COUNT(*)::text AS count
    FROM activities a,
      LATERAL generate_series(
        date_trunc('day', a.started_at AT TIME ZONE 'UTC')::timestamp,
        date_trunc('day', COALESCE(a.ended_at, a.started_at) AT TIME ZONE 'UTC')::timestamp,
        interval '1 day'
      ) gs(d)
    WHERE a.user_id = ${user.id}::uuid
      AND a.started_at >= NOW() - INTERVAL '365 days'
    GROUP BY gs.d::date
    ORDER BY date ASC
  `);

  return c.json({
    data: result.rows.map((r) => ({
      date: r.date,
      count: parseInt(r.count, 10),
    })),
  });
});

router.get("/suggestions", requireAuth, async (c) => {
  const user = c.get("user");
  const db = getDb();

  // Find 5 nearest uncollected peaks to user's most-covered region centroid.
  // Falls back to last activity centroid, then to UK centre if no data.
  const result = await db.execute<{
    item_type: string;
    id: string;
    name: string;
    slug: string;
    elevation: number | null;
    latitude: number;
    longitude: number;
  }>(sql`
    WITH user_location AS (
      SELECT COALESCE(
        (
          SELECT ST_Centroid(r.geom)
          FROM regions r
          JOIN user_region_coverage urc ON urc.region_id = r.id
          WHERE urc.user_id = ${user.id}::uuid AND r.geom IS NOT NULL
          ORDER BY urc.coverage_pct DESC
          LIMIT 1
        ),
        (
          SELECT ST_Centroid(a.geom)
          FROM activities a
          WHERE a.user_id = ${user.id}::uuid AND a.geom IS NOT NULL
          ORDER BY a.started_at DESC
          LIMIT 1
        ),
        ST_SetSRID(ST_MakePoint(-2.5, 54.0), 4326)
      ) AS point
    )
    SELECT
      'peak' AS item_type,
      p.id,
      p.name,
      p.slug,
      p.elevation_m AS elevation,
      p.latitude,
      p.longitude
    FROM peaks p, user_location
    WHERE p.geom IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM user_peak_log upl
        WHERE upl.peak_id = p.id AND upl.user_id = ${user.id}::uuid
      )
    ORDER BY p.geom <-> user_location.point
    LIMIT 5
  `);

  return c.json({
    suggestions: result.rows.map((r) => ({
      itemType: r.item_type,
      id: r.id,
      name: r.name,
      slug: r.slug,
      elevation: r.elevation,
      latitude: r.latitude,
      longitude: r.longitude,
    })),
  });
});

function computeStreaks(sortedDatesDesc: string[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (sortedDatesDesc.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const today = new Date().toISOString().split("T")[0]!;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]!;

  let currentStreak = 0;
  if (sortedDatesDesc[0] === today || sortedDatesDesc[0] === yesterday) {
    currentStreak = 1;
    for (let i = 1; i < sortedDatesDesc.length; i++) {
      const daysBetween =
        (new Date(sortedDatesDesc[i - 1]!).getTime() -
          new Date(sortedDatesDesc[i]!).getTime()) /
        86400000;
      if (daysBetween === 1) currentStreak++;
      else break;
    }
  }

  let longestStreak = sortedDatesDesc.length > 0 ? 1 : 0;
  let streak = 1;
  for (let i = 1; i < sortedDatesDesc.length; i++) {
    const daysBetween =
      (new Date(sortedDatesDesc[i - 1]!).getTime() -
        new Date(sortedDatesDesc[i]!).getTime()) /
      86400000;
    if (daysBetween === 1) {
      streak++;
      if (streak > longestStreak) longestStreak = streak;
    } else {
      streak = 1;
    }
  }

  return { currentStreak, longestStreak };
}

export default router;
