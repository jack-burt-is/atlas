import * as React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Image URL. Falls back to initials when absent. */
  src?: string | null;
  /** Full name — used for initials and alt text. */
  name?: string;
  /** Diameter in px. Default 44. */
  size?: number;
  /** Level number shown in a gold badge at the corner. */
  level?: number | null;
  /** Gold ring around the avatar. */
  ring?: boolean;
}

/** Circular avatar with optional gold level badge. */
export function Avatar(props: AvatarProps): JSX.Element;
