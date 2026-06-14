import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MountainSnow,
  Route,
  TrendingUp,
  Sun,
  Globe2,
  Activity,
  Flame,
  CalendarDays,
  Pencil,
  Trash2,
  X,
  Calendar,
} from "lucide-react";
import { fetchProfileStats, fetchActivityHeatmap } from "../api/profile";
import {
  fetchActivity,
  fetchActivities,
  updateActivity,
  deleteActivity,
} from "../api/activities";
import type { Activity as ActivityRecord } from "../api/activities";
import { HeatGrid, buildHeatData } from "../components/HeatGrid";
import { ScoreMeter } from "../components/ScoreMeter";
import { StatBlock } from "../components/StatBlock";
import { Button } from "../components/Button";
import { AtlasPanel } from "../components/AtlasPanel";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SKEL_CSS = `
@keyframes atlas-pulse{0%,100%{opacity:.4}50%{opacity:.9}}
.atlas-skel{border-radius:var(--radius-md);background:var(--surface-raised);animation:atlas-pulse 1.6s ease-in-out infinite;}
`;

function ensureSkelCss() {
  if (typeof document === "undefined") return;
  if (!document.getElementById("atlas-skel-css")) {
    const s = document.createElement("style");
    s.id = "atlas-skel-css";
    s.textContent = SKEL_CSS;
    document.head.appendChild(s);
  }
}

function Skel({ width = "100%", height = "20px" }: { width?: string; height?: string }) {
  ensureSkelCss();
  return <div className="atlas-skel" style={{ width, height }} />;
}

// ─── Edit Activity Dialog ─────────────────────────────────────────────────────

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function EditActivityDialog({
  activity,
  onClose,
}: {
  activity: ActivityRecord;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = React.useState(activity.name);
  const [startDate, setStartDate] = React.useState(toDateInputValue(activity.startedAt));
  const [endDate, setEndDate] = React.useState(toDateInputValue(activity.endedAt));

  const saveMutation = useMutation({
    mutationFn: () => {
      const patch: { name?: string; startedAt?: string; endedAt?: string | null } = {};
      if (name !== activity.name) patch.name = name;
      const newStartedAt = startDate ? new Date(startDate).toISOString() : undefined;
      const origStart = toDateInputValue(activity.startedAt);
      if (startDate !== origStart) patch.startedAt = newStartedAt;
      const origEnd = toDateInputValue(activity.endedAt);
      if (endDate !== origEnd) patch.endedAt = endDate ? new Date(endDate).toISOString() : null;
      return updateActivity(activity.id, patch);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["activities"] });
      void queryClient.invalidateQueries({ queryKey: ["profile/stats"] });
      void queryClient.invalidateQueries({ queryKey: ["profile/activity-heatmap"] });
      onClose();
    },
  });

  const isMultiDay = endDate && endDate > startDate;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-xl)",
          padding: 28,
          maxWidth: 420,
          width: "90%",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ font: "var(--type-h3)", color: "var(--text-primary)", margin: 0 }}>
            Edit activity
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex" }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                background: "var(--surface-sunken)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                padding: "8px 12px",
                fontSize: 14,
                color: "var(--text-primary)",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Start date</span>
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  background: "var(--surface-sunken)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 12px",
                  fontSize: 14,
                  color: "var(--text-primary)",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                End date
                <span style={{ fontWeight: 400, color: "var(--text-muted)", marginLeft: 4 }}>(optional)</span>
              </span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  background: "var(--surface-sunken)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 12px",
                  fontSize: 14,
                  color: "var(--text-primary)",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </label>
          </div>

          {isMultiDay && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                background: "var(--accent-soft)",
                border: "1px solid var(--border-gold)",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                color: "var(--gold-400)",
              }}
            >
              <Calendar size={14} />
              Multi-day activity — all days will count in your heatmap
            </div>
          )}

          {saveMutation.isError && (
            <p style={{ fontSize: 13, color: "var(--status-danger)", margin: 0 }}>
              {saveMutation.error instanceof Error ? saveMutation.error.message : "Failed to save"}
            </p>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              disabled={saveMutation.isPending || !name.trim()}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Activities Panel ─────────────────────────────────────────────────────────

function ActivityDateRange({ activity }: { activity: ActivityRecord }) {
  const start = new Date(activity.startedAt);
  const startStr = start.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

  if (!activity.endedAt) return <>{startStr}</>;

  const end = new Date(activity.endedAt);
  if (end.toDateString() === start.toDateString()) return <>{startStr}</>;

  const endStr = end.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  return <>{startStr} — {endStr} · {days} days</>;
}

function ActivitiesPanel() {
  const [editing, setEditing] = React.useState<ActivityRecord | null>(null);
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const queryClient = useQueryClient();

  const activitiesQuery = useQuery({
    queryKey: ["activities"],
    queryFn: () => fetchActivities(20),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteActivity(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["activities"] });
      void queryClient.invalidateQueries({ queryKey: ["profile/stats"] });
      void queryClient.invalidateQueries({ queryKey: ["profile/activity-heatmap"] });
      setDeleting(null);
    },
  });

  const activities = activitiesQuery.data?.activities ?? [];

  return (
    <>
      <AtlasPanel
        title="Activities"
        action={
          activitiesQuery.isLoading ? null : (
            <span className="eyebrow" style={{ fontSize: 10 }}>
              {activities.length > 0 ? `${activities.length} recent` : ""}
            </span>
          )
        }
      >
        {activitiesQuery.isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[0, 1, 2].map((i) => <Skel key={i} height="52px" />)}
          </div>
        ) : activities.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
            No activities yet — import a GPX file or connect Strava on the Connected Sources page
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {activities.map((act) => (
              <div
                key={act.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  background: "var(--surface-sunken)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    borderRadius: "var(--radius-md)",
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border-default)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  <Activity size={15} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {act.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                    <ActivityDateRange activity={act} />
                    {act.distanceM != null && (
                      <> · {(act.distanceM / 1000).toFixed(1)} km</>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setEditing(act)}
                  title="Edit activity"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: 6,
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "var(--radius-sm)",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--surface-raised)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "none"; }}
                >
                  <Pencil size={13} />
                </button>
                {deleting === act.id ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <button
                      onClick={() => deleteMutation.mutate(act.id)}
                      disabled={deleteMutation.isPending}
                      title="Confirm delete"
                      style={{
                        background: "var(--status-danger)",
                        border: "none",
                        cursor: "pointer",
                        color: "#fff",
                        padding: "4px 8px",
                        display: "flex",
                        alignItems: "center",
                        borderRadius: "var(--radius-sm)",
                        fontSize: 11,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {deleteMutation.isPending ? "…" : "Delete"}
                    </button>
                    <button
                      onClick={() => setDeleting(null)}
                      title="Cancel"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        padding: 4,
                        display: "flex",
                        alignItems: "center",
                        borderRadius: "var(--radius-sm)",
                        flexShrink: 0,
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleting(act.id)}
                    title="Delete activity"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      padding: 6,
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "var(--radius-sm)",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--status-danger)"; e.currentTarget.style.background = "var(--surface-raised)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "none"; }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </AtlasPanel>

      {editing && (
        <EditActivityDialog
          activity={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

// ─── StatisticsPage ───────────────────────────────────────────────────────────

export default function StatisticsPage() {
  const statsQuery = useQuery({
    queryKey: ["profile/stats"],
    queryFn: fetchProfileStats,
  });
  const heatmapQuery = useQuery({
    queryKey: ["profile/activity-heatmap"],
    queryFn: fetchActivityHeatmap,
  });

  const stats = statsQuery.data?.stats;
  const streaks = statsQuery.data?.streaks;
  const heatData = heatmapQuery.data ? buildHeatData(heatmapQuery.data.data) : null;

  const statRow1 = [
    { label: "Summits", value: stats ? String(stats.totalSummits) : null, icon: <MountainSnow size={12} /> },
    {
      label: "Distance",
      value: stats ? `${(stats.totalDistanceM / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} km` : null,
      icon: <Route size={12} />,
    },
    {
      label: "Elevation gain",
      value: stats ? `${(stats.totalElevationGainM / 1000).toFixed(1)} km` : null,
      icon: <TrendingUp size={12} />,
    },
    { label: "Days out", value: stats ? String(stats.totalDaysOut) : null, icon: <Sun size={12} /> },
  ];

  const statRow2 = [
    { label: "Activities", value: stats ? String(stats.totalActivities) : null, icon: <Activity size={12} /> },
    { label: "Countries", value: stats ? String(stats.totalCountries) : null, icon: <Globe2 size={12} /> },
    { label: "Current streak", value: streaks ? `${streaks.currentStreak}d` : null, icon: <Flame size={12} /> },
    { label: "Longest streak", value: streaks ? `${streaks.longestStreak}d` : null, icon: <CalendarDays size={12} /> },
  ];

  return (
    <div
      style={{
        overflow: "auto",
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className="atlas-topo"
        style={{ position: "relative", padding: "28px 28px 24px" }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(0deg, var(--bg-app) 0%, color-mix(in srgb, var(--bg-app) 40%, transparent) 100%)",
          }}
        />
        <div style={{ position: "relative" }}>
          <p className="eyebrow" style={{ fontSize: 11, marginBottom: 4 }}>Your data</p>
          <h1 style={{ font: "var(--type-h2)", color: "var(--text-primary)", margin: 0 }}>
            Statistics
          </h1>
        </div>
      </div>

      <div
        style={{
          padding: "0 28px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* ── Score meter ──────────────────────────────────────────────── */}
        {stats ? (
          <ScoreMeter
            score={stats.outdoorScore}
            level={stats.level}
            levelProgress={stats.levelProgress * 100}
            toNext={`${stats.toNextLevel.toLocaleString()} pts to level ${stats.level + 1}`}
          />
        ) : (
          <Skel height="88px" />
        )}

        {/* ── Stats row 1 ──────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {statRow1.map(({ label, value, icon }) => (
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

        {/* ── Stats row 2 ──────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {statRow2.map(({ label, value, icon }) => (
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

        {/* ── Activity heatmap ─────────────────────────────────────────── */}
        <AtlasPanel
          title="Activity history"
          action={
            <span className="eyebrow" style={{ fontSize: 10 }}>
              Past year
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
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>Less</span>
            {["--heat-0", "--heat-1", "--heat-2", "--heat-3", "--heat-4"].map((h) => (
              <span
                key={h}
                style={{ width: 11, height: 11, borderRadius: 3, background: `var(${h})`, display: "block" }}
              />
            ))}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>More</span>
          </div>
        </AtlasPanel>

        {/* ── Activities ───────────────────────────────────────────────── */}
        <ActivitiesPanel />
      </div>
    </div>
  );
}
