import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  doublePrecision,
  timestamp,
  index,
  uniqueIndex,
  customType,
} from "drizzle-orm/pg-core";

export const geometry = (name: string, geoType: string) =>
  customType<{ data: string; driverData: string }>({
    dataType: () => `geometry(${geoType},4326)`,
  })(name);

export const collectionTypeEnum = pgEnum("collection_type", [
  "peaks",
  "trails",
  "landmarks",
  "regions",
]);

export const landmarkCategoryEnum = pgEnum("landmark_category", [
  "trig_point",
  "waterfall",
  "bothy",
  "shelter",
  "viewpoint",
  "mountain_hut",
  "stone_circle",
  "bridge",
]);

export const collectionItemTypeEnum = pgEnum("collection_item_type", [
  "peak",
  "trail",
  "landmark",
  "region",
]);

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    type: collectionTypeEnum("type").notNull(),
    description: text("description"),
    region: text("region"),
    country: text("country"),
    coverImage: text("cover_image"),
    itemCount: integer("item_count").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("collections_slug_idx").on(table.slug),
  }),
);

export const peaks = pgTable(
  "peaks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    elevationM: integer("elevation_m").notNull(),
    prominenceM: integer("prominence_m"),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    geom: geometry("geom", "Point"),
    collections: text("collections").array().notNull().default([]),
    country: text("country"),
    region: text("region"),
    tags: text("tags").array().notNull().default([]),
    wikiUrl: text("wiki_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("peaks_slug_idx").on(table.slug),
    geomIdx: index("peaks_geom_idx").using("gist", table.geom),
    collectionsIdx: index("peaks_collections_idx").using("gin", table.collections),
  }),
);

export const trails = pgTable(
  "trails",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    country: text("country"),
    region: text("region"),
    distanceKm: doublePrecision("distance_km"),
    elevationGainM: integer("elevation_gain_m"),
    geom: geometry("geom", "MultiLineString"),
    sectionCount: integer("section_count").notNull().default(0),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("trails_slug_idx").on(table.slug),
  }),
);

export const trailSections = pgTable(
  "trail_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trailId: uuid("trail_id")
      .notNull()
      .references(() => trails.id, { onDelete: "cascade" }),
    sectionNumber: integer("section_number").notNull(),
    name: text("name"),
    distanceKm: doublePrecision("distance_km"),
    geom: geometry("geom", "LineString"),
  },
  (table) => ({
    trailIdx: index("trail_sections_trail_id_idx").on(table.trailId),
    geomIdx: index("trail_sections_geom_idx").using("gist", table.geom),
  }),
);

export const regions = pgTable(
  "regions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    country: text("country"),
    geom: geometry("geom", "MultiPolygon"),
    description: text("description"),
    heroImage: text("hero_image"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("regions_slug_idx").on(table.slug),
    geomIdx: index("regions_geom_idx").using("gist", table.geom),
  }),
);

export const landmarks = pgTable(
  "landmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    category: landmarkCategoryEnum("category").notNull(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    geom: geometry("geom", "Point"),
    region: text("region"),
    country: text("country"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("landmarks_slug_idx").on(table.slug),
    geomIdx: index("landmarks_geom_idx").using("gist", table.geom),
  }),
);

export const collectionItems = pgTable(
  "collection_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    itemType: collectionItemTypeEnum("item_type").notNull(),
    itemId: uuid("item_id").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => ({
    uniqueIdx: uniqueIndex("collection_items_unique_idx").on(
      table.collectionId,
      table.itemType,
      table.itemId,
    ),
    collectionIdx: index("collection_items_collection_id_idx").on(
      table.collectionId,
    ),
  }),
);
