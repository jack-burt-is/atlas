import { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { BlurView } from "expo-blur";
import type { MapFeatureProperties, MapFeature } from "@atlas/shared";
import { fetchMapFeatures, fetchHeatmap } from "../../src/api/map";
import { colors, typography, spacing, radius, tabbarHeight } from "../../src/theme/tokens";

MapLibreGL.setAccessToken(null);

const STYLE_URL = "https://tiles.openfreemap.org/styles/dark";
const GOLD = "#F4B740";
const SKY = "#46B6E8";
const GREY = "#566777";

type FilterKind = "all" | "peaks" | "trails" | "landmarks" | "gaps" | "completed";

const FILTER_TABS: Array<{ key: FilterKind; label: string }> = [
  { key: "all", label: "ALL" },
  { key: "peaks", label: "PEAKS" },
  { key: "trails", label: "TRAILS" },
  { key: "landmarks", label: "LANDMARKS" },
  { key: "gaps", label: "GAPS" },
  { key: "completed", label: "DONE" },
];

// MapLibre expression for status → colour
const STATUS_COLOR_EXPR = [
  "match", ["get", "status"],
  "collected", GOLD,
  "in_progress", SKY,
  GREY,
] as unknown as string;

function filterByKind(features: MapFeature[], type: "peak" | "trail" | "landmark", filter: FilterKind): MapFeature[] {
  const byType = features.filter((f) => f.properties.type === type);
  if (filter === "completed") return byType.filter((f) => f.properties.status === "collected");
  if (filter === "gaps") return byType.filter((f) => f.properties.status === "not_collected");
  if (filter === "peaks") return type === "peak" ? byType : [];
  if (filter === "trails") return type === "trail" ? byType : [];
  if (filter === "landmarks") return type === "landmark" ? byType : [];
  return byType; // "all"
}

function statusColor(status: string): string {
  if (status === "collected") return GOLD;
  if (status === "in_progress") return SKY;
  return GREY;
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [filter, setFilter] = useState<FilterKind>("all");
  const [selectedFeature, setSelectedFeature] = useState<MapFeatureProperties | null>(null);
  const [bbox, setBbox] = useState<[number, number, number, number]>([-3.2, 54.3, -2.8, 54.6]);

  const { data, isLoading } = useQuery({
    queryKey: ["mapFeatures", bbox],
    queryFn: () => fetchMapFeatures(bbox),
    staleTime: 30_000,
  });

  const { data: heatmapData } = useQuery({
    queryKey: ["heatmap"],
    queryFn: fetchHeatmap,
    staleTime: 120_000,
  });

  const allFeatures = data?.features ?? [];

  const counts: Record<FilterKind, number> = {
    all: allFeatures.length,
    peaks: allFeatures.filter((f) => f.properties.type === "peak").length,
    trails: allFeatures.filter((f) => f.properties.type === "trail").length,
    landmarks: allFeatures.filter((f) => f.properties.type === "landmark").length,
    gaps: allFeatures.filter((f) => f.properties.status === "not_collected").length,
    completed: allFeatures.filter((f) => f.properties.status === "collected").length,
  };

  const peakGeoJSON = { type: "FeatureCollection" as const, features: filterByKind(allFeatures, "peak", filter) };
  const trailGeoJSON = { type: "FeatureCollection" as const, features: filterByKind(allFeatures, "trail", filter) };
  const landmarkGeoJSON = { type: "FeatureCollection" as const, features: filterByKind(allFeatures, "landmark", filter) };
  const heatmapGeoJSON = heatmapData ?? { type: "FeatureCollection" as const, features: [] };

  const handleFeatureTap = useCallback((props: MapFeatureProperties) => {
    setSelectedFeature(props);
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleMapPress = useCallback(() => {
    setSelectedFeature(null);
    bottomSheetRef.current?.close();
  }, []);

  const handleRegionDidChange = useCallback((feature: any) => {
    const bounds = feature?.properties?.visibleBounds;
    if (!bounds) return;
    // visibleBounds = [[ne_lng, ne_lat], [sw_lng, sw_lat]]
    const [[eLng, nLat], [wLng, sLat]] = bounds;
    setBbox([wLng, sLat, eLng, nLat]);
  }, []);

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={styles.map}
        mapStyle={STYLE_URL}
        onPress={handleMapPress}
        onRegionDidChange={handleRegionDidChange}
      >
        <MapLibreGL.Camera
          defaultSettings={{ centerCoordinate: [-3.0, 54.45], zoomLevel: 10 }}
        />

        {/* Activity routes — gold GPS traces */}
        <MapLibreGL.ShapeSource id="heatmap" shape={heatmapGeoJSON as any}>
          <MapLibreGL.LineLayer
            id="heatmap-line"
            style={{ lineColor: GOLD, lineWidth: 3, lineOpacity: 0.65 }}
          />
        </MapLibreGL.ShapeSource>

        {/* Trails */}
        <MapLibreGL.ShapeSource
          id="trails"
          shape={trailGeoJSON as any}
          onPress={(e) => {
            const f = e.features?.[0];
            if (f?.properties) handleFeatureTap(f.properties as MapFeatureProperties);
          }}
        >
          <MapLibreGL.LineLayer
            id="trails-line"
            style={{
              lineColor: STATUS_COLOR_EXPR,
              lineWidth: 3,
              lineOpacity: 0.85,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        </MapLibreGL.ShapeSource>

        {/* Landmarks */}
        <MapLibreGL.ShapeSource
          id="landmarks"
          shape={landmarkGeoJSON as any}
          onPress={(e) => {
            const f = e.features?.[0];
            if (f?.properties) handleFeatureTap(f.properties as MapFeatureProperties);
          }}
        >
          <MapLibreGL.CircleLayer
            id="landmarks-circle"
            style={{
              circleRadius: 6,
              circleColor: ["match", ["get", "status"], "collected", SKY, GREY] as any,
              circleStrokeWidth: 1.5,
              circleStrokeColor: "rgba(255,255,255,0.15)",
              circleOpacity: 0.9,
            }}
          />
        </MapLibreGL.ShapeSource>

        {/* Peaks — gold glow ring + filled circle */}
        <MapLibreGL.ShapeSource
          id="peaks"
          shape={peakGeoJSON as any}
          onPress={(e) => {
            const f = e.features?.[0];
            if (f?.properties) handleFeatureTap(f.properties as MapFeatureProperties);
          }}
        >
          <MapLibreGL.CircleLayer
            id="peaks-glow"
            style={{
              circleRadius: 16,
              circleColor: GOLD,
              circleOpacity: ["match", ["get", "status"], "collected", 0.12, 0] as any,
              circleBlur: 1,
            }}
          />
          <MapLibreGL.CircleLayer
            id="peaks-circle"
            style={{
              circleRadius: 9,
              circleColor: STATUS_COLOR_EXPR,
              circleStrokeWidth: 2,
              circleStrokeColor: ["match", ["get", "status"],
                "collected", "rgba(244,183,64,0.45)",
                "rgba(255,255,255,0.12)",
              ] as any,
            }}
          />
        </MapLibreGL.ShapeSource>
      </MapLibreGL.MapView>

      {/* Filter bar */}
      <View style={[styles.filterContainer, { top: insets.top + spacing[2] }]}>
        <BlurView intensity={60} tint="dark" style={styles.filterBlur}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {FILTER_TABS.map((tab) => {
              const active = filter === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setFilter(tab.key)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {tab.label}
                  </Text>
                  <View style={[styles.chipBadge, active && styles.chipBadgeActive]}>
                    <Text style={[styles.chipBadgeText, active && styles.chipBadgeTextActive]}>
                      {counts[tab.key]}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </BlurView>
      </View>

      {/* Loading spinner */}
      {isLoading && (
        <View style={[styles.loadingIndicator, { bottom: tabbarHeight + insets.bottom + spacing[4] }]}>
          <ActivityIndicator color={colors.accent} size="small" />
        </View>
      )}

      {/* Legend */}
      <View style={[styles.legend, { bottom: tabbarHeight + insets.bottom + spacing[4] }]}>
        {([["collected", GOLD, "Collected"], ["in_progress", SKY, "In progress"], ["not_collected", GREY, "Not visited"]] as const).map(
          ([, color, label]) => (
            <View key={label} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          )
        )}
      </View>

      {/* Feature detail bottom sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["30%"]}
        enablePanDownToClose
        onClose={() => setSelectedFeature(null)}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
        bottomInset={tabbarHeight + insets.bottom}
      >
        <BottomSheetView style={styles.sheetContent}>
          {selectedFeature !== null && (
            <>
              <View style={styles.sheetHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureType}>{selectedFeature.type.toUpperCase()}</Text>
                  <Text style={styles.featureName}>{selectedFeature.name}</Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: statusColor(selectedFeature.status) }]} />
              </View>
              <View style={styles.sheetMeta}>
                {selectedFeature.elevation !== undefined && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>ELEVATION</Text>
                    <Text style={styles.metaValue}>{selectedFeature.elevation}m</Text>
                  </View>
                )}
                {selectedFeature.distanceKm !== undefined && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>DISTANCE</Text>
                    <Text style={styles.metaValue}>{selectedFeature.distanceKm}km</Text>
                  </View>
                )}
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>STATUS</Text>
                  <Text style={[styles.metaValue, { color: statusColor(selectedFeature.status) }]}>
                    {selectedFeature.status.replace(/_/g, " ").toUpperCase()}
                  </Text>
                </View>
              </View>
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp },
  map: { flex: 1 },

  filterContainer: {
    position: "absolute",
    left: spacing[4],
    right: spacing[4],
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  filterBlur: {
    borderRadius: radius.pill,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  filterScroll: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1] + 2,
    flexDirection: "row",
    gap: spacing[1],
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1] + 2,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 4,
    borderRadius: radius.pill,
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  chipTextActive: { color: colors.textOnGold },
  chipBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    minWidth: 18,
    alignItems: "center",
  },
  chipBadgeActive: { backgroundColor: "rgba(0,0,0,0.18)" },
  chipBadgeText: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: "700",
  },
  chipBadgeTextActive: { color: colors.textOnGold },

  loadingIndicator: {
    position: "absolute",
    right: spacing[4],
  },

  legend: {
    position: "absolute",
    left: spacing[4],
    backgroundColor: colors.surfaceOverlay,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.borderDefault,
    gap: 6,
  },
  legendRow: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },

  sheetBackground: {
    backgroundColor: colors.surfaceRaised,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
  },
  sheetHandle: { backgroundColor: colors.ink[600], width: 32 },
  sheetContent: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[5],
    gap: spacing[4],
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  featureType: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  featureName: {
    fontFamily: typography.displaySemiBold,
    fontSize: 22,
    color: colors.textPrimary,
    lineHeight: 26,
  },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  sheetMeta: { flexDirection: "row", gap: spacing[6] },
  metaItem: { gap: 3 },
  metaLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.textFaint,
    letterSpacing: 1.2,
  },
  metaValue: {
    fontFamily: typography.displaySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
});
