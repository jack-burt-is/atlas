# Atlas — Implementation Plan

## Overview

Atlas is a completionist platform for outdoor exploration. Users connect activity sources (Strava, GPX files), and Atlas automatically builds a lifetime record of explored trails, summits, regions, and landmarks — turning activity history into collections, achievements, and progress.

This plan is structured as sequenced prompts, each sized to fit a single Claude Pro conversation. Read the design system before each frontend prompt so component names and token values match exactly what was designed.

---

## Technology Stack

Mirrors the playloop (patchnook) codebase directly to reduce decisions.

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces |
| Infrastructure | SST v3 + AWS |
| API runtime | Hono on AWS Lambda (Node 22) |
| Database | Aurora PostgreSQL 16 (serverless) + **PostGIS** extension |
| ORM | Drizzle ORM + drizzle-kit |
| Web | React 19 + Vite + TanStack Router + TanStack Query + Tailwind CSS v4 |
| Maps | **MapLibre GL JS** (open source, no paid API key) + OpenFreeMap tiles |
| Auth | Email/password (argon2) + OAuth (Strava for both auth and import) |
| Background jobs | SQS queues + Lambda workers |
| Email | SES via SQS queue |
| Observability | AWS Powertools (logger, tracer, metrics) |

### PostGIS rationale

Geospatial operations are central to Atlas's matching engine:
- `ST_DWithin` — did a GPS track pass within 50 m of this peak? 
- `ST_Intersects` / `ST_Length` — how much of a trail section was covered?
- `ST_Contains` — what percentage of a region polygon was explored?
- Activities and geographic features are both stored as PostGIS geometry columns.

### MapLibre rationale

MapLibre GL JS is open source (MIT), works with free vector tile providers (OpenFreeMap, Stadia, or Mapbox), and renders peaks/trails as styled GeoJSON layers. No required API key to get started, can upgrade to Mapbox paid tiles later if needed.

---

## Prompt 1 — Monorepo Skeleton

**Goal**: Create the full repository scaffold. No logic yet — just package boundaries, configs, and a working `sst dev` startup.

**Produces**:
```
atlas/
├── sst.config.ts
├── package.json              (name: "atlas", pnpm@11, node>=22)
├── pnpm-workspace.yaml
├── docker-compose.yml        (postgres:16-postgis for local dev)
├── .gitignore
├── packages/
│   ├── db/
│   │   ├── package.json      (@atlas/db)
│   │   ├── tsconfig.json
│   │   ├── drizzle.config.ts
│   │   └── src/
│   │       ├── client.ts     (getDb() singleton, same pattern as playloop)
│   │       ├── index.ts
│   │       ├── migrate.ts
│   │       ├── migrate-handler.ts
│   │       └── schema/
│   │           └── index.ts  (empty barrel)
│   ├── api/
│   │   ├── package.json      (@atlas/api, deps: hono, @middy/core, @aws-lambda-powertools/*)
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts      (Lambda handler with middy)
│   │       ├── app.ts        (Hono app, /health route only)
│   │       ├── types.ts      (AppEnv interface)
│   │       └── lib/
│   │           └── powertools.ts
│   ├── web/
│   │   ├── package.json      (@atlas/web, deps: react, @tanstack/react-router, @tanstack/react-query, tailwindcss)
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── router.tsx    (TanStack Router root)
│   │       └── index.css     (imports Atlas design tokens)
│   └── workers/
│       ├── package.json      (@atlas/workers)
│       ├── tsconfig.json
│       └── src/
│           └── index.ts      (placeholder)
└── infra/
    ├── secrets.ts
    ├── network.ts
    ├── database.ts           (Aurora + PostGIS note)
    ├── api.ts
    ├── web.ts
    ├── router.ts
    ├── storage.ts
    ├── queues.ts
    └── workers.ts
```

**Key details**:
- `docker-compose.yml` runs `postgis/postgis:16-3.4` locally
- `drizzle.config.ts` points at `DATABASE_URL` env var (local: postgres://atlas:atlas@localhost:5432/atlas)
- Copy the `sst.aws.Aurora` pattern from playloop's `infra/database.ts`, rename to `AtlasDb`, database name `atlas`
- Copy the VPC with `nat: "ec2"` from playloop
- `packages/web/src/index.css` imports the Atlas design token file (copy `atlas-design-system/project/tokens/colors.css`, `typography.css`, `spacing.css`, `elevation.css`, `motion.css`, `base.css` into `packages/web/src/styles/`)
- Tailwind v4 config uses `@theme inline` to expose CSS variables as Tailwind utilities (e.g. `bg-[--surface-card]`, `text-[--text-primary]`)
- SST app name: `"atlas"`, region: `"eu-west-2"`

---

## Prompt 2 — Database Schema: Auth + Users

**Goal**: Create user authentication tables. Identical structure to playloop — battle-tested, copy directly.

**Produces** `packages/db/src/schema/auth.ts`:

```
users               (id, email, name, passwordHash, emailVerified, isAdmin, createdAt)
sessions            (id, userId, expiresAt, ip, userAgent, createdAt)
userIdentities      (id, userId, provider, providerId, accessToken, refreshToken, tokenExpiresAt)
passwordResetTokens (id, userId, tokenHash, expiresAt, usedAt)
emailVerificationTokens (id, userId, tokenHash, expiresAt, usedAt)
```

Plus `packages/db/src/schema/index.ts` barrel export.

**Key details**:
- Same column names and Drizzle syntax as playloop's `packages/db/src/schema/auth.ts` — copy and rename patchnook → atlas references
- `provider` values will include: `"strava"`, `"garmin"`, `"google"` (future)
- `accessToken` and `refreshToken` on `userIdentities` store Strava OAuth tokens for activity sync

---

## Prompt 3 — Database Schema: Geographic Features

**Goal**: Create the core geographic data tables with PostGIS geometry columns. These hold the curated dataset of peaks, trails, regions, and landmarks.

**Produces** `packages/db/src/schema/geography.ts`:

```sql
-- Enable PostGIS (in migration, not schema file)
-- CREATE EXTENSION IF NOT EXISTS postgis;

collections         (id, slug, name, type ENUM('peaks'|'trails'|'landmarks'|'regions'), description, region, country, coverImage, itemCount, sortOrder, createdAt)

peaks               (id, name, slug, elevationM, prominenceM, latitude, longitude, geom geometry(Point,4326), collections text[], country, region, tags, wikiUrl, createdAt)
  -- index: GIST(geom), index: GIN(collections)

trails              (id, name, slug, country, region, distanceKm, elevationGainM, geom geometry(LineString,4326), sectionCount, description, createdAt)

trail_sections      (id, trailId→trails.id, sectionNumber, name, distanceKm, geom geometry(LineString,4326))
  -- index: GIST(geom)

regions             (id, name, slug, country, geom geometry(MultiPolygon,4326), description, createdAt)
  -- index: GIST(geom)

landmarks           (id, name, slug, category ENUM('trig_point'|'waterfall'|'bothy'|'shelter'|'viewpoint'|'mountain_hut'|'stone_circle'|'bridge'), latitude, longitude, geom geometry(Point,4326), region, country, description, createdAt)
  -- index: GIST(geom)

collection_items    (id, collectionId→collections.id, itemType ENUM('peak'|'trail'|'landmark'|'region'), itemId uuid, sortOrder)
  -- unique index on (collectionId, itemType, itemId)
```

**Key details**:
- Use `customType` in Drizzle for PostGIS geometry columns — Drizzle doesn't have native PostGIS support. Define a `geometryType` helper:
  ```ts
  import { customType } from "drizzle-orm/pg-core";
  export const geometry = (name: string, type: string) =>
    customType<{ data: string; driverData: string }>({
      dataType: () => `geometry(${type},4326)`,
    })(name);
  ```
- The first migration must run `CREATE EXTENSION IF NOT EXISTS postgis;` before any table creation
- `peaks.collections` is a `text[]` denormalized column for fast collection filtering (e.g. `["wainwrights", "birketts"]`) — also linked via `collection_items` for proper relational queries
- Geom columns are indexed with `USING GIST` — express this in the Drizzle table's `(table) => ({})` block as raw SQL index if Drizzle doesn't support GIST directly

---

## Prompt 4 — Database Schema: User Progress + Achievements

**Goal**: Create the tables that record what each user has done and what they've unlocked.

**Produces** `packages/db/src/schema/progress.ts` and `packages/db/src/schema/achievements.ts`:

**progress.ts**:
```
activities          (id, userId→users.id, sourceType ENUM('strava'|'garmin'|'gpx'|'komoot'), sourceId, name, startedAt, durationSeconds, distanceM, elevationGainM, geom geometry(LineString,4326), processedAt, createdAt)
  -- index: (userId, startedAt), GIST(geom)

user_peak_log       (id, userId, peakId→peaks.id, activityId→activities.id, summmitedAt, notes, createdAt)
  -- unique partial index for "first bag" queries
  -- index: (userId, peakId)

user_trail_progress (id, userId, trailId→trails.id, sectionId→trail_sections.id, activityId, completedAt)
  -- unique: (userId, sectionId)

user_landmark_log   (id, userId, landmarkId→landmarks.id, activityId, visitedAt)
  -- unique: (userId, landmarkId)

user_region_coverage (id, userId, regionId→regions.id, coveragePct numeric(5,2), lastUpdatedAt)
  -- unique: (userId, regionId)
  -- coveragePct computed by the matching engine after each import
```

**achievements.ts**:
```
achievement_definitions (id, slug, name, description, tier ENUM('bronze'|'silver'|'gold'|'platinum'), points, iconName, category, ruleType, ruleParams jsonb, rarity numeric(5,2), createdAt)

user_achievements   (id, userId, achievementId→achievement_definitions.id, unlockedAt, triggerActivityId→activities.id)
  -- unique: (userId, achievementId)

user_stats          (id, userId unique, outdoorScore int, level int, totalActivities int, totalDistanceM int, totalElevationGainM int, totalSummits int, totalDaysOut int, totalCountries int, updatedAt)
```

**Key details**:
- `achievement_definitions` are seeded via a migration — they are static data, not user-created
- `ruleType` + `ruleParams` encode each achievement's unlock condition:
  - `"peak_count"` + `{"count": 100}` → summit 100 unique peaks
  - `"single_day_elevation"` + `{"metres": 1000}` → 1000m gain in one day
  - `"collection_complete"` + `{"collectionSlug": "munros"}` → finish all Munros
  - `"trail_complete"` + `{"trailSlug": "pennine-way"}` → walk entire trail
- Points by tier: Bronze = 25, Silver = 50, Gold = 100, Platinum = 250
- `user_stats.level` is derived from `outdoorScore` (level = floor(sqrt(score / 100)) + 1)

---

## Prompt 5 — Auth API

**Goal**: Implement the full authentication API. Copy playloop's pattern closely — it's already tested and production-hardened.

**Produces** `packages/api/src/routes/auth.ts` and support files:
- `src/lib/session.ts` — createSession, setSessionCookie, clearSessionCookie, getSessionId
- `src/lib/crypto.ts` — generateToken, hashToken
- `src/lib/rate-limit.ts` — in-memory rate limiting (same as playloop)
- `src/middleware/auth.ts` — requireAuth middleware
- `src/routes/auth.ts` — all auth endpoints
- `src/routes/account.ts` — GET /account/me, PATCH /account/me, DELETE /account/me

**Endpoints**:
```
POST   /auth/signup          (email, password, name)
POST   /auth/login           (email, password)
POST   /auth/logout
GET    /auth/me
POST   /auth/verify-email    (token)
POST   /auth/resend-verification
POST   /auth/forgot-password (email)
POST   /auth/reset-password  (token, newPassword)
GET    /auth/strava           → redirect to Strava OAuth (scope: activity:read_all)
GET    /auth/strava/callback  → exchange code, store in userIdentities, redirect to /dashboard
```

**Key details**:
- Copy playloop's `lib/session.ts`, `lib/crypto.ts`, `middleware/auth.ts` exactly — rename patchnook → atlas
- Strava OAuth: client_id/secret in SST secrets. After callback, store `access_token` and `refresh_token` in `user_identities` with `provider = "strava"`. If no user account exists for the Strava provider ID, create one.
- Strava token refresh: implement `refreshStravaToken(userId)` helper that checks `tokenExpiresAt` and calls Strava's `/oauth/token` with `grant_type: refresh_token`
- Session cookie: `httpOnly`, `secure: true` (prod), `sameSite: "lax"`, 30-day expiry
- Rate limiting on signup (5/hour/IP) and login (10/hour/IP)

---

## Prompt 6 — Activity Import: GPX Upload + Matching Engine

**Goal**: Build the GPX upload endpoint and the geospatial matching engine that transforms a raw GPS track into collected peaks, trail sections, and region coverage.

**Produces**:
- `packages/api/src/routes/activities.ts` — upload endpoint
- `packages/workers/src/handlers/process-activity.ts` — matching engine
- `packages/workers/src/lib/gpx-parser.ts` — GPX → LineString geometry
- `packages/workers/src/lib/geospatial-matcher.ts` — PostGIS queries

**Endpoints**:
```
POST   /activities/upload    (multipart: gpx file)
GET    /activities           (user's activity history, paginated)
GET    /activities/:id       (single activity with matched features)
DELETE /activities/:id
```

**Matching engine logic** (runs in worker after each import):

```
1. Parse GPX file → extract coordinate array → ST_MakeLine → store as geom LineString
2. Peak matching:
   SELECT id FROM peaks
   WHERE ST_DWithin(geom::geography, activity.geom::geography, 80)  -- 80m radius
   → INSERT into user_peak_log for each peak not already logged
3. Trail section matching:
   SELECT id FROM trail_sections  
   WHERE ST_Length(ST_Intersection(geom::geography, ST_Buffer(activity.geom::geography, 30))) 
         / ST_Length(geom::geography) > 0.75   -- 75% of section covered
   → INSERT into user_trail_progress for each section
4. Region coverage:
   For each region intersecting the activity bounding box:
     total_area = ST_Area(region.geom::geography)
     covered = ST_Area(ST_Union(all user activities within region)::geography)
     coverage_pct = covered / total_area
   → UPSERT user_region_coverage
5. Landmark matching:
   SELECT id FROM landmarks
   WHERE ST_DWithin(geom::geography, activity.geom::geography, 50)
   → UPSERT user_landmark_log
6. Re-evaluate achievements (call achievement engine)
7. Recompute user_stats
```

**Key details**:
- GPX parser: use the `gpxparser` npm package (or write minimal parser). Extract `<trkpt lat lon>` elements, build coordinate array, create WKT LineString via `ST_MakeLine`
- `ST_DWithin(...::geography, ...)` compares in metres — cast to geography for accurate distance
- Region coverage recomputation is expensive — only recalculate regions whose bounding box intersects the new activity. Cache in `user_region_coverage`, recompute asynchronously in worker.
- Worker is triggered by SQS queue. Upload endpoint stores raw activity record (no geom yet, `processedAt = null`), enqueues message with `activityId`.
- Strava import uses the same worker — Strava activities are converted to GeoJSON polyline → WKT LineString

---

## Prompt 7 — Strava Integration Worker

**Goal**: Build the Strava sync worker that imports historical activities and subscribes to webhooks for real-time updates.

**Produces**:
- `packages/workers/src/handlers/strava-sync.ts` — full history import
- `packages/workers/src/lib/strava-client.ts` — Strava API wrapper
- `packages/api/src/routes/integrations.ts` — sync trigger + status
- `packages/api/src/routes/webhooks.ts` — Strava webhook endpoint

**Endpoints**:
```
POST   /integrations/strava/sync     (enqueue full Strava history sync)
GET    /integrations/strava/status   (last sync time, activity count, is syncing)
DELETE /integrations/strava          (revoke + remove tokens)
POST   /webhooks/strava              (Strava webhook push — new/updated activity)
GET    /webhooks/strava              (Strava webhook verification challenge)
```

**Strava sync logic**:
```
1. GET https://www.strava.com/api/v3/athlete/activities?per_page=200&page=N
   (paginate until empty page)
2. For each activity:
   a. Check if already imported by sourceId
   b. GET /activities/:id/streams?keys=latlng,altitude for GPS trace
   c. Convert latlng array to WKT LineString
   d. Store in activities table with sourceType="strava", sourceId=stravaId
   e. Enqueue process-activity message
3. Mark integration as synced (update userIdentities.updatedAt)
```

**Key details**:
- Strava API rate limit: 200 requests/15min, 2000/day — implement exponential backoff with jitter
- Token refresh: call `refreshStravaToken()` before each API request if `tokenExpiresAt < now + 5 minutes`
- Webhook subscription: register with Strava on first sync. Store webhook subscription ID in `userIdentities.providerId` metadata.
- Webhook events: `object_type: "activity"`, `aspect_type: "create"` → fetch full activity + streams → process
- The Strava webhook GET endpoint returns the `hub.challenge` query param (Strava's verification protocol)
- Worker SQS batch size: 1 (each activity processed independently to isolate failures)

---

## Prompt 8 — Collections & Progress API

**Goal**: Build all the read-heavy API routes that the web and mobile clients consume to display progress, collections, and geographic features.

**Produces**:
- `packages/api/src/routes/collections.ts`
- `packages/api/src/routes/features.ts` (peaks, trails, landmarks, regions)
- `packages/api/src/routes/profile.ts`
- `packages/api/src/routes/map.ts` (GeoJSON endpoints for the map)

**Endpoints**:
```
GET   /collections                        (all collections with user progress)
GET   /collections/:slug                  (collection detail + items with completion)
GET   /collections/:slug/map              (GeoJSON FeatureCollection for map layer)

GET   /peaks/:id                          (peak detail + user log)
GET   /trails/:id                         (trail with sections + user completion)
GET   /regions/:id                        (region with coverage stats)
GET   /landmarks/:id                      (landmark + user visit)

GET   /map/features                       (GeoJSON for visible map area: ?bbox=w,s,e,n&types=peaks,trails)
GET   /map/regions/:slug                  (region GeoJSON polygon)
GET   /map/heatmap                        (user activity lines as GeoJSON)

GET   /profile/stats                      (user_stats + recent unlocks + streaks)
GET   /profile/activity-heatmap           (daily activity counts for 52-week grid)
GET   /profile/suggestions                (5 nearest uncollected items to user's home region)
```

**Key details**:
- `GET /collections` joins `collections` + `collection_items` + user progress tables; returns `{ id, name, type, itemCount, completedCount, pct }` per collection — sorted by progress descending
- `GET /collections/:slug` returns items in a Pokédex-style format: `{ id, name, elevation, collected: bool, visits: number, lastVisit: date }[]`
- `GET /map/features` uses `ST_MakeEnvelope(w,s,e,n,4326)` to filter features by bbox — returns GeoJSON FeatureCollection with `properties.status` (collected | not_collected), `properties.type` (peak | trail | landmark)
- `GET /profile/activity-heatmap` returns `{ date: "2025-06-10", count: 2 }[]` for the last 365 days — used by the HeatGrid component
- `GET /profile/suggestions` finds 5 uncollected peaks/landmarks nearest to a user's most active region using `ST_DWithin` + order by distance
- All endpoints require `requireAuth` middleware
- Paginate collection items (offset pagination, 100 per page) to handle large collections (Wainwrights = 214 items)

---

## Prompt 9 — Achievement Engine

**Goal**: Build the achievement evaluation system that runs after every activity import and unlocks achievements.

**Produces**:
- `packages/workers/src/lib/achievement-engine.ts` — evaluator
- `packages/db/src/seeds/achievements.ts` — seed data for all achievement definitions
- `packages/api/src/routes/achievements.ts` — read endpoints

**Endpoints**:
```
GET   /achievements           (all definitions with user unlock status + progress)
GET   /achievements/:slug     (single achievement detail)
```

**Achievement rules to seed** (representative set — add more over time):

| Slug | Tier | Points | Rule |
|---|---|---|---|
| first-summit | Bronze | 25 | peak_count >= 1 |
| ten-summits | Bronze | 25 | peak_count >= 10 |
| fifty-summits | Silver | 50 | peak_count >= 50 |
| hundred-summits | Gold | 100 | peak_count >= 100 |
| first-1000m | Bronze | 25 | single peak elevation >= 1000m |
| triple-800m-day | Silver | 50 | 3 peaks >= 800m in same activity |
| hike-50km-day | Gold | 100 | single activity distance >= 50km |
| night-out | Bronze | 25 | activity start before 05:00 |
| complete-wainwrights | Platinum | 250 | collection_complete wainwrights |
| complete-munros | Platinum | 250 | collection_complete munros |
| complete-national-trail (per trail) | Gold | 100 | trail_complete |
| hundred-landmarks | Silver | 50 | landmark_count >= 100 |
| four-countries | Gold | 100 | distinct countries >= 4 |
| explore-50pct-region (per region) | Bronze | 25 | region_coverage >= 50% |
| explore-100pct-region (per region) | Gold | 100 | region_coverage >= 100% |

**Engine logic**:
```typescript
async function evaluateAchievements(userId: string, db: Db) {
  const stats = await getUserStats(userId, db);
  const definitions = await db.select().from(achievementDefinitions);
  const unlocked = await getUnlockedAchievementIds(userId, db);
  
  for (const def of definitions) {
    if (unlocked.has(def.id)) continue;
    const earned = await checkRule(def.ruleType, def.ruleParams, userId, stats, db);
    if (earned) {
      await db.insert(userAchievements).values({ userId, achievementId: def.id, unlockedAt: new Date() });
      await db.update(userStats).set({ outdoorScore: sql`outdoor_score + ${def.points}` }).where(eq(userStats.userId, userId));
    }
  }
}
```

**Key details**:
- Run `evaluateAchievements` at the end of `process-activity` worker, after all peak/trail/landmark logs are updated
- `getUserStats` reads `user_stats` + freshly computed counts from progress tables
- Level formula: `level = Math.floor(Math.sqrt(outdoorScore / 100)) + 1`, `levelProgress = (outdoorScore % (level * 100)) / (level * 100)` — matches the `ScoreMeter` component expectations
- Achievement definitions are seeded with a Drizzle seed script run as part of migration

---

## Prompt 10 — Web Shell + Design Tokens

**Goal**: Build the web app shell: routing, layout, auth flow, and complete design system token integration with Tailwind.

**Produces**:
- `packages/web/src/styles/` — copy of all Atlas design token CSS files
- `packages/web/src/router.tsx` — TanStack Router with auth guards
- `packages/web/src/layouts/AppShell.tsx` — sidebar + topbar shell
- `packages/web/src/layouts/AuthLayout.tsx` — centered card for login/signup
- `packages/web/src/pages/auth/LoginPage.tsx`
- `packages/web/src/pages/auth/SignupPage.tsx`
- `packages/web/src/lib/api-client.ts` — typed fetch wrapper (same pattern as playloop)
- `packages/web/src/lib/query-client.ts`
- `packages/web/src/hooks/useAuth.ts` — auth state via TanStack Query

**Shell layout** (mirrors the design system Shell.jsx):
```
┌────────────────────────────────────────────────────────┐
│ SIDEBAR (264px, --sidebar-w)   │  MAIN CONTENT AREA    │
│                                │                        │
│  [Atlas logo + wordmark]       │  <Outlet />            │
│                                │                        │
│  ● Home          /dashboard    │                        │
│  ● Explore Map   /map          │                        │
│  ● Collections   /collections  │                        │
│  ● Achievements  /achievements │                        │
│  ─────────────────────         │                        │
│  ● Profile       /profile      │                        │
│                                │                        │
│  [User avatar + score]         │                        │
└────────────────────────────────────────────────────────┘
```

**Routes**:
```
/                  → redirect to /dashboard (if authed) or /login
/login             → LoginPage
/signup            → SignupPage
/auth/strava/callback → handle Strava OAuth callback
/dashboard         → DashboardPage (protected)
/map               → MapPage (protected)
/collections       → CollectionsPage (protected)
/collections/:slug → CollectionDetailPage (protected)
/achievements      → AchievementsPage (protected)
/regions/:slug     → RegionPage (protected)
/profile           → ProfilePage (protected)
```

**Key details**:
- Design tokens: copy the 7 CSS files from `atlas-design-system/project/tokens/` into `packages/web/src/styles/` and import them all in `index.css`
- Copy `atlas-design-system/project/tokens/base.css` as-is — it provides `.atlas-topo`, `.atlas-glass`, `.atlas-gold-text`, `.eyebrow` utilities
- Tailwind v4: in `index.css`, use `@import "tailwindcss"` then `@layer base { :root { ... } }` — the CSS variables are already defined by the token files, Tailwind arbitrary values (`bg-[--surface-card]`) work automatically
- Auth guard: TanStack Router `beforeLoad` on the `_protected` route tree — redirect to `/login` if no session
- `useAuth` hook: `useQuery({ queryKey: ['me'], queryFn: () => apiClient.get('/auth/me') })` — 401 response sets auth state to null
- Login/signup forms: Space Grotesk heading, `--surface-card` background, gold CTA button, match the brand feel

---

## Prompt 11 — Dashboard Page

**Goal**: Build the Home Dashboard page using the exact component hierarchy from `atlas-design-system/project/ui_kits/web/Dashboard.jsx`.

**Produces**:
- `packages/web/src/pages/DashboardPage.tsx`
- `packages/web/src/components/ScoreMeter.tsx`
- `packages/web/src/components/HeatGrid.tsx`
- `packages/web/src/components/CollectionCard.tsx`
- `packages/web/src/components/AchievementBadge.tsx`
- `packages/web/src/components/StatBlock.tsx`
- `packages/web/src/components/ProgressBar.tsx`
- `packages/web/src/components/ProgressRing.tsx`
- `packages/web/src/components/Badge.tsx`
- `packages/web/src/components/Button.tsx`
- `packages/web/src/components/AtlasPanel.tsx`

**Dashboard layout** (from design system):
```
┌─ Hero row (1.3fr / 1fr) ──────────────────────────────┐
│  ScoreMeter + 4 stat cards        │  Next goals panel  │
│  Exploration activity heatmap     │  (suggestions +    │
│                                   │   region progress) │
├─ Bottom row (1fr / 1fr) ──────────────────────────────┤
│  Closest to completion            │  Recent unlocks    │
│  (3 CollectionCards)              │  (3 AchievementBadges) │
└───────────────────────────────────────────────────────┘
```

**Component specs** (match design system exactly):

**ScoreMeter**: Horizontal bar showing level progress. `score` (number), `level` (number), `levelProgress` (0–1), `toNext` (number). Gold gradient fill bar on `--surface-sunken` track. Level badge left, "to next level" counter right.

**HeatGrid**: 52×7 grid of small squares (11px, gap 3px). Cell color from `--heat-0` through `--heat-4` based on activity count. GitHub contribution heatmap aesthetic. Props: `columns`, `rows`, `cell`, `gap`, `data: { date, count }[]`.

**ProgressRing**: SVG circle ring. `value` (0–100), `size` (px), `stroke` (px). Gold stroke on `--surface-sunken` track. Center label shows percentage. Used in Collection and Region hero banners.

**ProgressBar**: Horizontal bar with label and percentage. `label`, `value`, `max`, `color` ('gold'|'sky'|'spruce'). Used in region progress and trail completion.

**AtlasPanel**: Card container. `title`, `action` (right-aligned slot), `children`. `--surface-card` background, `--border-subtle` border, `--radius-lg` corners, `--ring-top` box-shadow.

**Key details**:
- Data from `useQuery({ queryKey: ['profile/stats'] })` and `useQuery({ queryKey: ['profile/activity-heatmap'] })`
- Skeleton loading states for all cards (use CSS animation pulse)
- `CollectionCard` links to `/collections/:slug` via TanStack Router `<Link>`
- "Open map" button in Next Goals panel navigates to `/map`

---

## Prompt 12 — Map Page

**Goal**: Build the interactive exploration map using MapLibre GL JS. This is the emotional centrepiece of the product.

**Produces**:
- `packages/web/src/pages/MapPage.tsx`
- `packages/web/src/components/map/AtlasMap.tsx` — MapLibre GL wrapper
- `packages/web/src/components/map/MapInspector.tsx` — right-side feature detail panel
- `packages/web/src/components/map/FeatureDetail.tsx`
- `packages/web/src/components/map/RegionOverview.tsx`
- `packages/web/src/components/map/FilterBar.tsx`
- `packages/web/src/hooks/useMapFeatures.ts`

**Map behaviour** (match `atlas-design-system/project/ui_kits/web/Map.jsx` exactly):
- Pannable and zoomable (MapLibre handles this natively)
- Click a peak marker → open FeatureDetail inspector on the right
- Click a trail chip → open trail detail
- Filter tabs: All / Peaks / Trails / Landmarks / Gaps
- Zoom controls (+ / − / reset) bottom-right
- Legend bottom-left
- Region header top-left (name + exploration %)
- Filter bar top-right

**Marker styling**:
- Collected peak: filled gold circle (`--accent`), gold glow shadow
- Planned peak: semi-transparent sky-blue with blur backdrop
- Not visited: semi-transparent dark with blur backdrop
- Trails: gold polyline (completed), sky dashed (in progress), grey dashed (not started)

**Implementation approach**:
```tsx
// Use maplibre-gl npm package
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Map tiles: OpenFreeMap (free, no key required)
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
When in dark mode, switch to dark terrain: https://tiles.openfreemap.org/styles/dark

// GeoJSON sources
map.addSource('peaks', { type: 'geojson', data: peaksGeoJSON });
map.addSource('trails', { type: 'geojson', data: trailsGeoJSON });
map.addSource('landmarks', { type: 'geojson', data: landmarksGeoJSON });
map.addSource('activity-heatmap', { type: 'geojson', data: activitiesGeoJSON });

// Peak layer: circle with data-driven color
map.addLayer({
  id: 'peaks-circle',
  type: 'circle',
  source: 'peaks',
  paint: {
    'circle-color': ['match', ['get', 'status'], 'collected', '#F4B740', 'planned', '#46B6E8', '#566777'],
    'circle-radius': 8,
  }
});

// Trail layer: line with data-driven color + dash
map.addLayer({ id: 'trails-line', type: 'line', source: 'trails', ... });

// Activity heatmap layer (user's GPS traces): thin gold lines, low opacity
map.addLayer({ id: 'activities', type: 'line', source: 'activity-heatmap', paint: { 'line-color': '#F4B740', 'line-opacity': 0.35, 'line-width': 1.5 } });
```

**Key details**:
- `useMapFeatures` fetches from `GET /map/features?bbox=...` on map move/zoom (debounced 300ms)
- Inspector panel: 360px fixed right side, `--surface-card` background. `RegionOverview` by default, `FeatureDetail` when a feature is selected
- `FeatureDetail` displays elevation/distance stats, visit count, last visited date, nearest similar features
- `ActivityHeatmap` layer renders the user's personal GPS traces (gold lines, 35% opacity) so their explored territory is visually obvious
- Cluster peaks at zoom < 8 using MapLibre's cluster feature to avoid marker overlap

---

## Prompt 13 — Collections Page

**Goal**: Build the Collections overview and Collection detail (Pokédex grid) pages.

**Produces**:
- `packages/web/src/pages/CollectionsPage.tsx`
- `packages/web/src/pages/CollectionDetailPage.tsx`
- `packages/web/src/components/CollectibleItem.tsx`

**Collections overview layout** (from design system):
```
┌─ Hero (1.35fr / 1fr) ────────────────────────────────┐
│  ProgressRing (avg %)  │  Completionist stats         │
│  Collection type stats │  Closest-to-completion list  │
├─ Filter bar ─────────────────────────────────────────┤
│  [ All ] [ Peaks ] [ Trails ] [ Landmarks ]           │
├─ 2-column grid ──────────────────────────────────────┤
│  CollectionCard   CollectionCard                     │
│  CollectionCard   CollectionCard                     │
└──────────────────────────────────────────────────────┘
```

**Collection detail layout** (Pokédex grid):
```
← All collections

┌─ Hero banner with collection image ──────────────────┐
│  ProgressRing + collection name + stats badges        │
│  [View on map]  [Set a goal]                         │
├─ 4 stat cards ───────────────────────────────────────┤
│  Collected / Remaining / Total visits / Highest      │
├─ [ All ] [ Collected N ] [ Remaining N ] ────────────┤
│  6-column Pokédex grid of CollectibleItems            │
└──────────────────────────────────────────────────────┘
```

**CollectibleItem component**:
- 6-column grid item
- Collected: shows peak photo thumbnail, gold checkmark overlay, name, elevation
- Not collected: dark greyscale/dimmed, lock icon or outline, name, elevation
- Hover: slight scale-up, border glow

**Key details**:
- Data: `useQuery({ queryKey: ['collections'] })` → list; `useQuery({ queryKey: ['collections', slug] })` → detail
- `CollectionCard` (used in overview grid and Dashboard): shows progress ring + title + type + `value/max` count + progress bar
- "View on map" button links to `/map?collection=wainwrights` — MapPage reads this param and pre-filters to that collection
- Pagination in detail grid (load more button, not infinite scroll — easier to reason about)

---

## Prompt 14 — Achievements Page + Region Page

**Goal**: Build the Achievements gallery and Region detail page.

**Produces**:
- `packages/web/src/pages/AchievementsPage.tsx`
- `packages/web/src/pages/RegionPage.tsx`

**Achievements page layout** (Steam/Xbox style, from design system):
```
┌─ Hero (1.35fr / 1fr) ────────────────────────────────┐
│  ProgressRing + total points     │  Closest to unlock │
│  Bronze/Silver/Gold/Platinum     │  (4 in-progress)   │
│  medal counts                    │                    │
├─ Filter bar ─────────────────────────────────────────┤
│  [ All ] [ Unlocked ] [ In progress ] [ Locked ]      │
├─ 2-column achievement grid ──────────────────────────┤
│  AchievementBadge  AchievementBadge                  │
└──────────────────────────────────────────────────────┘
```

**AchievementBadge** (already built in Prompt 11 — reuse):
- Unlocked: coloured tier badge (gold/silver/bronze/platinum), icon, title, description, earned date, points
- In progress: greyed badge with lock icon, progress bar showing current/target
- Locked: fully greyed, lock icon, percentage of explorers who have it

**Region page layout** (from design system):
```
┌─ Hero banner (region photo + topo overlay) ──────────┐
│  ProgressRing (% explored)   │  Region name           │
│                              │  Badges: 68% explored, │
│                              │  9 trails done, 54 landmarks │
│                              │  [View on map] [Set a goal] │
├─ 4 stat cards ───────────────────────────────────────┤
│  Peaks / Trails / Landmarks / Distance here           │
├─ Progress by collection (1.4fr) │ Missing nearby (1fr) ┤
│  ProgressBar: Wainwrights       │  2×2 CollectibleItem │
│  ProgressBar: Birketts          │  grid of uncollected │
│  ProgressBar: Waterfalls        │  [Show all N gaps]   │
└──────────────────────────────────────────────────────┘
```

**Key details**:
- Achievements data: `useQuery({ queryKey: ['achievements'] })` returns all definitions with user-specific `unlocked`, `progress`, `unlockedAt` fields merged server-side
- Achievements sorted: unlocked first (newest first), then in-progress (highest pct first), then locked
- Region page accessed via link from map inspector or collections page
- `GET /regions/:slug` returns: `{ name, coveragePct, heroImage, stats: { peaks, trails, landmarks, distanceKm }, collections: [{name, value, max}], missingNearby: Peak[] }`
- "Show all N gaps" button navigates to `/map?region=lake-district&filter=gaps`

---

## Prompt 15 — Profile Page + Full SST Infrastructure

**Goal**: Complete the profile page and wire up the full production-ready AWS infrastructure.

**Produces**:
- `packages/web/src/pages/ProfilePage.tsx`
- Complete `infra/` directory (database, api, web, workers, queues, storage, router, secrets, network, waf, alarms, migrate)
- `infra/secrets.ts` with all required secrets
- Production deployment checklist in comments

**Profile page**:
```
┌─ Profile header ─────────────────────────────────────┐
│  Avatar (ring = level)  │  Name, level badge          │
│                         │  Outdoor Score (gold text)  │
│                         │  Level progress bar         │
├─ Lifetime stat grid (4 columns) ─────────────────────┤
│  Summits / Distance / Days out / Countries            │
├─ Activity heatmap ───────────────────────────────────┤
│  52×7 HeatGrid (2 years)                             │
├─ Connected sources ──────────────────────────────────┤
│  Strava [connected | Connect]                        │
│  GPX    [Upload files]                               │
├─ Danger zone ────────────────────────────────────────┤
│  [Delete account]                                    │
└──────────────────────────────────────────────────────┘
```

**SST infrastructure** (full production config, mirrors playloop):

```typescript
// infra/database.ts — Aurora PostgreSQL + PostGIS
const database = new sst.aws.Aurora("AtlasDb", {
  engine: "postgres",
  version: "16.4",
  database: "atlas",
  username: "atlas",
  vpc,
  scaling: isProd ? { min: "0.5 ACU", max: "16 ACU" } : { min: "0 ACU", max: "4 ACU" },
});
// First migration MUST run: CREATE EXTENSION IF NOT EXISTS postgis;

// infra/queues.ts — SQS queues
const processActivity = new sst.aws.Queue("ProcessActivity");
const stravaSync = new sst.aws.Queue("StravaSync", { visibilityTimeout: "5 minutes" });
const email = new sst.aws.Queue("Email");

// infra/workers.ts — Lambda workers consuming queues
const activityWorker = new sst.aws.Function("ActivityWorker", {
  handler: "packages/workers/src/handlers/process-activity.handler",
  timeout: "2 minutes",
  memory: "512 MB",
  vpc,
  environment: { DATABASE_URL: databaseUrl },
});
activityWorker.subscribe(processActivity.arn);

// infra/secrets.ts
const stravaClientId = new sst.Secret("StravaClientId");
const stravaClientSecret = new sst.Secret("StravaClientSecret");
const sessionSecret = new sst.Secret("SessionSecret");
const maplibreTilesKey = new sst.Secret("MaplibreTilesKey"); // optional

// infra/storage.ts — S3 for GPX uploads
const uploads = new sst.aws.Bucket("AtlasUploads");
```

**PostGIS migration note**: Add to `packages/db/src/migrate.ts`:
```typescript
// Run before drizzle migrations
await sql`CREATE EXTENSION IF NOT EXISTS postgis`;
```

**Key details**:
- WAF WebACL same as playloop (`infra/waf.ts`)
- CSP in CloudFront headers: include `connect-src` for map tile domains (`tiles.openfreemap.org`, Mapbox if used)
- `VITE_MAPLIBRE_STYLE` env var set in `infra/web.ts` — defaults to OpenFreeMap liberty style
- GPX upload: multipart form to API → Lambda stores to S3 → enqueue ProcessActivity with S3 key → worker fetches from S3, parses, then processes geospatially
- Keep file size limit: 50 MB max GPX (Lambda payload limit is 6 MB, so S3 upload is required)
- CloudFront serves both web assets and proxies `/api/*` to the API router (same pattern as playloop)

---

## Data Seeding Strategy

The geographic feature dataset (peaks, trails, regions, landmarks) is curated reference data, not user-generated. Seed it separately from application migrations:

**Phase 1 seed** (included with initial deploy):
- **Wainwrights** (214 peaks) — available as open dataset from OpenStreetMap/Wikipedia
- **Munros** (282 peaks) — available from Scottish Mountaineering Club data (check licence)
- **Pennine Way** trail + sections
- **South West Coast Path** trail + sections
- **Lake District** region polygon
- **Scottish Highlands** region polygon
- Sample landmark categories (trig points, bothies from MBA data)

**Tooling**: Write a `packages/db/src/seeds/geographic-data.ts` script that:
1. Reads curated GeoJSON/CSV files from `packages/db/src/seeds/data/`
2. Inserts via Drizzle using `ST_GeomFromGeoJSON(...)` for geometry columns
3. Creates collection + collection_items links

**Data sources**:
- OpenStreetMap (overpass-turbo queries) for peak points, trail linestrings
- QGIS or geojson.io for region polygons
- The Mountain Bothy Association (MBA) for bothy locations
- OSTN15 or WGS84 — use WGS84 (SRID 4326) throughout

---

## Development Workflow

```bash
# Start local Postgres with PostGIS
docker compose up -d

# Run migrations
pnpm db:migrate

# Seed geographic data
pnpm db:seed

# Start API locally (http://localhost:3000)
pnpm dev:api

# Start web locally (http://localhost:5173)
pnpm dev:web

# Deploy to dev stage
pnpm sst deploy --stage dev

# Deploy to prod
pnpm sst deploy --stage prod
```

---

## Build Order Summary

| # | Prompt | Output | Depends on |
|---|---|---|---|
| 1 | Monorepo skeleton | Project structure, all packages | — |
| 2 | Auth schema | users, sessions, identities | 1 |
| 3 | Geography schema | peaks, trails, regions, landmarks | 1 |
| 4 | Progress schema | activities, logs, achievements | 2, 3 |
| 5 | Auth API | login/signup/Strava OAuth | 2 |
| 6 | GPX import + matcher | Activity processing worker | 3, 4, 5 |
| 7 | Strava worker | Full history sync, webhooks | 5, 6 |
| 8 | Collections API | All read routes + GeoJSON map endpoints | 3, 4 |
| 9 | Achievement engine | Evaluator + seed data | 4, 8 |
| 10 | Web shell + tokens | Routes, layout, auth pages | 5 |
| 11 | Dashboard page | All core UI components | 8, 9, 10 |
| 12 | Map page | MapLibre integration | 8, 10 |
| 13 | Collections page | Pokédex grid | 8, 10, 11 |
| 14 | Achievements + Region | Remaining content pages | 9, 10, 11 |
| 15 | Profile + infrastructure | Full AWS deploy | all |
