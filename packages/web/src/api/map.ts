import type { MapFeatureCollection, HeatmapFeatureCollection } from "@atlas/shared";
import { apiGet } from "../lib/api-client";

export type {
  FeatureStatus,
  FeatureKind,
  MapFeatureProperties,
  MapFeature,
  MapFeatureCollection,
  HeatmapFeature,
  HeatmapFeatureCollection,
} from "@atlas/shared";

export function fetchMapFeatures(
  bbox: [number, number, number, number],
  types?: string,
): Promise<MapFeatureCollection> {
  const [w, s, e, n] = bbox;
  const params = new URLSearchParams({ bbox: `${w},${s},${e},${n}` });
  if (types) params.set("types", types);
  return apiGet(`/map/features?${params}`);
}

export function fetchHeatmap(): Promise<HeatmapFeatureCollection> {
  return apiGet("/map/heatmap");
}
