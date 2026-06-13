import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { getDb } from "@atlas/db";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const router = new Hono<AppEnv>();

router.get("/features", requireAuth, async (c) => {
  const user = c.get("user");
  const db = getDb();

  const bboxParam = c.req.query("bbox");
  const typesParam = c.req.query("types") ?? "peaks,trails,landmarks";

  if (!bboxParam) {
    return c.json({ error: "bbox query parameter required (w,s,e,n)" }, 400);
  }

  const parts = bboxParam.split(",").map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) {
    return c.json({ error: "bbox must be four numbers: w,s,e,n" }, 400);
  }
  const [w, s, e, n] = parts as [number, number, number, number];

  const requestedTypes = new Set(typesParam.split(",").map((t) => t.trim()));
  const features: unknown[] = [];

  if (requestedTypes.has("peaks")) {
    const result = await db.execute<{
      id: string;
      name: string;
      slug: string;
      elevation_m: number;
      latitude: number;
      longitude: number;
      collected: boolean;
    }>(sql`
      SELECT
        p.id, p.name, p.slug, p.elevation_m, p.latitude, p.longitude,
        EXISTS (
          SELECT 1 FROM user_peak_log upl
          WHERE upl.peak_id = p.id AND upl.user_id = ${user.id}::uuid
        ) AS collected
      FROM peaks p
      WHERE p.geom IS NOT NULL
        AND ST_Intersects(p.geom, ST_MakeEnvelope(${w}, ${s}, ${e}, ${n}, 4326))
      LIMIT 1000
    `);
    for (const r of result.rows) {
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [r.longitude, r.latitude] },
        properties: {
          id: r.id,
          name: r.name,
          slug: r.slug,
          elevation: r.elevation_m,
          type: "peak",
          status: r.collected ? "collected" : "not_collected",
        },
      });
    }
  }

  if (requestedTypes.has("trails")) {
    const result = await db.execute<{
      id: string;
      name: string;
      slug: string;
      distance_km: number | null;
      geom_json: string;
      total_sections: string;
      completed_sections: string;
    }>(sql`
      SELECT
        t.id, t.name, t.slug, t.distance_km,
        ST_AsGeoJSON(t.geom)::text AS geom_json,
        (SELECT COUNT(*) FROM trail_sections ts WHERE ts.trail_id = t.id) AS total_sections,
        (SELECT COUNT(DISTINCT utp.section_id) FROM user_trail_progress utp
         WHERE utp.trail_id = t.id AND utp.user_id = ${user.id}::uuid) AS completed_sections
      FROM trails t
      WHERE t.geom IS NOT NULL
        AND ST_Intersects(t.geom, ST_MakeEnvelope(${w}, ${s}, ${e}, ${n}, 4326))
      LIMIT 200
    `);
    for (const r of result.rows) {
      if (!r.geom_json) continue;
      const total = parseInt(r.total_sections, 10);
      const done = parseInt(r.completed_sections, 10);
      const status =
        total > 0 && done === total
          ? "collected"
          : done > 0
            ? "in_progress"
            : "not_collected";
      features.push({
        type: "Feature",
        geometry: JSON.parse(r.geom_json),
        properties: {
          id: r.id,
          name: r.name,
          slug: r.slug,
          distanceKm: r.distance_km,
          type: "trail",
          status,
        },
      });
    }
  }

  if (requestedTypes.has("landmarks")) {
    const result = await db.execute<{
      id: string;
      name: string;
      slug: string;
      category: string;
      latitude: number;
      longitude: number;
      collected: boolean;
    }>(sql`
      SELECT
        l.id, l.name, l.slug, l.category, l.latitude, l.longitude,
        EXISTS (
          SELECT 1 FROM user_landmark_log ull
          WHERE ull.landmark_id = l.id AND ull.user_id = ${user.id}::uuid
        ) AS collected
      FROM landmarks l
      WHERE l.geom IS NOT NULL
        AND ST_Intersects(l.geom, ST_MakeEnvelope(${w}, ${s}, ${e}, ${n}, 4326))
      LIMIT 500
    `);
    for (const r of result.rows) {
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [r.longitude, r.latitude] },
        properties: {
          id: r.id,
          name: r.name,
          slug: r.slug,
          category: r.category,
          type: "landmark",
          status: r.collected ? "collected" : "not_collected",
        },
      });
    }
  }

  return c.json({ type: "FeatureCollection", features });
});

router.get("/regions/:slug", requireAuth, async (c) => {
  const user = c.get("user");
  const { slug } = c.req.param();
  const db = getDb();

  const result = await db.execute<{
    id: string;
    name: string;
    slug: string;
    country: string | null;
    geom_json: string | null;
    coverage_pct: string | null;
  }>(sql`
    SELECT
      r.id, r.name, r.slug, r.country,
      ST_AsGeoJSON(r.geom)::text AS geom_json,
      urc.coverage_pct
    FROM regions r
    LEFT JOIN user_region_coverage urc ON urc.region_id = r.id AND urc.user_id = ${user.id}::uuid
    WHERE r.slug = ${slug} AND r.geom IS NOT NULL
    LIMIT 1
  `);

  const row = result.rows[0];
  if (!row || !row.geom_json) return c.json({ error: "Not found" }, 404);

  const pct = row.coverage_pct ? parseFloat(row.coverage_pct) : 0;

  return c.json({
    type: "Feature",
    geometry: JSON.parse(row.geom_json),
    properties: {
      id: row.id,
      name: row.name,
      slug: row.slug,
      country: row.country,
      coveragePct: pct,
      status: pct >= 100 ? "collected" : pct > 0 ? "in_progress" : "not_collected",
    },
  });
});

router.get("/heatmap", requireAuth, async (c) => {
  const user = c.get("user");
  const db = getDb();

  const result = await db.execute<{
    id: string;
    name: string;
    started_at: string;
    geom_json: string;
  }>(sql`
    SELECT id, name, started_at, ST_AsGeoJSON(geom)::text AS geom_json
    FROM activities
    WHERE user_id = ${user.id}::uuid AND geom IS NOT NULL
    ORDER BY started_at DESC
    LIMIT 200
  `);

  const features = result.rows.map((r) => ({
    type: "Feature",
    geometry: JSON.parse(r.geom_json),
    properties: {
      id: r.id,
      name: r.name,
      startedAt: r.started_at,
    },
  }));

  return c.json({ type: "FeatureCollection", features });
});

export default router;
