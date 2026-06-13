/* Atlas · ProgressRing
   Circular completion dial. Center shows % or custom children. */
import React from 'react';

const COLORS = {
  gold: ['var(--gold-400)', 'var(--gold-600)'],
  sky: ['var(--sky-300)', 'var(--sky-500)'],
  spruce: ['var(--spruce-300)', 'var(--spruce-500)'],
};

let gid = 0;

export function ProgressRing({
  value = 0,
  max = 100,
  size = 96,
  stroke = 8,
  color = 'gold',
  label = null,
  showValue = true,
  children = null,
  className = '',
  ...rest
}) {
  const idRef = React.useRef(null);
  if (idRef.current === null) idRef.current = `atlas-ring-${++gid}`;
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const [from, to] = COLORS[color] || COLORS.gold;
  const complete = pct >= 100;

  return (
    <div
      className={className}
      style={{ position: 'relative', width: size, height: size, display: 'inline-flex' }}
      {...rest}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={idRef.current} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-sunken)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={`url(#${idRef.current})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{
            transition: 'stroke-dasharray var(--dur-slow) var(--ease-out)',
            filter: complete ? 'drop-shadow(0 0 6px rgba(244,183,64,.6))' : 'none',
          }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 1,
      }}>
        {children || (showValue && (
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: size * 0.26, color: 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          }}>{Math.round(pct)}<span style={{ fontSize: size * 0.14, color: 'var(--text-muted)' }}>%</span></span>
        ))}
        {label && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: Math.max(9, size * 0.1),
            textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-muted)',
          }}>{label}</span>
        )}
      </div>
    </div>
  );
}
