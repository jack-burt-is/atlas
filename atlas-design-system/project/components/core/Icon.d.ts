import * as React from 'react';

export interface IconProps {
  /** Lucide icon name, e.g. "mountain", "trophy", "map-pin". */
  name?: string;
  /** Pixel size (square). Default 20. */
  size?: number;
  /** Stroke width. Default 2. */
  strokeWidth?: number;
  /** Color (defaults to currentColor). */
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

/** Lucide icon wrapper. Requires the Lucide UMD script on the page. */
export function Icon(props: IconProps): JSX.Element;
