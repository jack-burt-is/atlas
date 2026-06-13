import React from "react";
import { FeatureDetail } from "./FeatureDetail";
import { RegionOverview } from "./RegionOverview";
import type { MapFeatureProperties, MapFeatureCollection } from "../../api/map";
import type { FilterType } from "./FilterBar";

interface MapInspectorProps {
  selected: MapFeatureProperties | null;
  features: MapFeatureCollection | null;
  filter: FilterType;
  onSelect: (f: MapFeatureProperties) => void;
  onDeselect: () => void;
  regionName?: string;
  regionCoveragePct?: number;
}

export function MapInspector({
  selected,
  features,
  filter,
  onSelect,
  onDeselect,
  regionName,
  regionCoveragePct,
}: MapInspectorProps) {
  const nearby = selected
    ? (features?.features ?? [])
        .map((f) => f.properties)
        .filter((f) => f.type === selected.type && f.id !== selected.id)
        .slice(0, 3)
    : [];

  return (
    <aside
      style={{
        width: 360,
        flex: "0 0 360px",
        borderLeft: "1px solid var(--border-subtle)",
        background: "var(--surface-card)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {selected ? (
        <FeatureDetail
          feature={selected}
          nearby={nearby}
          onBack={onDeselect}
          onSelect={onSelect}
        />
      ) : (
        <RegionOverview
          filter={filter}
          features={features}
          onSelect={onSelect}
          regionName={regionName}
          regionCoveragePct={regionCoveragePct}
        />
      )}
    </aside>
  );
}
