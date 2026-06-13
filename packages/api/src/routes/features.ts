import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { getDb } from "@atlas/db";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const router = new Hono<AppEnv>();

router.get("/peaks/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();
  const db = getDb();

  const peakRows = await db.execute<{
    id: string;
    name: string;
    slug: string;
    elevation_m: number;
    prominence_m: number | null;
    latitude: number;
    longitude: number;
    collections: string[];
    country: string | null;
    region: string | null;
    tags: string[];
    wiki_url: string | null;
    created_at: string;
  }>(sql`
    SELECT id, name, slug, elevation_m, prominence_m, latitude, longitude,
           collections, country, region, tags, wiki_url, created_at
    FROM peaks WHERE id = ${id}::uuid LIMIT 1
  `);

  const peak = peakRows.rows[0];
  if (!peak) return c.json({ error: "Not found" }, 404);

  const logRows = await db.execute<{
    id: string;
    activity_id: string | null;
    summited_at: string;
    notes: string | null;
    created_at: string;
  }>(sql`
    SELECT id, activity_id, summited_at, notes, created_at
    FROM user_peak_log
    WHERE user_id = ${user.id}::uuid AND peak_id = ${id}::uuid
    ORDER BY summited_at DESC
  `);

  return c.json({ peak, userLog: logRows.rows });
});

router.get("/trails/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();
  const db = getDb();

  const trailRows = await db.execute<{
    id: string;
    name: string;
    slug: string;
    country: string | null;
    region: string | null;
    distance_km: number | null;
    elevation_gain_m: number | null;
    section_count: number;
    description: string | null;
    created_at: string;
  }>(sql`
    SELECT id, name, slug, country, region, distance_km, elevation_gain_m,
           section_count, description, created_at
    FROM trails WHERE id = ${id}::uuid LIMIT 1
  `);

  const trail = trailRows.rows[0];
  if (!trail) return c.json({ error: "Not found" }, 404);

  const sectionRows = await db.execute<{
    id: string;
    section_number: number;
    name: string | null;
    distance_km: number | null;
    completed: boolean;
    completed_at: string | null;
  }>(sql`
    SELECT
      ts.id,
      ts.section_number,
      ts.name,
      ts.distance_km,
      EXISTS (
        SELECT 1 FROM user_trail_progress utp
        WHERE utp.section_id = ts.id AND utp.user_id = ${user.id}::uuid
      ) AS completed,
      (SELECT utp.completed_at FROM user_trail_progress utp
       WHERE utp.section_id = ts.id AND utp.user_id = ${user.id}::uuid
       LIMIT 1) AS completed_at
    FROM trail_sections ts
    WHERE ts.trail_id = ${id}::uuid
    ORDER BY ts.section_number
  `);

  const sections = sectionRows.rows;
  const completedCount = sections.filter((s) => s.completed).length;

  return c.json({
    trail,
    sections,
    userProgress: {
      completedSections: completedCount,
      totalSections: sections.length,
      pct: sections.length > 0 ? Math.round((completedCount / sections.length) * 100) : 0,
    },
  });
});

router.get("/regions", requireAuth, async (c) => {
  const user = c.get("user");
  const db = getDb();

  const rows = await db.execute<{
    id: string;
    name: string;
    slug: string;
    country: string | null;
    coverage_pct: string | null;
  }>(sql`
    SELECT r.id, r.name, r.slug, r.country,
           urc.coverage_pct
    FROM regions r
    LEFT JOIN user_region_coverage urc
      ON urc.region_id = r.id AND urc.user_id = ${user.id}::uuid
    ORDER BY urc.coverage_pct DESC NULLS LAST, r.name
  `);

  return c.json({
    regions: rows.rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      country: r.country,
      coveragePct: r.coverage_pct ? parseFloat(r.coverage_pct) : 0,
    })),
  });
});

router.get("/regions/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();
  const db = getDb();

  const regionRows = await db.execute<{
    id: string;
    name: string;
    slug: string;
    country: string | null;
    description: string | null;
    created_at: string;
  }>(sql`
    SELECT id, name, slug, country, description, created_at
    FROM regions WHERE id = ${id}::uuid LIMIT 1
  `);

  const region = regionRows.rows[0];
  if (!region) return c.json({ error: "Not found" }, 404);

  const coverageRows = await db.execute<{
    coverage_pct: string;
    last_updated_at: string;
  }>(sql`
    SELECT coverage_pct, last_updated_at
    FROM user_region_coverage
    WHERE user_id = ${user.id}::uuid AND region_id = ${id}::uuid
    LIMIT 1
  `);

  const coverage = coverageRows.rows[0];

  const statsRows = await db.execute<{
    peak_count: string;
    landmark_count: string;
  }>(sql`
    SELECT
      (SELECT COUNT(*) FROM user_peak_log upl
       JOIN peaks p ON p.id = upl.peak_id
       WHERE upl.user_id = ${user.id}::uuid AND p.region = ${region.name}) AS peak_count,
      (SELECT COUNT(*) FROM user_landmark_log ull
       JOIN landmarks l ON l.id = ull.landmark_id
       WHERE ull.user_id = ${user.id}::uuid AND l.region = ${region.name}) AS landmark_count
  `);

  const stats = statsRows.rows[0];

  return c.json({
    region,
    userCoverage: coverage
      ? {
          coveragePct: parseFloat(coverage.coverage_pct),
          lastUpdatedAt: coverage.last_updated_at,
        }
      : { coveragePct: 0, lastUpdatedAt: null },
    stats: {
      peakCount: parseInt(stats?.peak_count ?? "0", 10),
      landmarkCount: parseInt(stats?.landmark_count ?? "0", 10),
    },
  });
});

router.get("/landmarks/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();
  const db = getDb();

  const landmarkRows = await db.execute<{
    id: string;
    name: string;
    slug: string;
    category: string;
    latitude: number;
    longitude: number;
    region: string | null;
    country: string | null;
    description: string | null;
    created_at: string;
  }>(sql`
    SELECT id, name, slug, category, latitude, longitude, region, country, description, created_at
    FROM landmarks WHERE id = ${id}::uuid LIMIT 1
  `);

  const landmark = landmarkRows.rows[0];
  if (!landmark) return c.json({ error: "Not found" }, 404);

  const visitRows = await db.execute<{
    id: string;
    activity_id: string | null;
    visited_at: string;
  }>(sql`
    SELECT id, activity_id, visited_at
    FROM user_landmark_log
    WHERE user_id = ${user.id}::uuid AND landmark_id = ${id}::uuid
    ORDER BY visited_at DESC
  `);

  return c.json({ landmark, userVisits: visitRows.rows });
});

export default router;
