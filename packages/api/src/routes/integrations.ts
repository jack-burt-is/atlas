import { Hono } from "hono";
import { and, count, eq } from "drizzle-orm";
import { getDb, userIdentities, activities } from "@atlas/db";
import { requireAuth } from "../middleware/auth.js";
import { enqueueStravaSync } from "../lib/sqs.js";
import type { AppEnv } from "../types.js";

const router = new Hono<AppEnv>();

// ─── POST /integrations/strava/sync ──────────────────────────────────────────

router.post("/strava/sync", requireAuth, async (c) => {
  const user = c.get("user");
  const db = getDb();

  const rows = await db
    .select({ id: userIdentities.id })
    .from(userIdentities)
    .where(
      and(eq(userIdentities.userId, user.id), eq(userIdentities.provider, "strava")),
    )
    .limit(1);

  if (!rows[0]) {
    return c.json({ error: "Strava not connected" }, 400);
  }

  await enqueueStravaSync({ type: "full_sync", userId: user.id });

  return c.json({ ok: true, message: "Strava sync queued" });
});

// ─── GET /integrations/strava/status ─────────────────────────────────────────

router.get("/strava/status", requireAuth, async (c) => {
  const user = c.get("user");
  const db = getDb();

  const identityRows = await db
    .select({
      updatedAt: userIdentities.updatedAt,
      tokenExpiresAt: userIdentities.tokenExpiresAt,
    })
    .from(userIdentities)
    .where(
      and(eq(userIdentities.userId, user.id), eq(userIdentities.provider, "strava")),
    )
    .limit(1);

  const identity = identityRows[0];
  if (!identity) {
    return c.json({ connected: false });
  }

  const [countRow] = await db
    .select({ value: count() })
    .from(activities)
    .where(
      and(eq(activities.userId, user.id), eq(activities.sourceType, "strava")),
    );

  return c.json({
    connected: true,
    lastSyncAt: identity.updatedAt ?? null,
    activityCount: countRow?.value ?? 0,
    isSyncing: false,
  });
});

// ─── DELETE /integrations/strava ─────────────────────────────────────────────

router.delete("/strava", requireAuth, async (c) => {
  const user = c.get("user");
  const db = getDb();

  const rows = await db
    .select({ accessToken: userIdentities.accessToken })
    .from(userIdentities)
    .where(
      and(eq(userIdentities.userId, user.id), eq(userIdentities.provider, "strava")),
    )
    .limit(1);

  const identity = rows[0];
  if (!identity) {
    return c.json({ error: "Strava not connected" }, 400);
  }

  if (identity.accessToken) {
    try {
      await fetch("https://www.strava.com/oauth/deauthorize", {
        method: "POST",
        headers: { Authorization: `Bearer ${identity.accessToken}` },
      });
    } catch {
      // Deauthorize is best-effort — proceed to local cleanup even if Strava is unreachable
    }
  }

  await db
    .delete(userIdentities)
    .where(
      and(eq(userIdentities.userId, user.id), eq(userIdentities.provider, "strava")),
    );

  return c.json({ ok: true });
});

export default router;
