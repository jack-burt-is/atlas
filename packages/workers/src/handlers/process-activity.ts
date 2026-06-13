import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Logger } from "@aws-lambda-powertools/logger";
import type { SQSHandler } from "aws-lambda";
import { getDb, activities } from "@atlas/db";
import { sql, eq } from "drizzle-orm";
import { parseGpx, buildLineStringWkt } from "../lib/gpx-parser.js";
import {
  matchPeaks,
  matchTrailSections,
  matchLandmarks,
  matchRegions,
  recomputeUserStats,
} from "../lib/geospatial-matcher.js";
import { evaluateAchievements } from "../lib/achievement-engine.js";

const logger = new Logger({ serviceName: "process-activity" });
const s3 = new S3Client({});

export interface ProcessActivityMessage {
  activityId: string;
  userId: string;
  /** Present for GPX uploads. Absent for Strava activities (geom already written). */
  s3Key?: string;
}

async function processActivity(
  msg: ProcessActivityMessage,
  db: ReturnType<typeof getDb>,
): Promise<void> {
  const { activityId, userId, s3Key } = msg;

  if (s3Key) {
    const bucket = process.env["UPLOADS_BUCKET"];
    if (!bucket) throw new Error("UPLOADS_BUCKET not configured");

    const s3Res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: s3Key }));
    if (!s3Res.Body) throw new Error(`Empty S3 object: ${s3Key}`);
    const gpxContent = await s3Res.Body.transformToString("utf-8");

    const parsed = parseGpx(gpxContent);
    const wkt = buildLineStringWkt(parsed.points);

    await db.execute(sql`
      UPDATE activities SET
        geom          = ST_GeomFromText(${wkt}, 4326),
        name          = CASE WHEN name = 'Untitled Activity' AND ${parsed.name ?? null}::text IS NOT NULL
                            THEN ${parsed.name ?? null}::text
                            ELSE name END,
        started_at    = COALESCE(${parsed.startedAt ?? null}::timestamptz, started_at),
        duration_seconds = ${parsed.durationSeconds ?? null}::integer,
        distance_m    = ${parsed.distanceM}::integer,
        elevation_gain_m = ${parsed.elevationGainM}::integer,
        processed_at  = NOW()
      WHERE id = ${activityId}::uuid AND user_id = ${userId}::uuid
    `);
  } else {
    // Strava path: geom + metadata already written by strava-sync worker
    await db.execute(sql`
      UPDATE activities SET processed_at = NOW()
      WHERE id = ${activityId}::uuid AND user_id = ${userId}::uuid AND geom IS NOT NULL
    `);
  }

  await matchPeaks(activityId, userId, db);
  await matchTrailSections(activityId, userId, db);
  await matchLandmarks(activityId, userId, db);
  await matchRegions(activityId, userId, db);
  await recomputeUserStats(userId, db);
  await evaluateAchievements(userId, db);

  logger.info("Activity processed", { activityId, userId });
}

export const handler: SQSHandler = async (event) => {
  const db = getDb();
  for (const record of event.Records) {
    const msg = JSON.parse(record.body) as ProcessActivityMessage;
    try {
      await processActivity(msg, db);
    } catch (err) {
      logger.error("Failed to process activity", {
        activityId: msg.activityId,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }
};
