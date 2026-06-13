/* Atlas · CollectibleItem
   A single collectible — a peak, trig point, bothy, waterfall. Pokédex-style
   tile that reads as "collected" (gold) or "not yet" (muted silhouette). */
import React from 'react';

const CSS = `
.atlas-item{
  position:relative; display:flex; flex-direction:column; gap:9px; width:100%;
  background:var(--surface-card); border:1px solid var(--border-subtle);
  border-radius:var(--radius-md); padding:13px; font-family:var(--font-sans);
  text-align:left; cursor:pointer; transition:var(--t-colors), transform var(--dur-quick) var(--ease-out);
}
.atlas-item:hover{ transform:translateY(-2px); border-color:var(--border-default); }
.atlas-item__media{
  width:100%; aspect-ratio:1.4; border-radius:var(--radius-sm); overflow:hidden;
  display:flex; align-items:center; justify-content:center;
  background:linear-gradient(150deg, var(--surface-raised), var(--surface-sunken));
  border:1px solid var(--border-subtle); position:relative;
}
.atlas-item__media img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.atlas-item--missing .atlas-item__media img{ filter:grayscale(1) brightness(.46) contrast(.95); }
.atlas-item--got .atlas-item__media{ background:linear-gradient(150deg, var(--accent-soft-2), var(--surface-sunken)); border-color:var(--border-gold); color:var(--gold-400); }
.atlas-item--missing .atlas-item__media{ color:var(--text-faint); }
.atlas-item__check{
  position:absolute; top:6px; right:6px; width:20px; height:20px; border-radius:50%;
  background:var(--accent); color:var(--text-on-gold); display:flex; align-items:center; justify-content:center;
  box-shadow:var(--glow-gold-sm);
}
.atlas-item__name{ font-family:var(--font-display); font-weight:600; font-size:14px; color:var(--text-primary); letter-spacing:-.01em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.atlas-item--missing .atlas-item__name{ color:var(--text-muted); }
.atlas-item__meta{ font-family:var(--font-mono); font-size:11px; color:var(--text-muted); display:flex; gap:8px; }
.atlas-item__meta b{ color:var(--text-secondary); font-weight:700; }
`;

function ensure() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('atlas-item-css')) {
    const s = document.createElement('style');
    s.id = 'atlas-item-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}

export function CollectibleItem({
  name,
  meta = null,
  icon = null,
  image = null,
  collected = false,
  checkIcon = null,
  className = '',
  ...rest
}) {
  ensure();
  return (
    <button
      className={['atlas-item', collected ? 'atlas-item--got' : 'atlas-item--missing', className].filter(Boolean).join(' ')}
      {...rest}
    >
      <span className="atlas-item__media">
        {icon}
        {image && <img src={image} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
        {collected && <span className="atlas-item__check">{checkIcon}</span>}
      </span>
      <span className="atlas-item__name">{name}</span>
      {meta && <span className="atlas-item__meta">{meta}</span>}
    </button>
  );
}
