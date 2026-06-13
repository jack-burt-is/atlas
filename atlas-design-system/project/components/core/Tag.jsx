/* Atlas · Tag
   Filter chip / category pill. Selectable and optionally removable. */
import React from 'react';

const CSS = `
.atlas-tag{
  display:inline-flex; align-items:center; gap:6px;
  height:30px; padding:0 12px; border-radius:var(--radius-pill);
  font-family:var(--font-sans); font-size:13px; font-weight:500; line-height:1;
  background:var(--surface-raised); color:var(--text-secondary);
  border:1px solid var(--border-default); cursor:pointer;
  transition:var(--t-colors);
}
.atlas-tag:hover{ color:var(--text-primary); border-color:var(--border-strong); }
.atlas-tag--selected{ background:var(--accent-soft); color:var(--gold-300); border-color:var(--border-gold); }
.atlas-tag--static{ cursor:default; }
.atlas-tag__count{ font-family:var(--font-mono); font-size:11px; opacity:.8; }
.atlas-tag__x{ display:inline-flex; opacity:.7; margin-right:-2px; }
.atlas-tag__x:hover{ opacity:1; }
`;

function ensure() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('atlas-tag-css')) {
    const s = document.createElement('style');
    s.id = 'atlas-tag-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}

export function Tag({ selected = false, count = null, icon = null, onRemove = null, interactive = true, className = '', children, ...rest }) {
  ensure();
  const cls = [
    'atlas-tag',
    selected ? 'atlas-tag--selected' : '',
    !interactive ? 'atlas-tag--static' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {icon}
      {children}
      {count != null && <span className="atlas-tag__count">{count}</span>}
      {onRemove && (
        <span
          className="atlas-tag__x"
          onClick={(e) => { e.stopPropagation(); onRemove(e); }}
          aria-label="Remove"
        >×</span>
      )}
    </span>
  );
}
