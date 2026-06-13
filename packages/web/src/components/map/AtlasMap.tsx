import React, { useRef, useEffect, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapFeatureCollection, HeatmapFeatureCollection, MapFeatureProperties } from "../../api/map";
import type { FilterType } from "./FilterBar";

type FeatureCollection = { type: "FeatureCollection"; features: Feature[] };
type Feature = { type: "Feature"; geometry: { type: string; coordinates: unknown }; properties: Record<string, unknown> };
type PointGeom = { type: "Point"; coordinates: [number, number] };

// OpenFreeMap dark style — no API key required
const MAP_STYLE = "https://tiles.openfreemap.org/styles/dark";

// Design token hex values (CSS vars can't be used in MapLibre paint)
const GOLD = "#F4B740";
const SKY = "#46B6E8";
const GREY = "#566777";
const GOLD_TEXT = "#1A1A2E";

// Creates a circular peak marker image: coloured circle + mountain silhouette
function createPeakMarkerImage(bgColor: string, size: number): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const r = size / 2;

  ctx.beginPath();
  ctx.arc(r, r, r - 1.5, 0, Math.PI * 2);
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Lucide Mountain outline scaled into the icon area
  // Original path points from a 24×24 viewbox: (8,3)→(12,12)→(17,7)→(22,22)→(2,22)
  const pad = Math.round(size * 0.2);
  const sc = (size - pad * 2) / 24;
  const ox = pad;
  const oy = pad;
  ctx.beginPath();
  ctx.moveTo(ox + 8  * sc, oy + 3  * sc);
  ctx.lineTo(ox + 12 * sc, oy + 12 * sc);
  ctx.lineTo(ox + 17 * sc, oy + 7  * sc);
  ctx.lineTo(ox + 22 * sc, oy + 22 * sc);
  ctx.lineTo(ox + 2  * sc, oy + 22 * sc);
  ctx.closePath();
  ctx.fillStyle = "rgba(12, 18, 28, 0.80)";
  ctx.fill();

  return ctx.getImageData(0, 0, size, size);
}

export interface AtlasMapControls {
  zoom: (delta: number) => void;
  reset: () => void;
}

interface AtlasMapProps {
  features: MapFeatureCollection | null;
  heatmap: HeatmapFeatureCollection | null;
  selectedId: string | null;
  filter: FilterType;
  onFeatureSelect: (f: MapFeatureProperties) => void;
  onBoundsChange: (bbox: [number, number, number, number]) => void;
  controlsRef?: React.RefObject<AtlasMapControls | null>;
}

const EMPTY_FC: FeatureCollection = { type: "FeatureCollection", features: [] };

function applyFilter(map: maplibregl.Map, filter: FilterType) {
  const gapExpr: maplibregl.FilterSpecification = ["==", ["get", "status"], "not_collected"];
  const collectedExpr: maplibregl.FilterSpecification = ["==", ["get", "status"], "collected"];

  const showPeaks = filter === "all" || filter === "peaks" || filter === "gaps" || filter === "completed";
  const showTrails = filter === "all" || filter === "trails" || filter === "gaps" || filter === "completed";
  const showLandmarks = filter === "all" || filter === "landmarks" || filter === "gaps" || filter === "completed";

  const setVis = (id: string, vis: boolean) => {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, "visibility", vis ? "visible" : "none");
    }
  };

  setVis("peaks-symbol", showPeaks);
  setVis("peaks-cluster", showPeaks);
  setVis("peaks-cluster-count", showPeaks);
  setVis("trails-line", showTrails);
  setVis("landmarks-circle", showLandmarks);

  if (filter === "gaps") {
    if (map.getLayer("peaks-symbol")) map.setFilter("peaks-symbol", ["all", ["!", ["has", "point_count"]], gapExpr]);
    if (map.getLayer("trails-line")) map.setFilter("trails-line", gapExpr);
    if (map.getLayer("landmarks-circle")) map.setFilter("landmarks-circle", gapExpr);
  } else if (filter === "completed") {
    if (map.getLayer("peaks-symbol")) map.setFilter("peaks-symbol", ["all", ["!", ["has", "point_count"]], collectedExpr]);
    if (map.getLayer("trails-line")) map.setFilter("trails-line", collectedExpr);
    if (map.getLayer("landmarks-circle")) map.setFilter("landmarks-circle", collectedExpr);
  } else {
    if (map.getLayer("peaks-symbol")) map.setFilter("peaks-symbol", ["!", ["has", "point_count"]]);
    if (map.getLayer("trails-line")) map.setFilter("trails-line", null);
    if (map.getLayer("landmarks-circle")) map.setFilter("landmarks-circle", null);
  }
}

export function AtlasMap({
  features,
  heatmap,
  selectedId,
  filter,
  onFeatureSelect,
  onBoundsChange,
  controlsRef,
}: AtlasMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const sourcesReadyRef = useRef(false);
  const featuresRef = useRef<MapFeatureCollection | null>(null);
  const heatmapRef = useRef<HeatmapFeatureCollection | null>(null);

  // Keep refs in sync so the load handler can read the latest data
  featuresRef.current = features;
  heatmapRef.current = heatmap;

  const emitBounds = useCallback(
    (map: maplibregl.Map) => {
      const b = map.getBounds();
      onBoundsChange([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    },
    [onBoundsChange]
  );

  // Initialise map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [-3.1, 54.5],
      zoom: 9,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      // Sources
      map.addSource("peaks", {
        type: "geojson",
        data: EMPTY_FC as maplibregl.GeoJSONSourceSpecification["data"],
        cluster: true,
        clusterMaxZoom: 9,
        clusterRadius: 40,
      });
      map.addSource("trails", { type: "geojson", data: EMPTY_FC as maplibregl.GeoJSONSourceSpecification["data"] });
      map.addSource("landmarks", { type: "geojson", data: EMPTY_FC as maplibregl.GeoJSONSourceSpecification["data"] });
      map.addSource("heatmap", { type: "geojson", data: EMPTY_FC as maplibregl.GeoJSONSourceSpecification["data"] });

      // Activity heatmap layer — user GPS traces
      map.addLayer({
        id: "activity-heatmap",
        type: "line",
        source: "heatmap",
        paint: {
          "line-color": GOLD,
          "line-opacity": 0.65,
          "line-width": 4,
        },
      });

      // Trail line layer
      map.addLayer({
        id: "trails-line",
        type: "line",
        source: "trails",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": [
            "match",
            ["get", "status"],
            "collected", GOLD,
            "in_progress", SKY,
            GREY,
          ],
          "line-width": 3,
          "line-opacity": 0.85,
          "line-dasharray": ["case", ["==", ["get", "status"], "not_collected"], ["literal", [4, 3]], ["literal", [1, 0]]],
        },
      });

      // Cluster circles
      map.addLayer({
        id: "peaks-cluster",
        type: "circle",
        source: "peaks",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": GOLD,
          "circle-radius": ["step", ["get", "point_count"], 16, 10, 22, 30, 28],
          "circle-opacity": 0.85,
        },
      });

      // Cluster count labels
      map.addLayer({
        id: "peaks-cluster-count",
        type: "symbol",
        source: "peaks",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Noto Sans Bold"],
          "text-size": 12,
        },
        paint: { "text-color": GOLD_TEXT },
      });

      // Register circular peak marker images
      map.addImage("peak-collected",     createPeakMarkerImage(GOLD, 24), { pixelRatio: 1 });
      map.addImage("peak-not-collected", createPeakMarkerImage(GREY, 24), { pixelRatio: 1 });

      // Individual peak symbols
      map.addLayer({
        id: "peaks-symbol",
        type: "symbol",
        source: "peaks",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": ["match", ["get", "status"], "collected", "peak-collected", "peak-not-collected"],
          "icon-size": 1.0,
          "icon-allow-overlap": true,
          "icon-anchor": "center",
        },
      });

      // Landmark circles
      map.addLayer({
        id: "landmarks-circle",
        type: "circle",
        source: "landmarks",
        paint: {
          "circle-color": ["match", ["get", "status"], "collected", SKY, GREY],
          "circle-radius": ["case", ["==", ["get", "id"], selectedId ?? ""], 9, 6],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "rgba(255,255,255,0.15)",
          "circle-opacity": 0.9,
        },
      });

      sourcesReadyRef.current = true;

      // Apply any data that arrived from cache before this load event fired
      const pendingHeatmap = heatmapRef.current;
      if (pendingHeatmap) {
        (map.getSource("heatmap") as maplibregl.GeoJSONSource).setData(
          pendingHeatmap as FeatureCollection
        );
      }
      const pendingFeatures = featuresRef.current;
      if (pendingFeatures) {
        const pf = pendingFeatures.features;
        (map.getSource("peaks") as maplibregl.GeoJSONSource).setData({
          type: "FeatureCollection",
          features: pf.filter((f) => f.properties.type === "peak") as unknown as Feature[],
        });
        (map.getSource("trails") as maplibregl.GeoJSONSource).setData({
          type: "FeatureCollection",
          features: pf.filter((f) => f.properties.type === "trail") as unknown as Feature[],
        });
        (map.getSource("landmarks") as maplibregl.GeoJSONSource).setData({
          type: "FeatureCollection",
          features: pf.filter((f) => f.properties.type === "landmark") as unknown as Feature[],
        });
      }

      // Click handlers
      map.on("click", "peaks-symbol", (e) => {
        const f = e.features?.[0];
        if (f) onFeatureSelect(f.properties as MapFeatureProperties);
      });
      map.on("click", "landmarks-circle", (e) => {
        const f = e.features?.[0];
        if (f) onFeatureSelect(f.properties as MapFeatureProperties);
      });
      map.on("click", "trails-line", (e) => {
        const f = e.features?.[0];
        if (f) onFeatureSelect(f.properties as MapFeatureProperties);
      });
      map.on("click", "peaks-cluster", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["peaks-cluster"] });
        const clusterId = features[0]?.properties?.["cluster_id"] as number | undefined;
        if (clusterId == null) return;
        const src = map.getSource("peaks") as maplibregl.GeoJSONSource;
        src.getClusterExpansionZoom(clusterId).then((zoom) => {
          const coords = (features[0]?.geometry as PointGeom)?.coordinates;
          if (coords) {
            map.easeTo({ center: [coords[0], coords[1]], zoom });
          }
        });
      });

      // Cursor pointers
      for (const layer of ["peaks-symbol", "landmarks-circle", "trails-line", "peaks-cluster"]) {
        map.on("mouseenter", layer, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", layer, () => { map.getCanvas().style.cursor = ""; });
      }

      // Expose imperative controls
      if (controlsRef) {
        (controlsRef as React.MutableRefObject<AtlasMapControls | null>).current = {
          zoom: (delta) => map.setZoom(map.getZoom() + delta),
          reset: () => map.flyTo({ center: [-3.1, 54.5], zoom: 9 }),
        };
      }

      // Bounds reporting
      map.on("moveend", () => emitBounds(map));
      map.on("zoomend", () => emitBounds(map));
      emitBounds(map);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        sourcesReadyRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update sources when feature data or filter changes.
  // Peaks are pre-filtered at the source level so MapLibre clustering only
  // aggregates the features that should actually be visible.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sourcesReadyRef.current) return;

    const allPeaks = features?.features.filter((f) => f.properties.type === "peak") ?? [];
    const trailFeatures = features?.features.filter((f) => f.properties.type === "trail") ?? [];
    const landmarkFeatures = features?.features.filter((f) => f.properties.type === "landmark") ?? [];

    const peakFeatures =
      filter === "completed"
        ? allPeaks.filter((f) => f.properties.status === "collected")
        : filter === "gaps"
        ? allPeaks.filter((f) => f.properties.status === "not_collected")
        : allPeaks;

    (map.getSource("peaks") as maplibregl.GeoJSONSource)?.setData({
      type: "FeatureCollection",
      features: peakFeatures as unknown as Feature[],
    });
    (map.getSource("trails") as maplibregl.GeoJSONSource)?.setData({
      type: "FeatureCollection",
      features: trailFeatures as unknown as Feature[],
    });
    (map.getSource("landmarks") as maplibregl.GeoJSONSource)?.setData({
      type: "FeatureCollection",
      features: landmarkFeatures as unknown as Feature[],
    });
  }, [features, filter]);

  // Update heatmap source
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sourcesReadyRef.current) return;
    (map.getSource("heatmap") as maplibregl.GeoJSONSource)?.setData(
      (heatmap ?? EMPTY_FC) as FeatureCollection
    );
  }, [heatmap]);

  // Update filter/visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    applyFilter(map, filter);
  }, [filter]);

  // Highlight selected feature
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const id = selectedId ?? "";
    if (map.getLayer("peaks-symbol")) {
      map.setLayoutProperty("peaks-symbol", "icon-size", ["case", ["==", ["get", "id"], id], 1.4, 1.0]);
    }
    if (map.getLayer("landmarks-circle")) {
      map.setPaintProperty("landmarks-circle", "circle-radius", ["case", ["==", ["get", "id"], id], 9, 6]);
    }
  }, [selectedId]);

  return (
    <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
  );
}
