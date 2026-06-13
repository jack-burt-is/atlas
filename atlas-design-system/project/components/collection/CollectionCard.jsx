/* Atlas · CollectionCard
   A completionist collection (Munros, Wainwrights, a National Trail…)
   with progress. Self-contained; pass an icon node and optional image. */
import React from 'react';

const CSS = `
.atlas-coll{
  position:relative; display:flex; gap:14px; align-items:center;
  background:var(--surface-card); border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg); box-shadow:var(--shadow-sm), var(--ring-top);
  padding:14px; cursor:pointer; transition:var(--t-colors), transform var(--dur-quick) var(--ease-out);
  text-align:left; width:100%; font-family:var(--font-sans);
}
.atlas-coll:hover{ transform:translateY(-2px); border-color:var(--border-default); box-shadow:var(--shadow-md), var(--ring-top); }
.atlas-coll--done{ border-color:var(--border-gold); box-shadow:var(--glow-gold-sm), var(--ring-top); }
.atlas-coll__media{
  flex:0 0 auto; width:60px; height:60px; border-radius:var(--radius-md);
  display:flex; align-items:center; justify-content:center; overflow:hidden;
  background:linear-gradient(150deg, var(--surface-raised), var(--surface-sunken));
  border:1px solid var(--border-default); color:var(--gold-400);
}
.atlas-coll__media img{ width:100%; height:100%; object-fit:cover; }
.atlas-coll__body{ flex:1; min-width:0; display:flex; flex-direction:column; gap:8px; }
.atlas-coll__top{ display:flex; align-items:baseline; justify-content:space-between; gap:10px; }
.atlas-coll__type{ font-family:var(--font-mono); font-size:10px; text-transform:uppercase; letter-spacing:.12em; color:var(--text-muted); }
.atlas-coll__title{ font-family:var(--font-display); font-weight:600; font-size:16px; color:var(--text-primary); letter-spacing:-.01em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.atlas-coll__count{ font-family:var(--font-mono); font-size:13px; font-weight:700; color:var(--text-primary); font-variant-numeric:tabular-nums; flex:0 0 auto; white-space:nowrap; }
.atlas-coll__count b{ color:var(--gold-400); }
.atlas-coll__track{ height:7px; border-radius:var(--radius-pill); background:var(--surface-sunken); overflow:hidden; box-shadow:inset 0 1px 2px rgba(0,0,0,.4); }
.atlas-coll__fill{ height:100%; border-radius:var(--radius-pill); background:linear-gradient(90deg, var(--gold-600), var(--gold-400)); transition:width var(--dur-slow) var(--ease-out); }
.atlas-coll--done .atlas-coll__fill{ background:linear-gradient(90deg, var(--gold-500), var(--gold-300)); box-shadow:0 0 10px rgba(244,183,64,.5); }
.atlas-coll__pct{ font-family:var(--font-mono); font-size:11px; color:var(--text-muted); }
`;

function ensure() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('atlas-coll-css')) {
    const s = document.createElement('style');
    s.id = 'atlas-coll-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}

export function CollectionCard({
  title,
  type = 'Collection',
  value = 0,
  max = 100,
  icon = null,
  image = null,
  className = '',
  ...rest
}) {
  ensure();
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const done = pct >= 100;
  return (
    <button className={['atlas-coll', done ? 'atlas-coll--done' : '', className].filter(Boolean).join(' ')} {...rest}>
      <span className="atlas-coll__media">
        {image ? <img src={image} alt="" /> : icon}
      </span>
      <span className="atlas-coll__body">
        <span className="atlas-coll__top">
          <span style={{ minWidth: 0 }}>
            <span className="atlas-coll__type">{type}</span>
            <span className="atlas-coll__title" style={{ display: 'block' }}>{title}</span>
          </span>
          <span className="atlas-coll__count"><b>{value}</b> / {max}</span>
        </span>
        <span className="atlas-coll__track">
          <span className="atlas-coll__fill" style={{ width: `${pct}%`, display: 'block' }} />
        </span>
        <span className="atlas-coll__pct">{done ? 'Completed' : `${Math.round(pct)}% complete · ${max - value} remaining`}</span>
      </span>
    </button>
  );
}
