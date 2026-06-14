import { Hono, type MiddlewareHandler } from "hono";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { getDb, planKeys, users } from "@atlas/db";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const router = new Hono<AppEnv>();

const requireAdmin: MiddlewareHandler<AppEnv> = async (c, next) => {
  const user = c.get("user");
  if (!user.isAdmin) {
    return c.json({ error: "Forbidden" }, 403);
  }
  await next();
};

function generateKeyCode() {
  const hex = randomBytes(8).toString("hex").toUpperCase();
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`;
}

// ─── GET /admin/plan-keys ─────────────────────────────────────────────────────

router.get("/plan-keys", requireAuth, requireAdmin, async (c) => {
  const db = getDb();

  const keys = await db
    .select({
      id: planKeys.id,
      code: planKeys.code,
      plan: planKeys.plan,
      durationDays: planKeys.durationDays,
      note: planKeys.note,
      redeemedAt: planKeys.redeemedAt,
      redeemedByUserId: planKeys.redeemedByUserId,
      createdAt: planKeys.createdAt,
      redeemedByEmail: users.email,
    })
    .from(planKeys)
    .leftJoin(users, eq(planKeys.redeemedByUserId, users.id))
    .orderBy(planKeys.createdAt);

  return c.json({ keys });
});

// ─── POST /admin/plan-keys ────────────────────────────────────────────────────

router.post("/plan-keys", requireAuth, requireAdmin, async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{
    plan?: string;
    durationDays?: number;
    note?: string;
  }>();

  const plan = body.plan ?? "pro";
  if (!["pro"].includes(plan)) {
    return c.json({ error: "Invalid plan. Must be 'pro'" }, 400);
  }

  const db = getDb();
  const code = generateKeyCode();

  const [key] = await db
    .insert(planKeys)
    .values({
      code,
      plan,
      durationDays: body.durationDays ?? null,
      note: body.note ?? null,
      createdByUserId: user.id,
    })
    .returning();

  return c.json({ key }, 201);
});

// ─── DELETE /admin/plan-keys/:keyId ──────────────────────────────────────────

router.delete("/plan-keys/:keyId", requireAuth, requireAdmin, async (c) => {
  const keyId = c.req.param("keyId");
  const db = getDb();

  const [key] = await db
    .select({ id: planKeys.id, redeemedAt: planKeys.redeemedAt })
    .from(planKeys)
    .where(eq(planKeys.id, keyId))
    .limit(1);

  if (!key) return c.json({ error: "Key not found" }, 404);
  if (key.redeemedAt) return c.json({ error: "Cannot delete a redeemed key" }, 409);

  await db.delete(planKeys).where(eq(planKeys.id, keyId));

  return c.json({ ok: true });
});

export default router;
