import React from "react";

const CSS = `
.atlas-score{
  display:flex; align-items:center; gap:16px; font-family:var(--font-sans);
  background:linear-gradient(135deg, var(--surface-raised), var(--surface-sunken));
  border:1px solid var(--border-gold); border-radius:var(--radius-lg);
  box-shadow:var(--glow-gold-sm), var(--ring-top); padding:16px 18px;
}
.atlas-score__lvl{
  flex:0 0 auto; width:52px; height:52px; border-radius:var(--radius-md);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  background:var(--accent); color:var(--text-on-gold); box-shadow:var(--glow-gold-sm);
}
.atlas-score__lvlnum{ font-family:var(--font-display); font-weight:700; font-size:22px; line-height:1; }
.atlas-score__lvllbl{ font-family:var(--font-mono); font-size:8px; text-transform:uppercase; letter-spacing:.14em; opacity:.8; }
.atlas-score__body{ flex:1; min-width:0; display:flex; flex-direction:column; gap:6px; }
.atlas-score__cap{ font-family:var(--font-mono); font-size:10px; text-transform:uppercase; letter-spacing:.14em; color:var(--text-muted); }
.atlas-score__val{ font-family:var(--font-display); font-weight:700; font-size:32px; line-height:1; letter-spacing:-.02em; font-variant-numeric:tabular-nums; white-space:nowrap; }
.atlas-score__next{ font-family:var(--font-mono); font-size:11px; color:var(--text-muted); }
.atlas-score__track{ height:7px; border-radius:var(--radius-pill); background:var(--surface-sunken); overflow:hidden; box-shadow:inset 0 1px 2px rgba(0,0,0,.4); }
.atlas-score__fill{ height:100%; border-radius:var(--radius-pill); background:linear-gradient(90deg, var(--gold-600), var(--gold-300)); transition:width var(--dur-slow) var(--ease-out); }
`;

function ensure() {
  if (typeof document === "undefined") return;
  if (!document.getElementById("atlas-score-css")) {
    const s = document.createElement("style");
    s.id = "atlas-score-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}

interface ScoreMeterProps {
  score?: number;
  level?: number;
  levelProgress?: number; // 0..100
  toNext?: string | null;
  className?: string;
}

export function ScoreMeter({
  score = 0,
  level = 1,
  levelProgress = 0,
  toNext = null,
  className = "",
}: ScoreMeterProps) {
  ensure();
  const pct = Math.max(0, Math.min(100, levelProgress));
  const fmt = typeof score === "number" ? score.toLocaleString() : score;
  return (
    <div className={["atlas-score", className].filter(Boolean).join(" ")}>
      <div className="atlas-score__lvl">
        <span className="atlas-score__lvlnum">{level}</span>
        <span className="atlas-score__lvllbl">Level</span>
      </div>
      <div className="atlas-score__body">
        <span className="atlas-score__cap">Outdoor Score</span>
        <span className="atlas-gold-text atlas-score__val">{fmt}</span>
        <div className="atlas-score__track">
          <div className="atlas-score__fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="atlas-score__next">
          {toNext != null ? toNext : `${Math.round(pct)}% to level ${level + 1}`}
        </span>
      </div>
    </div>
  );
}
