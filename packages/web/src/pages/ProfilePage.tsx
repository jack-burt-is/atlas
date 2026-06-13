import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  MountainSnow,
  Route,
  Sun,
  Globe2,
  Activity,
  Upload,
  LogOut,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  X,
  Pencil,
  Calendar,
} from "lucide-react";
import { fetchProfileStats, fetchActivityHeatmap } from "../api/profile";
import { fetchActivity, fetchActivities, updateActivity, deleteActivity } from "../api/activities";
import type { Activity as ActivityRecord } from "../api/activities";
import {
  fetchStravaStatus,
  triggerStravaSync,
  disconnectStrava,
} from "../api/integrations";
import { logout } from "../api/auth";
import { apiDelete, apiPost } from "../lib/api-client";
import { HeatGrid, buildHeatData } from "../components/HeatGrid";
import { ScoreMeter } from "../components/ScoreMeter";
import { StatBlock } from "../components/StatBlock";
import { Button } from "../components/Button";
import { AtlasPanel } from "../components/AtlasPanel";
import { useAuth } from "../hooks/useAuth";

// ─── Inline Avatar ────────────────────────────────────────────────────────────

const AVATAR_CSS = `
.atlas-profile-avatar{ position:relative; display:inline-flex; flex:0 0 auto; }
.atlas-profile-avatar__img{
  width:100%; height:100%; border-radius:50%; object-fit:cover; display:flex;
  align-items:center; justify-content:center;
  background:var(--surface-raised); color:var(--text-secondary);
  font-family:var(--font-display); font-weight:700; letter-spacing:-.01em;
  border:1px solid var(--border-default);
}
.atlas-profile-avatar--ring .atlas-profile-avatar__img{
  box-shadow:0 0 0 2px var(--bg-app), 0 0 0 4px var(--accent);
}
.atlas-profile-avatar__lvl{
  position:absolute; bottom:-3px; right:-3px;
  background:var(--accent); color:var(--text-on-gold);
  font-family:var(--font-display); font-weight:700; font-size:11px; line-height:1;
  min-width:20px; height:20px; padding:0 5px; border-radius:var(--radius-pill);
  display:flex; align-items:center; justify-content:center;
  border:2px solid var(--bg-app); box-shadow:var(--glow-gold-sm);
}
`;

function ensureAvatarCss() {
  if (typeof document === "undefined") return;
  if (!document.getElementById("atlas-profile-avatar-css")) {
    const s = document.createElement("style");
    s.id = "atlas-profile-avatar-css";
    s.textContent = AVATAR_CSS;
    document.head.appendChild(s);
  }
}

function ProfileAvatar({
  name,
  size = 72,
  level = null,
}: {
  name: string;
  size?: number;
  level?: number | null;
}) {
  ensureAvatarCss();
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const fontSize = Math.round(size * 0.38);
  return (
    <span
      className="atlas-profile-avatar atlas-profile-avatar--ring"
      style={{ width: size, height: size }}
    >
      <span className="atlas-profile-avatar__img" style={{ fontSize }}>
        {initials || "?"}
      </span>
      {level != null && (
        <span className="atlas-profile-avatar__lvl">{level}</span>
      )}
    </span>
  );
}

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

// ─── Delete Account Dialog ────────────────────────────────────────────────────

function DeleteAccountDialog({ onClose }: { onClose: () => void }) {
  const [confirmed, setConfirmed] = React.useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiDelete<{ ok: boolean; message: string }>("/account/me", {
        confirm: "DELETE",
      }),
    onSuccess: async () => {
      queryClient.clear();
      await navigate({ to: "/login" });
    },
  });

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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-xl)",
          padding: 28,
          maxWidth: 400,
          width: "90%",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <h2
          style={{
            font: "var(--type-h3)",
            color: "var(--text-primary)",
            marginBottom: 8,
          }}
        >
          Delete your account?
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          This will permanently delete all your activity data, peak logs,
          achievements, and progress. This cannot be undone.
        </p>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            marginBottom: 20,
          }}
        >
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: "var(--status-danger)" }}
          />
          <span style={{ fontSize: 14, color: "var(--text-primary)" }}>
            I understand this is permanent
          </span>
        </label>

        {deleteMutation.isError && (
          <p
            style={{
              fontSize: 13,
              color: "var(--status-danger)",
              marginBottom: 12,
            }}
          >
            {deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : "Failed to delete account"}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={!confirmed || deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete account"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── GPX Import ───────────────────────────────────────────────────────────────

interface ImportJob {
  id: string;
  filename: string;
  status: "uploading" | "queued" | "processing" | "done" | "error";
  queuedAt?: number;
  errorMsg?: string;
  result?: {
    activityName: string;
    peaks: number;
    sections: number;
    landmarks: number;
  };
}

function JobRow({
  job,
  onDismiss,
}: {
  job: ImportJob;
  onDismiss: () => void;
}) {
  const subtext = () => {
    if (job.status === "uploading") return "Uploading…";
    if (job.status === "queued") return "Queued for processing…";
    if (job.status === "processing") return "Processing…";
    if (job.status === "error") return job.errorMsg ?? "Failed";
    if (job.result) {
      const parts: string[] = [];
      if (job.result.peaks > 0)
        parts.push(`${job.result.peaks} peak${job.result.peaks !== 1 ? "s" : ""}`);
      if (job.result.sections > 0)
        parts.push(
          `${job.result.sections} trail section${job.result.sections !== 1 ? "s" : ""}`,
        );
      if (job.result.landmarks > 0)
        parts.push(
          `${job.result.landmarks} landmark${job.result.landmarks !== 1 ? "s" : ""}`,
        );
      return parts.length > 0 ? parts.join(" · ") : "No features matched";
    }
    return "Complete";
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 10px",
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          color:
            job.status === "done"
              ? "var(--status-success)"
              : job.status === "error"
                ? "var(--status-danger)"
                : "var(--text-muted)",
        }}
      >
        {job.status === "done" ? (
          <CheckCircle size={14} />
        ) : job.status === "error" ? (
          <XCircle size={14} />
        ) : (
          <RefreshCw size={14} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {job.result?.activityName ?? job.filename}
        </div>
        <div
          style={{
            fontSize: 11,
            color:
              job.status === "error" ? "var(--status-danger)" : "var(--text-muted)",
            marginTop: 1,
          }}
        >
          {subtext()}
        </div>
      </div>
      {(job.status === "done" || job.status === "error") && (
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: 2,
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

const POLL_TIMEOUT_MS = 5 * 60 * 1000;

function GpxUploadRow() {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = React.useState<ImportJob[]>([]);
  const jobsRef = React.useRef(jobs);
  jobsRef.current = jobs;

  const hasPending = jobs.some(
    (j) => j.status === "queued" || j.status === "processing",
  );

  React.useEffect(() => {
    if (!hasPending) return;

    const timer = setInterval(async () => {
      const pending = jobsRef.current.filter(
        (j) => j.status === "queued" || j.status === "processing",
      );
      if (pending.length === 0) return;

      const results = await Promise.allSettled(
        pending.map((j) => fetchActivity(j.id)),
      );

      setJobs((prev) => {
        let changed = false;
        const next = prev.map((job) => {
          if (job.status !== "queued" && job.status !== "processing") return job;
          if (job.queuedAt && Date.now() - job.queuedAt > POLL_TIMEOUT_MS) {
            changed = true;
            return { ...job, status: "error" as const, errorMsg: "Processing timed out" };
          }
          const ri = pending.findIndex((p) => p.id === job.id);
          if (ri === -1) return job;
          const r = results[ri];
          if (!r || r.status === "rejected") return job;
          const data = r.value;
          if (!data.activity.processedAt) {
            if (job.status === "queued") {
              changed = true;
              return { ...job, status: "processing" as const };
            }
            return job;
          }
          changed = true;
          return {
            ...job,
            status: "done" as const,
            result: {
              activityName: data.activity.name,
              peaks: data.matchedPeaks.length,
              sections: data.matchedSections.length,
              landmarks: data.matchedLandmarks.length,
            },
          };
        });
        return changed ? next : prev;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [hasPending]);

  async function handleFiles(files: FileList) {
    for (const file of Array.from(files)) {
      const tempId = `tmp_${Math.random().toString(36).slice(2)}`;
      setJobs((prev) => [
        ...prev,
        { id: tempId, filename: file.name, status: "uploading" },
      ]);

      try {
        const form = new FormData();
        form.append("gpx", file);
        const res = await fetch(
          `${import.meta.env["VITE_API_URL"] ?? "/api"}/activities/upload`,
          { method: "POST", body: form, credentials: "include" },
        );

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "Upload failed");
        }

        const data = (await res.json()) as { activityId: string; status: string };

        if (data.status === "processed") {
          try {
            const detail = await fetchActivity(data.activityId);
            setJobs((prev) =>
              prev.map((j) =>
                j.id === tempId
                  ? {
                      ...j,
                      id: data.activityId,
                      status: "done" as const,
                      result: {
                        activityName: detail.activity.name,
                        peaks: detail.matchedPeaks.length,
                        sections: detail.matchedSections.length,
                        landmarks: detail.matchedLandmarks.length,
                      },
                    }
                  : j,
              ),
            );
          } catch {
            setJobs((prev) =>
              prev.map((j) =>
                j.id === tempId ? { ...j, id: data.activityId, status: "done" as const } : j,
              ),
            );
          }
        } else {
          setJobs((prev) =>
            prev.map((j) =>
              j.id === tempId
                ? { ...j, id: data.activityId, status: "queued" as const, queuedAt: Date.now() }
                : j,
            ),
          );
        }
      } catch (err) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === tempId
              ? {
                  ...j,
                  status: "error" as const,
                  errorMsg: err instanceof Error ? err.message : "Upload failed",
                }
              : j,
          ),
        );
      }
    }
  }

  const isUploading = jobs.some((j) => j.status === "uploading");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "var(--surface-sunken)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
            }}
          >
            <Upload size={18} />
          </span>
          <div>
            <div
              style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}
            >
              GPX files
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Import a recorded activity
            </div>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".gpx"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files?.length) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          variant="secondary"
          size="sm"
          disabled={isUploading}
          onClick={() => fileRef.current?.click()}
        >
          Upload files
        </Button>
      </div>

      {jobs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {jobs.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              onDismiss={() => setJobs((prev) => prev.filter((j) => j.id !== job.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Strava Connection Row ────────────────────────────────────────────────────

function StravaRow() {
  const statusQuery = useQuery({
    queryKey: ["integrations/strava/status"],
    queryFn: fetchStravaStatus,
    retry: false,
  });

  const syncMutation = useMutation({ mutationFn: triggerStravaSync });
  const disconnectMutation = useMutation({ mutationFn: disconnectStrava });
  const queryClient = useQueryClient();

  function handleDisconnect() {
    disconnectMutation.mutate(undefined, {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: ["integrations/strava/status"],
        });
      },
    });
  }

  const stravaOAuthUrl = `${import.meta.env["VITE_API_URL"] ?? "/api"}/auth/strava`;
  const connected = statusQuery.data?.connected ?? false;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: "var(--radius-md)",
            background: connected ? "var(--accent-soft)" : "var(--surface-sunken)",
            border: `1px solid ${connected ? "var(--border-gold)" : "var(--border-subtle)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: connected ? "var(--gold-400)" : "var(--text-muted)",
          }}
        >
          <Activity size={18} />
        </span>
        <div>
          <div
            style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}
          >
            Strava
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {statusQuery.isLoading && "Checking…"}
            {!statusQuery.isLoading && connected && (
              <>
                {statusQuery.data?.activityCount ?? 0} activities synced
                {statusQuery.data?.lastSyncAt && (
                  <> · Last sync {new Date(statusQuery.data.lastSyncAt).toLocaleDateString()}</>
                )}
              </>
            )}
            {!statusQuery.isLoading && !connected && "Not connected"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {connected ? (
          <>
            {syncMutation.isSuccess ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 13,
                  color: "var(--status-success)",
                }}
              >
                <CheckCircle size={14} /> Syncing
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                disabled={syncMutation.isPending}
                leftIcon={<RefreshCw size={13} />}
                onClick={() => syncMutation.mutate()}
              >
                Sync now
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              disabled={disconnectMutation.isPending}
              leftIcon={<XCircle size={13} />}
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              window.location.href = stravaOAuthUrl;
            }}
          >
            Connect Strava
          </Button>
        )}
      </div>
    </div>
  );
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
    queryFn: () => fetchActivities(10),
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
            No activities yet — import a GPX file or connect Strava
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

// ─── ProfilePage ──────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const statsQuery = useQuery({
    queryKey: ["profile/stats"],
    queryFn: fetchProfileStats,
  });
  const heatmapQuery = useQuery({
    queryKey: ["profile/activity-heatmap"],
    queryFn: fetchActivityHeatmap,
  });

  const stats = statsQuery.data?.stats;
  const heatData = heatmapQuery.data
    ? buildHeatData(heatmapQuery.data.data)
    : null;

  const logoutMutation = useMutation({
    mutationFn: () => import("../api/auth").then((m) => m.logout()),
    onSuccess: async () => {
      queryClient.clear();
      await navigate({ to: "/login" });
    },
  });

  const statCards = [
    {
      label: "Summits",
      value: stats ? String(stats.totalSummits) : null,
      icon: <MountainSnow size={12} />,
    },
    {
      label: "Distance",
      value: stats
        ? `${(stats.totalDistanceM / 1000).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })} km`
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
        overflow: "auto",
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Profile header ─────────────────────────────────────────────── */}
      <div
        className="atlas-topo"
        style={{
          position: "relative",
          padding: "32px 28px 28px",
        }}
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
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <ProfileAvatar
            name={user?.name ?? ""}
            size={72}
            level={stats?.level ?? null}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                font: "var(--type-h2)",
                color: "var(--text-primary)",
                margin: "0 0 4px",
              }}
            >
              {user?.name ?? <Skel width="160px" height="28px" />}
            </h1>
            {user?.email && (
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
                {user.email}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<LogOut size={14} />}
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            Sign out
          </Button>
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

        {/* ── Lifetime stat grid ───────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
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
              ),
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

        {/* ── Activities ───────────────────────────────────────────────── */}
        <ActivitiesPanel />

        {/* ── Connected sources ────────────────────────────────────────── */}
        <AtlasPanel title="Connected sources">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <StravaRow />
            <div
              style={{
                height: 1,
                background: "var(--border-subtle)",
              }}
            />
            <GpxUploadRow />
          </div>
        </AtlasPanel>

        {/* ── Danger zone ──────────────────────────────────────────────── */}
        <AtlasPanel title="Danger zone">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 4,
                }}
              >
                Delete account
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Permanently remove your account and all activity data
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete account
            </Button>
          </div>
        </AtlasPanel>
      </div>

      {showDeleteDialog && (
        <DeleteAccountDialog onClose={() => setShowDeleteDialog(false)} />
      )}
    </div>
  );
}
