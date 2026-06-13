/* Atlas · Card
   Base surface container. Optional interactive hover-raise and gold emphasis. */
import React from 'react';

const CSS = `
.atlas-card{
  position:relative;
  background:var(--surface-card);
  border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg);
  box-shadow:var(--shadow-sm), var(--ring-top);
  padding:var(--space-5);
}
.atlas-card--pad-sm{ padding:var(--space-4); }
.atlas-card--pad-lg{ padding:var(--space-6); }
.atlas-card--flush{ padding:0; overflow:hidden; }
.atlas-card--interactive{ cursor:pointer; transition:var(--t-colors), transform var(--dur-quick) var(--ease-out); }
.atlas-card--interactive:hover{ transform:translateY(-2px); border-color:var(--border-default); box-shadow:var(--shadow-md), var(--ring-top); }
.atlas-card--emphasis{ border-color:var(--border-gold); box-shadow:var(--glow-gold-sm), var(--ring-top); }
`;

function ensure() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('atlas-card-css')) {
    const s = document.createElement('style');
    s.id = 'atlas-card-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}

export function Card({ pad = 'md', interactive = false, emphasis = false, as = 'div', className = '', children, ...rest }) {
  ensure();
  const Tag = as;
  const cls = [
    'atlas-card',
    pad === 'sm' ? 'atlas-card--pad-sm' : pad === 'lg' ? 'atlas-card--pad-lg' : pad === 'none' ? 'atlas-card--flush' : '',
    interactive ? 'atlas-card--interactive' : '',
    emphasis ? 'atlas-card--emphasis' : '',
    className,
  ].filter(Boolean).join(' ');
  return <Tag className={cls} {...rest}>{children}</Tag>;
}
