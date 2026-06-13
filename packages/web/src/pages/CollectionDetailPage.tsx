import React from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronLeft,
  Flag,
  LayoutGrid,
  Map as MapIcon,
  MountainSnow,
  Route,
  Target,
  Footprints,
  Check,
} from "lucide-react";
import { fetchCollectionItems, type CollectionItem } from "../api/collections";
import { ProgressRing } from "../components/ProgressRing";
import { StatBlock } from "../components/StatBlock";
import { CollectibleItem } from "../components/CollectibleItem";
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
  "Peak List": <MountainSnow size={30} />,
  peaks: <MountainSnow size={30} />,
  Peaks: <MountainSnow size={30} />,
  "National Trail": <Route size={30} />,
  trails: <Route size={30} />,
  Trails: <Route size={30} />,
  Landmarks: <Flag size={30} />,
  landmarks: <Flag size={30} />,
  Challenge: <CheckCircle2 size={30} />,
};

type TabFilter = "all" | "collected" | "remaining";

function itemMeta(item: CollectionItem, type: string): React.ReactNode {
  if (type === "peaks" || type === "Peak List" || type === "Peaks") {
    return item.elevation != null ? (
      <React.Fragment>
        <b>{item.elevation}m</b>
        {item.visits > 0 && <span>×{item.visits}</span>}
      </React.Fragment>
    ) : null;
  }
  if (type === "landmarks" || type === "Landmarks") {
    return item.category ? <b>{item.category.replace(/_/g, " ")}</b> : null;
  }
  if (type === "trails" || type === "National Trail" || type === "Trails") {
    return item.distanceKm != null ? (
      <b>{item.distanceKm.toFixed(1)} km</b>
    ) : null;
  }
  if (type === "regions") {
    return item.coveragePct != null ? (
      <b>{Math.round(item.coveragePct)}%</b>
    ) : null;
  }
  return null;
}

export default function CollectionDetailPage({
  staticSlug,
}: {
  staticSlug?: string;
} = {}) {
  const params = useParams({ strict: false });
  const slug = staticSlug ?? (params as { slug?: string }).slug;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [tab, setTab] = React.useState<TabFilter>("all");
  const [numPages, setNumPages] = React.useState(1);

  // When tab changes, we still show all loaded items (client-side filter only)
  const pageQueries = useQueries({
    queries: Array.from({ length: numPages }, (_, i) => ({
      queryKey: ["collections", slug, "items", i],
      queryFn: () =>
        fetchCollectionItems(slug!, { limit: 100, offset: i * 100 }),
      enabled: !!slug,
    })),
  });

  const allItems = pageQueries.flatMap((q) => q.data?.items ?? []);
  const isLoading = pageQueries[0]?.isLoading ?? true;
  const isFetchingMore =
    numPages > 1 &&
    (pageQueries[pageQueries.length - 1]?.isLoading ?? false);
  const lastPageItems = pageQueries[pageQueries.length - 1]?.data?.items ?? [];
  const hasMore = lastPageItems.length >= 100;

  // Collection type from first page's meta
  const collectionMeta = pageQueries[0]?.data?.collection;
  const collectionType = collectionMeta?.type ?? "";

  // Prefer cached list data for progress stats (pct, itemCount, completedCount)
  const listCache = qc.getQueryData<{
    collections: Array<{
      slug: string;
      itemCount: number;
      completedCount: number;
      pct: number;
      name: string;
      type: string;
      coverImage: string | null;
      region: string | null;
      country: string | null;
    }>;
  }>(["collections"]);
  const listEntry = listCache?.collections.find((c) => c.slug === slug);

  const displayName = listEntry?.name ?? collectionMeta?.name ?? slug ?? "";
  const displayType = listEntry?.type ?? collectionType;
  const itemCount = listEntry?.itemCount ?? allItems.length;
  const completedCount = listEntry?.completedCount ?? allItems.filter((i) => i.collected).length;
  const pct = itemCount > 0 ? (completedCount / itemCount) * 100 : 0;
  const coverImage = listEntry?.coverImage ?? collectionMeta?.cover_image ?? null;
  const regionLabel =
    listEntry?.region ??
    collectionMeta?.region ??
    listEntry?.country ??
    collectionMeta?.country ??
    "";

  // Stat aggregates from loaded items
  const collectedItems = allItems.filter((i) => i.collected);
  const totalVisits = collectedItems.reduce((s, i) => s + (i.visits ?? 0), 0);
  const highestElevation =
    collectedItems.length > 0
      ? Math.max(...collectedItems.map((i) => i.elevation ?? 0))
      : null;
  const firstItem = allItems[0] ?? null;
  const totalDistance =
    firstItem?.distanceKm != null
      ? allItems.reduce((s, i) => s + (i.distanceKm ?? 0), 0)
      : null;

  const remaining = itemCount - completedCount;

  // Stat card for 4th slot depends on collection type
  const fourthStat =
    displayType === "trails" || displayType === "National Trail" || displayType === "Trails"
      ? {
          label: "Total distance",
          value: totalDistance != null ? `${totalDistance.toFixed(0)} km` : "—",
          icon: <Route size={12} />,
        }
      : {
          label: "Highest",
          value:
            highestElevation != null && highestElevation > 0
              ? `${highestElevation}m`
              : "—",
          icon: <MountainSnow size={12} />,
        };

  // Filtered items for grid
  const shownItems =
    tab === "all"
      ? allItems
      : tab === "collected"
        ? collectedItems
        : allItems.filter((i) => !i.collected);

  const collectedCount = collectedItems.length;
  const remainingCount = allItems.filter((i) => !i.collected).length;

  const tabs: [TabFilter, string, number][] = [
    ["all", "All", allItems.length],
    ["collected", "Collected", collectedCount],
    ["remaining", "Remaining", remainingCount],
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
      {/* back nav */}
      <button
        type="button"
        onClick={() => void navigate({ to: "/collections" })}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          alignSelf: "flex-start",
          background: "none",
          border: "none",
          color: "var(--text-secondary)",
          cursor: "pointer",
          padding: 0,
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <ChevronLeft size={18} /> All collections
      </button>

      {/* hero banner */}
      <div
        className="atlas-topo"
        style={{
          position: "relative",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-default)",
          padding: 28,
          overflow: "hidden",
          boxShadow: "var(--shadow-md)",
          minHeight: 160,
        }}
      >
        {coverImage && (
          <img
            src={coverImage}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        {coverImage && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(100deg, var(--bg-app) 18%, color-mix(in srgb, var(--bg-app) 60%, transparent) 44%, color-mix(in srgb, var(--bg-app) 12%, transparent) 100%), linear-gradient(0deg, color-mix(in srgb, var(--bg-app) 45%, transparent), transparent 60%)",
            }}
          />
        )}

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          {isLoading ? (
            <div style={{ width: 132, height: 132, flexShrink: 0 }}>
              <Skel width="132px" height="132px" />
            </div>
          ) : (
            <ProgressRing
              value={completedCount}
              max={itemCount}
              size={132}
              stroke={12}
              label="Collected"
            />
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              {displayType}
              {regionLabel ? ` · ${regionLabel}` : ""}
            </div>
            {isLoading ? (
              <Skel height="44px" width="240px" />
            ) : (
              <h1
                style={{
                  font: "var(--type-display)",
                  fontSize: 44,
                  color: "var(--text-primary)",
                  margin: "0 0 12px",
                  letterSpacing: "-.02em",
                }}
              >
                {displayName}
              </h1>
            )}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Badge variant="gold" dot>
                {completedCount} / {itemCount}
              </Badge>
              {remaining > 0 ? (
                <Badge variant="neutral">{remaining} to go</Badge>
              ) : (
                <Badge variant="success">Completed</Badge>
              )}
              <Badge variant="neutral">{Math.round(pct)}% complete</Badge>
            </div>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}
          >
            <Button
              variant="primary"
              leftIcon={<MapIcon size={16} />}
              onClick={() =>
                void navigate({
                  to: "/map",
                  search: { collection: slug },
                })
              }
            >
              View on map
            </Button>
            <Button variant="secondary" leftIcon={<Target size={16} />}>
              Set a goal
            </Button>
          </div>
        </div>
      </div>

      {/* stat strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 16,
        }}
      >
        {[
          {
            label: "Collected",
            value: String(completedCount),
            icon: <CheckCircle2 size={12} />,
          },
          {
            label: "Remaining",
            value: String(remaining),
            icon: <Target size={12} />,
          },
          {
            label: "Total visits",
            value: String(totalVisits),
            icon: <Footprints size={12} />,
          },
          fourthStat,
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: 18,
              boxShadow: "var(--ring-top)",
            }}
          >
            {isLoading ? (
              <Skel height="56px" />
            ) : (
              <StatBlock label={label} value={value} icon={icon} />
            )}
          </div>
        ))}
      </div>

      {/* tab bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
          {tabs.map(([id, label, count]) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
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
      </div>

      {/* Pokédex grid */}
      {isLoading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 12,
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="atlas-skel"
              style={{ aspectRatio: "1" }}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 12,
          }}
        >
          {shownItems.map((item) => (
            <CollectibleItem
              key={item.id}
              name={item.name}
              collected={item.collected}
              image={null}
              meta={itemMeta(item, displayType)}
              icon={TYPE_ICON[displayType] ?? <LayoutGrid size={30} />}
              checkIcon={<Check size={13} />}
            />
          ))}
        </div>
      )}

      {/* load more */}
      {hasMore && (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
          <Button
            variant="secondary"
            onClick={() => setNumPages((n) => n + 1)}
            disabled={isFetchingMore}
          >
            {isFetchingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
