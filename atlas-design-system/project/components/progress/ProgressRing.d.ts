import * as React from 'react';

export interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value. */
  value?: number;
  /** Max value. Default 100. */
  max?: number;
  /** Diameter px. Default 96. */
  size?: number;
  /** Ring thickness px. Default 8. */
  stroke?: number;
  /** Arc color. Default "gold". */
  color?: 'gold' | 'sky' | 'spruce';
  /** Mono caption under the value. */
  label?: React.ReactNode;
  /** Show the % in the center. Default true. */
  showValue?: boolean;
  /** Custom center content (overrides the % readout). */
  children?: React.ReactNode;
}

/** Circular completion dial. */
export function ProgressRing(props: ProgressRingProps): JSX.Element;
