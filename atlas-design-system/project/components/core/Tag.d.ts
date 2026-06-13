import * as React from 'react';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Selected (gold) state. */
  selected?: boolean;
  /** Optional trailing count. */
  count?: number | string | null;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
  /** When set, shows a × that calls this. */
  onRemove?: ((e: React.MouseEvent) => void) | null;
  /** Set false for a non-clickable label chip. Default true. */
  interactive?: boolean;
}

/** Filter chip / category pill. */
export function Tag(props: TagProps): JSX.Element;
