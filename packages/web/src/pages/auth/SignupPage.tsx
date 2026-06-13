import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../../api/auth";

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

export default function SignupPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      qc.setQueryData(["me"], data);
      void navigate({ to: "/dashboard" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, email, password });
  };

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

        {mutation.error && (
          <div style={{
            padding: "10px 12px",
            background: "var(--danger-soft)",
            border: "1px solid rgba(224, 80, 63, 0.4)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
            color: "var(--coral-300)",
          }}>
            {mutation.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          style={{
            width: "100%",
            height: "var(--control-lg)",
            background: mutation.isPending ? "var(--accent-press)" : "var(--accent)",
            color: "var(--text-on-gold)",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-base)",
            fontWeight: 600,
            cursor: mutation.isPending ? "not-allowed" : "pointer",
            transition: "background 0.15s ease",
          }}
        >
          {mutation.isPending ? "Creating account…" : "Create account"}
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
