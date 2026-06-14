import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  LogOut,
  Trash2,
  BarChart3,
  Plug,
  CreditCard,
  ChevronRight,
  Camera,
} from "lucide-react";
import { logout } from "../api/auth";
import { apiDelete, apiPatch, apiPost } from "../lib/api-client";
import { Button } from "../components/Button";
import { AtlasPanel } from "../components/AtlasPanel";
import { useAuth } from "../hooks/useAuth";

// ─── Avatar ───────────────────────────────────────────────────────────────────

function ProfileAvatar({
  name,
  avatarUrl,
  size = 72,
  onUploadClick,
  uploading,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  onUploadClick?: () => void;
  uploading?: boolean;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const fontSize = Math.round(size * 0.38);

  return (
    <div style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          border: "3px solid var(--accent)",
          boxShadow: "0 0 0 2px var(--bg-app), var(--glow-gold-sm)",
          background: "var(--surface-raised)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize,
          color: "var(--text-accent)",
        }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          initials || "?"
        )}
      </div>
      {onUploadClick && (
        <button
          onClick={onUploadClick}
          disabled={uploading}
          aria-label="Change photo"
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--accent)",
            border: "2px solid var(--bg-app)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.6 : 1,
          }}
        >
          <Camera size={13} color="var(--text-on-gold)" />
        </button>
      )}
    </div>
  );
}

// ─── Delete Account Dialog ────────────────────────────────────────────────────

function DeleteAccountDialog({ onClose }: { onClose: () => void }) {
  const [confirmed, setConfirmed] = React.useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiDelete<{ ok: boolean; message: string }>("/account/me", { confirm: "DELETE" }),
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
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
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
        <h2 style={{ font: "var(--type-h3)", color: "var(--text-primary)", marginBottom: 8 }}>
          Delete your account?
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.5 }}>
          This will permanently delete all your activity data, peak logs,
          achievements, and progress. This cannot be undone.
        </p>

        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 20 }}>
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
          <p style={{ fontSize: 13, color: "var(--status-danger)", marginBottom: 12 }}>
            {deleteMutation.error instanceof Error ? deleteMutation.error.message : "Failed to delete account"}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
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

// ─── ProfilePage ──────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [avatarUploading, setAvatarUploading] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: async () => {
      queryClient.clear();
      await navigate({ to: "/login" });
    },
  });

  async function handleAvatarUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be under 5MB");
      return;
    }

    setAvatarUploading(true);
    setAvatarError(null);

    try {
      const { uploadUrl, publicUrl } = await apiPost<{ uploadUrl: string; publicUrl: string }>(
        "/account/avatar/upload-url",
        { contentType: file.type },
      ).catch(() => {
        throw new Error("Failed to get upload URL");
      });

      // Upload directly to S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadRes.ok) throw new Error("Upload to storage failed");

      // Update user record
      await apiPatch<{ user: unknown }>("/account/me", { avatarUrl: publicUrl });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setAvatarUploading(false);
    }
  }

  const quickLinks = [
    {
      to: "/statistics",
      icon: <BarChart3 size={22} />,
      label: "Statistics",
      description: "Scores, lifetime stats & activity history",
    },
    {
      to: "/connected-sources",
      icon: <Plug size={22} />,
      label: "Connected Sources",
      description: "Strava, GPX files & data imports",
    },
    {
      to: "/plan",
      icon: <CreditCard size={22} />,
      label: "Plan & Billing",
      description: `${user?.plan === "pro" ? "Pro" : "Free"} plan · Manage subscription`,
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
        style={{ position: "relative", padding: "32px 28px 28px" }}
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleAvatarUpload(file);
              e.target.value = "";
            }}
          />
          <ProfileAvatar
            name={user?.name ?? ""}
            avatarUrl={user?.avatarUrl}
            size={72}
            uploading={avatarUploading}
            onUploadClick={() => fileInputRef.current?.click()}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ font: "var(--type-h2)", color: "var(--text-primary)", margin: "0 0 4px" }}>
              {user?.name ?? "Explorer"}
            </h1>
            {user?.email && (
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>
                {user.email}
              </div>
            )}
            {avatarError && (
              <div style={{ fontSize: 12, color: "var(--status-danger)", marginTop: 4 }}>
                {avatarError}
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

      <div style={{ padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* ── Quick nav ────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {quickLinks.map(({ to, icon, label, description }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 18px",
                background: "var(--surface-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-sm), var(--ring-top)",
                textDecoration: "none",
                color: "var(--text-primary)",
                transition: "border-color 0.15s ease, background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-gold)";
                e.currentTarget.style.background = "var(--accent-soft)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.background = "var(--surface-card)";
              }}
            >
              <span
                style={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border-default)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-accent)",
                }}
              >
                {icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{description}</div>
              </div>
              <ChevronRight size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            </Link>
          ))}
        </div>

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
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
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
