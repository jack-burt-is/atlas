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

export interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  collected: boolean;
  visits: number;
  lastVisit: string | null;
  elevation?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  wikiUrl?: string | null;
  category?: string | null;
  region?: string | null;
  distanceKm?: number | null;
  elevationGainM?: number | null;
  totalSections?: number | null;
  completedSections?: number | null;
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
