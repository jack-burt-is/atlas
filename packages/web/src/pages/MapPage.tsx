import React, { useState, useCallback, useRef } from "react";
import { MountainSnow, Plus, Minus, LocateFixed } from "lucide-react";
import { AtlasMap, type AtlasMapControls } from "../components/map/AtlasMap";
import { MapInspector } from "../components/map/MapInspector";
import { FilterBar, type FilterType } from "../components/map/FilterBar";
import { useMapFeatures } from "../hooks/useMapFeatures";
import type { MapFeatureProperties, MapFeatureCollection, HeatmapFeatureCollection } from "../api/map";

function CtrlBtn({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        width: 38,
        height: 38,
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        background: "var(--surface-overlay)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "none",
        borderBottom: "1px solid var(--border-default)",
        color: "var(--text-secondary)",
        transition: "var(--t-colors)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--text-primary)";
        e.currentTarget.style.background = "var(--surface-raised)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-secondary)";
        e.currentTarget.style.background = "var(--surface-overlay)";
      }}
    >
      {icon}
    </button>
  );
}

interface MapPageProps {
  staticFeatures?: MapFeatureCollection;
  staticHeatmap?: HeatmapFeatureCollection;
  initialFilter?: FilterType;
}

export default function MapPage({ staticFeatures, staticHeatmap, initialFilter }: MapPageProps = {}) {
  const isStatic = staticFeatures != null;
  const [filter, setFilter] = useState<FilterType>(initialFilter ?? "all");
  const [bbox, setBbox] = useState<[number, number, number, number] | null>(null);
  const [selected, setSelected] = useState<MapFeatureProperties | null>(null);
  const mapControlsRef = useRef<AtlasMapControls | null>(null);

  const { features: liveFeatures, heatmap: liveHeatmap } = useMapFeatures(bbox, !isStatic);
  const features = staticFeatures ?? liveFeatures;
  const heatmap = staticHeatmap ?? liveHeatmap;

  const handleBoundsChange = useCallback((b: [number, number, number, number]) => {
    setBbox(b);
  }, []);

  const handleFeatureSelect = useCallback((f: MapFeatureProperties) => {
    setSelected(f);
  }, []);

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden", position: "relative" }}>
      {/* Map canvas */}
      <div style={{ flex: 1, minWidth: 0, position: "relative", overflow: "hidden" }}>
        <AtlasMap
          features={features}
          heatmap={heatmap}
          selectedId={selected?.id ?? null}
          filter={filter}
          onFeatureSelect={handleFeatureSelect}
          onBoundsChange={handleBoundsChange}
          controlsRef={mapControlsRef}
        />

        {/* TOP overlays */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            right: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {/* Region pill */}
          <div
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: "var(--radius-pill)",
              background: "var(--surface-overlay)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <MountainSnow size={16} color="var(--gold-400)" />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>
              Explore
            </span>
          </div>

          {/* Filter tabs */}
          <div style={{ pointerEvents: "auto" }}>
            <FilterBar filter={filter} onChange={setFilter} features={features} />
          </div>
        </div>

        {/* LEGEND bottom-left */}
        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 16,
            display: "flex",
            flexDirection: "column",
            gap: 7,
            padding: "11px 13px",
            borderRadius: "var(--radius-md)",
            background: "var(--surface-overlay)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-md)",
            zIndex: 10,
          }}
        >
          <div className="eyebrow" style={{ fontSize: 9, marginBottom: 1 }}>
            Legend
          </div>
          {[
            ["#F4B740", "Collected"],
            ["#46B6E8", "In progress"],
            ["rgba(86,103,119,0.7)", "Not visited"],
          ].map(([color, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: color,
                  boxShadow: color === "#F4B740" ? "0 0 6px rgba(244,183,64,0.55)" : "none",
                }}
              />
              <span
                style={{
                  fontSize: 11.5,
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ZOOM CONTROLS bottom-right */}
        <div
          style={{
            position: "absolute",
            right: 16,
            bottom: 16,
            display: "flex",
            flexDirection: "column",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-md)",
            zIndex: 10,
          }}
        >
          <CtrlBtn icon={<Plus size={17} />} title="Zoom in" onClick={() => mapControlsRef.current?.zoom(1)} />
          <CtrlBtn icon={<Minus size={17} />} title="Zoom out" onClick={() => mapControlsRef.current?.zoom(-1)} />
          <CtrlBtn icon={<LocateFixed size={17} />} title="Reset view" onClick={() => mapControlsRef.current?.reset()} />
        </div>
      </div>

      {/* Inspector rail */}
      <MapInspector
        selected={selected}
        features={features}
        filter={filter}
        onSelect={handleFeatureSelect}
        onDeselect={() => setSelected(null)}
      />
    </div>
  );
}
