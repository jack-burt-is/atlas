import React from "react";
import { ArrowLeft, Mountain, Route, Flag, TrendingUp, Calendar, MapPin } from "lucide-react";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { ProgressBar } from "../ProgressBar";
import type { MapFeatureProperties, FeatureStatus } from "../../api/map";

const STATUS_META: Record<FeatureStatus, { label: string; variant: "success" | "info" | "neutral" }> = {
  collected: { label: "Collected", variant: "success" },
  in_progress: { label: "In progress", variant: "info" },
  not_collected: { label: "Not visited", variant: "neutral" },
};

function StatRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "9px 0",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "var(--text-muted)",
          fontSize: 13,
        }}
      >
        {icon}
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-primary)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function DirectoryRow({
  feature,
  onSelect,
  active,
}: {
  feature: MapFeatureProperties;
  onSelect: (f: MapFeatureProperties) => void;
  active?: boolean;
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
        padding: "8px 9px",
        borderRadius: "var(--radius-md)",
        border: "1px solid " + (active ? "var(--border-gold)" : "transparent"),
        background: active ? "var(--accent-soft)" : "transparent",
        font: "inherit",
        transition: "var(--t-colors)",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "var(--surface-raised)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
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

interface FeatureDetailProps {
  feature: MapFeatureProperties;
  nearby: MapFeatureProperties[];
  onBack: () => void;
  onSelect: (f: MapFeatureProperties) => void;
}

export function FeatureDetail({ feature, nearby, onBack, onSelect }: FeatureDetailProps) {
  const st = STATUS_META[feature.status];
  const isTrail = feature.type === "trail";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* hero */}
      <div style={{ position: "relative", height: 168, flex: "0 0 168px", overflow: "hidden" }}>
        <div
          className="atlas-topo"
          style={{ position: "absolute", inset: 0, background: "var(--surface-sunken)" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(0deg, var(--surface-card) 4%, color-mix(in srgb, var(--surface-card) 30%, transparent) 55%, transparent)",
          }}
        />
        <button
          onClick={onBack}
          title="Back"
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            width: 34,
            height: 34,
            borderRadius: "var(--radius-pill)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            color: "var(--text-primary)",
            background: "var(--surface-overlay)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid var(--border-default)",
          }}
        >
          <ArrowLeft size={17} />
        </button>
        <div style={{ position: "absolute", left: 18, right: 18, bottom: 14 }}>
          <div className="eyebrow" style={{ fontSize: 10, marginBottom: 6 }}>
            {feature.type === "peak"
              ? "Peak"
              : isTrail
                ? "Trail"
                : feature.category ?? "Landmark"}
          </div>
          <h2
            style={{
              font: "var(--type-h2)",
              fontSize: 24,
              color: "var(--text-primary)",
              margin: 0,
              letterSpacing: "-.01em",
              lineHeight: 1.05,
            }}
          >
            {feature.name}
          </h2>
        </div>
      </div>

      {/* body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Badge variant={st.variant} dot={feature.status !== "not_collected"}>
            {st.label}
          </Badge>
          {feature.type === "peak" && feature.elevation != null && (
            <Badge variant="neutral">{feature.elevation} m</Badge>
          )}
          {isTrail && feature.distanceKm != null && (
            <Badge variant="neutral">{feature.distanceKm} km</Badge>
          )}
        </div>

        {isTrail && feature.status === "in_progress" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 7,
              }}
            >
              <span style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 600 }}>
                Sections walked
              </span>
            </div>
            <ProgressBar value={1} max={4} color="sky" />
          </div>
        )}

        <div>
          {feature.type === "peak" && (
            <>
              <StatRow label="Elevation" value={`${feature.elevation ?? "—"} m`} icon={<Mountain size={14} color="var(--text-faint)" />} />
              <StatRow label="Status" value={st.label} icon={<MapPin size={14} color="var(--text-faint)" />} />
            </>
          )}
          {isTrail && (
            <>
              <StatRow label="Distance" value={feature.distanceKm != null ? `${feature.distanceKm} km` : "—"} icon={<Route size={14} color="var(--text-faint)" />} />
              <StatRow label="Status" value={st.label} icon={<TrendingUp size={14} color="var(--text-faint)" />} />
            </>
          )}
          {feature.type === "landmark" && (
            <>
              <StatRow label="Type" value={feature.category ?? "Landmark"} icon={<Flag size={14} color="var(--text-faint)" />} />
              <StatRow label="Status" value={st.label} icon={<Calendar size={14} color="var(--text-faint)" />} />
            </>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {feature.status === "collected" ? (
            <Button variant="secondary" block leftIcon={<Mountain size={15} />}>
              View details
            </Button>
          ) : (
            <Button variant="primary" block leftIcon={<Flag size={15} />}>
              {feature.status === "in_progress" ? "Continue" : "Add to plan"}
            </Button>
          )}
        </div>

        {nearby.length > 0 && (
          <>
            <div style={{ height: 1, background: "var(--border-subtle)" }} />
            <div>
              <div className="eyebrow" style={{ fontSize: 10, marginBottom: 10 }}>
                More {feature.type === "peak" ? "peaks" : feature.type === "trail" ? "trails" : "landmarks"} nearby
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {nearby.map((f) => (
                  <DirectoryRow key={f.id} feature={f} onSelect={onSelect} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
