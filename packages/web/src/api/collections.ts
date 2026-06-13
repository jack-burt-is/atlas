import { apiGet } from "../lib/api-client";

export interface Collection {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string | null;
  coverImage: string | null;
  region: string | null;
  country: string | null;
  itemCount: number;
  completedCount: number;
  pct: number; // 0–100
}

export interface CollectionsResponse {
  collections: Collection[];
}

export function fetchCollections(): Promise<CollectionsResponse> {
  return apiGet("/collections");
}

export interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  collected: boolean;
  visits: number;
  lastVisit: string | null;
  // peaks
  elevation?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  wikiUrl?: string | null;
  // landmarks
  category?: string | null;
  region?: string | null;
  // trails
  distanceKm?: number | null;
  elevationGainM?: number | null;
  totalSections?: number | null;
  completedSections?: number | null;
  // regions
  coveragePct?: number | null;
  country?: string | null;
}

export interface CollectionMeta {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string | null;
  cover_image: string | null;
  region: string | null;
  country: string | null;
}

export interface CollectionItemsResponse {
  collection: CollectionMeta;
  items: CollectionItem[];
}

export function fetchCollectionItems(
  slug: string,
  params?: { limit?: number; offset?: number }
): Promise<CollectionItemsResponse> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.offset) qs.set("offset", String(params.offset));
  const q = qs.toString();
  return apiGet(`/collections/${slug}${q ? `?${q}` : ""}`);
}
