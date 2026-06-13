import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchMapFeatures,
  fetchHeatmap,
  type MapFeatureCollection,
  type HeatmapFeatureCollection,
} from "../api/map";

export function useMapFeatures(bbox: [number, number, number, number] | null, enabled = true) {
  const [debouncedBbox, setDebouncedBbox] = useState(bbox);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBbox(bbox), 300);
    return () => clearTimeout(timer);
  }, [bbox]);

  const features = useQuery<MapFeatureCollection>({
    queryKey: ["map/features", debouncedBbox],
    queryFn: () => fetchMapFeatures(debouncedBbox!),
    enabled: enabled && debouncedBbox !== null,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const heatmap = useQuery<HeatmapFeatureCollection>({
    queryKey: ["map/heatmap"],
    queryFn: fetchHeatmap,
    enabled,
    staleTime: 300_000,
  });

  return {
    features: features.data ?? null,
    heatmap: heatmap.data ?? null,
    isLoading: features.isFetching,
  };
}
