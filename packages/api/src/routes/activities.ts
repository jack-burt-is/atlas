import { Hono } from "hono";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  getDb,
  activities,
  userPeakLog,
  userTrailProgress,
  userLandmarkLog,
} from "@atlas/db";
import { eq, and, gte, count, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { enqueueProcessActivity } from "../lib/sqs.js";
import { processGpxLocally, reprocessActivity, recomputeStatsAndAchievements } from "../lib/local-gpx-processor.js";
import type { AppEnv } from "../types.js";

const router = new Hono<AppEnv>();
const s3 = new S3Client({});

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const GPX_MONTHLY_LIMIT_FREE = 3;

function isUploadedFile(
  v: unknown,
): v is { arrayBuffer(): Promise<ArrayBuffer>; size: number; name: string } {
  return typeof v === "object" && v !== null && typeof (v as File).arrayBuffer === "function";
}

router.post("/upload", requireAuth, async (c) => {
  const user = c.get("user");
  const bucket = process.env["UPLOADS_BUCKET"];
  const db = getDb();
  const now = new Date();

  const isPro = user.plan === "pro" && (!user.planExpiresAt || user.planExpiresAt > now);

  if (!isPro) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [row] = await db
      .select({ count: count() })
      .from(activities)
      .where(
        and(
          eq(activities.userId, user.id),
          eq(activities.sourceType, "gpx"),
          gte(activities.createdAt, startOfMonth),
        ),
      );
    if ((row?.count ?? 0) >= GPX_MONTHLY_LIMIT_FREE) {
      return c.json(
        {
          error: `Free plan limit: ${GPX_MONTHLY_LIMIT_FREE} GPX imports per month. Upgrade to Pro for unlimited imports.`,
          limitReached: true,
        },
        402,
      );
    }
  }

  const body = await c.req.parseBody();
  const gpxFile = body["gpx"];

  if (!isUploadedFile(gpxFile)) {
    return c.json({ error: "Expected a GPX file in the 'gpx' field" }, 400);
  }
  if (gpxFile.size > MAX_FILE_SIZE) {
    return c.json({ error: "File too large (max 50MB)" }, 413);
  }

  const buffer = Buffer.from(await gpxFile.arrayBuffer());

  const [activity] = await db
    .insert(activities)
    .values({
      userId: user.id,
      sourceType: "gpx",
      name: "Untitled Activity",
      startedAt: now,
    })
    .returning({ id: activities.id });

  if (!activity) return c.json({ error: "Failed to create activity" }, 500);

  if (!bucket) {
    await processGpxLocally(buffer.toString("utf-8"), activity.id, user.id, db);
    return c.json({ activityId: activity.id, status: "processed" });
  }

  const s3Key = `gpx/${user.id}/${activity.id}.gpx`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: buffer,
      ContentType: "application/gpx+xml",
    }),
  );

  await enqueueProcessActivity({ activityId: activity.id, userId: user.id, s3Key });

  return c.json({ activityId: activity.id, status: "processing" }, 202);
});

router.get("/", requireAuth, async (c) => {
  const user = c.get("user");
  const db = getDb();

  const limit = Math.min(parseInt(c.req.query("limit") ?? "20", 10), 100);
  const offset = parseInt(c.req.query("offset") ?? "0", 10);

  const rows = await db
    .select()
    .from(activities)
    .where(eq(activities.userId, user.id))
    .orderBy(desc(activities.startedAt))
    .limit(limit)
    .offset(offset);

  return c.json({ activities: rows });
});

router.get("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();
  const db = getDb();

  const [activity] = await db
    .select()
    .from(activities)
    .where(and(eq(activities.id, id), eq(activities.userId, user.id)))
    .limit(1);

  if (!activity) return c.json({ error: "Not found" }, 404);

  const [peaks, sections, landmarks] = await Promise.all([
    db
      .select()
      .from(userPeakLog)
      .where(eq(userPeakLog.activityId, id)),
    db
      .select()
      .from(userTrailProgress)
      .where(eq(userTrailProgress.activityId, id)),
    db
      .select()
      .from(userLandmarkLog)
      .where(eq(userLandmarkLog.activityId, id)),
  ]);

  return c.json({ activity, matchedPeaks: peaks, matchedSections: sections, matchedLandmarks: landmarks });
});

router.patch("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();
  const db = getDb();

  const body = await c.req.json<{
    name?: string;
    startedAt?: string;
    endedAt?: string | null;
  }>();

  const startedAt = body.startedAt ? new Date(body.startedAt) : undefined;
  const endedAt = body.endedAt === null ? null : body.endedAt ? new Date(body.endedAt) : undefined;

  if (startedAt && isNaN(startedAt.getTime())) {
    return c.json({ error: "Invalid startedAt date" }, 400);
  }
  if (endedAt != null && isNaN(endedAt.getTime())) {
    return c.json({ error: "Invalid endedAt date" }, 400);
  }
  if (startedAt && endedAt && endedAt < startedAt) {
    return c.json({ error: "endedAt must be on or after startedAt" }, 400);
  }

  const [existing] = await db
    .select({ id: activities.id, startedAt: activities.startedAt })
    .from(activities)
    .where(and(eq(activities.id, id), eq(activities.userId, user.id)))
    .limit(1);

  if (!existing) return c.json({ error: "Not found" }, 404);

  const effectiveStartedAt = startedAt ?? existing.startedAt;
  if (endedAt && endedAt < effectiveStartedAt) {
    return c.json({ error: "endedAt must be on or after startedAt" }, 400);
  }

  const updates: Partial<typeof activities.$inferInsert> = {};
  if (body.name !== undefined) updates.name = body.name.trim() || "Untitled Activity";
  if (startedAt !== undefined) updates.startedAt = startedAt;
  if (endedAt !== undefined) updates.endedAt = endedAt;

  if (Object.keys(updates).length === 0) return c.json({ error: "Nothing to update" }, 400);

  const [updated] = await db
    .update(activities)
    .set(updates)
    .where(and(eq(activities.id, id), eq(activities.userId, user.id)))
    .returning();

  if (startedAt !== undefined || endedAt !== undefined) {
    await recomputeStatsAndAchievements(user.id, db);
  }

  return c.json({ activity: updated });
});

router.post("/:id/reprocess", requireAuth, async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();
  const db = getDb();
  await reprocessActivity(id, user.id, db);
  return c.json({ ok: true });
});

router.delete("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();
  const db = getDb();

  const [existing] = await db
    .select({ id: activities.id })
    .from(activities)
    .where(and(eq(activities.id, id), eq(activities.userId, user.id)))
    .limit(1);

  if (!existing) return c.json({ error: "Not found" }, 404);

  await db.delete(activities).where(eq(activities.id, id));

  return c.json({ ok: true });
});

export default router;
