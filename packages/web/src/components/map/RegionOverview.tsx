import React from "react";
import { Mountain, Route, Flag, Target } from "lucide-react";
import { Badge } from "../Badge";
import { ProgressRing } from "../ProgressRing";
import { StatBlock } from "../StatBlock";
import type { MapFeatureProperties, MapFeatureCollection } from "../../api/map";
import type { FilterType } from "./FilterBar";

function DirectoryRow({
  feature,
  onSelect,
}: {
  feature: MapFeatureProperties;
  onSelect: (f: MapFeatureProperties) => void;
}) {
  const got = feature.status === "collected";
  const meta =
    feature.type === "peak"
      ? `${feature.elevation ?? "?"} m`
      : feature.type === "trail"
        ? `${feature.distanceKm ?? "?"} km`
        : feature.category ?? "Landmark";

  return (
    <button
      onClick={() => onSelect(feature)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        padding: "9px 10px",
        borderRadius: "var(--radius-md)",
        border: "1px solid transparent",
        background: "transparent",
        font: "inherit",
        transition: "var(--t-colors)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-raised)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          flex: "0 0 auto",
          borderRadius: "var(--radius-md)",
          display: "grid",
          placeItems: "center",
          background: got ? "var(--accent-soft)" : "var(--surface-sunken)",
          border: "1px solid " + (got ? "var(--border-gold)" : "var(--border-default)"),
          color: got ? "var(--gold-400)" : "var(--text-muted)",
        }}
      >
        {feature.type === "trail" ? (
          <Route size={16} />
        ) : feature.type === "peak" ? (
          <Mountain size={16} />
        ) : (
          <Flag size={16} />
        )}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--text-primary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {feature.name}
        </div>
        <div className="eyebrow" style={{ fontSize: 9.5, marginTop: 2 }}>
          {meta}
        </div>
      </div>
      <span
        style={{
          width: 8,
          height: 8,
          flex: "0 0 auto",
          borderRadius: "50%",
          background:
            feature.status === "collected"
              ? "var(--gold-400)"
              : feature.status === "in_progress"
                ? "var(--sky-400)"
                : "var(--text-muted)",
          boxShadow: got ? "var(--glow-gold-sm)" : "none",
        }}
      />
    </button>
  );
}

interface RegionOverviewProps {
  filter: FilterType;
  features: MapFeatureCollection | null;
  onSelect: (f: MapFeatureProperties) => void;
  regionName?: string;
  regionCoveragePct?: number;
}

export function RegionOverview({
  filter,
  features,
  onSelect,
  regionName = "Visible area",
  regionCoveragePct,
}: RegionOverviewProps) {
  const all = features?.features ?? [];

  const shown = all.filter((f) => {
    if (filter === "all") return true;
    if (filter === "gaps") return f.properties.status === "not_collected";
    if (filter === "completed") return f.properties.status === "collected";
    if (filter === "peaks") return f.properties.type === "peak";
    if (filter === "trails") return f.properties.type === "trail";
    if (filter === "landmarks") return f.properties.type === "landmark";
    return true;
  });

  const peaks = all.filter((f) => f.properties.type === "peak");
  const trails = all.filter((f) => f.properties.type === "trail");
  const landmarks = all.filter((f) => f.properties.type === "landmark");
  const gaps = all.filter((f) => f.properties.status === "not_collected");

  const collectedPeaks = peaks.filter((f) => f.properties.status === "collected").length;
  const collectedTrails = trails.filter((f) => f.properties.status === "collected").length;
  const collectedLandmarks = landmarks.filter((f) => f.properties.status === "collected").length;

  const stats = [
    { label: "Peaks", value: `${collectedPeaks}/${peaks.length}`, icon: <Mountain size={11} /> },
    { label: "Trails", value: `${collectedTrails}/${trails.length}`, icon: <Route size={11} /> },
    { label: "Landmarks", value: `${collectedLandmarks}/${landmarks.length}`, icon: <Flag size={11} /> },
    { label: "Gaps", value: String(gaps.length), icon: <Target size={11} /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          padding: 18,
          display: "flex",
          alignItems: "center",
          gap: 16,
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {regionCoveragePct != null ? (
          <ProgressRing value={regionCoveragePct} size={84} stroke={9} label="Explored" />
        ) : (
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: "var(--surface-sunken)",
              border: "2px solid var(--border-default)",
              display: "grid",
              placeItems: "center",
              flex: "0 0 84px",
            }}
          >
            <Mountain size={28} color="var(--text-muted)" />
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow" style={{ fontSize: 10, marginBottom: 5 }}>
            Exploration area
          </div>
          <div
            style={{
              font: "var(--type-h3)",
              fontSize: 18,
              color: "var(--text-primary)",
              marginBottom: 8,
            }}
          >
            {regionName}
          </div>
          {regionCoveragePct != null && (
            <Badge variant="gold" dot>
              {regionCoveragePct.toFixed(0)}% explored
            </Badge>
          )}
        </div>
      </div>

      <div
        style={{
          padding: "14px 18px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--surface-sunken)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "11px 13px",
            }}
          >
            <StatBlock size="sm" label={s.label} value={s.value} icon={s.icon} />
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px" }}>
        <div
          className="eyebrow"
          style={{
            fontSize: 10,
            padding: "0 6px 10px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>
            {filter === "all"
              ? "All features"
              : filter === "gaps"
                ? "Gaps"
                : filter.charAt(0).toUpperCase() + filter.slice(1)}{" "}
            on map
          </span>
          <span style={{ color: "var(--text-faint)" }}>{shown.length}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {shown.slice(0, 50).map((f) => (
            <DirectoryRow key={f.properties.id} feature={f.properties} onSelect={onSelect} />
          ))}
          {shown.length === 0 && (
            <div
              style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}
            >
              Nothing in view for this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
