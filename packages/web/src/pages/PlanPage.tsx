import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { Check, Zap, Lock } from "lucide-react";
import {
  fetchBillingStatus,
  startCheckout,
  openBillingPortal,
  redeemKey,
} from "../api/billing";
import { Button } from "../components/Button";
import { AtlasPanel } from "../components/AtlasPanel";
import { useAuth } from "../hooks/useAuth";

// ─── Plan feature lists ───────────────────────────────────────────────────────

const FREE_FEATURES = [
  "Unlimited peak & trail tracking",
  "Strava sync",
  "3 GPX imports per month",
  "Basic statistics",
  "Region coverage map",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited GPX imports",
  "Full activity heatmap history",
  "Advanced analytics",
  "Priority support",
];

// ─── PlanPage ─────────────────────────────────────────────────────────────────

export default function PlanPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [keyInput, setKeyInput] = React.useState("");
  const [keySuccess, setKeySuccess] = React.useState<string | null>(null);

  const search = useSearch({ from: "/_protected/plan" });
  const checkoutResult = (search as Record<string, string>)["checkout"];

  const billingQuery = useQuery({
    queryKey: ["billing"],
    queryFn: fetchBillingStatus,
    staleTime: 60_000,
  });

  const checkoutMutation = useMutation({
    mutationFn: startCheckout,
    onSuccess: ({ url }) => {
      if (url) window.location.href = url;
    },
  });

  const portalMutation = useMutation({
    mutationFn: openBillingPortal,
    onSuccess: ({ url }) => {
      if (url) window.location.href = url;
    },
  });

  const redeemMutation = useMutation({
    mutationFn: (code: string) => redeemKey(code),
    onSuccess: (data) => {
      setKeySuccess(`Key redeemed! Your plan is now ${data.plan}${data.expiresAt ? ` until ${new Date(data.expiresAt).toLocaleDateString()}` : ""}.`);
      setKeyInput("");
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      void queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });

  const billing = billingQuery.data;
  const isPro = billing?.isPro ?? user?.plan === "pro";
  const usedThisMonth = billing?.limits.gpxImportsUsedThisMonth ?? 0;
  const monthlyLimit = billing?.limits.gpxImportsPerMonth;

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
          <p className="eyebrow" style={{ fontSize: 11, marginBottom: 4 }}>Subscription</p>
          <h1 style={{ font: "var(--type-h2)", color: "var(--text-primary)", margin: 0 }}>
            Plan & Billing
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6, marginBottom: 0 }}>
            Manage your Atlas subscription and usage.
          </p>
        </div>
      </div>

      <div style={{ padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Checkout result banner ───────────────────────────────────── */}
        {checkoutResult === "success" && (
          <div style={{
            padding: "12px 16px",
            background: "var(--status-success-soft, rgba(34,197,94,.1))",
            border: "1px solid var(--status-success)",
            borderRadius: "var(--radius-md)",
            fontSize: 14,
            color: "var(--status-success)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <Check size={16} />
            Welcome to Pro! Your subscription is now active.
          </div>
        )}
        {checkoutResult === "cancelled" && (
          <div style={{
            padding: "12px 16px",
            background: "var(--surface-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            fontSize: 14,
            color: "var(--text-secondary)",
          }}>
            Checkout cancelled — you're still on the Free plan.
          </div>
        )}

        {/* ── Current plan ─────────────────────────────────────────────── */}
        <AtlasPanel title="Current plan">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-md)",
                background: isPro ? "var(--accent-soft)" : "var(--surface-sunken)",
                border: `1px solid ${isPro ? "var(--border-gold)" : "var(--border-subtle)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isPro ? "var(--gold-400)" : "var(--text-muted)",
              }}>
                {isPro ? <Zap size={20} /> : <Lock size={20} />}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                  {isPro ? "Atlas Pro" : "Atlas Free"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {isPro
                    ? billing?.planExpiresAt
                      ? `Key access · expires ${new Date(billing.planExpiresAt).toLocaleDateString()}`
                      : `Subscription · ${billing?.billingStatus ?? "active"}`
                    : "3 GPX imports/month · basic stats"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {isPro && !billing?.planExpiresAt ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                >
                  {portalMutation.isPending ? "Opening…" : "Manage subscription"}
                </Button>
              ) : !isPro ? (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Zap size={14} />}
                  onClick={() => checkoutMutation.mutate()}
                  disabled={checkoutMutation.isPending}
                >
                  {checkoutMutation.isPending ? "Loading…" : "Upgrade to Pro"}
                </Button>
              ) : null}
            </div>
          </div>

          {/* Usage bar for free users */}
          {!isPro && monthlyLimit != null && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
                <span>GPX imports this month</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{usedThisMonth} / {monthlyLimit}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "var(--surface-sunken)", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${Math.min(100, (usedThisMonth / monthlyLimit) * 100)}%`,
                  background: usedThisMonth >= monthlyLimit ? "var(--status-danger)" : "var(--accent)",
                  borderRadius: 3,
                  transition: "width 0.3s ease",
                }} />
              </div>
            </div>
          )}
        </AtlasPanel>

        {/* ── Plan comparison ──────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Free */}
          <AtlasPanel title="">
            <div style={{ padding: "4px 0" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Free</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>
                £0<span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-muted)" }}>/mo</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {FREE_FEATURES.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                    <Check size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </AtlasPanel>

          {/* Pro */}
          <AtlasPanel title="">
            <div style={{ padding: "4px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-accent)" }}>Pro</div>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                  background: "var(--accent)", color: "var(--text-on-gold)",
                  padding: "2px 6px", borderRadius: "var(--radius-pill)",
                }}>RECOMMENDED</span>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--text-accent)", marginBottom: 16 }}>
                £4<span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-muted)" }}>/mo</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PRO_FEATURES.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                    <Check size={14} style={{ color: "var(--text-accent)", flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>
              {!isPro && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Zap size={14} />}
                  onClick={() => checkoutMutation.mutate()}
                  disabled={checkoutMutation.isPending}
                  style={{ width: "100%", marginTop: 20 }}
                >
                  {checkoutMutation.isPending ? "Loading…" : "Upgrade to Pro"}
                </Button>
              )}
            </div>
          </AtlasPanel>
        </div>

        {/* ── Redeem key ───────────────────────────────────────────────── */}
        <AtlasPanel title="Redeem a key">
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
            Have an access key? Enter it below to activate your plan.
          </p>
          {keySuccess ? (
            <div style={{
              padding: "10px 14px",
              background: "var(--accent-soft)",
              border: "1px solid var(--border-gold)",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
              color: "var(--text-accent)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <Check size={14} /> {keySuccess}
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (keyInput.trim()) redeemMutation.mutate(keyInput.trim());
              }}
              style={{ display: "flex", gap: 8 }}
            >
              <input
                type="text"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  height: 36,
                  padding: "0 12px",
                  background: "var(--surface-sunken)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  letterSpacing: "0.05em",
                  outline: "none",
                }}
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={!keyInput.trim() || redeemMutation.isPending}
              >
                {redeemMutation.isPending ? "Redeeming…" : "Redeem"}
              </Button>
            </form>
          )}
          {redeemMutation.isError && (
            <p style={{ fontSize: 13, color: "var(--status-danger)", marginTop: 8 }}>
              {redeemMutation.error instanceof Error ? redeemMutation.error.message : "Redemption failed"}
            </p>
          )}
        </AtlasPanel>
      </div>
    </div>
  );
}
