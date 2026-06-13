import { sql } from "drizzle-orm";
import {
  getDb,
  userPeakLog,
  userTrailProgress,
  userLandmarkLog,
  userRegionCoverage,
  userAchievements,
  achievementDefinitions,
  buildEvalContext,
  evaluateRule,
} from "@atlas/db";

type Db = ReturnType<typeof getDb>;

// ─── GPX parsing (mirrors packages/workers/src/lib/gpx-parser.ts) ─────────────

interface GpxPoint {
  lat: number;
  lon: number;
  ele?: number;
  time?: Date;
}

function haversineMetres(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseGpx(xml: string): {
  name?: string;
  startedAt?: Date;
  points: GpxPoint[];
  distanceM: number;
  elevationGainM: number;
  durationSeconds?: number;
} {
  const nameMatch = /<name>([\s\S]*?)<\/name>/i.exec(xml);
  const rawName = nameMatch?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
  const name = rawName || undefined;

  const points: GpxPoint[] = [];
  const trkptRegex = /<trkpt\b([^>]+)>([\s\S]*?)<\/trkpt>/g;
  let match: RegExpExecArray | null;

  while ((match = trkptRegex.exec(xml)) !== null) {
    const attrs = match[1]!;
    const inner = match[2]!;

    const latMatch = /\blat="([^"]+)"/.exec(attrs);
    const lonMatch = /\blon="([^"]+)"/.exec(attrs);
    if (!latMatch || !lonMatch) continue;

    const lat = parseFloat(latMatch[1]!);
    const lon = parseFloat(lonMatch[1]!);
    if (isNaN(lat) || isNaN(lon)) continue;

    const eleMatch = /<ele>([^<]+)<\/ele>/i.exec(inner);
    const timeMatch = /<time>([^<]+)<\/time>/i.exec(inner);

    points.push({
      lat,
      lon,
      ele: eleMatch ? parseFloat(eleMatch[1]!) : undefined,
      time: timeMatch ? new Date(timeMatch[1]!.trim()) : undefined,
    });
  }

  if (points.length < 2) throw new Error(`GPX track has too few points: ${points.length}`);

  let distanceM = 0;
  let elevationGainM = 0;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    distanceM += haversineMetres(prev.lat, prev.lon, curr.lat, curr.lon);
    if (prev.ele !== undefined && curr.ele !== undefined && curr.ele > prev.ele) {
      elevationGainM += curr.ele - prev.ele;
    }
  }

  const startedAt = points[0]?.time;
  const endedAt = points[points.length - 1]?.time;
  const durationSeconds =
    startedAt && endedAt
      ? Math.round((endedAt.getTime() - startedAt.getTime()) / 1000)
      : undefined;

  return {
    name,
    startedAt,
    points,
    distanceM: Math.round(distanceM),
    elevationGainM: Math.round(elevationGainM),
    durationSeconds,
  };
}

function buildLineStringWkt(points: GpxPoint[]): string {
  return `LINESTRING(${points.map((p) => `${p.lon} ${p.lat}`).join(", ")})`;
}

// ─── Reprocess using stored geom (no GPX needed) ─────────────────────────────

export async function reprocessActivity(
  activityId: string,
  userId: string,
  db: Db,
): Promise<void> {
  // Verify the activity has a geom (can't match without it)
  const geomCheck = await db.execute<{ has_geom: boolean }>(sql`
    SELECT geom IS NOT NULL AS has_geom FROM activities WHERE id = ${activityId}::uuid AND user_id = ${userId}::uuid
  `);
  if (!geomCheck.rows[0]?.has_geom) {
    throw new Error("Activity has no geometry — re-upload the GPX to process it");
  }

  // Clear existing matches so we can re-run from scratch
  await db.execute(sql`DELETE FROM user_peak_log WHERE activity_id = ${activityId}::uuid AND user_id = ${userId}::uuid`);
  await db.execute(sql`DELETE FROM user_trail_progress WHERE activity_id = ${activityId}::uuid AND user_id = ${userId}::uuid`);
  await db.execute(sql`DELETE FROM user_landmark_log WHERE activity_id = ${activityId}::uuid AND user_id = ${userId}::uuid`);

  await runMatchingPipeline(activityId, userId, db);
  await recomputeStatsAndAchievements(userId, db);
}

async function runMatchingPipeline(activityId: string, userId: string, db: Db): Promise<void> {
  // ── Peak matching ────────────────────────────────────────────────────────────
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

  // Diagnostic: log closest peaks regardless of radius so we can tune the threshold
  const closest = await db.execute<{ name: string; dist_m: number }>(sql`
    SELECT p.name, ROUND(ST_Distance(p.geom::geography, (SELECT geom::geography FROM activities WHERE id = ${activityId}::uuid))::numeric, 1) AS dist_m
    FROM peaks p WHERE p.geom IS NOT NULL
    ORDER BY ST_Distance(p.geom::geography, (SELECT geom::geography FROM activities WHERE id = ${activityId}::uuid))
    LIMIT 5
  `);
  console.log(`[matching] ${newPeaks.rows.length} peaks within 75m — closest:`, closest.rows.map((r) => `${r.name} ${r.dist_m}m`));
  if (newPeaks.rows.length > 0) {
    const { rows: [actRow] } = await db.execute<{ started_at: string }>(sql`
      SELECT started_at FROM activities WHERE id = ${activityId}::uuid
    `);
    const summitedAt = actRow?.started_at ? new Date(actRow.started_at) : new Date();
    for (const row of newPeaks.rows) {
      await db.insert(userPeakLog).values({ userId, peakId: row.id, activityId, summitedAt });
    }
  }

  // ── Trail section matching ────────────────────────────────────────────────────
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

  if (sections.rows.length > 0) {
    const { rows: [actRow] } = await db.execute<{ started_at: string }>(sql`
      SELECT started_at FROM activities WHERE id = ${activityId}::uuid
    `);
    const completedAt = actRow?.started_at ? new Date(actRow.started_at) : new Date();
    for (const row of sections.rows) {
      await db
        .insert(userTrailProgress)
        .values({ userId, trailId: row.trail_id, sectionId: row.id, activityId, completedAt })
        .onConflictDoNothing();
    }
  }

  // ── Landmark matching ─────────────────────────────────────────────────────────
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

  if (landmarks.rows.length > 0) {
    const { rows: [actRow] } = await db.execute<{ started_at: string }>(sql`
      SELECT started_at FROM activities WHERE id = ${activityId}::uuid
    `);
    const visitedAt = actRow?.started_at ? new Date(actRow.started_at) : new Date();
    for (const row of landmarks.rows) {
      await db
        .insert(userLandmarkLog)
        .values({ userId, landmarkId: row.id, activityId, visitedAt })
        .onConflictDoNothing();
    }
  }

  // ── Region coverage ───────────────────────────────────────────────────────────
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
      .values({ userId, regionId: row.id, coveragePct: row.coverage_pct, lastUpdatedAt: new Date() })
      .onConflictDoUpdate({
        target: [userRegionCoverage.userId, userRegionCoverage.regionId],
        set: { coveragePct: row.coverage_pct, lastUpdatedAt: new Date() },
      });
  }
}

export async function recomputeStatsAndAchievements(userId: string, db: Db): Promise<void> {
  // ── User stats recompute ───────────────────────────────────────────────────
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
        COUNT(*)::int                                                         AS total_activities,
        COALESCE(SUM(distance_m), 0)::int                                    AS total_distance_m,
        COALESCE(SUM(elevation_gain_m), 0)::int                              AS total_elevation_gain_m,
        (SELECT COUNT(*)::int FROM expanded_days)                            AS total_days_out
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
        SELECT p.country FROM user_peak_log upl JOIN peaks p ON p.id = upl.peak_id
        WHERE upl.user_id = ${userId}::uuid AND p.country IS NOT NULL
        UNION
        SELECT l.country FROM user_landmark_log ull JOIN landmarks l ON l.id = ull.landmark_id
        WHERE ull.user_id = ${userId}::uuid AND l.country IS NOT NULL
        UNION
        SELECT r.country FROM user_region_coverage urc JOIN regions r ON r.id = urc.region_id
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
      total_activities       = EXCLUDED.total_activities,
      total_distance_m       = EXCLUDED.total_distance_m,
      total_elevation_gain_m = EXCLUDED.total_elevation_gain_m,
      total_summits          = EXCLUDED.total_summits,
      total_days_out         = EXCLUDED.total_days_out,
      total_countries        = EXCLUDED.total_countries,
      updated_at             = EXCLUDED.updated_at
  `);

  // ── Achievement evaluation ─────────────────────────────────────────────────
  const [ctx, definitions, unlockedRows] = await Promise.all([
    buildEvalContext(userId, db),
    db.select().from(achievementDefinitions),
    db.execute<{ achievement_id: string }>(sql`
      SELECT achievement_id FROM user_achievements WHERE user_id = ${userId}::uuid
    `),
  ]);

  const unlocked = new Set(unlockedRows.rows.map((r) => r.achievement_id));
  const newlyEarned: Array<{ id: string; points: number }> = [];

  for (const def of definitions) {
    if (unlocked.has(def.id)) continue;
    const { current, target } = evaluateRule(
      def.ruleType,
      def.ruleParams as Record<string, unknown>,
      ctx,
    );
    if (current >= target) newlyEarned.push({ id: def.id, points: def.points });
  }

  if (newlyEarned.length === 0) return;

  for (const { id } of newlyEarned) {
    await db
      .insert(userAchievements)
      .values({ userId, achievementId: id, unlockedAt: new Date() })
      .onConflictDoNothing();
  }

  const totalPoints = newlyEarned.reduce((sum, a) => sum + a.points, 0);
  await db.execute(sql`
    UPDATE user_stats SET
      outdoor_score = outdoor_score + ${totalPoints},
      level         = FLOOR(SQRT((outdoor_score + ${totalPoints}) / 100.0))::int + 1,
      updated_at    = NOW()
    WHERE user_id = ${userId}::uuid
  `);
}

// ─── Full processing pipeline (mirrors packages/workers/src/handlers/process-activity.ts) ──

export async function processGpxLocally(
  gpxContent: string,
  activityId: string,
  userId: string,
  db: Db,
): Promise<void> {
  const parsed = parseGpx(gpxContent);
  const wkt = buildLineStringWkt(parsed.points);

  await db.execute(sql`
    UPDATE activities SET
      geom             = ST_GeomFromText(${wkt}, 4326),
      name             = CASE WHEN name = 'Untitled Activity' AND ${parsed.name ?? null}::text IS NOT NULL
                              THEN ${parsed.name ?? null}::text
                              ELSE name END,
      started_at       = COALESCE(${parsed.startedAt ?? null}::timestamptz, started_at),
      duration_seconds = ${parsed.durationSeconds ?? null}::integer,
      distance_m       = ${parsed.distanceM}::integer,
      elevation_gain_m = ${parsed.elevationGainM}::integer,
      processed_at     = NOW()
    WHERE id = ${activityId}::uuid AND user_id = ${userId}::uuid
  `);

  // Diagnostic: verify geom was actually written before matching
  const geomCheck = await db.execute<{ has_geom: boolean }>(sql`
    SELECT geom IS NOT NULL AS has_geom FROM activities WHERE id = ${activityId}::uuid
  `);
  const hasGeom = geomCheck.rows[0]?.has_geom ?? false;
  if (!hasGeom) {
    throw new Error(`GPX geometry was not saved for activity ${activityId} — the file may be corrupt or the upload was incomplete`);
  }

  await runMatchingPipeline(activityId, userId, db);
  await recomputeStatsAndAchievements(userId, db);
}
