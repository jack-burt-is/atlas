import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Upload,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { fetchStravaStatus, triggerStravaSync, disconnectStrava } from "../api/integrations";
import { fetchActivity } from "../api/activities";
import { Button } from "../components/Button";
import { AtlasPanel } from "../components/AtlasPanel";

// ─── Strava Row ───────────────────────────────────────────────────────────────

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
        void queryClient.invalidateQueries({ queryKey: ["integrations/strava/status"] });
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
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Strava</div>
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
            onClick={() => { window.location.href = stravaOAuthUrl; }}
          >
            Connect Strava
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── GPX Upload Row ───────────────────────────────────────────────────────────

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

function JobRow({ job, onDismiss }: { job: ImportJob; onDismiss: () => void }) {
  const subtext = () => {
    if (job.status === "uploading") return "Uploading…";
    if (job.status === "queued") return "Queued for processing…";
    if (job.status === "processing") return "Processing…";
    if (job.status === "error") return job.errorMsg ?? "Failed";
    if (job.result) {
      const parts: string[] = [];
      if (job.result.peaks > 0) parts.push(`${job.result.peaks} peak${job.result.peaks !== 1 ? "s" : ""}`);
      if (job.result.sections > 0) parts.push(`${job.result.sections} trail section${job.result.sections !== 1 ? "s" : ""}`);
      if (job.result.landmarks > 0) parts.push(`${job.result.landmarks} landmark${job.result.landmarks !== 1 ? "s" : ""}`);
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
            color: job.status === "error" ? "var(--status-danger)" : "var(--text-muted)",
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

  const hasPending = jobs.some((j) => j.status === "queued" || j.status === "processing");

  React.useEffect(() => {
    if (!hasPending) return;

    const timer = setInterval(async () => {
      const pending = jobsRef.current.filter((j) => j.status === "queued" || j.status === "processing");
      if (pending.length === 0) return;

      const results = await Promise.allSettled(pending.map((j) => fetchActivity(j.id)));

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
            if (job.status === "queued") { changed = true; return { ...job, status: "processing" as const }; }
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
      setJobs((prev) => [...prev, { id: tempId, filename: file.name, status: "uploading" }]);

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
              prev.map((j) => j.id === tempId ? { ...j, id: data.activityId, status: "done" as const } : j),
            );
          }
        } else {
          setJobs((prev) =>
            prev.map((j) =>
              j.id === tempId ? { ...j, id: data.activityId, status: "queued" as const, queuedAt: Date.now() } : j,
            ),
          );
        }
      } catch (err) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === tempId
              ? { ...j, status: "error" as const, errorMsg: err instanceof Error ? err.message : "Upload failed" }
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
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>GPX files</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Import a recorded activity</div>
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

// ─── ConnectedSourcesPage ─────────────────────────────────────────────────────

export default function ConnectedSourcesPage() {
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
          <p className="eyebrow" style={{ fontSize: 11, marginBottom: 4 }}>Data sources</p>
          <h1 style={{ font: "var(--type-h2)", color: "var(--text-primary)", margin: 0 }}>
            Connected Sources
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6, marginBottom: 0 }}>
            Connect your accounts and import activities to build your exploration record.
          </p>
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
        <AtlasPanel title="Connections">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <StravaRow />
            <div style={{ height: 1, background: "var(--border-subtle)" }} />
            <GpxUploadRow />
          </div>
        </AtlasPanel>
      </div>
    </div>
  );
}
