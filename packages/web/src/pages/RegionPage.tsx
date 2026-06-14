import React from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flag, Footprints, Map, MountainSnow, Route, Target } from "lucide-react";
import { fetchRegion, type RegionResponse } from "../api/regions";
import { AtlasPanel } from "../components/AtlasPanel";
import { ProgressRing } from "../components/ProgressRing";
import { ProgressBar } from "../components/ProgressBar";
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

function Skel({ width = "100%", height = "20px" }: { width?: string; height?: string }) {
  ensureSkeleton();
  return <div className="atlas-skel" style={{ width, height }} />;
}

function RegionContent({ data, slug }: { data: RegionResponse; slug: string }) {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20, flex: 1, overflow: "auto" }}>
      {/* hero banner */}
      <div className="atlas-topo" style={{
        position: "relative", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-default)",
        padding: 28, overflow: "hidden", boxShadow: "var(--shadow-md)", flexShrink: 0,
      }}>
        {data.heroImage && (
          <img src={data.heroImage} alt="" aria-hidden="true" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
          }} />
        )}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(100deg, var(--bg-app) 18%, color-mix(in srgb, var(--bg-app) 60%, transparent) 44%, color-mix(in srgb, var(--bg-app) 12%, transparent) 100%), linear-gradient(0deg, color-mix(in srgb, var(--bg-app) 45%, transparent), transparent 60%)",
        }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 28 }}>
          <ProgressRing value={data.coveragePct} size={132} stroke={12} label="Explored" />
          <div style={{ flex: 1 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>{data.subtitle}</div>
            <h1 style={{ font: "var(--type-display)", fontSize: 44, color: "var(--text-primary)", margin: "0 0 12px", letterSpacing: "-.02em" }}>
              {data.name}
            </h1>
            <div style={{ display: "flex", gap: 10 }}>
              <Badge variant="gold" dot>{data.coveragePct}% explored</Badge>
              <Badge variant="success">{data.stats.trails.value} trails done</Badge>
              <Badge variant="neutral">{data.stats.landmarks.value} landmarks</Badge>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Button
              variant="primary"
              leftIcon={<Map size={16} />}
              onClick={() => void navigate({ to: "/map", search: { region: slug } })}
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {[
          { label: "Peaks", value: `${data.stats.peaks.value} / ${data.stats.peaks.total}`, icon: <MountainSnow size={12} /> },
          { label: "Trails", value: `${data.stats.trails.value} / ${data.stats.trails.total}`, icon: <Route size={12} /> },
          { label: "Landmarks", value: `${data.stats.landmarks.value} / ${data.stats.landmarks.total}`, icon: <Flag size={12} /> },
          { label: "Distance here", value: `${data.stats.distanceKm.toLocaleString()} km`, icon: <Footprints size={12} /> },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: 18, boxShadow: "var(--ring-top)" }}>
            <StatBlock label={label} value={value} icon={icon} />
          </div>
        ))}
      </div>

      {/* progress + missing nearby */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        <AtlasPanel title="Progress by collection">
          {data.collections.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No collection data for this region.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {data.collections.map((c) => (
                <ProgressBar key={c.name} label={c.name} value={c.value} max={c.max} color={c.color ?? "gold"} />
              ))}
            </div>
          )}
        </AtlasPanel>

        <AtlasPanel
          title="Missing nearby"
          action={data.gapCount > 0 ? <Badge variant="gold">+ {data.gapCount} gaps</Badge> : undefined}
        >
          {data.missingNearby.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Nothing nearby — you've explored it all!</p>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {data.missingNearby.slice(0, 4).map((p) => (
                  <CollectibleItem
                    key={p.id}
                    name={p.name}
                    meta={p.elevationM != null ? <b>{p.elevationM}m</b> : undefined}
                    image={p.image ?? null}
                    collected={p.collected}
                    icon={<MountainSnow size={28} />}
                  />
                ))}
              </div>
              <div style={{ marginTop: 14 }}>
                <Button
                  variant="secondary"
                  block
                  onClick={() => void navigate({ to: "/map", search: { region: slug, filter: "gaps" } })}
                >
                  Show all {data.gapCount} gaps
                </Button>
              </div>
            </>
          )}
        </AtlasPanel>
      </div>
    </div>
  );
}

interface RegionPageProps {
  staticSlug?: string;
  staticData?: RegionResponse;
}

export default function RegionPage({ staticSlug, staticData }: RegionPageProps = {}) {
  const params = useParams({ strict: false });
  const slug = staticSlug ?? (params as { slug?: string }).slug ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["regions", slug],
    queryFn: () => fetchRegion(slug),
    enabled: !staticData && !!slug,
    initialData: staticData,
  });

  if (isLoading || (!data && !staticData)) {
    return (
      <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20, flex: 1, overflow: "auto" }}>
        <Skel height="200px" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => <Skel key={i} height="80px" />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
          <Skel height="220px" />
          <Skel height="220px" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 28, flex: 1, overflow: "auto" }}>
        <p style={{ color: "var(--text-muted)" }}>Region not found.</p>
      </div>
    );
  }

  return <RegionContent data={data} slug={slug} />;
}
