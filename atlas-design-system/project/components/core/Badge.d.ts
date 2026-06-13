import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color treatment. Default "neutral". */
  variant?: 'neutral' | 'gold' | 'success' | 'info' | 'danger' | 'bronze' | 'silver' | 'platinum' | 'solid';
  /** Leading status dot. */
  dot?: boolean;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
}

/** Small uppercase mono status / tier label. */
export function Badge(props: BadgeProps): JSX.Element;
