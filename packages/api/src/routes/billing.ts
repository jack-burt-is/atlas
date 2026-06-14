import { Hono } from "hono";
import Stripe from "stripe";
import { eq, and, gte, count } from "drizzle-orm";
import { getDb, users, planKeys, activities } from "@atlas/db";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const router = new Hono<AppEnv>();

function getStripe() {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw new Error("Stripe not configured");
  return new Stripe(key);
}

// ─── GET /billing ─────────────────────────────────────────────────────────────

router.get("/", requireAuth, async (c) => {
  const user = c.get("user");
  const db = getDb();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [gpxThisMonth] = await db
    .select({ count: count() })
    .from(activities)
    .where(
      and(
        eq(activities.userId, user.id),
        eq(activities.sourceType, "gpx"),
        gte(activities.createdAt, startOfMonth),
      ),
    );

  const isPro = user.plan === "pro" && (!user.planExpiresAt || user.planExpiresAt > now);

  return c.json({
    plan: user.plan,
    billingStatus: user.billingStatus,
    planExpiresAt: user.planExpiresAt?.toISOString() ?? null,
    isPro,
    limits: {
      gpxImportsPerMonth: isPro ? null : 3,
      gpxImportsUsedThisMonth: gpxThisMonth?.count ?? 0,
    },
  });
});

// ─── POST /billing/checkout ───────────────────────────────────────────────────

router.post("/checkout", requireAuth, async (c) => {
  const user = c.get("user");
  const stripe = getStripe();
  const priceId = process.env["STRIPE_PRICE_ID_PRO"];
  const frontendUrl = process.env["FRONTEND_URL"] ?? "http://localhost:5173";

  if (!priceId) {
    return c.json({ error: "Pro plan not configured" }, 503);
  }

  let customerId = user.billingCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;

    const db = getDb();
    await db
      .update(users)
      .set({ billingCustomerId: customerId })
      .where(eq(users.id, user.id));
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${frontendUrl}/plan?checkout=success`,
    cancel_url: `${frontendUrl}/plan?checkout=cancelled`,
    allow_promotion_codes: true,
  });

  return c.json({ url: session.url });
});

// ─── POST /billing/portal ─────────────────────────────────────────────────────

router.post("/portal", requireAuth, async (c) => {
  const user = c.get("user");
  const stripe = getStripe();
  const frontendUrl = process.env["FRONTEND_URL"] ?? "http://localhost:5173";

  if (!user.billingCustomerId) {
    return c.json({ error: "No billing account found" }, 400);
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.billingCustomerId,
    return_url: `${frontendUrl}/plan`,
  });

  return c.json({ url: session.url });
});

// ─── POST /billing/redeem-key ─────────────────────────────────────────────────

router.post("/redeem-key", requireAuth, async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{ code?: string }>();

  if (!body.code?.trim()) {
    return c.json({ error: "Key code is required" }, 400);
  }

  const db = getDb();
  const code = body.code.trim().toUpperCase();

  const [key] = await db
    .select()
    .from(planKeys)
    .where(eq(planKeys.code, code))
    .limit(1);

  if (!key) {
    return c.json({ error: "Invalid key" }, 404);
  }

  if (key.redeemedAt) {
    return c.json({ error: "This key has already been redeemed" }, 409);
  }

  const now = new Date();
  const planExpiresAt = key.durationDays
    ? new Date(now.getTime() + key.durationDays * 24 * 60 * 60 * 1000)
    : null;

  await db.transaction(async (tx) => {
    await tx
      .update(planKeys)
      .set({ redeemedAt: now, redeemedByUserId: user.id })
      .where(eq(planKeys.id, key.id));

    await tx
      .update(users)
      .set({
        plan: key.plan,
        planExpiresAt: planExpiresAt ?? undefined,
        billingStatus: "active",
      })
      .where(eq(users.id, user.id));
  });

  return c.json({
    ok: true,
    plan: key.plan,
    expiresAt: planExpiresAt?.toISOString() ?? null,
  });
});

export default router;
