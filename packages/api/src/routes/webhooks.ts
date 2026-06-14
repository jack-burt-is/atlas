import { Hono } from "hono";
import Stripe from "stripe";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { eq } from "drizzle-orm";
import { getDb, users } from "@atlas/db";
import type { AppEnv } from "../types.js";

type StravaSyncWebhookMessage = {
  type: "activity";
  stravaAthleteId: string;
  stravaActivityId: number;
};

const router = new Hono<AppEnv>();
const sqs = new SQSClient({});

// ─── GET /webhooks/strava — Strava subscription verification ─────────────────
// Strava calls this once to confirm the endpoint. Respond with the challenge.

router.get("/strava", (c) => {
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");

  const expectedToken = process.env["STRAVA_WEBHOOK_VERIFY_TOKEN"];
  if (!expectedToken) {
    return c.json({ error: "Webhook not configured" }, 503);
  }

  if (mode !== "subscribe" || token !== expectedToken || !challenge) {
    return c.json({ error: "Verification failed" }, 403);
  }

  return c.json({ "hub.challenge": challenge });
});

// ─── POST /webhooks/strava — incoming Strava events ──────────────────────────
// Strava delivers create/update/delete events here. We ack immediately and
// enqueue the activity fetch + processing work.

router.post("/strava", async (c) => {
  let body: Record<string, unknown>;
  try {
    body = await c.req.json<Record<string, unknown>>();
  } catch {
    return c.json({ ok: true });
  }

  const objectType = body["object_type"] as string | undefined;
  const aspectType = body["aspect_type"] as string | undefined;
  const ownerId = body["owner_id"];
  const objectId = body["object_id"];

  if (
    objectType === "activity" &&
    aspectType === "create" &&
    typeof ownerId === "number" &&
    typeof objectId === "number"
  ) {
    const msg: StravaSyncWebhookMessage = {
      type: "activity",
      stravaAthleteId: String(ownerId),
      stravaActivityId: objectId,
    };

    const queueUrl = process.env["STRAVA_SYNC_QUEUE_URL"];
    if (queueUrl) {
      await sqs
        .send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: JSON.stringify(msg) }))
        .catch((err: unknown) => {
          console.error("[webhook/strava] enqueue failed:", err);
        });
    }
  }

  return c.json({ ok: true });
});

// ─── POST /webhooks/stripe — Stripe event handler ────────────────────────────
// Must read raw body BEFORE any JSON parsing; signature verification fails otherwise.

router.post("/stripe", async (c) => {
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];
  const stripeKey = process.env["STRIPE_SECRET_KEY"];

  if (!webhookSecret || !stripeKey) {
    return c.json({ error: "Stripe not configured" }, 503);
  }

  const rawBody = await c.req.text();
  const sig = c.req.header("stripe-signature");

  if (!sig) {
    return c.json({ error: "Missing stripe-signature header" }, 400);
  }

  const stripe = new Stripe(stripeKey);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch {
    return c.json({ error: "Webhook signature verification failed" }, 400);
  }

  const db = getDb();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = session.customer as string | null;
    const subscriptionId = session.subscription as string | null;

    if (customerId) {
      await db
        .update(users)
        .set({
          plan: "pro",
          billingStatus: "active",
          planExpiresAt: null,
          billingSubscriptionId: subscriptionId ?? undefined,
        })
        .where(eq(users.billingCustomerId, customerId));
    }
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    const status = sub.status;

    await db
      .update(users)
      .set({
        billingSubscriptionId: sub.id,
        billingStatus: status === "active" || status === "trialing" ? "active" : status,
        plan: status === "active" || status === "trialing" ? "pro" : "free",
        planExpiresAt: null,
      })
      .where(eq(users.billingCustomerId, customerId));
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;

    await db
      .update(users)
      .set({
        plan: "free",
        billingStatus: "cancelled",
        billingSubscriptionId: null,
        planExpiresAt: null,
      })
      .where(eq(users.billingCustomerId, customerId));
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string | null;

    if (customerId) {
      await db
        .update(users)
        .set({ billingStatus: "past_due" })
        .where(eq(users.billingCustomerId, customerId));
    }
  }

  return c.json({ ok: true });
});

export default router;
