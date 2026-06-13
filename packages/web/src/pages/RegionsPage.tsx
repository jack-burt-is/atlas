import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Globe2, Map, MountainSnow } from "lucide-react";
import { fetchRegions, type RegionListItem, type RegionsListResponse } from "../api/regions";
import { AtlasPanel } from "../components/AtlasPanel";
import { ProgressRing } from "../components/ProgressRing";
import { Badge } from "../components/Badge";

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

const COUNTRY_LABELS: Record<string, string> = {
  GB: "United Kingdom",
  US: "United States",
  FR: "France",
  DE: "Germany",
  NO: "Norway",
  AU: "Australia",
  NZ: "New Zealand",
};

function countryLabel(code: string | null) {
  if (!code) return null;
  return COUNTRY_LABELS[code] ?? code;
}

function RegionCard({ region, onClick }: { region: RegionListItem; onClick: () => void }) {
  const pct = region.coveragePct;
  const started = pct > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        width: "100%",
        textAlign: "left",
        background: "var(--surface-card)",
        border: `1px solid ${started ? "var(--border-gold)" : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "16px 20px",
        cursor: "pointer",
        boxShadow: started ? "var(--glow-gold-sm), var(--ring-top)" : "var(--ring-top)",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        font: "inherit",
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <ProgressRing value={pct} size={64} stroke={7} label={null} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 17,
          color: "var(--text-primary)",
          letterSpacing: "-.01em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          marginBottom: 5,
        }}>
          {region.name}
        </div>

        {countryLabel(region.country) && (
          <div className="eyebrow" style={{ fontSize: 10.5, marginBottom: 8 }}>
            {countryLabel(region.country)}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {pct >= 100 ? (
            <Badge variant="gold" dot>Complete</Badge>
          ) : pct > 0 ? (
            <Badge variant="success">{Math.round(pct)}% explored</Badge>
          ) : (
            <Badge variant="neutral">Not started</Badge>
          )}
        </div>
      </div>

      <div style={{ color: "var(--text-faint)", flexShrink: 0 }}>
        <Map size={18} />
      </div>
    </button>
  );
}

interface RegionsPageProps {
  staticData?: RegionsListResponse;
}

export default function RegionsPage({ staticData }: RegionsPageProps = {}) {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["regions"],
    queryFn: fetchRegions,
    enabled: !staticData,
    initialData: staticData,
  });

  const regions = data?.regions ?? [];
  const started = regions.filter((r) => r.coveragePct > 0);
  const complete = regions.filter((r) => r.coveragePct >= 100);
  const countries = [...new Set(regions.map((r) => r.country).filter(Boolean))];
  const avgPct =
    started.length > 0
      ? Math.round(started.reduce((s, r) => s + r.coveragePct, 0) / started.length)
      : 0;

  return (
    <div style={{ padding: 28, overflow: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* hero row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 20 }}>
        {/* left: summary */}
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
            <div style={{ width: 124, height: 124, flexShrink: 0 }}><Skel width="124px" height="124px" /></div>
          ) : (
            <ProgressRing value={avgPct} size={124} stroke={12} label="Avg explored" />
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Regions · Worldwide</div>

            {isLoading ? (
              <Skel height="46px" width="160px" />
            ) : (
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
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
                  {started.length}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  / {regions.length} regions explored
                </span>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <Badge variant="gold" dot>{regions.length} regions tracked</Badge>
              {complete.length > 0 && <Badge variant="success">{complete.length} complete</Badge>}
              {countries.length > 0 && (
                <Badge variant="neutral">
                  <Globe2 size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                  {countries.length} {countries.length === 1 ? "country" : "countries"}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* right: leaderboard / top regions */}
        <AtlasPanel
          title="Most explored"
          action={started.length > 0 ? <Badge variant="gold">{started.length} active</Badge> : undefined}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {isLoading ? (
              [0, 1, 2].map((i) => <Skel key={i} height="44px" />)
            ) : started.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                No regions started yet — connect Strava or upload a GPX to get going.
              </p>
            ) : (
              [...started]
                .sort((a, b) => b.coveragePct - a.coveragePct)
                .slice(0, 4)
                .map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => void navigate({ to: "/regions/$slug", params: { slug: r.slug } })}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      font: "inherit",
                    }}
                  >
                    <span style={{
                      width: 38, height: 38, flex: "0 0 auto",
                      borderRadius: "var(--radius-md)",
                      display: "grid", placeItems: "center",
                      background: "var(--accent-soft)",
                      border: "1px solid var(--border-gold)",
                      color: "var(--gold-400)",
                    }}>
                      <MountainSnow size={18} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "baseline",
                        gap: 8, marginBottom: 4,
                      }}>
                        <span style={{
                          fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {r.name}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", flex: "0 0 auto" }}>
                          {Math.round(r.coveragePct)}%
                        </span>
                      </div>
                      <div style={{
                        height: 4, borderRadius: 4,
                        background: "var(--surface-sunken)",
                        overflow: "hidden",
                      }}>
                        <div style={{
                          height: "100%",
                          width: `${Math.min(r.coveragePct, 100)}%`,
                          borderRadius: 4,
                          background: "var(--accent)",
                          boxShadow: "var(--glow-gold-sm)",
                          transition: "width 0.4s ease",
                        }} />
                      </div>
                    </div>
                  </button>
                ))
            )}
          </div>
        </AtlasPanel>
      </div>

      {/* all regions grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {isLoading
          ? [0, 1, 2, 3].map((i) => <Skel key={i} height="96px" />)
          : regions.map((r) => (
              <RegionCard
                key={r.id}
                region={r}
                onClick={() => void navigate({ to: "/regions/$slug", params: { slug: r.slug } })}
              />
            ))}
      </div>
    </div>
  );
}
