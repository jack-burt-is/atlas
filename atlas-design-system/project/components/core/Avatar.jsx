/* Atlas · Avatar
   Circular user image or initials, with an optional gold level ring + badge. */
import React from 'react';

const CSS = `
.atlas-avatar{ position:relative; display:inline-flex; flex:0 0 auto; }
.atlas-avatar__img{
  width:100%; height:100%; border-radius:50%; object-fit:cover; display:block;
  background:var(--surface-raised); color:var(--text-secondary);
  display:flex; align-items:center; justify-content:center;
  font-family:var(--font-display); font-weight:700; letter-spacing:-.01em;
  border:1px solid var(--border-default);
}
.atlas-avatar--ring .atlas-avatar__img{ box-shadow:0 0 0 2px var(--bg-app), 0 0 0 4px var(--accent); }
.atlas-avatar__lvl{
  position:absolute; bottom:-3px; right:-3px;
  background:var(--accent); color:var(--text-on-gold);
  font-family:var(--font-display); font-weight:700; font-size:11px; line-height:1;
  min-width:20px; height:20px; padding:0 5px; border-radius:var(--radius-pill);
  display:flex; align-items:center; justify-content:center;
  border:2px solid var(--bg-app); box-shadow:var(--glow-gold-sm);
}
`;

function ensure() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('atlas-avatar-css')) {
    const s = document.createElement('style');
    s.id = 'atlas-avatar-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}

export function Avatar({ src = null, name = '', size = 44, level = null, ring = false, className = '', ...rest }) {
  ensure();
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const fontSize = Math.round(size * 0.38);
  return (
    <span
      className={['atlas-avatar', ring ? 'atlas-avatar--ring' : '', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
      {...rest}
    >
      {src ? (
        <img className="atlas-avatar__img" src={src} alt={name} />
      ) : (
        <span className="atlas-avatar__img" style={{ fontSize }}>{initials || '?'}</span>
      )}
      {level != null && <span className="atlas-avatar__lvl">{level}</span>}
    </span>
  );
}
