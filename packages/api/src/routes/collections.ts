import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { getDb } from "@atlas/db";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const router = new Hono<AppEnv>();

router.get("/", requireAuth, async (c) => {
  const user = c.get("user");
  const db = getDb();

  const rows = await db.execute<{
    id: string;
    slug: string;
    name: string;
    type: string;
    description: string | null;
    cover_image: string | null;
    region: string | null;
    country: string | null;
    sort_order: number;
    total_count: string;
    completed_count: string;
    pct: string;
  }>(sql`
    WITH progress AS (
      SELECT
        c.id,
        c.slug,
        c.name,
        c.type,
        c.description,
        c.cover_image,
        c.region,
        c.country,
        c.sort_order,
        c.created_at,
        COUNT(ci.id) AS total_count,
        COALESCE(SUM(CASE
          WHEN ci.item_type = 'peak' AND EXISTS (
            SELECT 1 FROM user_peak_log upl
            WHERE upl.peak_id = ci.item_id AND upl.user_id = ${user.id}::uuid
          ) THEN 1
          WHEN ci.item_type = 'landmark' AND EXISTS (
            SELECT 1 FROM user_landmark_log ull
            WHERE ull.landmark_id = ci.item_id AND ull.user_id = ${user.id}::uuid
          ) THEN 1
          WHEN ci.item_type = 'trail'
            AND (SELECT COUNT(*) FROM trail_sections ts WHERE ts.trail_id = ci.item_id) > 0
            AND (SELECT COUNT(*) FROM trail_sections ts WHERE ts.trail_id = ci.item_id)
              = (SELECT COUNT(DISTINCT utp.section_id) FROM user_trail_progress utp
                 WHERE utp.trail_id = ci.item_id AND utp.user_id = ${user.id}::uuid)
            THEN 1
          WHEN ci.item_type = 'region' AND EXISTS (
            SELECT 1 FROM user_region_coverage urc
            WHERE urc.region_id = ci.item_id AND urc.user_id = ${user.id}::uuid
              AND urc.coverage_pct >= 100
          ) THEN 1
          ELSE 0
        END), 0) AS completed_count
      FROM collections c
      LEFT JOIN collection_items ci ON ci.collection_id = c.id
      GROUP BY c.id, c.slug, c.name, c.type, c.description, c.cover_image,
               c.region, c.country, c.sort_order, c.created_at
    )
    SELECT
      *,
      CASE WHEN total_count > 0
        THEN ROUND((completed_count::numeric / total_count) * 100, 1)
        ELSE 0
      END AS pct
    FROM progress
    ORDER BY pct DESC, sort_order ASC
  `);

  return c.json({
    collections: rows.rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      type: r.type,
      description: r.description,
      coverImage: r.cover_image,
      region: r.region,
      country: r.country,
      itemCount: parseInt(r.total_count, 10),
      completedCount: parseInt(r.completed_count, 10),
      pct: parseFloat(r.pct),
    })),
  });
});

router.get("/:slug", requireAuth, async (c) => {
  const user = c.get("user");
  const { slug } = c.req.param();
  const limit = Math.min(parseInt(c.req.query("limit") ?? "100", 10), 100);
  const offset = parseInt(c.req.query("offset") ?? "0", 10);
  const db = getDb();

  const collRows = await db.execute<{
    id: string;
    slug: string;
    name: string;
    type: string;
    description: string | null;
    cover_image: string | null;
    region: string | null;
    country: string | null;
  }>(sql`
    SELECT id, slug, name, type, description, cover_image, region, country
    FROM collections WHERE slug = ${slug} LIMIT 1
  `);

  const collection = collRows.rows[0];
  if (!collection) return c.json({ error: "Not found" }, 404);

  let items: unknown[] = [];

  if (collection.type === "peaks") {
    const result = await db.execute<{
      id: string;
      name: string;
      slug: string;
      elevation_m: number;
      latitude: number;
      longitude: number;
      wiki_url: string | null;
      visit_count: string;
      last_visit: string | null;
    }>(sql`
      SELECT
        p.id, p.name, p.slug, p.elevation_m, p.latitude, p.longitude, p.wiki_url,
        COUNT(upl.id) AS visit_count,
        MAX(upl.summited_at) AS last_visit
      FROM collection_items ci
      JOIN peaks p ON p.id = ci.item_id
      LEFT JOIN user_peak_log upl ON upl.peak_id = p.id AND upl.user_id = ${user.id}::uuid
      WHERE ci.collection_id = ${collection.id}::uuid AND ci.item_type = 'peak'
      GROUP BY p.id, p.name, p.slug, p.elevation_m, p.latitude, p.longitude, p.wiki_url, ci.sort_order
      ORDER BY ci.sort_order
      LIMIT ${limit} OFFSET ${offset}
    `);
    items = result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      elevation: r.elevation_m,
      latitude: r.latitude,
      longitude: r.longitude,
      wikiUrl: r.wiki_url,
      collected: parseInt(r.visit_count, 10) > 0,
      visits: parseInt(r.visit_count, 10),
      lastVisit: r.last_visit ?? null,
    }));
  } else if (collection.type === "landmarks") {
    const result = await db.execute<{
      id: string;
      name: string;
      slug: string;
      category: string;
      latitude: number;
      longitude: number;
      region: string | null;
      visit_count: string;
      last_visit: string | null;
    }>(sql`
      SELECT
        l.id, l.name, l.slug, l.category, l.latitude, l.longitude, l.region,
        COUNT(ull.id) AS visit_count,
        MAX(ull.visited_at) AS last_visit
      FROM collection_items ci
      JOIN landmarks l ON l.id = ci.item_id
      LEFT JOIN user_landmark_log ull ON ull.landmark_id = l.id AND ull.user_id = ${user.id}::uuid
      WHERE ci.collection_id = ${collection.id}::uuid AND ci.item_type = 'landmark'
      GROUP BY l.id, l.name, l.slug, l.category, l.latitude, l.longitude, l.region, ci.sort_order
      ORDER BY ci.sort_order
      LIMIT ${limit} OFFSET ${offset}
    `);
    items = result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      category: r.category,
      latitude: r.latitude,
      longitude: r.longitude,
      region: r.region,
      collected: parseInt(r.visit_count, 10) > 0,
      visits: parseInt(r.visit_count, 10),
      lastVisit: r.last_visit ?? null,
    }));
  } else if (collection.type === "trails") {
    const result = await db.execute<{
      id: string;
      name: string;
      slug: string;
      distance_km: number | null;
      elevation_gain_m: number | null;
      region: string | null;
      country: string | null;
      total_sections: string;
      completed_sections: string;
      last_completed: string | null;
    }>(sql`
      SELECT
        t.id, t.name, t.slug, t.distance_km, t.elevation_gain_m, t.region, t.country,
        (SELECT COUNT(*) FROM trail_sections ts WHERE ts.trail_id = t.id) AS total_sections,
        (SELECT COUNT(DISTINCT utp.section_id) FROM user_trail_progress utp
         WHERE utp.trail_id = t.id AND utp.user_id = ${user.id}::uuid) AS completed_sections,
        (SELECT MAX(utp.completed_at) FROM user_trail_progress utp
         WHERE utp.trail_id = t.id AND utp.user_id = ${user.id}::uuid) AS last_completed
      FROM collection_items ci
      JOIN trails t ON t.id = ci.item_id
      WHERE ci.collection_id = ${collection.id}::uuid AND ci.item_type = 'trail'
      ORDER BY ci.sort_order
      LIMIT ${limit} OFFSET ${offset}
    `);
    items = result.rows.map((r) => {
      const total = parseInt(r.total_sections, 10);
      const done = parseInt(r.completed_sections, 10);
      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        distanceKm: r.distance_km,
        elevationGainM: r.elevation_gain_m,
        region: r.region,
        country: r.country,
        totalSections: total,
        completedSections: done,
        collected: total > 0 && done === total,
        visits: done,
        lastVisit: r.last_completed ?? null,
      };
    });
  } else if (collection.type === "regions") {
    const result = await db.execute<{
      id: string;
      name: string;
      slug: string;
      country: string | null;
      coverage_pct: string | null;
    }>(sql`
      SELECT
        r.id, r.name, r.slug, r.country,
        urc.coverage_pct
      FROM collection_items ci
      JOIN regions r ON r.id = ci.item_id
      LEFT JOIN user_region_coverage urc ON urc.region_id = r.id AND urc.user_id = ${user.id}::uuid
      WHERE ci.collection_id = ${collection.id}::uuid AND ci.item_type = 'region'
      ORDER BY ci.sort_order
      LIMIT ${limit} OFFSET ${offset}
    `);
    items = result.rows.map((r) => {
      const pct = r.coverage_pct ? parseFloat(r.coverage_pct) : 0;
      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        country: r.country,
        coveragePct: pct,
        collected: pct >= 100,
        visits: pct > 0 ? 1 : 0,
        lastVisit: null,
      };
    });
  }

  return c.json({ collection, items });
});

router.get("/:slug/map", requireAuth, async (c) => {
  const user = c.get("user");
  const { slug } = c.req.param();
  const db = getDb();

  const collRows = await db.execute<{
    id: string;
    type: string;
  }>(sql`SELECT id, type FROM collections WHERE slug = ${slug} LIMIT 1`);

  const collection = collRows.rows[0];
  if (!collection) return c.json({ error: "Not found" }, 404);

  const features: unknown[] = [];

  if (collection.type === "peaks") {
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
      FROM collection_items ci
      JOIN peaks p ON p.id = ci.item_id
      WHERE ci.collection_id = ${collection.id}::uuid AND ci.item_type = 'peak'
      ORDER BY ci.sort_order
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
  } else if (collection.type === "landmarks") {
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
      FROM collection_items ci
      JOIN landmarks l ON l.id = ci.item_id
      WHERE ci.collection_id = ${collection.id}::uuid AND ci.item_type = 'landmark'
      ORDER BY ci.sort_order
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
  } else if (collection.type === "trails") {
    const result = await db.execute<{
      id: string;
      name: string;
      slug: string;
      distance_km: number | null;
      geom_json: string | null;
      total_sections: string;
      completed_sections: string;
    }>(sql`
      SELECT
        t.id, t.name, t.slug, t.distance_km,
        ST_AsGeoJSON(t.geom)::text AS geom_json,
        (SELECT COUNT(*) FROM trail_sections ts WHERE ts.trail_id = t.id) AS total_sections,
        (SELECT COUNT(DISTINCT utp.section_id) FROM user_trail_progress utp
         WHERE utp.trail_id = t.id AND utp.user_id = ${user.id}::uuid) AS completed_sections
      FROM collection_items ci
      JOIN trails t ON t.id = ci.item_id
      WHERE ci.collection_id = ${collection.id}::uuid AND ci.item_type = 'trail'
        AND t.geom IS NOT NULL
      ORDER BY ci.sort_order
    `);
    for (const r of result.rows) {
      if (!r.geom_json) continue;
      const total = parseInt(r.total_sections, 10);
      const done = parseInt(r.completed_sections, 10);
      const status = total > 0 && done === total ? "collected" : done > 0 ? "in_progress" : "not_collected";
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
  } else if (collection.type === "regions") {
    const result = await db.execute<{
      id: string;
      name: string;
      slug: string;
      geom_json: string | null;
      coverage_pct: string | null;
    }>(sql`
      SELECT
        r.id, r.name, r.slug,
        ST_AsGeoJSON(r.geom)::text AS geom_json,
        urc.coverage_pct
      FROM collection_items ci
      JOIN regions r ON r.id = ci.item_id
      LEFT JOIN user_region_coverage urc ON urc.region_id = r.id AND urc.user_id = ${user.id}::uuid
      WHERE ci.collection_id = ${collection.id}::uuid AND ci.item_type = 'region'
        AND r.geom IS NOT NULL
      ORDER BY ci.sort_order
    `);
    for (const r of result.rows) {
      if (!r.geom_json) continue;
      const pct = r.coverage_pct ? parseFloat(r.coverage_pct) : 0;
      features.push({
        type: "Feature",
        geometry: JSON.parse(r.geom_json),
        properties: {
          id: r.id,
          name: r.name,
          slug: r.slug,
          coveragePct: pct,
          type: "region",
          status: pct >= 100 ? "collected" : pct > 0 ? "in_progress" : "not_collected",
        },
      });
    }
  }

  return c.json({ type: "FeatureCollection", features });
});

export default router;
