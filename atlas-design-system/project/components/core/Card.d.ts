import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Padding preset. Default "md". "none" is flush (use for media/edge-to-edge). */
  pad?: 'none' | 'sm' | 'md' | 'lg';
  /** Hover-raise + pointer cursor. */
  interactive?: boolean;
  /** Gold border + glow for featured/unlocked content. */
  emphasis?: boolean;
  /** Element tag to render. Default "div". */
  as?: keyof JSX.IntrinsicElements;
}

/** Base surface container on dark. */
export function Card(props: CardProps): JSX.Element;
