/* Atlas · Button
   Primary action is Summit Gold with ink text — premium, confident.
   Variants: primary | secondary | ghost | danger.
   Sizes: sm | md | lg. Optional leftIcon / rightIcon nodes. */
import React from 'react';

const CSS = `
.atlas-btn{
  --_h: var(--control-md);
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  height:var(--_h); padding:0 18px; border-radius:var(--radius-md);
  font-family:var(--font-sans); font-size:14px; font-weight:600;
  letter-spacing:-0.005em; line-height:1; white-space:nowrap;
  border:1px solid transparent; cursor:pointer; user-select:none;
  transition:var(--t-colors), transform var(--dur-fast) var(--ease-out);
}
.atlas-btn:active{ transform:translateY(1px); }
.atlas-btn:disabled{ opacity:.45; cursor:not-allowed; transform:none; }
.atlas-btn--sm{ --_h:var(--control-sm); padding:0 12px; font-size:13px; }
.atlas-btn--lg{ --_h:var(--control-lg); padding:0 22px; font-size:15px; }
.atlas-btn--block{ width:100%; }

.atlas-btn--primary{ background:var(--accent); color:var(--text-on-gold); }
.atlas-btn--primary:hover:not(:disabled){ background:var(--accent-hover); box-shadow:var(--glow-gold-sm); }
.atlas-btn--primary:active{ background:var(--accent-press); }

.atlas-btn--secondary{ background:var(--surface-raised); color:var(--text-primary); border-color:var(--border-strong); }
.atlas-btn--secondary:hover:not(:disabled){ background:var(--surface-hover); border-color:var(--border-strong); }

.atlas-btn--ghost{ background:transparent; color:var(--text-secondary); }
.atlas-btn--ghost:hover:not(:disabled){ background:var(--surface-raised); color:var(--text-primary); }

.atlas-btn--danger{ background:var(--status-danger); color:#fff; }
.atlas-btn--danger:hover:not(:disabled){ filter:brightness(1.08); }
`;

function ensure() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('atlas-btn-css')) {
    const s = document.createElement('style');
    s.id = 'atlas-btn-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  leftIcon = null,
  rightIcon = null,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  ensure();
  const cls = [
    'atlas-btn',
    `atlas-btn--${variant}`,
    size !== 'md' ? `atlas-btn--${size}` : '',
    block ? 'atlas-btn--block' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={cls} disabled={disabled} {...rest}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
