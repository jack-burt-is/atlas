import * as React from 'react';

export interface ScoreMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Outdoor Score (number is auto-formatted with thousands separators). */
  score?: number | string;
  /** Current level. */
  level?: number;
  /** Percent 0–100 toward the next level. */
  levelProgress?: number;
  /** Custom "to next level" caption (overrides the default). */
  toNext?: React.ReactNode;
}

/** Outdoor Score + level meter — the Gamerscore of Atlas. */
export function ScoreMeter(props: ScoreMeterProps): JSX.Element;
