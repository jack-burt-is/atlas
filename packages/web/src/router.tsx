import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  redirect,
  useSearch,
} from "@tanstack/react-router";
import React from "react";
import { queryClient } from "./lib/query-client";
import { fetchMe } from "./api/auth";
import AuthLayout from "./layouts/AuthLayout";
import AppShell from "./layouts/AppShell";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";

// ── Preview: seeds mock data, bypasses auth ───────────────────────────────────

function DashboardPreview() {
  React.useEffect(() => {
    queryClient.setQueryData(["profile/stats"], {
      stats: {
        outdoorScore: 12_480,
        level: 7,
        levelProgress: 0.63,
        toNextLevel: 3520,
        totalActivities: 214,
        totalDistanceM: 2_340_000,
        totalElevationGainM: 98_000,
        totalSummits: 42,
        totalDaysOut: 178,
        totalCountries: 5,
        updatedAt: null,
      },
      recentUnlocks: [
        { achievementId: "1", unlockedAt: "2026-05-01", slug: "first-munro", name: "First Munro", description: "Summit your first Munro.", tier: "bronze", points: 50, iconName: "mountain" },
        { achievementId: "2", unlockedAt: "2026-04-15", slug: "ten-peaks", name: "Ten Peaks", description: "Summit 10 peaks.", tier: "silver", points: 150, iconName: "mountain" },
        { achievementId: "3", unlockedAt: "2026-03-20", slug: "century-days", name: "100 Days Out", description: "Log 100 days outdoors.", tier: "gold", points: 500, iconName: "sun" },
      ],
      streaks: { currentStreak: 12, longestStreak: 31 },
    });
    queryClient.setQueryData(["profile/activity-heatmap"], {
      data: Array.from({ length: 80 }, (_, i) => ({
        date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
        count: Math.random() > 0.6 ? Math.ceil(Math.random() * 6) : 0,
      })),
    });
    queryClient.setQueryData(["profile/suggestions"], {
      suggestions: [
        { itemType: "summit", id: "s1", name: "Ben Nevis", slug: "ben-nevis", elevation: 1345, latitude: 56.8, longitude: -5.0 },
        { itemType: "summit", id: "s2", name: "Scafell Pike", slug: "scafell-pike", elevation: 978, latitude: 54.5, longitude: -3.2 },
        { itemType: "summit", id: "s3", name: "Snowdon", slug: "snowdon", elevation: 1085, latitude: 53.1, longitude: -4.1 },
        { itemType: "summit", id: "s4", name: "Cairn Gorm", slug: "cairn-gorm", elevation: 1245, latitude: 57.1, longitude: -3.7 },
      ],
    });
    queryClient.setQueryData(["collections"], {
      collections: [
        { id: "c1", slug: "munros", name: "Munros", type: "Peak List", description: null, coverImage: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=800&q=80", region: "Scotland", country: "GB", itemCount: 282, completedCount: 42, pct: 14.9 },
        { id: "c2", slug: "wainwrights", name: "Wainwrights", type: "Peak List", description: null, coverImage: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80", region: "Lake District", country: "GB", itemCount: 214, completedCount: 87, pct: 40.7 },
        { id: "c3", slug: "national-3-peaks", name: "National 3 Peaks", type: "Challenge", description: null, coverImage: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80", region: null, country: "GB", itemCount: 3, completedCount: 2, pct: 66.7 },
      ],
    });
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-app)" }}>
      <DashboardPage />
    </div>
  );
}
import MapPage from "./pages/MapPage";
import type { MapFeatureCollection, HeatmapFeatureCollection } from "./api/map";
import type { FilterType } from "./components/map/FilterBar";
import CollectionsPage from "./pages/CollectionsPage";
import CollectionDetailPage from "./pages/CollectionDetailPage";
import AchievementsPage from "./pages/AchievementsPage";
import RegionPage from "./pages/RegionPage";
import RegionsPage from "./pages/RegionsPage";
import ProfilePage from "./pages/ProfilePage";
import StatisticsPage from "./pages/StatisticsPage";
import ConnectedSourcesPage from "./pages/ConnectedSourcesPage";
import PlanPage from "./pages/PlanPage";
import AdminPage from "./pages/AdminPage";

// ── Root ─────────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// ── Index: landing page ───────────────────────────────────────────────────────

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

// ── Auth layout ───────────────────────────────────────────────────────────────

const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_auth",
  component: AuthLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/login",
  component: LoginPage,
});

const signupRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/signup",
  component: SignupPage,
});

// ── Protected layout (requires auth) ─────────────────────────────────────────

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_protected",
  component: AppShell,
  beforeLoad: async () => {
    try {
      await queryClient.ensureQueryData({
        queryKey: ["me"],
        queryFn: fetchMe,
      });
    } catch {
      throw redirect({ to: "/login" });
    }
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const mapRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/map",
  validateSearch: (search: Record<string, unknown>): {
    collection?: string;
    region?: string;
    filter?: string;
  } => ({
    collection: typeof search["collection"] === "string" ? search["collection"] : undefined,
    region: typeof search["region"] === "string" ? search["region"] : undefined,
    filter: typeof search["filter"] === "string" ? search["filter"] : undefined,
  }),
  component: function MapRoute() {
    const { filter } = useSearch({ from: "/_protected/map" });
    const validFilters: FilterType[] = ["all", "peaks", "trails", "landmarks", "gaps"];
    const initialFilter = validFilters.includes(filter as FilterType) ? (filter as FilterType) : "all";
    return <MapPage initialFilter={initialFilter} />;
  },
});

const collectionsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/collections",
  component: CollectionsPage,
});

const collectionDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/collections/$slug",
  component: CollectionDetailPage,
});

const achievementsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/achievements",
  component: AchievementsPage,
});

const regionsListRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/regions",
  component: RegionsPage,
});

const regionRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/regions/$slug",
  component: RegionPage,
});

const profileRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/profile",
  component: ProfilePage,
});

const statisticsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/statistics",
  component: StatisticsPage,
});

const connectedSourcesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/connected-sources",
  component: ConnectedSourcesPage,
});

const planRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/plan",
  validateSearch: (search: Record<string, unknown>): { checkout?: string } => ({
    checkout: typeof search["checkout"] === "string" ? search["checkout"] : undefined,
  }),
  component: PlanPage,
});

const adminRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/admin",
  component: AdminPage,
});

// ── Preview route (dev-only) ──────────────────────────────────────────────────

const previewDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/preview-dashboard",
  component: DashboardPreview,
});

const LAKE_DISTRICT_PEAKS: MapFeatureCollection = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", geometry: { type: "Point", coordinates: [-3.007, 54.527] }, properties: { id: "p1", name: "Helvellyn", slug: "helvellyn", type: "peak", status: "collected", elevation: 950 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [-3.211, 54.454] }, properties: { id: "p2", name: "Scafell Pike", slug: "scafell-pike", type: "peak", status: "collected", elevation: 978 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [-3.147, 54.654] }, properties: { id: "p3", name: "Skiddaw", slug: "skiddaw", type: "peak", status: "collected", elevation: 931 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [-3.221, 54.482] }, properties: { id: "p4", name: "Great Gable", slug: "great-gable", type: "peak", status: "collected", elevation: 899 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [-2.918, 54.530] }, properties: { id: "p5", name: "Fairfield", slug: "fairfield", type: "peak", status: "collected", elevation: 873 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [-3.156, 54.557] }, properties: { id: "p6", name: "Catbells", slug: "catbells", type: "peak", status: "collected", elevation: 451 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [-3.166, 54.468] }, properties: { id: "p7", name: "Bowfell", slug: "bowfell", type: "peak", status: "not_collected", elevation: 902 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [-3.064, 54.639] }, properties: { id: "p8", name: "Blencathra", slug: "blencathra", type: "peak", status: "not_collected", elevation: 868 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [-3.119, 54.370] }, properties: { id: "p9", name: "Old Man of Coniston", slug: "old-man-of-coniston", type: "peak", status: "not_collected", elevation: 803 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [-3.250, 54.509] }, properties: { id: "p10", name: "Haystacks", slug: "haystacks", type: "peak", status: "not_collected", elevation: 597 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [-3.040, 54.470] }, properties: { id: "p11", name: "Red Screes", slug: "red-screes", type: "peak", status: "not_collected", elevation: 776 } },
    { type: "Feature", geometry: { type: "Point", coordinates: [-2.976, 54.491] }, properties: { id: "p12", name: "St Sunday Crag", slug: "st-sunday-crag", type: "peak", status: "not_collected", elevation: 841 } },
    // Trails
    { type: "Feature", geometry: { type: "LineString", coordinates: [[-2.918, 54.530], [-3.007, 54.527], [-3.064, 54.639], [-3.147, 54.654]] }, properties: { id: "t1", name: "Fairfield Horseshoe", slug: "fairfield-horseshoe", type: "trail", status: "collected", distanceKm: 17.5 } },
    { type: "Feature", geometry: { type: "LineString", coordinates: [[-3.221, 54.482], [-3.211, 54.454], [-3.166, 54.468], [-3.250, 54.509]] }, properties: { id: "t2", name: "Scafell Circuit", slug: "scafell-circuit", type: "trail", status: "in_progress", distanceKm: 13.2 } },
    { type: "Feature", geometry: { type: "LineString", coordinates: [[-3.119, 54.370], [-3.166, 54.468], [-3.250, 54.509]] }, properties: { id: "t3", name: "Coniston Round", slug: "coniston-round", type: "trail", status: "not_collected", distanceKm: 14.0 } },
    // Landmarks
    { type: "Feature", geometry: { type: "Point", coordinates: [-3.098, 54.603] }, properties: { id: "l1", name: "Castlerigg Stone Circle", slug: "castlerigg", type: "landmark", status: "collected", category: "stone_circle" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [-3.057, 54.567] }, properties: { id: "l2", name: "Ashness Bridge", slug: "ashness-bridge", type: "landmark", status: "collected", category: "bridge" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [-3.220, 54.500] }, properties: { id: "l3", name: "Black Sail Hut", slug: "black-sail-hut", type: "landmark", status: "not_collected", category: "bothy" } },
  ],
};

const MOCK_HEATMAP: HeatmapFeatureCollection = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", geometry: { type: "LineString", coordinates: [[-3.007, 54.527], [-2.990, 54.520], [-2.975, 54.515], [-2.918, 54.530]] }, properties: { id: "a1", name: "Fairfield via Striding Edge", startedAt: "2026-05-10" } },
    { type: "Feature", geometry: { type: "LineString", coordinates: [[-3.147, 54.654], [-3.156, 54.640], [-3.156, 54.557], [-3.098, 54.603]] }, properties: { id: "a2", name: "Skiddaw to Catbells", startedAt: "2026-04-20" } },
    { type: "Feature", geometry: { type: "LineString", coordinates: [[-3.221, 54.482], [-3.211, 54.454], [-3.200, 54.460]] }, properties: { id: "a3", name: "Scafell Pike via Wasdale", startedAt: "2026-03-15" } },
  ],
};

function MapPreview() {
  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-app)" }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <MapPage staticFeatures={LAKE_DISTRICT_PEAKS} staticHeatmap={MOCK_HEATMAP} />
      </div>
    </div>
  );
}

const previewMapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/preview-map",
  component: MapPreview,
});

// ── Collections preview ───────────────────────────────────────────────────────

const MOCK_WAINWRIGHTS_ITEMS = [
  { id: "p1", name: "Helvellyn", slug: "helvellyn", elevation: 950, latitude: 54.527, longitude: -3.007, wikiUrl: null, collected: true, visits: 3, lastVisit: "2026-05-10" },
  { id: "p2", name: "Scafell Pike", slug: "scafell-pike", elevation: 978, latitude: 54.454, longitude: -3.211, wikiUrl: null, collected: true, visits: 2, lastVisit: "2026-04-20" },
  { id: "p3", name: "Skiddaw", slug: "skiddaw", elevation: 931, latitude: 54.654, longitude: -3.147, wikiUrl: null, collected: true, visits: 1, lastVisit: "2026-03-15" },
  { id: "p4", name: "Great Gable", slug: "great-gable", elevation: 899, latitude: 54.482, longitude: -3.221, wikiUrl: null, collected: true, visits: 2, lastVisit: "2026-05-01" },
  { id: "p5", name: "Fairfield", slug: "fairfield", elevation: 873, latitude: 54.530, longitude: -2.918, wikiUrl: null, collected: true, visits: 1, lastVisit: "2026-02-28" },
  { id: "p6", name: "Catbells", slug: "catbells", elevation: 451, latitude: 54.557, longitude: -3.156, wikiUrl: null, collected: true, visits: 4, lastVisit: "2026-04-10" },
  { id: "p7", name: "Bowfell", slug: "bowfell", elevation: 902, latitude: 54.468, longitude: -3.166, wikiUrl: null, collected: false, visits: 0, lastVisit: null },
  { id: "p8", name: "Blencathra", slug: "blencathra", elevation: 868, latitude: 54.639, longitude: -3.064, wikiUrl: null, collected: false, visits: 0, lastVisit: null },
  { id: "p9", name: "Old Man of Coniston", slug: "old-man-of-coniston", elevation: 803, latitude: 54.370, longitude: -3.119, wikiUrl: null, collected: false, visits: 0, lastVisit: null },
  { id: "p10", name: "Haystacks", slug: "haystacks", elevation: 597, latitude: 54.509, longitude: -3.250, wikiUrl: null, collected: false, visits: 0, lastVisit: null },
  { id: "p11", name: "Red Screes", slug: "red-screes", elevation: 776, latitude: 54.470, longitude: -3.040, wikiUrl: null, collected: false, visits: 0, lastVisit: null },
  { id: "p12", name: "St Sunday Crag", slug: "st-sunday-crag", elevation: 841, latitude: 54.491, longitude: -2.976, wikiUrl: null, collected: false, visits: 0, lastVisit: null },
  { id: "p13", name: "High Stile", slug: "high-stile", elevation: 806, latitude: 54.515, longitude: -3.289, wikiUrl: null, collected: false, visits: 0, lastVisit: null },
  { id: "p14", name: "Pillar", slug: "pillar", elevation: 892, latitude: 54.495, longitude: -3.278, wikiUrl: null, collected: false, visits: 0, lastVisit: null },
  { id: "p15", name: "Grasmoor", slug: "grasmoor", elevation: 852, latitude: 54.580, longitude: -3.267, wikiUrl: null, collected: false, visits: 0, lastVisit: null },
  { id: "p16", name: "Sail", slug: "sail", elevation: 773, latitude: 54.576, longitude: -3.240, wikiUrl: null, collected: false, visits: 0, lastVisit: null },
  { id: "p17", name: "Wandope", slug: "wandope", elevation: 772, latitude: 54.576, longitude: -3.255, wikiUrl: null, collected: false, visits: 0, lastVisit: null },
  { id: "p18", name: "Eel Crag", slug: "eel-crag", elevation: 839, latitude: 54.574, longitude: -3.249, wikiUrl: null, collected: false, visits: 0, lastVisit: null },
];

const MOCK_COLLECTIONS_DATA = {
  collections: [
    { id: "c1", slug: "wainwrights", name: "Wainwrights", type: "Peak List", description: "214 fells in the Lake District documented by Alfred Wainwright", coverImage: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80", region: "Lake District", country: "GB", itemCount: 214, completedCount: 87, pct: 40.7 },
    { id: "c2", slug: "munros", name: "Munros", type: "Peak List", description: "282 Scottish mountains over 3,000 ft", coverImage: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=800&q=80", region: "Scotland", country: "GB", itemCount: 282, completedCount: 42, pct: 14.9 },
    { id: "c3", slug: "national-3-peaks", name: "National 3 Peaks", type: "Challenge", description: null, coverImage: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80", region: null, country: "GB", itemCount: 3, completedCount: 2, pct: 66.7 },
    { id: "c4", slug: "lake-district-landmarks", name: "Lake District Landmarks", type: "Landmarks", description: null, coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", region: "Lake District", country: "GB", itemCount: 45, completedCount: 18, pct: 40.0 },
    { id: "c5", slug: "pennine-way", name: "Pennine Way", type: "National Trail", description: "268 miles from Edale to Kirk Yetholm", coverImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80", region: "Northern England", country: "GB", itemCount: 24, completedCount: 9, pct: 37.5 },
  ],
};

function CollectionsPreview() {
  React.useEffect(() => {
    queryClient.setQueryData(["collections"], MOCK_COLLECTIONS_DATA);
    queryClient.setQueryData(["collections", "wainwrights", "items", 0], {
      collection: { id: "c1", slug: "wainwrights", name: "Wainwrights", type: "Peak List", description: null, cover_image: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80", region: "Lake District", country: "GB" },
      items: MOCK_WAINWRIGHTS_ITEMS,
    });
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-app)" }}>
      <CollectionsPage />
    </div>
  );
}

function CollectionsDetailPreview() {
  React.useEffect(() => {
    queryClient.setQueryData(["collections"], MOCK_COLLECTIONS_DATA);
    queryClient.setQueryData(["collections", "wainwrights", "items", 0], {
      collection: { id: "c1", slug: "wainwrights", name: "Wainwrights", type: "Peak List", description: null, cover_image: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80", region: "Lake District", country: "GB" },
      items: MOCK_WAINWRIGHTS_ITEMS,
    });
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-app)" }}>
      <CollectionDetailPage staticSlug="wainwrights" />
    </div>
  );
}

const previewCollectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/preview-collections",
  component: CollectionsPreview,
});

const previewCollectionsDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/preview-collections-detail",
  component: CollectionsDetailPreview,
});

// ── Achievements preview ──────────────────────────────────────────────────────

const MOCK_ACHIEVEMENTS = {
  achievements: [
    { id: "1", slug: "skyliner", name: "Skyliner", description: "Climb three 800m summits in one day", tier: "gold" as const, points: 500, iconName: "mountain", category: "Summits", unlocked: true, unlockedAt: "2026-04-20", progress: null, rarity: 6.2 },
    { id: "2", slug: "into-thin-air", name: "Into Thin Air", description: "Reach your first 1000m summit", tier: "silver" as const, points: 250, iconName: "flag", category: "Summits", unlocked: true, unlockedAt: "2023-06-15", progress: null, rarity: 41.0 },
    { id: "3", slug: "end-to-end", name: "End to End", description: "Complete a National Trail", tier: "gold" as const, points: 500, iconName: "route", category: "Trails", unlocked: true, unlockedAt: "2025-09-01", progress: null, rarity: 8.7 },
    { id: "4", slug: "the-long-way", name: "The Long Way", description: "Hike 50km in a single day", tier: "platinum" as const, points: 750, iconName: "footprints", category: "Endurance", unlocked: true, unlockedAt: "2025-08-10", progress: null, rarity: 1.4 },
    { id: "5", slug: "dawn-patrol", name: "Dawn Patrol", description: "Log five sunrise summits", tier: "silver" as const, points: 250, iconName: "sunrise", category: "Summits", unlocked: true, unlockedAt: "2024-07-22", progress: null, rarity: 19.3 },
    { id: "6", slug: "cartographer", name: "Cartographer", description: "Visit 25 trig pillars", tier: "bronze" as const, points: 100, iconName: "triangle", category: "Landmarks", unlocked: true, unlockedAt: "2024-02-14", progress: null, rarity: 33.5 },
    { id: "7", slug: "centurion", name: "Centurion", description: "Visit 100 unique summits", tier: "silver" as const, points: 250, iconName: "mountain", category: "Summits", unlocked: false, unlockedAt: null, progress: { value: 78, max: 100 }, rarity: 14.8 },
    { id: "8", slug: "local-legend", name: "Local Legend", description: "Explore 90% of a single region", tier: "gold" as const, points: 500, iconName: "compass", category: "Coverage", unlocked: false, unlockedAt: null, progress: { value: 68, max: 90 }, rarity: 5.1 },
    { id: "9", slug: "all-weather", name: "All Weather", description: "Summit in snow, rain and sun", tier: "bronze" as const, points: 100, iconName: "cloud-rain", category: "Summits", unlocked: false, unlockedAt: null, progress: { value: 2, max: 3 }, rarity: 22.0 },
    { id: "10", slug: "completionist", name: "Completionist", description: "Finish an entire collection", tier: "platinum" as const, points: 750, iconName: "award", category: "Coverage", unlocked: false, unlockedAt: null, progress: { value: 1, max: 3 }, rarity: 2.3 },
    { id: "11", slug: "nightfall", name: "Nightfall", description: "Complete a walk after dark", tier: "bronze" as const, points: 100, iconName: "moon", category: "Endurance", unlocked: false, unlockedAt: null, progress: null, rarity: 28.9 },
    { id: "12", slug: "globetrotter", name: "Globetrotter", description: "Summit peaks in five countries", tier: "gold" as const, points: 500, iconName: "globe", category: "Coverage", unlocked: false, unlockedAt: null, progress: { value: 4, max: 5 }, rarity: 3.6 },
  ],
};

function AchievementsPreview() {
  React.useEffect(() => {
    queryClient.setQueryData(["achievements"], MOCK_ACHIEVEMENTS);
  }, []);
  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-app)" }}>
      <AchievementsPage />
    </div>
  );
}

const previewAchievementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/preview-achievements",
  component: AchievementsPreview,
});

// ── Region preview ────────────────────────────────────────────────────────────

const MOCK_REGION_DATA = {
  name: "Lake District",
  slug: "lake-district",
  subtitle: "National Park · Cumbria, England",
  coveragePct: 68,
  heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1280&q=80",
  stats: {
    peaks:     { value: 121, total: 214 },
    trails:    { value: 9,   total: 13  },
    landmarks: { value: 54,  total: 96  },
    distanceKm: 1284,
  },
  collections: [
    { name: "Wainwrights",       value: 121, max: 214, color: "gold"   as const },
    { name: "Birketts",          value: 203, max: 541, color: "sky"    as const },
    { name: "Lakeland waterfalls", value: 18, max: 42,  color: "sky"   as const },
    { name: "Bothies & shelters", value: 4,  max: 9,   color: "spruce" as const },
    { name: "Lake circuits",      value: 6,  max: 6,   color: "gold"   as const },
  ],
  missingNearby: [
    { id: "p1", name: "Bowfell",              slug: "bowfell",              elevationM: 902, collected: false, image: "https://images.unsplash.com/photo-1458668383970-8ddd3927deed?auto=format&fit=crop&w=240&q=80" },
    { id: "p2", name: "Blencathra",           slug: "blencathra",           elevationM: 868, collected: false, image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=240&q=80" },
    { id: "p3", name: "Haystacks",            slug: "haystacks",            elevationM: 597, collected: false, image: "https://images.unsplash.com/photo-1472791108553-c9405341e398?auto=format&fit=crop&w=240&q=80" },
    { id: "p4", name: "Old Man of Coniston",  slug: "old-man-of-coniston",  elevationM: 803, collected: false, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=240&q=80" },
  ],
  gapCount: 93,
};

function RegionPreview() {
  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-app)" }}>
      <RegionPage staticSlug="lake-district" staticData={MOCK_REGION_DATA} />
    </div>
  );
}

const previewRegionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/preview-region",
  component: RegionPreview,
});

// ── Regions list preview ──────────────────────────────────────────────────────

const MOCK_REGIONS_DATA = {
  regions: [
    { id: "r1", name: "Lake District",      slug: "lake-district",      country: "GB", coveragePct: 68 },
    { id: "r2", name: "Scottish Highlands", slug: "scottish-highlands", country: "GB", coveragePct: 41 },
    { id: "r3", name: "Snowdonia",          slug: "snowdonia",          country: "GB", coveragePct: 29 },
    { id: "r4", name: "Peak District",      slug: "peak-district",      country: "GB", coveragePct: 15 },
    { id: "r5", name: "Cairngorms",         slug: "cairngorms",         country: "GB", coveragePct: 8  },
    { id: "r6", name: "Dartmoor",           slug: "dartmoor",           country: "GB", coveragePct: 0  },
  ],
};

function RegionsPreview() {
  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-app)" }}>
      <RegionsPage staticData={MOCK_REGIONS_DATA} />
    </div>
  );
}

const previewRegionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/preview-regions",
  component: RegionsPreview,
});

// ── Route tree ────────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  authLayoutRoute.addChildren([loginRoute, signupRoute]),
  protectedRoute.addChildren([
    dashboardRoute,
    mapRoute,
    collectionsRoute,
    collectionDetailRoute,
    achievementsRoute,
    regionsListRoute,
    regionRoute,
    profileRoute,
    statisticsRoute,
    connectedSourcesRoute,
    planRoute,
    adminRoute,
  ]),
  previewDashboardRoute,
  previewMapRoute,
  previewCollectionsRoute,
  previewCollectionsDetailRoute,
  previewAchievementsRoute,
  previewRegionRoute,
  previewRegionsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
