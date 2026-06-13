import * as React from 'react';

export interface StatBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The figure — string or number (e.g. "43 / 282", "14,820"). */
  value: React.ReactNode;
  /** Mono caption above the figure. */
  label?: React.ReactNode;
  /** Secondary line under the figure. */
  sub?: React.ReactNode;
  /** Optional leading icon in the caption. */
  icon?: React.ReactNode;
  /** Gold gradient figure — reserve for score / hero numbers. */
  gold?: boolean;
  /** Text alignment. Default "left". */
  align?: 'left' | 'center';
  /** Figure size. Default "md". */
  size?: 'sm' | 'md' | 'lg';
}

/** Big tabular figure with mono caption. */
export function StatBlock(props: StatBlockProps): JSX.Element;
