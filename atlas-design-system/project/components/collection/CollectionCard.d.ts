import * as React from 'react';

/**
 * A completionist collection with progress.
 * @startingPoint section="Collection" subtitle="Collection row with completion progress" viewport="700x110"
 */
export interface CollectionCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Collection name, e.g. "Wainwrights". */
  title: string;
  /** Object class shown as the eyebrow, e.g. "Peaks" / "National Trail". */
  type?: string;
  /** Items completed. */
  value?: number;
  /** Total items in the collection. */
  max?: number;
  /** Icon node shown in the media tile (when no image). */
  icon?: React.ReactNode;
  /** Optional thumbnail image URL. */
  image?: string | null;
}

/** Collection row with media, count and progress. Completed collections glow gold. */
export function CollectionCard(props: CollectionCardProps): JSX.Element;
