import React from "react";

const CSS = `
.atlas-badge{
  display:inline-flex; align-items:center; gap:5px;
  height:22px; padding:0 9px; border-radius:var(--radius-pill);
  font-family:var(--font-mono); font-size:11px; font-weight:700;
  text-transform:uppercase; letter-spacing:0.06em; line-height:1;
  border:1px solid transparent; white-space:nowrap;
}
.atlas-badge .dot{ width:6px; height:6px; border-radius:50%; background:currentColor; }
.atlas-badge--neutral{ background:var(--surface-raised); color:var(--text-secondary); border-color:var(--border-default); }
.atlas-badge--gold{ background:var(--accent-soft); color:var(--gold-300); border-color:var(--border-gold); }
.atlas-badge--success{ background:var(--success-soft); color:var(--spruce-300); }
.atlas-badge--info{ background:var(--info-soft); color:var(--sky-300); }
.atlas-badge--danger{ background:var(--danger-soft); color:var(--coral-300); }
.atlas-badge--bronze{ background:rgba(199,123,67,.16); color:var(--tier-bronze); border-color:rgba(199,123,67,.4); }
.atlas-badge--silver{ background:rgba(180,193,205,.14); color:var(--tier-silver); border-color:rgba(180,193,205,.4); }
.atlas-badge--platinum{ background:rgba(143,224,230,.14); color:var(--tier-platinum); border-color:rgba(143,224,230,.4); }
.atlas-badge--solid{ background:var(--accent); color:var(--text-on-gold); border-color:transparent; }
`;

function ensure() {
  if (typeof document === "undefined") return;
  if (!document.getElementById("atlas-badge-css")) {
    const s = document.createElement("style");
    s.id = "atlas-badge-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}

type BadgeVariant =
  | "neutral"
  | "gold"
  | "success"
  | "info"
  | "danger"
  | "bronze"
  | "silver"
  | "platinum"
  | "solid";

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function Badge({
  variant = "neutral",
  dot = false,
  icon = null,
  className = "",
  children,
}: BadgeProps) {
  ensure();
  return (
    <span
      className={["atlas-badge", `atlas-badge--${variant}`, className]
        .filter(Boolean)
        .join(" ")}
    >
      {dot && <span className="dot" />}
      {icon}
      {children}
    </span>
  );
}
