import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Award,
  CalendarCheck,
  CloudRain,
  Compass,
  Footprints,
  Globe2,
  Lock,
  Moon,
  MountainSnow,
  Route,
  Share2,
  Star,
  Sunrise,
  Triangle,
  Trophy,
  Users,
  Flag,
} from "lucide-react";
import { fetchAchievements, type Achievement, type AchievementTier } from "../api/achievements";
import { AtlasPanel } from "../components/AtlasPanel";
import { AchievementBadge } from "../components/AchievementBadge";
import { ProgressRing } from "../components/ProgressRing";
import { ProgressBar } from "../components/ProgressBar";
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

function achievementIcon(name: string, size: number): React.ReactNode {
  const p = { size };
  switch (name) {
    case "mountain": return <MountainSnow {...p} />;
    case "flag": return <Flag {...p} />;
    case "route": return <Route {...p} />;
    case "footprints": return <Footprints {...p} />;
    case "sunrise": return <Sunrise {...p} />;
    case "triangle": return <Triangle {...p} />;
    case "award": return <Award {...p} />;
    case "cloud-rain": return <CloudRain {...p} />;
    case "moon": return <Moon {...p} />;
    case "globe": return <Globe2 {...p} />;
    case "compass": return <Compass {...p} />;
    case "star": return <Star {...p} />;
    case "lock": return <Lock {...p} />;
    default: return <Trophy {...p} />;
  }
}

const TIER_STYLES: Record<AchievementTier, { color: string; glow: string; mark: string; label: string }> = {
  platinum: { color: "var(--tier-platinum)", glow: "var(--glow-platinum)", mark: "★", label: "Platinum" },
  gold:     { color: "var(--tier-gold)",     glow: "var(--glow-gold-md)", mark: "I",   label: "Gold" },
  silver:   { color: "var(--tier-silver)",   glow: "var(--glow-silver)",  mark: "II",  label: "Silver" },
  bronze:   { color: "var(--tier-bronze)",   glow: "var(--glow-bronze)",  mark: "III", label: "Bronze" },
};

const TIERS: AchievementTier[] = ["platinum", "gold", "silver", "bronze"];

type FilterKey = "all" | "unlocked" | "progress" | "locked";
const FILTERS: { id: FilterKey; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unlocked", label: "Unlocked" },
  { id: "progress", label: "In progress" },
  { id: "locked", label: "Locked" },
];

function sortAchievements(list: Achievement[]): Achievement[] {
  return [...list].sort((a, b) => {
    const rank = (x: Achievement) => (x.unlocked ? 0 : x.progress ? 1 : 2);
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    // unlocked: newest first
    if (a.unlocked && b.unlocked) {
      return (b.unlockedAt ?? "").localeCompare(a.unlockedAt ?? "");
    }
    // in-progress: highest completion % first
    if (a.progress && b.progress) {
      return b.progress.value / b.progress.max - a.progress.value / a.progress.max;
    }
    return 0;
  });
}

export default function AchievementsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = React.useState<FilterKey>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: fetchAchievements,
  });

  const achievements = data?.achievements ?? [];
  const unlocked = achievements.filter((a) => a.unlocked);
  const points = unlocked.reduce((s, a) => s + a.points, 0);
  const possible = achievements.reduce((s, a) => s + a.points, 0);
  const pct = achievements.length > 0 ? Math.round((unlocked.length / achievements.length) * 100) : 0;

  const tierCount = (tier: AchievementTier) => ({
    have: unlocked.filter((a) => a.tier === tier).length,
    total: achievements.filter((a) => a.tier === tier).length,
  });

  const inProgress = achievements
    .filter((a) => !a.unlocked && a.progress)
    .sort((a, b) => b.progress!.value / b.progress!.max - a.progress!.value / a.progress!.max);

  const filterCount = (id: FilterKey): number => {
    switch (id) {
      case "all": return achievements.length;
      case "unlocked": return unlocked.length;
      case "progress": return inProgress.length;
      case "locked": return achievements.filter((a) => !a.unlocked).length;
    }
  };

  const filtered = (() => {
    switch (filter) {
      case "unlocked": return sortAchievements(achievements.filter((a) => a.unlocked));
      case "progress": return sortAchievements(achievements.filter((a) => !a.unlocked && !!a.progress));
      case "locked": return sortAchievements(achievements.filter((a) => !a.unlocked));
      default: return sortAchievements(achievements);
    }
  })();

  if (isLoading && achievements.length === 0) {
    return (
      <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20, flex: 1, overflow: "auto" }}>
        <Skel height="220px" />
        <Skel height="48px" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => <Skel key={i} height="90px" />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20, flex: 1, overflow: "auto" }}>
      {/* hero */}
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 20 }}>
        {/* left: points + medal counts */}
        <div className="atlas-topo" style={{
          position: "relative", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-gold)",
          padding: 28, overflow: "hidden", boxShadow: "var(--glow-gold-sm), var(--ring-top)",
          display: "flex", alignItems: "center", gap: 26,
        }}>
          <ProgressRing value={pct} size={124} stroke={12} label="Completed" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Trophy Case · Lifetime</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
              <span className="atlas-gold-text" style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 46, lineHeight: 1,
                letterSpacing: "-.02em", fontVariantNumeric: "tabular-nums",
              }}>{points.toLocaleString()}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                / {possible.toLocaleString()} pts
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <Badge variant="gold" dot>{unlocked.length} of {achievements.length} unlocked</Badge>
              <Badge variant="neutral">Adds to Outdoor Score</Badge>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 28px" }}>
              {TIERS.map((tier) => {
                const style = TIER_STYLES[tier];
                const { have, total } = tierCount(tier);
                return (
                  <div key={tier} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{
                      width: 46, height: 46, flex: "0 0 auto", borderRadius: "50%", display: "grid", placeItems: "center",
                      background: style.color, color: "var(--ink-950)", boxShadow: style.glow,
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
                    }}>{style.mark}</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, color: "var(--text-primary)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                        {have}<span style={{ color: "var(--text-faint)", fontWeight: 500 }}> / {total}</span>
                      </div>
                      <div className="eyebrow" style={{ fontSize: 9.5, marginTop: 4, color: style.color }}>{style.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* right: closest to unlock */}
        <AtlasPanel
          title="Closest to unlock"
          action={<Badge variant="gold">+{inProgress.slice(0, 4).reduce((s, a) => s + a.points, 0).toLocaleString()} pts</Badge>}
        >
          {inProgress.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No achievements in progress yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {inProgress.slice(0, 4).map((a) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <span style={{
                    width: 38, height: 38, flex: "0 0 auto", borderRadius: "var(--radius-md)",
                    display: "grid", placeItems: "center", background: "var(--surface-sunken)",
                    border: "1px solid var(--border-default)", color: "var(--text-secondary)",
                  }}>{achievementIcon(a.iconName, 18)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", flex: "0 0 auto" }}>
                        {a.progress!.value}/{a.progress!.max}
                      </span>
                    </div>
                    <ProgressBar value={a.progress!.value} max={a.progress!.max} color={a.tier === "platinum" ? "sky" : "gold"} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </AtlasPanel>
      </div>

      {/* filter bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", gap: 6, padding: 4, background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-pill)" }}>
          {FILTERS.map(({ id, label }) => {
            const on = filter === id;
            return (
              <button key={id} onClick={() => setFilter(id)} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "0 16px", height: 34,
                borderRadius: "var(--radius-pill)", cursor: "pointer", border: "none",
                fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
                background: on ? "var(--accent)" : "transparent",
                color: on ? "var(--text-on-gold)" : "var(--text-secondary)",
                boxShadow: on ? "var(--glow-gold-sm)" : "none",
                transition: "var(--t-colors)",
              }}>
                {label}
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 700,
                  padding: "1px 6px", borderRadius: "var(--radius-pill)",
                  background: on ? "rgba(0,0,0,.16)" : "var(--surface-sunken)",
                  color: on ? "var(--text-on-gold)" : "var(--text-muted)",
                }}>{filterCount(id)}</span>
              </button>
            );
          })}
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Share2 size={15} />}
          onClick={() => void navigate({ to: "/dashboard" })}
        >
          Share trophy case
        </Button>
      </div>

      {/* achievement grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {filtered.map((a) => (
          <AchievementBadge
            key={a.id}
            title={a.name}
            description={
              <>
                {a.description}
                <span style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)" }}>
                  {a.unlocked ? <CalendarCheck size={11} /> : <Users size={11} />}
                  {a.unlocked
                    ? `Earned ${a.unlockedAt ? new Date(a.unlockedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : ""}`
                    : `${a.rarity}% of explorers have this`}
                </span>
              </>
            }
            tier={a.tier}
            points={a.points}
            unlocked={a.unlocked}
            progress={a.progress}
            icon={achievementIcon(a.unlocked ? a.iconName : "lock", a.unlocked ? 24 : 20)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
            No achievements match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
