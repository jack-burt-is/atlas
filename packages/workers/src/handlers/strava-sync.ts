import { Logger } from "@aws-lambda-powertools/logger";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import type { SQSHandler } from "aws-lambda";
import { getDb, userIdentities, activities } from "@atlas/db";
import { and, eq, sql } from "drizzle-orm";
import {
  getActivities,
  getActivityStreams,
  refreshStravaToken,
  latlngToLineStringWkt,
  StravaApiError,
  type StravaActivitySummary,
} from "../lib/strava-client.js";
import type { ProcessActivityMessage } from "./process-activity.js";

const logger = new Logger({ serviceName: "strava-sync" });
const sqs = new SQSClient({});

export type StravaSyncMessage =
  | { type: "full_sync"; userId: string }
  | { type: "activity"; stravaAthleteId: string; stravaActivityId: number };

type Db = ReturnType<typeof getDb>;

// ─── Token refresh helper ─────────────────────────────────────────────────────

async function ensureFreshToken(
  userId: string,
  db: Db,
): Promise<string> {
  const rows = await db
    .select()
    .from(userIdentities)
    .where(and(eq(userIdentities.userId, userId), eq(userIdentities.provider, "strava")))
    .limit(1);

  const identity = rows[0];
  if (!identity?.accessToken || !identity.refreshToken) {
    throw new Error(`No Strava identity for user ${userId}`);
  }

  const fiveMinutes = 5 * 60 * 1000;
  const needsRefresh =
    !identity.tokenExpiresAt ||
    identity.tokenExpiresAt.getTime() < Date.now() + fiveMinutes;

  if (!needsRefresh) return identity.accessToken;

  const refreshed = await refreshStravaToken(identity.refreshToken);

  await db
    .update(userIdentities)
    .set({
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token,
      tokenExpiresAt: new Date(refreshed.expires_at * 1000),
    })
    .where(and(eq(userIdentities.userId, userId), eq(userIdentities.provider, "strava")));

  return refreshed.access_token;
}

// ─── Import a single Strava activity ─────────────────────────────────────────

async function importStravaActivity(
  userId: string,
  summary: StravaActivitySummary,
  accessToken: string,
  db: Db,
): Promise<void> {
  const stravaId = String(summary.id);

  const existing = await db
    .select({ id: activities.id })
    .from(activities)
    .where(
      and(
        eq(activities.userId, userId),
        eq(activities.sourceType, "strava"),
        eq(activities.sourceId, stravaId),
      ),
    )
    .limit(1);

  if (existing[0]) return;

  const latlng = await getActivityStreams(accessToken, summary.id);
  const wkt = latlng ? latlngToLineStringWkt(latlng) : null;

  const [activity] = await db
    .insert(activities)
    .values({
      userId,
      sourceType: "strava",
      sourceId: stravaId,
      name: summary.name,
      startedAt: new Date(summary.start_date),
      durationSeconds: summary.elapsed_time || null,
      distanceM: Math.round(summary.distance) || null,
      elevationGainM: Math.round(summary.total_elevation_gain) || null,
    })
    .returning({ id: activities.id });

  if (!activity) return;

  if (wkt) {
    await db.execute(sql`
      UPDATE activities
      SET geom = ST_GeomFromText(${wkt}, 4326)
      WHERE id = ${activity.id}::uuid
    `);
  }

  await enqueueProcessActivity({ activityId: activity.id, userId });
}

// ─── Full history sync ────────────────────────────────────────────────────────

async function syncFullHistory(userId: string, db: Db): Promise<void> {
  const accessToken = await ensureFreshToken(userId, db);
  let page = 1;
  let imported = 0;

  for (;;) {
    let page_activities: StravaActivitySummary[];
    try {
      page_activities = await getActivities(accessToken, page);
    } catch (err) {
      if (err instanceof StravaApiError && err.status === 401) {
        throw new Error(`Strava token invalid for user ${userId}`);
      }
      throw err;
    }

    if (page_activities.length === 0) break;

    for (const summary of page_activities) {
      try {
        await importStravaActivity(userId, summary, accessToken, db);
        imported++;
      } catch (err) {
        logger.warn("Failed to import Strava activity", {
          userId,
          stravaId: String(summary.id),
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    page++;
  }

  await db
    .update(userIdentities)
    .set({ updatedAt: new Date() })
    .where(and(eq(userIdentities.userId, userId), eq(userIdentities.provider, "strava")));

  logger.info("Strava full sync complete", { userId, imported });
}

// ─── Single activity (webhook-triggered) ─────────────────────────────────────

async function syncSingleActivity(
  stravaAthleteId: string,
  stravaActivityId: number,
  db: Db,
): Promise<void> {
  const rows = await db
    .select()
    .from(userIdentities)
    .where(
      and(
        eq(userIdentities.provider, "strava"),
        eq(userIdentities.providerId, stravaAthleteId),
      ),
    )
    .limit(1);

  if (!rows[0]) {
    logger.warn("No user found for Strava athlete", { stravaAthleteId });
    return;
  }

  const resolvedUserId = rows[0].userId;
  const accessToken = await ensureFreshToken(resolvedUserId, db);

  const summary: StravaActivitySummary = await fetch(
    `https://www.strava.com/api/v3/activities/${stravaActivityId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  ).then((r) => {
    if (!r.ok) throw new StravaApiError(r.status, "activity fetch failed", `/activities/${stravaActivityId}`);
    return r.json() as Promise<StravaActivitySummary>;
  });

  await importStravaActivity(resolvedUserId, summary, accessToken, db);
}

// ─── SQS enqueue helper ───────────────────────────────────────────────────────

async function enqueueProcessActivity(msg: ProcessActivityMessage): Promise<void> {
  const queueUrl = process.env["PROCESS_ACTIVITY_QUEUE_URL"];
  if (!queueUrl) return;
  await sqs.send(
    new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: JSON.stringify(msg) }),
  );
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export const handler: SQSHandler = async (event) => {
  const db = getDb();
  for (const record of event.Records) {
    const msg = JSON.parse(record.body) as StravaSyncMessage;
    try {
      if (msg.type === "full_sync") {
        await syncFullHistory(msg.userId, db);
      } else {
        await syncSingleActivity(msg.stravaAthleteId, msg.stravaActivityId, db);
      }
    } catch (err) {
      logger.error("Strava sync failed", {
        msg,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }
};
