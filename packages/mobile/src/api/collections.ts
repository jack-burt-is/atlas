import type { CollectionsResponse, CollectionItemsResponse } from "@atlas/shared";
import { apiClient } from "./client";

export type {
  Collection,
  CollectionsResponse,
  CollectionItem,
  CollectionMeta,
  CollectionItemsResponse,
} from "@atlas/shared";

export function fetchCollections(): Promise<CollectionsResponse> {
  return apiClient.get("/collections");
}

export function fetchCollectionItems(
  slug: string,
  params?: { limit?: number; offset?: number },
): Promise<CollectionItemsResponse> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.offset) qs.set("offset", String(params.offset));
  const q = qs.toString();
  return apiClient.get(`/collections/${slug}${q ? `?${q}` : ""}`);
}
