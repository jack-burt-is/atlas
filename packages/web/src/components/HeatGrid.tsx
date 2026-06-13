import React from "react";

const HEAT = [
  "var(--heat-0)",
  "var(--heat-1)",
  "var(--heat-2)",
  "var(--heat-3)",
  "var(--heat-4)",
];

interface HeatGridProps {
  data?: number[] | null;
  columns?: number;
  rows?: number;
  cell?: number;
  gap?: number;
  radius?: number;
  className?: string;
}

export function HeatGrid({
  data = null,
  columns = 30,
  rows = 7,
  cell = 13,
  gap = 4,
  radius = 3,
  className = "",
}: HeatGridProps) {
  const cells = React.useMemo(() => {
    if (data) return data;
    const n = columns * rows;
    return Array.from({ length: n }, () =>
      Math.floor(Math.pow(Math.random(), 1.6) * 5)
    );
  }, [data, columns, rows]);

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, ${cell}px)`,
        gridAutoRows: `${cell}px`,
        gap,
      }}
    >
      {cells.map((lvl, i) => (
        <div
          key={i}
          style={{
            width: cell,
            height: cell,
            borderRadius: radius,
            background: HEAT[Math.max(0, Math.min(4, lvl))],
            outline: lvl === 0 ? "1px solid var(--border-subtle)" : "none",
            outlineOffset: -1,
          }}
        />
      ))}
    </div>
  );
}

export function buildHeatData(
  entries: { date: string; count: number }[],
  columns = 52,
  rows = 7
): number[] {
  const map = new Map<string, number>();
  for (const e of entries) map.set(e.date, e.count);

  const total = columns * rows;
  const today = new Date();
  const result: number[] = new Array(total).fill(0);

  for (let i = total - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - (total - 1 - i));
    const key = d.toISOString().slice(0, 10);
    const count = map.get(key) ?? 0;
    // bucket count → intensity 0-4
    let level = 0;
    if (count >= 7) level = 4;
    else if (count >= 4) level = 3;
    else if (count >= 2) level = 2;
    else if (count >= 1) level = 1;
    result[i] = level;
  }
  return result;
}
