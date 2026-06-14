import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Zap } from "lucide-react";
import { signup } from "../../api/auth";
import { startCheckout } from "../../api/billing";

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{children}</div>;
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} style={{
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      color: "var(--text-secondary)",
      fontFamily: "var(--font-sans)",
    }}>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        height: "var(--control-md)",
        padding: "0 12px",
        background: "var(--surface-sunken)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        color: "var(--text-primary)",
        fontSize: "var(--text-base)",
        fontFamily: "var(--font-sans)",
        outline: "none",
        boxSizing: "border-box",
        ...props.style,
      }}
    />
  );
}

// ─── Plan selection step ──────────────────────────────────────────────────────

const PRO_FEATURES = [
  "Unlimited GPX imports",
  "Full activity heatmap history",
  "Advanced analytics",
];

function PlanStep({ onContinueFree, onUpgradePro, upgrading }: {
  onContinueFree: () => void;
  onUpgradePro: () => void;
  upgrading: boolean;
}) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div className="eyebrow" style={{ marginBottom: "var(--space-2)" }}>
          One last thing
        </div>
        <h1 style={{ font: "var(--type-h2)", color: "var(--text-primary)" }}>
          Choose your plan
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 8 }}>
          Start free and upgrade anytime.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Pro card */}
        <div style={{
          padding: "18px 20px",
          background: "var(--accent-soft)",
          border: "2px solid var(--border-gold)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--glow-gold-sm)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-accent)" }}>Atlas Pro</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                  background: "var(--accent)", color: "var(--text-on-gold)",
                  padding: "2px 6px", borderRadius: "var(--radius-pill)",
                }}>RECOMMENDED</span>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--text-accent)", marginTop: 2 }}>
                £4<span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>/mo</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {PRO_FEATURES.map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--text-secondary)" }}>
                <Check size={13} style={{ color: "var(--text-accent)", flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
          <button
            onClick={onUpgradePro}
            disabled={upgrading}
            style={{
              width: "100%",
              height: 38,
              background: upgrading ? "var(--accent-press)" : "var(--accent)",
              color: "var(--text-on-gold)",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontSize: 14,
              fontWeight: 600,
              cursor: upgrading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Zap size={14} />
            {upgrading ? "Loading checkout…" : "Upgrade to Pro"}
          </button>
        </div>

        {/* Free card */}
        <button
          onClick={onContinueFree}
          style={{
            padding: "14px 20px",
            background: "var(--surface-sunken)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Continue with Free</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
            Peak tracking, Strava sync, 3 GPX imports/month
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── SignupPage ───────────────────────────────────────────────────────────────

export default function SignupPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"account" | "plan">("account");

  const signupMutation = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      qc.setQueryData(["me"], data);
      setStep("plan");
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: startCheckout,
    onSuccess: ({ url }) => {
      if (url) window.location.href = url;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signupMutation.mutate({ name, email, password });
  };

  if (step === "plan") {
    return (
      <div style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-8)",
        boxShadow: "var(--shadow-md), var(--ring-top)",
      }}>
        <PlanStep
          upgrading={checkoutMutation.isPending}
          onContinueFree={() => { void navigate({ to: "/dashboard" }); }}
          onUpgradePro={() => checkoutMutation.mutate()}
        />
        {checkoutMutation.isError && (
          <p style={{ fontSize: 13, color: "var(--status-danger)", marginTop: 12 }}>
            {checkoutMutation.error instanceof Error ? checkoutMutation.error.message : "Failed to start checkout"}
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-xl)",
      padding: "var(--space-8)",
      boxShadow: "var(--shadow-md), var(--ring-top)",
    }}>
      <div style={{ marginBottom: "var(--space-7)" }}>
        <div className="eyebrow" style={{ marginBottom: "var(--space-2)" }}>
          Start exploring
        </div>
        <h1 style={{ font: "var(--type-h2)", color: "var(--text-primary)" }}>
          Create your account
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FieldGroup>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </FieldGroup>

        {signupMutation.error && (
          <div style={{
            padding: "10px 12px",
            background: "var(--danger-soft)",
            border: "1px solid rgba(224, 80, 63, 0.4)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
            color: "var(--coral-300)",
          }}>
            {signupMutation.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={signupMutation.isPending}
          style={{
            width: "100%",
            height: "var(--control-lg)",
            background: signupMutation.isPending ? "var(--accent-press)" : "var(--accent)",
            color: "var(--text-on-gold)",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-base)",
            fontWeight: 600,
            cursor: signupMutation.isPending ? "not-allowed" : "pointer",
            transition: "background 0.15s ease",
          }}
        >
          {signupMutation.isPending ? "Creating account…" : "Create account"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
          <span className="eyebrow">or</span>
          <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
        </div>

        <a
          href="/api/auth/strava"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            height: "var(--control-lg)",
            background: "#FC4C02",
            border: "none",
            borderRadius: "var(--radius-md)",
            color: "#fff",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-base)",
            fontWeight: 600,
            textDecoration: "none",
            transition: "opacity 0.15s ease",
          }}
        >
          <StravaIcon />
          Sign up with Strava
        </a>
      </form>

      <p style={{
        marginTop: "var(--space-6)",
        textAlign: "center",
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        fontFamily: "var(--font-sans)",
      }}>
        Already have an account?{" "}
        <Link
          to="/login"
          style={{ color: "var(--text-accent)", fontWeight: 600 }}
        >
          Sign in →
        </Link>
      </p>
    </div>
  );
}

function StravaIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116z" />
      <path d="M11.094 13.828l3.059-6.09 3.059 6.09h2.277L13.153 0 6.817 13.828z" />
    </svg>
  );
}
