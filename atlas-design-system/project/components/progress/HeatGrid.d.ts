import * as React from 'react';

export interface HeatGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Flat array of intensity levels 0–4. Omit to auto-fill columns×rows. */
  data?: number[] | null;
  /** Column count when auto-filling. Default 30. */
  columns?: number;
  /** Row count when auto-filling. Default 7. */
  rows?: number;
  /** Cell size px. Default 13. */
  cell?: number;
  /** Gap px. Default 4. */
  gap?: number;
  /** Cell corner radius px. Default 3. */
  radius?: number;
}

/** GitHub-style exploration heatmap on the gold ramp. */
export function HeatGrid(props: HeatGridProps): JSX.Element;
