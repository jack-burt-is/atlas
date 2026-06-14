import type { RegionResponse, RegionsListResponse } from "@atlas/shared";
import { apiGet } from "../lib/api-client";

export type {
  RegionStats,
  RegionCollection,
  RegionMissingItem,
  RegionResponse,
  RegionListItem,
  RegionsListResponse,
} from "@atlas/shared";

export function fetchRegion(slug: string): Promise<RegionResponse> {
  return apiGet(`/regions/${slug}`);
}

export function fetchRegions(): Promise<RegionsListResponse> {
  return apiGet("/regions");
}
