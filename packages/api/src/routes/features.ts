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

router.get("/regions/:slug", requireAuth, async (c) => {
  const user = c.get("user");
  const { slug } = c.req.param();
  const db = getDb();

  const regionRows = await db.execute<{
    id: string;
    name: string;
    slug: string;
    country: string | null;
    description: string | null;
    hero_image: string | null;
  }>(sql`
    SELECT id, name, slug, country, description, hero_image
    FROM regions WHERE slug = ${slug} LIMIT 1
  `);

  const region = regionRows.rows[0];
  if (!region) return c.json({ error: "Not found" }, 404);

  const [coverageRows, statsRows, collectionsRows, missingRows] = await Promise.all([
    db.execute<{ coverage_pct: string }>(sql`
      SELECT coverage_pct FROM user_region_coverage
      WHERE user_id = ${user.id}::uuid AND region_id = ${region.id}::uuid
      LIMIT 1
    `),
    db.execute<{
      total_peaks: string; user_peaks: string;
      total_trails: string; user_trails: string;
      total_landmarks: string; user_landmarks: string;
      total_distance_km: string;
    }>(sql`
      SELECT
        (SELECT COUNT(*) FROM peaks WHERE region = ${region.name}) AS total_peaks,
        (SELECT COUNT(*) FROM user_peak_log upl JOIN peaks p ON p.id = upl.peak_id
         WHERE upl.user_id = ${user.id}::uuid AND p.region = ${region.name}) AS user_peaks,
        (SELECT COUNT(*) FROM trails WHERE region = ${region.name}) AS total_trails,
        (SELECT COUNT(DISTINCT utp.trail_id) FROM user_trail_progress utp JOIN trails t ON t.id = utp.trail_id
         WHERE utp.user_id = ${user.id}::uuid AND t.region = ${region.name}) AS user_trails,
        (SELECT COUNT(*) FROM landmarks WHERE region = ${region.name}) AS total_landmarks,
        (SELECT COUNT(*) FROM user_landmark_log ull JOIN landmarks l ON l.id = ull.landmark_id
         WHERE ull.user_id = ${user.id}::uuid AND l.region = ${region.name}) AS user_landmarks,
        (SELECT COALESCE(SUM(distance_km), 0) FROM trails WHERE region = ${region.name}) AS total_distance_km
    `),
    db.execute<{ id: string; name: string; item_count: number; type: string; user_count: string }>(sql`
      SELECT c.id, c.name, c.item_count, c.type,
        (SELECT COUNT(*) FROM collection_items ci
         WHERE ci.collection_id = c.id AND (
           (ci.item_type = 'peak' AND EXISTS (SELECT 1 FROM user_peak_log upl WHERE upl.peak_id = ci.item_id AND upl.user_id = ${user.id}::uuid))
           OR (ci.item_type = 'landmark' AND EXISTS (SELECT 1 FROM user_landmark_log ull WHERE ull.landmark_id = ci.item_id AND ull.user_id = ${user.id}::uuid))
           OR (ci.item_type = 'trail' AND EXISTS (SELECT 1 FROM user_trail_progress utp WHERE utp.trail_id = ci.item_id AND utp.user_id = ${user.id}::uuid))
         )
        ) AS user_count
      FROM collections c
      WHERE c.region = ${region.name}
      ORDER BY c.sort_order
    `),
    db.execute<{ id: string; name: string; slug: string; elevation_m: number | null }>(sql`
      SELECT p.id, p.name, p.slug, p.elevation_m
      FROM peaks p
      WHERE p.region = ${region.name}
        AND NOT EXISTS (SELECT 1 FROM user_peak_log upl WHERE upl.peak_id = p.id AND upl.user_id = ${user.id}::uuid)
      ORDER BY p.elevation_m DESC NULLS LAST
      LIMIT 10
    `),
  ]);

  const coverage = coverageRows.rows[0];
  const stats = statsRows.rows[0];
  const coveragePct = coverage ? parseFloat(coverage.coverage_pct) : 0;

  const typeColorMap: Record<string, "gold" | "sky" | "spruce"> = {
    peaks: "gold",
    trails: "sky",
    landmarks: "spruce",
  };

  const gapCount = parseInt(
    (await db.execute<{ cnt: string }>(sql`
      SELECT COUNT(*) AS cnt FROM peaks p
      WHERE p.region = ${region.name}
        AND NOT EXISTS (SELECT 1 FROM user_peak_log upl WHERE upl.peak_id = p.id AND upl.user_id = ${user.id}::uuid)
    `)).rows[0]?.cnt ?? "0",
    10,
  );

  return c.json({
    name: region.name,
    slug: region.slug,
    subtitle: region.country ?? region.description ?? "",
    coveragePct,
    heroImage: region.hero_image,
    stats: {
      peaks: {
        value: parseInt(stats?.user_peaks ?? "0", 10),
        total: parseInt(stats?.total_peaks ?? "0", 10),
      },
      trails: {
        value: parseInt(stats?.user_trails ?? "0", 10),
        total: parseInt(stats?.total_trails ?? "0", 10),
      },
      landmarks: {
        value: parseInt(stats?.user_landmarks ?? "0", 10),
        total: parseInt(stats?.total_landmarks ?? "0", 10),
      },
      distanceKm: Math.round(parseFloat(stats?.total_distance_km ?? "0")),
    },
    collections: collectionsRows.rows.map((c) => ({
      name: c.name,
      value: parseInt(c.user_count, 10),
      max: c.item_count,
      color: typeColorMap[c.type],
    })),
    missingNearby: missingRows.rows.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      elevationM: p.elevation_m,
      collected: false,
      image: null,
    })),
    gapCount,
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
