/* Atlas · StatBlock
   Big tabular figure with a mono caption — the product's vital signs. */
import React from 'react';

export function StatBlock({
  value,
  label,
  sub = null,
  icon = null,
  gold = false,
  align = 'left',
  size = 'md',
  className = '',
  ...rest
}) {
  const sizes = { sm: 30, md: 40, lg: 56 };
  const fs = sizes[size] || sizes.md;
  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: align === 'center' ? 'center' : 'flex-start', textAlign: align }}
      {...rest}
    >
      {(label || icon) && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase',
          letterSpacing: '.12em', color: 'var(--text-muted)',
        }}>{icon}{label}</span>
      )}
      <span
        className={gold ? 'atlas-gold-text' : ''}
        style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, lineHeight: 1,
          fontSize: fs, letterSpacing: '-.02em', fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
          color: gold ? undefined : 'var(--text-primary)',
        }}
      >{value}</span>
      {sub && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)' }}>{sub}</span>
      )}
    </div>
  );
}
