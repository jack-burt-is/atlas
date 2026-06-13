import { Hono } from "hono";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
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

export default router;
