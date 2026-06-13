/* Atlas · AchievementBadge
   Steam/Xbox-style achievement. Locked or unlocked, tiered, with points
   and optional progress toward the next unlock. */
import React from 'react';

const TIER = {
  bronze: { color: 'var(--tier-bronze)', glow: 'var(--glow-bronze)', soft: 'rgba(199,123,67,.16)' },
  silver: { color: 'var(--tier-silver)', glow: 'var(--glow-silver)', soft: 'rgba(180,193,205,.14)' },
  gold: { color: 'var(--tier-gold)', glow: 'var(--glow-gold-md)', soft: 'var(--accent-soft)' },
  platinum: { color: 'var(--tier-platinum)', glow: 'var(--glow-platinum)', soft: 'rgba(143,224,230,.14)' },
};

const CSS = `
.atlas-ach{
  display:flex; gap:14px; align-items:center; width:100%; text-align:left;
  background:var(--surface-card); border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg); box-shadow:var(--shadow-sm), var(--ring-top);
  padding:14px; font-family:var(--font-sans); transition:var(--t-colors), transform var(--dur-quick) var(--ease-out);
}
.atlas-ach--unlocked{ cursor:pointer; }
.atlas-ach--unlocked:hover{ transform:translateY(-2px); box-shadow:var(--shadow-md), var(--ring-top); }
.atlas-ach--locked{ opacity:.72; }
.atlas-ach__medal{
  position:relative; flex:0 0 auto; width:56px; height:56px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
}
.atlas-ach__lockwrap{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:var(--text-muted); }
.atlas-ach__body{ flex:1; min-width:0; }
.atlas-ach__top{ display:flex; align-items:center; gap:8px; margin-bottom:3px; }
.atlas-ach__title{ font-family:var(--font-display); font-weight:600; font-size:15px; color:var(--text-primary); letter-spacing:-.01em; }
.atlas-ach--locked .atlas-ach__title{ color:var(--text-secondary); }
.atlas-ach__desc{ font-size:13px; color:var(--text-muted); line-height:1.4; }
.atlas-ach__pts{
  flex:0 0 auto; display:flex; flex-direction:column; align-items:flex-end; gap:3px; padding-left:8px;
}
.atlas-ach__ptval{ font-family:var(--font-display); font-weight:700; font-size:18px; color:var(--gold-400); font-variant-numeric:tabular-nums; line-height:1; }
.atlas-ach--locked .atlas-ach__ptval{ color:var(--text-faint); }
.atlas-ach__ptlbl{ font-family:var(--font-mono); font-size:9px; text-transform:uppercase; letter-spacing:.1em; color:var(--text-faint); white-space:nowrap; }
.atlas-ach__prog{ margin-top:8px; height:5px; border-radius:var(--radius-pill); background:var(--surface-sunken); overflow:hidden; }
.atlas-ach__progfill{ height:100%; background:linear-gradient(90deg, var(--gold-600), var(--gold-400)); border-radius:var(--radius-pill); }
.atlas-ach__progtxt{ font-family:var(--font-mono); font-size:10px; color:var(--text-muted); margin-top:5px; display:block; }
`;

function ensure() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('atlas-ach-css')) {
    const s = document.createElement('style');
    s.id = 'atlas-ach-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}

export function AchievementBadge({
  title,
  description = null,
  tier = 'bronze',
  points = 0,
  unlocked = false,
  icon = null,
  progress = null,   // { value, max } toward unlock (locked only)
  className = '',
  ...rest
}) {
  ensure();
  const t = TIER[tier] || TIER.bronze;
  const pct = progress ? Math.min(100, (progress.value / progress.max) * 100) : 0;
  return (
    <div
      className={['atlas-ach', unlocked ? 'atlas-ach--unlocked' : 'atlas-ach--locked', className].filter(Boolean).join(' ')}
      {...rest}
    >
      <span
        className="atlas-ach__medal"
        style={{
          background: unlocked ? t.soft : 'var(--surface-raised)',
          color: unlocked ? t.color : 'var(--text-faint)',
          boxShadow: unlocked ? t.glow : 'inset 0 0 0 1px var(--border-default)',
        }}
      >
        {unlocked ? icon : <span className="atlas-ach__lockwrap">{icon}</span>}
      </span>
      <span className="atlas-ach__body">
        <span className="atlas-ach__top">
          <span className="atlas-ach__title">{title}</span>
        </span>
        {description && <span className="atlas-ach__desc">{description}</span>}
        {!unlocked && progress && (
          <>
            <span className="atlas-ach__prog"><span className="atlas-ach__progfill" style={{ width: `${pct}%`, display: 'block' }} /></span>
            <span className="atlas-ach__progtxt">{progress.value} / {progress.max} to unlock</span>
          </>
        )}
      </span>
      <span className="atlas-ach__pts">
        <span className="atlas-ach__ptval">{points}</span>
        <span className="atlas-ach__ptlbl">{tier} · pts</span>
      </span>
    </div>
  );
}
