import React from "react";
import type { MapFeatureCollection } from "../../api/map";

export type FilterType = "all" | "peaks" | "trails" | "landmarks" | "gaps" | "completed";

interface FilterBarProps {
  filter: FilterType;
  onChange: (f: FilterType) => void;
  features: MapFeatureCollection | null;
}

export function FilterBar({ filter, onChange, features }: FilterBarProps) {
  const f = features?.features ?? [];
  const counts: Record<FilterType, number> = {
    all: f.length,
    peaks: f.filter((x) => x.properties.type === "peak").length,
    trails: f.filter((x) => x.properties.type === "trail").length,
    landmarks: f.filter((x) => x.properties.type === "landmark").length,
    gaps: f.filter((x) => x.properties.status === "not_collected").length,
    completed: f.filter((x) => x.properties.status === "collected").length,
  };

  const tabs: [FilterType, string][] = [
    ["all", "All"],
    ["peaks", "Peaks"],
    ["trails", "Trails"],
    ["landmarks", "Landmarks"],
    ["gaps", "Gaps"],
    ["completed", "Completed"],
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        padding: 5,
        borderRadius: "var(--radius-pill)",
        background: "var(--surface-overlay)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-md)",
        overflowX: "auto",
      }}
    >
      {tabs.map(([id, label]) => {
        const on = filter === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "0 14px",
              height: 34,
              flex: "0 0 auto",
              borderRadius: "var(--radius-pill)",
              cursor: "pointer",
              border: "none",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 600,
              background: on ? "var(--accent)" : "transparent",
              color: on ? "var(--text-on-gold)" : "var(--text-secondary)",
              boxShadow: on ? "var(--glow-gold-sm)" : "none",
              transition: "var(--t-colors)",
            }}
          >
            {label}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: "var(--radius-pill)",
                background: on ? "rgba(0,0,0,.16)" : "var(--surface-sunken)",
                color: on ? "var(--text-on-gold)" : "var(--text-muted)",
              }}
            >
              {counts[id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
