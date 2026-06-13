import { sql } from "drizzle-orm";
import type { getDb } from "./client.js";

type Db = ReturnType<typeof getDb>;

export interface EvalContext {
  totalSummits: number;
  totalCountries: number;
  totalLandmarks: number;
  /** Max distance_m across all processed activities. */
  maxActivityDistanceM: number;
  /** Whether any processed activity started before 05:00 UTC. */
  hasEarlyStart: boolean;
  /** Elevation of the highest summited peak. */
  maxSummitElevationM: number;
  /**
   * Max number of peaks ≥ 800 m reached in a single activity.
   * Hardcoded to 800 m because that's the only seeded multi_peak_day threshold.
   */
  maxPeaksAbove800mInOneActivity: number;
  /** collection slug → { completed, total } — peaks and landmarks only. */
  collectionProgress: Record<string, { completed: number; total: number }>;
  /** trail slug → { done, total } — live section counts. */
  trailProgress: Record<string, { done: number; total: number }>;
  /** region slug → coverage pct (0–100). */
  regionCoverage: Record<string, number>;
}

export async function buildEvalContext(userId: string, db: Db): Promise<EvalContext> {
  const [
    statsRows,
    landmarkRows,
    maxDistRows,
    earlyStartRows,
    maxElevRows,
    multiPeakRows,
    collectionRows,
    trailRows,
    regionRows,
  ] = await Promise.all([
    db.execute<{ total_summits: number; total_countries: number }>(sql`
      SELECT total_summits, total_countries
      FROM user_stats WHERE user_id = ${userId}::uuid LIMIT 1
    `),
    db.execute<{ count: string }>(sql`
      SELECT COUNT(*)::text AS count
      FROM user_landmark_log WHERE user_id = ${userId}::uuid
    `),
    db.execute<{ max_dist: string }>(sql`
      SELECT COALESCE(MAX(distance_m), 0)::text AS max_dist
      FROM activities
      WHERE user_id = ${userId}::uuid AND processed_at IS NOT NULL
    `),
    db.execute<{ has_early: boolean }>(sql`
      SELECT EXISTS (
        SELECT 1 FROM activities
        WHERE user_id = ${userId}::uuid
          AND EXTRACT(HOUR FROM started_at AT TIME ZONE 'UTC') < 5
          AND processed_at IS NOT NULL
      ) AS has_early
    `),
    db.execute<{ max_elev: string }>(sql`
      SELECT COALESCE(MAX(p.elevation_m), 0)::text AS max_elev
      FROM user_peak_log upl
      JOIN peaks p ON p.id = upl.peak_id
      WHERE upl.user_id = ${userId}::uuid
    `),
    db.execute<{ max_count: string }>(sql`
      SELECT COALESCE(MAX(cnt), 0)::text AS max_count
      FROM (
        SELECT upl.activity_id, COUNT(*) AS cnt
        FROM user_peak_log upl
        JOIN peaks p ON p.id = upl.peak_id
        WHERE upl.user_id = ${userId}::uuid
          AND p.elevation_m >= 800
          AND upl.activity_id IS NOT NULL
        GROUP BY upl.activity_id
      ) t
    `),
    // Peaks + landmarks only; trails/regions counted separately via trail_complete / region_coverage rules.
    db.execute<{ slug: string; completed: string; total: string }>(sql`
      SELECT
        c.slug,
        COUNT(ci.id)::text AS total,
        COALESCE(SUM(CASE
          WHEN ci.item_type = 'peak' AND EXISTS (
            SELECT 1 FROM user_peak_log upl
            WHERE upl.peak_id = ci.item_id AND upl.user_id = ${userId}::uuid
          ) THEN 1
          WHEN ci.item_type = 'landmark' AND EXISTS (
            SELECT 1 FROM user_landmark_log ull
            WHERE ull.landmark_id = ci.item_id AND ull.user_id = ${userId}::uuid
          ) THEN 1
          ELSE 0
        END), 0)::text AS completed
      FROM collections c
      JOIN collection_items ci ON ci.collection_id = c.id
      GROUP BY c.slug
    `),
    // Live section counts (not the denormalised trails.section_count which may be stale).
    db.execute<{ slug: string; done: string; total: string }>(sql`
      SELECT
        t.slug,
        (SELECT COUNT(*) FROM trail_sections ts WHERE ts.trail_id = t.id)::text AS total,
        COALESCE(
          (SELECT COUNT(DISTINCT utp.section_id)
           FROM user_trail_progress utp
           WHERE utp.trail_id = t.id AND utp.user_id = ${userId}::uuid)::text,
          '0'
        ) AS done
      FROM trails t
    `),
    db.execute<{ slug: string; pct: string }>(sql`
      SELECT r.slug, COALESCE(urc.coverage_pct::text, '0') AS pct
      FROM regions r
      LEFT JOIN user_region_coverage urc
        ON urc.region_id = r.id AND urc.user_id = ${userId}::uuid
    `),
  ]);

  const collectionProgress: EvalContext["collectionProgress"] = {};
  for (const r of collectionRows.rows) {
    collectionProgress[r.slug] = {
      completed: parseInt(r.completed, 10),
      total: parseInt(r.total, 10),
    };
  }

  const trailProgress: EvalContext["trailProgress"] = {};
  for (const r of trailRows.rows) {
    trailProgress[r.slug] = {
      done: parseInt(r.done, 10),
      total: parseInt(r.total, 10),
    };
  }

  const regionCoverage: EvalContext["regionCoverage"] = {};
  for (const r of regionRows.rows) {
    regionCoverage[r.slug] = parseFloat(r.pct);
  }

  return {
    totalSummits: statsRows.rows[0]?.total_summits ?? 0,
    totalCountries: statsRows.rows[0]?.total_countries ?? 0,
    totalLandmarks: parseInt(landmarkRows.rows[0]?.count ?? "0", 10),
    maxActivityDistanceM: parseInt(maxDistRows.rows[0]?.max_dist ?? "0", 10),
    hasEarlyStart: earlyStartRows.rows[0]?.has_early ?? false,
    maxSummitElevationM: parseInt(maxElevRows.rows[0]?.max_elev ?? "0", 10),
    maxPeaksAbove800mInOneActivity: parseInt(multiPeakRows.rows[0]?.max_count ?? "0", 10),
    collectionProgress,
    trailProgress,
    regionCoverage,
  };
}

/**
 * Pure function — no DB access. Returns { current, target } so callers can
 * compute both earned (current >= target) and progress (current / target).
 */
export function evaluateRule(
  ruleType: string,
  ruleParams: Record<string, unknown>,
  ctx: EvalContext,
): { current: number; target: number } {
  switch (ruleType) {
    case "peak_count":
      return { current: ctx.totalSummits, target: ruleParams["count"] as number };

    case "peak_elevation":
      return { current: ctx.maxSummitElevationM, target: ruleParams["metres"] as number };

    case "multi_peak_day":
      return {
        current: ctx.maxPeaksAbove800mInOneActivity,
        target: ruleParams["count"] as number,
      };

    case "activity_distance":
      return { current: ctx.maxActivityDistanceM, target: ruleParams["distanceM"] as number };

    case "early_start":
      return { current: ctx.hasEarlyStart ? 1 : 0, target: 1 };

    case "collection_complete": {
      const slug = ruleParams["collectionSlug"] as string;
      const p = ctx.collectionProgress[slug] ?? { completed: 0, total: 1 };
      return { current: p.completed, target: p.total };
    }

    case "trail_complete": {
      const slug = ruleParams["trailSlug"] as string;
      const p = ctx.trailProgress[slug] ?? { done: 0, total: 1 };
      return { current: p.done, target: p.total };
    }

    case "landmark_count":
      return { current: ctx.totalLandmarks, target: ruleParams["count"] as number };

    case "distinct_countries":
      return { current: ctx.totalCountries, target: ruleParams["count"] as number };

    case "region_coverage": {
      const slug = ruleParams["regionSlug"] as string;
      const pct = ctx.regionCoverage[slug] ?? 0;
      return { current: pct, target: ruleParams["pct"] as number };
    }

    default:
      return { current: 0, target: 1 };
  }
}
