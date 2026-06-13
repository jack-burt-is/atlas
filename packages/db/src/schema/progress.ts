import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  timestamp,
  numeric,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./auth.js";
import { peaks, trails, trailSections, landmarks, regions } from "./geography.js";
import { geometry } from "./geography.js";

export const activitySourceTypeEnum = pgEnum("activity_source_type", [
  "strava",
  "garmin",
  "gpx",
  "komoot",
]);

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sourceType: activitySourceTypeEnum("source_type").notNull(),
    sourceId: text("source_id"),
    name: text("name").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    durationSeconds: integer("duration_seconds"),
    distanceM: integer("distance_m"),
    elevationGainM: integer("elevation_gain_m"),
    geom: geometry("geom", "LineString"),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userStartedAtIdx: index("activities_user_id_started_at_idx").on(
      table.userId,
      table.startedAt,
    ),
    geomIdx: index("activities_geom_idx").using("gist", table.geom),
    sourceIdx: index("activities_source_id_idx").on(
      table.userId,
      table.sourceType,
      table.sourceId,
    ),
  }),
);

export const userPeakLog = pgTable(
  "user_peak_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    peakId: uuid("peak_id")
      .notNull()
      .references(() => peaks.id, { onDelete: "cascade" }),
    activityId: uuid("activity_id").references(() => activities.id, {
      onDelete: "set null",
    }),
    summitedAt: timestamp("summited_at", { withTimezone: true }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userPeakIdx: index("user_peak_log_user_id_peak_id_idx").on(
      table.userId,
      table.peakId,
    ),
    userIdx: index("user_peak_log_user_id_idx").on(table.userId),
  }),
);

export const userTrailProgress = pgTable(
  "user_trail_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    trailId: uuid("trail_id")
      .notNull()
      .references(() => trails.id, { onDelete: "cascade" }),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => trailSections.id, { onDelete: "cascade" }),
    activityId: uuid("activity_id").references(() => activities.id, {
      onDelete: "set null",
    }),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    uniqueUserSection: uniqueIndex("user_trail_progress_user_section_idx").on(
      table.userId,
      table.sectionId,
    ),
    userTrailIdx: index("user_trail_progress_user_trail_idx").on(
      table.userId,
      table.trailId,
    ),
  }),
);

export const userLandmarkLog = pgTable(
  "user_landmark_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    landmarkId: uuid("landmark_id")
      .notNull()
      .references(() => landmarks.id, { onDelete: "cascade" }),
    activityId: uuid("activity_id").references(() => activities.id, {
      onDelete: "set null",
    }),
    visitedAt: timestamp("visited_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    uniqueUserLandmark: uniqueIndex("user_landmark_log_user_landmark_idx").on(
      table.userId,
      table.landmarkId,
    ),
    userIdx: index("user_landmark_log_user_id_idx").on(table.userId),
  }),
);

export const userRegionCoverage = pgTable(
  "user_region_coverage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    regionId: uuid("region_id")
      .notNull()
      .references(() => regions.id, { onDelete: "cascade" }),
    coveragePct: numeric("coverage_pct", { precision: 5, scale: 2 })
      .notNull()
      .default("0.00"),
    lastUpdatedAt: timestamp("last_updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueUserRegion: uniqueIndex("user_region_coverage_user_region_idx").on(
      table.userId,
      table.regionId,
    ),
    userIdx: index("user_region_coverage_user_id_idx").on(table.userId),
  }),
);
