export { ApiError, createApiClient } from "./api-client";
export type { ApiClientConfig, ApiClient } from "./api-client";

export type { User } from "./types/auth";
export type {
  ProfileStats,
  RecentUnlock,
  ProfileStatsResponse,
  HeatmapEntry,
  ActivityHeatmapResponse,
  Suggestion,
  SuggestionsResponse,
} from "./types/profile";
export type {
  Collection,
  CollectionsResponse,
  CollectionItem,
  CollectionMeta,
  CollectionItemsResponse,
} from "./types/collections";
export type { AchievementTier, Achievement, AchievementsResponse } from "./types/achievements";
export type {
  RegionStats,
  RegionCollection,
  RegionMissingItem,
  RegionResponse,
  RegionListItem,
  RegionsListResponse,
} from "./types/regions";
export type {
  FeatureStatus,
  FeatureKind,
  MapFeatureProperties,
  MapFeature,
  MapFeatureCollection,
  HeatmapFeature,
  HeatmapFeatureCollection,
} from "./types/map";
export type { Activity, ActivityDetail, ActivitiesListResponse } from "./types/activities";
export type { BillingStatus, PlanKey } from "./types/billing";
export type { StravaStatus } from "./types/integrations";
