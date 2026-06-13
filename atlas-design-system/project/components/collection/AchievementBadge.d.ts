import * as React from 'react';

/**
 * Steam/Xbox-style achievement.
 * @startingPoint section="Collection" subtitle="Locked / unlocked tiered achievement with points" viewport="700x110"
 */
export interface AchievementBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Achievement name. */
  title: string;
  /** One-line how-to / flavor text. */
  description?: React.ReactNode;
  /** Medal tier. Default "bronze". */
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  /** Points awarded toward Outdoor Score. */
  points?: number;
  /** Unlocked state — colors the medal and enables hover. */
  unlocked?: boolean;
  /** Glyph node (medal icon when unlocked, lock-styled when not). */
  icon?: React.ReactNode;
  /** Progress toward unlock, shown only when locked. */
  progress?: AchievementProgress | null;
}

/** Tiered achievement card with points and unlock progress. */
export function AchievementBadge(props: AchievementBadgeProps): JSX.Element;

export interface AchievementProgress {
  value: number;
  max: number;
}
