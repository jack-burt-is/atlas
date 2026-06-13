import * as React from 'react';

export interface CollectibleItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Item name, e.g. "Helvellyn". */
  name: string;
  /** Mono meta row (elevation, region, visit count…). */
  meta?: React.ReactNode;
  /** Glyph node in the media tile. */
  icon?: React.ReactNode;
  /** Photo URL for the media tile. Covers the tile; falls back to `icon` on load error. Missing items render desaturated. */
  image?: string;
  /** Collected → gold tile + check corner. Missing → muted silhouette. */
  collected?: boolean;
  /** Icon node for the collected check badge (e.g. a check). */
  checkIcon?: React.ReactNode;
}

/** Pokédex-style collectible tile (peak, trig point, bothy…). */
export function CollectibleItem(props: CollectibleItemProps): JSX.Element;
