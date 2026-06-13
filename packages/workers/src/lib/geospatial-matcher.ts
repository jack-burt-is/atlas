import { sql } from "drizzle-orm";
import {
  getDb,
  userPeakLog,
  userTrailProgress,
  userLandmarkLog,
  userRegionCoverage,
} from "@atlas/db";

type Db = ReturnType<typeof getDb>;

// ─── Peak matching ────────────────────────────────────────────────────────────
// No unique constraint on user_peak_log(userId, peakId) — SELECT then INSERT
// to avoid duplicate summits from the same activity (idempotent on retry).
export async function matchPeaks(activityId: string, userId: string, db: Db): Promise<void> {
  const newPeaks = await db.execute<{ id: string }>(sql`
    SELECT p.id
    FROM peaks p
    WHERE p.geom IS NOT NULL
      AND ST_DWithin(
        p.geom::geography,
        (SELECT geom::geography FROM activities WHERE id = ${activityId}::uuid),
        75
      )
      AND NOT EXISTS (
        SELECT 1 FROM user_peak_log upl
        WHERE upl.user_id = ${userId}::uuid AND upl.peak_id = p.id
      )
  `);

  if (newPeaks.rows.length === 0) return;

  const activityRow = await db.execute<{ started_at: string }>(sql`
    SELECT started_at FROM activities WHERE id = ${activityId}::uuid
  `);
  const summitedAt = activityRow.rows[0]?.started_at
    ? new Date(activityRow.rows[0].started_at)
    : new Date();

  for (const row of newPeaks.rows) {
    await db.insert(userPeakLog).values({
      userId,
      peakId: row.id,
      activityId,
      summitedAt,
    });
  }
}

// ─── Trail section matching ───────────────────────────────────────────────────
// Unique constraint on (userId, sectionId) — onConflictDoNothing is safe.
// Must cover ≥75% of the section's length within a 30m corridor of the track.
export async function matchTrailSections(
  activityId: string,
  userId: string,
  db: Db,
): Promise<void> {
  const sections = await db.execute<{ id: string; trail_id: string }>(sql`
    SELECT ts.id, ts.trail_id
    FROM trail_sections ts
    WHERE ts.geom IS NOT NULL
      AND ST_DWithin(
        ts.geom::geography,
        (SELECT geom::geography FROM activities WHERE id = ${activityId}::uuid),
        30
      )
      AND ST_Length(
        ST_Intersection(
          ts.geom::geography,
          ST_Buffer(
            (SELECT geom::geography FROM activities WHERE id = ${activityId}::uuid),
            30
          )
        )
      ) / NULLIF(ST_Length(ts.geom::geography), 0) > 0.75
  `);

  if (sections.rows.length === 0) return;

  const activityRow = await db.execute<{ started_at: string }>(sql`
    SELECT started_at FROM activities WHERE id = ${activityId}::uuid
  `);
  const completedAt = activityRow.rows[0]?.started_at
    ? new Date(activityRow.rows[0].started_at)
    : new Date();

  for (const row of sections.rows) {
    await db
      .insert(userTrailProgress)
      .values({
        userId,
        trailId: row.trail_id,
        sectionId: row.id,
        activityId,
        completedAt,
      })
      .onConflictDoNothing();
  }
}

// ─── Landmark matching ────────────────────────────────────────────────────────
// Unique constraint on (userId, landmarkId) — onConflictDoNothing is safe.
export async function matchLandmarks(activityId: string, userId: string, db: Db): Promise<void> {
  const landmarks = await db.execute<{ id: string }>(sql`
    SELECT l.id
    FROM landmarks l
    WHERE l.geom IS NOT NULL
      AND ST_DWithin(
        l.geom::geography,
        (SELECT geom::geography FROM activities WHERE id = ${activityId}::uuid),
        50
      )
  `);

  if (landmarks.rows.length === 0) return;

  const activityRow = await db.execute<{ started_at: string }>(sql`
    SELECT started_at FROM activities WHERE id = ${activityId}::uuid
  `);
  const visitedAt = activityRow.rows[0]?.started_at
    ? new Date(activityRow.rows[0].started_at)
    : new Date();

  for (const row of landmarks.rows) {
    await db
      .insert(userLandmarkLog)
      .values({
        userId,
        landmarkId: row.id,
        activityId,
        visitedAt,
      })
      .onConflictDoNothing();
  }
}

// ─── Region coverage ──────────────────────────────────────────────────────────
// Cumulative: unions ALL user activities' buffered corridors (0.0005° ≈ 50m)
// against each intersecting region. Ratio uses geometry (degrees²) — units
// cancel since both numerator and denominator share the same projection.
export async function matchRegions(activityId: string, userId: string, db: Db): Promise<void> {
  const coverage = await db.execute<{ id: string; coverage_pct: string }>(sql`
    SELECT
      r.id,
      LEAST(100,
        ROUND((
          ST_Area(ST_Intersection(
            r.geom,
            (
              SELECT ST_Union(ST_Buffer(a.geom, 0.0005))
              FROM activities a
              WHERE a.user_id = ${userId}::uuid AND a.geom IS NOT NULL
            )
          ))
          / NULLIF(ST_Area(r.geom), 0) * 100
        )::numeric, 2)
      ) AS coverage_pct
    FROM regions r
    WHERE r.geom IS NOT NULL
      AND ST_Intersects(
        r.geom,
        ST_Buffer(
          (SELECT geom FROM activities WHERE id = ${activityId}::uuid),
          0.0005
        )
      )
  `);

  for (const row of coverage.rows) {
    await db
      .insert(userRegionCoverage)
      .values({
        userId,
        regionId: row.id,
        coveragePct: row.coverage_pct,
        lastUpdatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userRegionCoverage.userId, userRegionCoverage.regionId],
        set: {
          coveragePct: row.coverage_pct,
          lastUpdatedAt: new Date(),
        },
      });
  }
}

// ─── User stats recompute ─────────────────────────────────────────────────────
// Recomputes activity and peak aggregates. Does NOT touch outdoorScore/level —
// those are computed by the achievement engine (Prompt 9).
export async function recomputeUserStats(userId: string, db: Db): Promise<void> {
  await db.execute(sql`
    WITH expanded_days AS (
      SELECT DISTINCT gs.d AS activity_day
      FROM activities a,
        LATERAL generate_series(
          date_trunc('day', a.started_at AT TIME ZONE 'UTC')::timestamp,
          date_trunc('day', COALESCE(a.ended_at, a.started_at) AT TIME ZONE 'UTC')::timestamp,
          interval '1 day'
        ) gs(d)
      WHERE a.user_id = ${userId}::uuid AND a.processed_at IS NOT NULL
    ),
    activity_stats AS (
      SELECT
        COUNT(*)::int                                                      AS total_activities,
        COALESCE(SUM(distance_m), 0)::int                                 AS total_distance_m,
        COALESCE(SUM(elevation_gain_m), 0)::int                           AS total_elevation_gain_m,
        (SELECT COUNT(*)::int FROM expanded_days)                         AS total_days_out
      FROM activities
      WHERE user_id = ${userId}::uuid AND processed_at IS NOT NULL
    ),
    peak_stats AS (
      SELECT COUNT(*)::int AS total_summits
      FROM user_peak_log
      WHERE user_id = ${userId}::uuid
    ),
    country_stats AS (
      SELECT COUNT(DISTINCT country)::int AS total_countries
      FROM (
        SELECT p.country
        FROM user_peak_log upl JOIN peaks p ON p.id = upl.peak_id
        WHERE upl.user_id = ${userId}::uuid AND p.country IS NOT NULL
        UNION
        SELECT l.country
        FROM user_landmark_log ull JOIN landmarks l ON l.id = ull.landmark_id
        WHERE ull.user_id = ${userId}::uuid AND l.country IS NOT NULL
        UNION
        SELECT r.country
        FROM user_region_coverage urc JOIN regions r ON r.id = urc.region_id
        WHERE urc.user_id = ${userId}::uuid AND r.country IS NOT NULL AND urc.coverage_pct > 0
      ) c
    )
    INSERT INTO user_stats (
      id, user_id,
      total_activities, total_distance_m, total_elevation_gain_m,
      total_summits, total_days_out, total_countries,
      updated_at
    )
    SELECT
      gen_random_uuid(), ${userId}::uuid,
      a.total_activities, a.total_distance_m, a.total_elevation_gain_m,
      p.total_summits, a.total_days_out, c.total_countries,
      NOW()
    FROM activity_stats a, peak_stats p, country_stats c
    ON CONFLICT (user_id) DO UPDATE SET
      total_activities      = EXCLUDED.total_activities,
      total_distance_m      = EXCLUDED.total_distance_m,
      total_elevation_gain_m = EXCLUDED.total_elevation_gain_m,
      total_summits         = EXCLUDED.total_summits,
      total_days_out        = EXCLUDED.total_days_out,
      total_countries       = EXCLUDED.total_countries,
      updated_at            = EXCLUDED.updated_at
  `);
}
