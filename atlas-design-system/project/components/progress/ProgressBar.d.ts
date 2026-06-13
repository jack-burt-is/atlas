import * as React from 'react';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value. */
  value?: number;
  /** Max value. Default 100. With max=100 the readout is a %; otherwise "value / max". */
  max?: number;
  /** Optional label shown above the track. */
  label?: React.ReactNode;
  /** Track thickness. Default "md". */
  size?: 'sm' | 'md' | 'lg';
  /** Fill color. Default "gold". A full bar auto-glows. */
  color?: 'gold' | 'sky' | 'spruce';
  /** Show the numeric readout. Default true. */
  showValue?: boolean;
  /** Custom formatter (value, max, pct) => string. */
  valueFormat?: ((value: number, max: number, pct: number) => string) | null;
}

/** Linear completion bar — the core progress motif. */
export function ProgressBar(props: ProgressBarProps): JSX.Element;
