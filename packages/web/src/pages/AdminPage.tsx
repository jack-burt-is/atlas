import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Copy, Check } from "lucide-react";
import {
  fetchAdminPlanKeys,
  createPlanKey,
  deletePlanKey,
  type PlanKey,
} from "../api/billing";
import { Button } from "../components/Button";
import { AtlasPanel } from "../components/AtlasPanel";
import { useAuth } from "../hooks/useAuth";

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      title="Copy key"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: copied ? "var(--status-success)" : "var(--text-muted)",
        padding: 4,
        display: "flex",
        alignItems: "center",
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

// ─── KeyRow ───────────────────────────────────────────────────────────────────

function KeyRow({ planKey, onDelete }: { planKey: PlanKey; onDelete: () => void }) {
  const redeemed = !!planKey.redeemedAt;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,2fr) 70px 80px minmax(0,1.5fr) auto",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid var(--border-subtle)",
        opacity: redeemed ? 0.6 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-primary)", letterSpacing: "0.05em" }}>
          {planKey.code}
        </span>
        {!redeemed && <CopyButton text={planKey.code} />}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-accent)", textTransform: "capitalize" }}>
        {planKey.plan}
      </span>
      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
        {planKey.durationDays != null ? `${planKey.durationDays}d` : "Lifetime"}
      </span>
      <div style={{ minWidth: 0 }}>
        {redeemed ? (
          <div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {planKey.redeemedByEmail ?? planKey.redeemedByUserId ?? "unknown"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
              {new Date(planKey.redeemedAt!).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{planKey.note ?? "—"}</span>
        )}
      </div>
      <div>
        {!redeemed && (
          <Button variant="ghost" size="sm" leftIcon={<Trash2 size={12} />} onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── CreateKeyDialog ──────────────────────────────────────────────────────────

function CreateKeyDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (key: PlanKey) => void }) {
  const [durationDays, setDurationDays] = React.useState("");
  const [note, setNote] = React.useState("");

  const mutation = useMutation({
    mutationFn: () =>
      createPlanKey({
        plan: "pro",
        durationDays: durationDays ? parseInt(durationDays, 10) : undefined,
        note: note.trim() || undefined,
      }),
    onSuccess: ({ key }) => onCreated(key),
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
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-xl)",
          padding: 28,
          width: 380,
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <h2 style={{ font: "var(--type-h3)", color: "var(--text-primary)", marginBottom: 20 }}>
          Create Pro key
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Duration (days) — leave empty for lifetime
            </label>
            <input
              type="number"
              placeholder="e.g. 365"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              min={1}
              style={{
                width: "100%",
                height: 36,
                padding: "0 10px",
                background: "var(--surface-sunken)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Note (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Beta tester, friend"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                width: "100%",
                height: 36,
                padding: "0 10px",
                background: "var(--surface-sunken)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {mutation.isError && (
          <p style={{ fontSize: 13, color: "var(--status-danger)", marginTop: 12 }}>
            {mutation.error instanceof Error ? mutation.error.message : "Failed to create key"}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Creating…" : "Create key"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── AdminPage ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = React.useState(false);
  const [newKey, setNewKey] = React.useState<PlanKey | null>(null);

  const keysQuery = useQuery({
    queryKey: ["admin/plan-keys"],
    queryFn: fetchAdminPlanKeys,
    enabled: !!user?.isAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlanKey,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin/plan-keys"] });
    },
  });

  if (!user?.isAdmin) {
    return (
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Access denied</p>
      </div>
    );
  }

  const keys = keysQuery.data?.keys ?? [];
  const unredeemedKeys = keys.filter((k) => !k.redeemedAt);
  const redeemedKeys = keys.filter((k) => k.redeemedAt);

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
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p className="eyebrow" style={{ fontSize: 11, marginBottom: 4 }}>Admin</p>
            <h1 style={{ font: "var(--type-h2)", color: "var(--text-primary)", margin: 0 }}>
              Plan Keys
            </h1>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setShowCreate(true)}
          >
            Create key
          </Button>
        </div>
      </div>

      <div style={{ padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Newly created key banner ─────────────────────────────────── */}
        {newKey && (
          <div style={{
            padding: "14px 16px",
            background: "var(--accent-soft)",
            border: "1px solid var(--border-gold)",
            borderRadius: "var(--radius-md)",
          }}>
            <div style={{ fontSize: 12, color: "var(--text-accent)", fontWeight: 600, marginBottom: 6 }}>
              New key created — share this with the recipient:
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.08em" }}>
                {newKey.code}
              </span>
              <CopyButton text={newKey.code} />
              <button
                onClick={() => setNewKey(null)}
                style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18, lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* ── Column headers ───────────────────────────────────────────── */}
        <AtlasPanel title={`Active keys (${unredeemedKeys.length})`}>
          {keysQuery.isLoading ? (
            <div style={{ padding: 16, color: "var(--text-muted)", fontSize: 13 }}>Loading…</div>
          ) : unredeemedKeys.length === 0 ? (
            <div style={{ padding: "12px 0", color: "var(--text-muted)", fontSize: 13 }}>
              No active keys. Create one above.
            </div>
          ) : (
            <div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,2fr) 70px 80px minmax(0,1.5fr) auto",
                gap: 12,
                padding: "6px 0",
                borderBottom: "1px solid var(--border-subtle)",
              }}>
                {["Code", "Plan", "Duration", "Note", ""].map((h) => (
                  <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {h}
                  </span>
                ))}
              </div>
              {unredeemedKeys.map((k) => (
                <KeyRow
                  key={k.id}
                  planKey={k}
                  onDelete={() => deleteMutation.mutate(k.id)}
                />
              ))}
            </div>
          )}
        </AtlasPanel>

        {redeemedKeys.length > 0 && (
          <AtlasPanel title={`Redeemed keys (${redeemedKeys.length})`}>
            <div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,2fr) 70px 80px minmax(0,1.5fr) auto",
                gap: 12,
                padding: "6px 0",
                borderBottom: "1px solid var(--border-subtle)",
              }}>
                {["Code", "Plan", "Duration", "Redeemed by", ""].map((h) => (
                  <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {h}
                  </span>
                ))}
              </div>
              {redeemedKeys.map((k) => (
                <KeyRow key={k.id} planKey={k} onDelete={() => {}} />
              ))}
            </div>
          </AtlasPanel>
        )}
      </div>

      {showCreate && (
        <CreateKeyDialog
          onClose={() => setShowCreate(false)}
          onCreated={(key) => {
            setNewKey(key);
            setShowCreate(false);
            void queryClient.invalidateQueries({ queryKey: ["admin/plan-keys"] });
          }}
        />
      )}
    </div>
  );
}
