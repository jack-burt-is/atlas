import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Globe2,
  LayoutGrid,
  MountainSnow,
  Route,
  Sun,
  Trophy,
} from "lucide-react";
import { fetchProfileStats, fetchActivityHeatmap, fetchSuggestions } from "../api/profile";
import { fetchCollections } from "../api/collections";
import { AtlasPanel } from "../components/AtlasPanel";
import { ScoreMeter } from "../components/ScoreMeter";
import { HeatGrid, buildHeatData } from "../components/HeatGrid";
import { StatBlock } from "../components/StatBlock";
import { ProgressBar } from "../components/ProgressBar";
import { CollectionCard } from "../components/CollectionCard";
import { AchievementBadge } from "../components/AchievementBadge";
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

function Skel({ width = "100%", height = "20px" }: { width?: string; height?: string }) {
  ensureSkeleton();
  return <div className="atlas-skel" style={{ width, height }} />;
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const statsQuery = useQuery({
    queryKey: ["profile/stats"],
    queryFn: fetchProfileStats,
  });
  const heatmapQuery = useQuery({
    queryKey: ["profile/activity-heatmap"],
    queryFn: fetchActivityHeatmap,
  });
  const suggestionsQuery = useQuery({
    queryKey: ["profile/suggestions"],
    queryFn: fetchSuggestions,
  });
  const collectionsQuery = useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
  });

  const stats = statsQuery.data?.stats;
  const recentUnlocks = statsQuery.data?.recentUnlocks ?? [];
  const heatData = heatmapQuery.data
    ? buildHeatData(heatmapQuery.data.data)
    : null;
  const suggestions = suggestionsQuery.data?.suggestions ?? [];
  const collections = collectionsQuery.data?.collections ?? [];

  const closestCollections = [...collections]
    .filter((c) => c.completedCount < c.itemCount)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);

  const regionCollections = collections.filter((c) =>
    c.type.toLowerCase().includes("region")
  );
  const progressBarItems = (
    regionCollections.length > 0
      ? regionCollections
      : [...collections].sort((a, b) => b.pct - a.pct)
  ).slice(0, 3);

  const statCards = [
    {
      label: "Summits",
      value: stats ? String(stats.totalSummits) : null,
      icon: <MountainSnow size={12} />,
    },
    {
      label: "Distance",
      value: stats
        ? `${(stats.totalDistanceM / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} km`
        : null,
      icon: <Route size={12} />,
    },
    {
      label: "Days out",
      value: stats ? String(stats.totalDaysOut) : null,
      icon: <Sun size={12} />,
    },
    {
      label: "Countries",
      value: stats ? String(stats.totalCountries) : null,
      icon: <Globe2 size={12} />,
    },
  ];

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
      <div
        style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}
      >
        {/* left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {stats ? (
            <ScoreMeter
              score={stats.outdoorScore}
              level={stats.level}
              levelProgress={stats.levelProgress * 100}
              toNext={`${stats.toNextLevel.toLocaleString()} pts to next level`}
            />
          ) : (
            <Skel height="88px" />
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 12,
            }}
          >
            {statCards.map(({ label, value, icon }) => (
              <div
                key={label}
                style={{
                  background: "var(--surface-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  padding: 16,
                  boxShadow: "var(--ring-top)",
                }}
              >
                {value != null ? (
                  <StatBlock size="sm" label={label} value={value} icon={icon} />
                ) : (
                  <Skel height="56px" />
                )}
              </div>
            ))}
          </div>

          <AtlasPanel
            title="Exploration activity"
            action={
              <span className="eyebrow" style={{ fontSize: 10 }}>
                2024 — 2026
              </span>
            }
          >
            <HeatGrid columns={52} rows={7} cell={11} gap={3} data={heatData} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 14,
                justifyContent: "flex-end",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-muted)",
                }}
              >
                Less
              </span>
              {["--heat-0", "--heat-1", "--heat-2", "--heat-3", "--heat-4"].map(
                (h) => (
                  <span
                    key={h}
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 3,
                      background: `var(${h})`,
                      display: "block",
                    }}
                  />
                )
              )}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-muted)",
                }}
              >
                More
              </span>
            </div>
          </AtlasPanel>
        </div>

        {/* Next goals */}
        <AtlasPanel
          title="Next goals"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void navigate({ to: "/map" })}
            >
              Open map
            </Button>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {suggestionsQuery.isLoading
              ? [0, 1, 2, 3].map((i) => <Skel key={i} height="40px" />)
              : suggestions.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <span
                      style={{
                        width: 40,
                        height: 40,
                        flex: "0 0 auto",
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--accent-soft)",
                        color: "var(--gold-400)",
                        border: "1px solid var(--border-gold)",
                      }}
                    >
                      <MountainSnow size={20} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.name}
                      </div>
                      <div
                        className="eyebrow"
                        style={{ fontSize: 10, marginTop: 2 }}
                      >
                        {s.elevation != null ? `${s.elevation}m` : s.itemType}
                      </div>
                    </div>
                    <Badge variant="gold">{s.itemType}</Badge>
                  </div>
                ))}

            {(suggestions.length > 0 || !suggestionsQuery.isLoading) &&
              progressBarItems.length > 0 && (
                <div
                  style={{
                    height: 1,
                    background: "var(--border-subtle)",
                    margin: "2px 0",
                  }}
                />
              )}

            {collectionsQuery.isLoading
              ? [0, 1, 2].map((i) => <Skel key={i} height="32px" />)
              : progressBarItems.map((c) => (
                  <ProgressBar key={c.id} label={c.name} value={c.pct} />
                ))}
          </div>
        </AtlasPanel>
      </div>

      {/* bottom row */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
      >
        <AtlasPanel
          title="Closest to completion"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void navigate({ to: "/collections" })}
            >
              All collections
            </Button>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {collectionsQuery.isLoading
              ? [0, 1, 2].map((i) => <Skel key={i} height="88px" />)
              : closestCollections.map((c) => (
                  <CollectionCard
                    key={c.id}
                    title={c.name}
                    type={c.type}
                    value={c.completedCount}
                    max={c.itemCount}
                    image={c.coverImage}
                    icon={<LayoutGrid size={26} />}
                    onClick={() =>
                      void navigate({
                        to: "/collections/$slug",
                        params: { slug: c.slug },
                      })
                    }
                  />
                ))}
          </div>
        </AtlasPanel>

        <AtlasPanel
          title="Recent unlocks"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void navigate({ to: "/achievements" })}
            >
              Trophy case
            </Button>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {statsQuery.isLoading
              ? [0, 1, 2].map((i) => <Skel key={i} height="84px" />)
              : recentUnlocks.slice(0, 3).map((u) => (
                  <AchievementBadge
                    key={u.achievementId}
                    title={u.name}
                    description={u.description}
                    tier={u.tier}
                    points={u.points}
                    unlocked
                    icon={<Trophy size={24} />}
                  />
                ))}
          </div>
        </AtlasPanel>
      </div>
    </div>
  );
}
