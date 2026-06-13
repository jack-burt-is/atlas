/* Atlas · HeatGrid
   GitHub-style exploration heatmap on the gold-on-ink ramp.
   Pass a flat array of intensity levels (0–4), or columns×rows is auto-filled. */
import React from 'react';

const HEAT = ['var(--heat-0)', 'var(--heat-1)', 'var(--heat-2)', 'var(--heat-3)', 'var(--heat-4)'];

export function HeatGrid({
  data = null,
  columns = 30,
  rows = 7,
  cell = 13,
  gap = 4,
  radius = 3,
  className = '',
  ...rest
}) {
  const cells = React.useMemo(() => {
    if (data) return data;
    const n = columns * rows;
    return Array.from({ length: n }, () => Math.floor(Math.pow(Math.random(), 1.6) * 5));
  }, [data, columns, rows]);

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, ${cell}px)`,
        gridAutoRows: `${cell}px`,
        gap,
      }}
      {...rest}
    >
      {cells.map((lvl, i) => (
        <div
          key={i}
          style={{
            width: cell, height: cell, borderRadius: radius,
            background: HEAT[Math.max(0, Math.min(4, lvl))],
            outline: lvl === 0 ? '1px solid var(--border-subtle)' : 'none',
            outlineOffset: -1,
          }}
        />
      ))}
    </div>
  );
}
