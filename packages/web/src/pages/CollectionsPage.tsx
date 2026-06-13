import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowUpDown,
  CheckCircle2,
  Flag,
  LayoutGrid,
  MountainSnow,
  Route,
} from "lucide-react";
import { fetchCollections, type Collection } from "../api/collections";
import { AtlasPanel } from "../components/AtlasPanel";
import { ProgressRing } from "../components/ProgressRing";
import { ProgressBar } from "../components/ProgressBar";
import { CollectionCard } from "../components/CollectionCard";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";

const SKELETON_CSS = `
@keyframes atlas-pulse { 0%,100%{opacity:.4} 50%{opacity:.9} }
.atlas-skel{ border-radius:var(--radius-md); background:var(--surface-raised); animation:atlas-pulse 1.6s ease-in-out infinite; }
`;

function ensureSkeleton() {
  if (typeof document === "undefined") return;
  if (!document.getElementById("atlas-skel-css")) {
    const s = document.createElement("style");
    s.id = "atlas-skel-css";
    s.textContent = SKELETON_CSS;
    document.head.appendChild(s);
  }
}

function Skel({
  width = "100%",
  height = "20px",
}: {
  width?: string;
  height?: string;
}) {
  ensureSkeleton();
  return <div className="atlas-skel" style={{ width, height }} />;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  "Peak List": <MountainSnow size={19} />,
  peaks: <MountainSnow size={19} />,
  Peaks: <MountainSnow size={19} />,
  "National Trail": <Route size={19} />,
  Trails: <Route size={19} />,
  trails: <Route size={19} />,
  Landmarks: <Flag size={19} />,
  landmarks: <Flag size={19} />,
  Challenge: <CheckCircle2 size={19} />,
};

const TYPE_ICON_LG: Record<string, React.ReactNode> = {
  "Peak List": <MountainSnow size={26} />,
  peaks: <MountainSnow size={26} />,
  Peaks: <MountainSnow size={26} />,
  "National Trail": <Route size={26} />,
  Trails: <Route size={26} />,
  trails: <Route size={26} />,
  Landmarks: <Flag size={26} />,
  landmarks: <Flag size={26} />,
  Challenge: <CheckCircle2 size={26} />,
};

function pctOf(c: Collection) {
  return c.itemCount > 0
    ? Math.round((c.completedCount / c.itemCount) * 100)
    : 0;
}

export default function CollectionsPage() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = React.useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
  });

  const collections = data?.collections ?? [];
  const completed = collections.filter((c) => c.completedCount >= c.itemCount);
  const inProgress = collections.filter((c) => c.completedCount < c.itemCount);
  const avg =
    collections.length > 0
      ? Math.round(
          collections.reduce((s, c) => s + pctOf(c), 0) / collections.length,
        )
      : 0;

  const types = [...new Set(collections.map((c) => c.type))];

  const typeStat = (type: string) => {
    const set = collections.filter((c) => c.type === type);
    const avgPct =
      set.length > 0
        ? Math.round(
            set.reduce((s, c) => s + pctOf(c), 0) / set.length,
          )
        : 0;
    return { count: set.length, pct: avgPct };
  };

  const filters: [string, string, number][] = [
    ["all", "All", collections.length],
    ...types.map(
      (t) =>
        [t, t, collections.filter((c) => c.type === t).length] as [
          string,
          string,
          number,
        ],
    ),
  ];

  const shown =
    filterType === "all"
      ? collections
      : collections.filter((c) => c.type === filterType);

  const closest = [...inProgress].sort((a, b) => pctOf(b) - pctOf(a)).slice(0, 4);

  return (
    <div
      style={{
        padding: 28,
        overflow: "auto",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* hero row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 20 }}>
        {/* left: completionist stats */}
        <div
          className="atlas-topo"
          style={{
            position: "relative",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-gold)",
            padding: 28,
            overflow: "hidden",
            boxShadow: "var(--glow-gold-sm), var(--ring-top)",
            display: "flex",
            alignItems: "center",
            gap: 26,
          }}
        >
          {isLoading ? (
            <div style={{ width: 124, height: 124, flexShrink: 0 }}>
              <Skel width="124px" height="124px" />
            </div>
          ) : (
            <ProgressRing value={avg} size={124} stroke={12} label="Avg complete" />
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              Completionist · Lifetime
            </div>

            {isLoading ? (
              <Skel height="46px" width="160px" />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <span
                  className="atlas-gold-text"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 46,
                    lineHeight: 1,
                    letterSpacing: "-.02em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {completed.length}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  / {collections.length} collections completed
                </span>
              </div>
            )}

            <div
              style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}
            >
              <Badge variant="gold" dot>
                {collections.length} collections tracked
              </Badge>
              <Badge variant="neutral">{inProgress.length} in progress</Badge>
            </div>

            {!isLoading && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 26px" }}>
                {types.map((t) => {
                  const s = typeStat(t);
                  return (
                    <div
                      key={t}
                      style={{ display: "flex", alignItems: "center", gap: 11 }}
                    >
                      <span
                        style={{
                          width: 40,
                          height: 40,
                          flex: "0 0 auto",
                          borderRadius: "var(--radius-md)",
                          display: "grid",
                          placeItems: "center",
                          background: "var(--accent-soft)",
                          border: "1px solid var(--border-gold)",
                          color: "var(--gold-400)",
                        }}
                      >
                        {TYPE_ICON[t] ?? <LayoutGrid size={19} />}
                      </span>
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: 18,
                            color: "var(--text-primary)",
                            lineHeight: 1,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {s.pct}
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--text-faint)",
                              fontWeight: 500,
                            }}
                          >
                            %
                          </span>
                        </div>
                        <div className="eyebrow" style={{ fontSize: 9.5, marginTop: 4 }}>
                          {t} · {s.count}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* right: closest to completion */}
        <AtlasPanel
          title="Closest to completion"
          action={<Badge variant="gold">{inProgress.length} active</Badge>}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {isLoading
              ? [0, 1, 2, 3].map((i) => <Skel key={i} height="44px" />)
              : closest.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      void navigate({
                        to: "/collections/$slug",
                        params: { slug: c.slug },
                      })
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 13,
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      font: "inherit",
                    }}
                  >
                    <span
                      style={{
                        width: 38,
                        height: 38,
                        flex: "0 0 auto",
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                        display: "grid",
                        placeItems: "center",
                        background: "var(--surface-sunken)",
                        border: "1px solid var(--border-default)",
                        color: "var(--gold-400)",
                      }}
                    >
                      {c.coverImage ? (
                        <img
                          src={c.coverImage}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        (TYPE_ICON[c.type] ?? <LayoutGrid size={19} />)
                      )}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {c.name}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: "var(--text-muted)",
                            flex: "0 0 auto",
                          }}
                        >
                          {c.completedCount}/{c.itemCount}
                        </span>
                      </div>
                      <ProgressBar
                        value={c.completedCount}
                        max={c.itemCount}
                        showValue={false}
                        size="sm"
                      />
                    </div>
                  </button>
                ))}
          </div>
        </AtlasPanel>
      </div>

      {/* filter bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
            padding: 4,
            background: "var(--surface-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-pill)",
          }}
        >
          {filters.map(([id, label, count]) => {
            const active = filterType === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilterType(id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "0 16px",
                  height: 34,
                  borderRadius: "var(--radius-pill)",
                  cursor: "pointer",
                  border: "none",
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  fontWeight: 600,
                  background: active ? "var(--accent)" : "transparent",
                  color: active ? "var(--text-on-gold)" : "var(--text-secondary)",
                  boxShadow: active ? "var(--glow-gold-sm)" : "none",
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
                    background: active ? "rgba(0,0,0,.16)" : "var(--surface-sunken)",
                    color: active ? "var(--text-on-gold)" : "var(--text-muted)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <Button variant="ghost" size="sm" leftIcon={<ArrowUpDown size={15} />}>
          Sort by progress
        </Button>
      </div>

      {/* 2-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {isLoading
          ? [0, 1, 2, 3].map((i) => <Skel key={i} height="88px" />)
          : shown.map((c) => (
              <CollectionCard
                key={c.id}
                title={c.name}
                type={c.type}
                value={c.completedCount}
                max={c.itemCount}
                image={c.coverImage}
                icon={TYPE_ICON_LG[c.type] ?? <LayoutGrid size={26} />}
                onClick={() =>
                  void navigate({
                    to: "/collections/$slug",
                    params: { slug: c.slug },
                  })
                }
              />
            ))}
      </div>
    </div>
  );
}
