import { apiGet } from "../lib/api-client";

export interface RegionStats {
  peaks: { value: number; total: number };
  trails: { value: number; total: number };
  landmarks: { value: number; total: number };
  distanceKm: number;
}

export interface RegionCollection {
  name: string;
  value: number;
  max: number;
  color?: "gold" | "sky" | "spruce";
}

export interface RegionMissingItem {
  id: string;
  name: string;
  slug: string;
  elevationM: number | null;
  collected: boolean;
  image?: string | null;
}

export interface RegionResponse {
  name: string;
  slug: string;
  subtitle: string;
  coveragePct: number;
  heroImage: string | null;
  stats: RegionStats;
  collections: RegionCollection[];
  missingNearby: RegionMissingItem[];
  gapCount: number;
}

export function fetchRegion(slug: string): Promise<RegionResponse> {
  return apiGet(`/regions/${slug}`);
}

export interface RegionListItem {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  coveragePct: number;
}

export interface RegionsListResponse {
  regions: RegionListItem[];
}

export function fetchRegions(): Promise<RegionsListResponse> {
  return apiGet("/regions");
}
