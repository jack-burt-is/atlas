import { apiGet } from "../lib/api-client";

export type FeatureStatus = "collected" | "in_progress" | "not_collected";
export type FeatureKind = "peak" | "trail" | "landmark";

export interface MapFeatureProperties {
  id: string;
  name: string;
  slug: string;
  type: FeatureKind;
  status: FeatureStatus;
  elevation?: number;
  distanceKm?: number;
  category?: string;
}

export interface MapFeature {
  type: "Feature";
  geometry: { type: string; coordinates: unknown };
  properties: MapFeatureProperties;
}

export interface MapFeatureCollection {
  type: "FeatureCollection";
  features: MapFeature[];
}

export interface HeatmapFeature {
  type: "Feature";
  geometry: { type: "LineString"; coordinates: [number, number][] };
  properties: { id: string; name: string; startedAt: string };
}

export interface HeatmapFeatureCollection {
  type: "FeatureCollection";
  features: HeatmapFeature[];
}

export function fetchMapFeatures(
  bbox: [number, number, number, number],
  types?: string
): Promise<MapFeatureCollection> {
  const [w, s, e, n] = bbox;
  const params = new URLSearchParams({ bbox: `${w},${s},${e},${n}` });
  if (types) params.set("types", types);
  return apiGet(`/map/features?${params}`);
}

export function fetchHeatmap(): Promise<HeatmapFeatureCollection> {
  return apiGet("/map/heatmap");
}
