import React from "react";

const CSS = `
.atlas-pbar{ display:flex; flex-direction:column; gap:7px; width:100%; }
.atlas-pbar__head{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; }
.atlas-pbar__label{ flex:1 1 auto; min-width:0; font-family:var(--font-sans); font-size:13px; font-weight:500; color:var(--text-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.atlas-pbar__val{ flex:0 0 auto; font-family:var(--font-mono); font-size:12px; font-weight:700; color:var(--text-primary); font-variant-numeric:tabular-nums; white-space:nowrap; }
.atlas-pbar__track{ position:relative; height:8px; border-radius:var(--radius-pill); background:var(--surface-sunken); overflow:hidden; box-shadow:inset 0 1px 2px rgba(0,0,0,.4); }
.atlas-pbar--lg .atlas-pbar__track{ height:12px; }
.atlas-pbar--sm .atlas-pbar__track{ height:6px; }
.atlas-pbar__fill{ position:absolute; inset:0 auto 0 0; border-radius:var(--radius-pill); transition:width var(--dur-slow) var(--ease-out); }
.atlas-pbar__fill--gold{ background:linear-gradient(90deg, var(--gold-600), var(--gold-400)); }
.atlas-pbar__fill--sky{ background:linear-gradient(90deg, var(--sky-500), var(--sky-300)); }
.atlas-pbar__fill--spruce{ background:linear-gradient(90deg, var(--spruce-500), var(--spruce-300)); }
.atlas-pbar__fill--complete{ background:linear-gradient(90deg, var(--gold-500), var(--gold-300)); box-shadow:0 0 12px rgba(244,183,64,.5); }
`;

function ensure() {
  if (typeof document === "undefined") return;
  if (!document.getElementById("atlas-pbar-css")) {
    const s = document.createElement("style");
    s.id = "atlas-pbar-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}

interface ProgressBarProps {
  value?: number;
  max?: number;
  label?: string | null;
  size?: "sm" | "md" | "lg";
  color?: "gold" | "sky" | "spruce";
  showValue?: boolean;
  valueFormat?: ((value: number, max: number, pct: number) => string) | null;
  className?: string;
}

export function ProgressBar({
  value = 0,
  max = 100,
  label = null,
  size = "md",
  color = "gold",
  showValue = true,
  valueFormat = null,
  className = "",
}: ProgressBarProps) {
  ensure();
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const complete = pct >= 100;
  const fillColor = complete ? "complete" : color;
  const display = valueFormat
    ? valueFormat(value, max, pct)
    : max === 100
      ? `${Math.round(pct)}%`
      : `${value} / ${max}`;
  return (
    <div
      className={["atlas-pbar", `atlas-pbar--${size}`, className]
        .filter(Boolean)
        .join(" ")}
    >
      {(label || showValue) && (
        <div className="atlas-pbar__head">
          {label && <span className="atlas-pbar__label">{label}</span>}
          {showValue && <span className="atlas-pbar__val">{display}</span>}
        </div>
      )}
      <div className="atlas-pbar__track">
        <div
          className={`atlas-pbar__fill atlas-pbar__fill--${fillColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
