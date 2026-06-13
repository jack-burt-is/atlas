import * as React from 'react';

/**
 * Atlas button. Primary is Summit Gold with ink text.
 * @startingPoint section="Core" subtitle="Gold primary, secondary, ghost & danger buttons" viewport="700x150"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. Default "primary". */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Size. Default "md". */
  size?: 'sm' | 'md' | 'lg';
  /** Stretch to full width. */
  block?: boolean;
  /** Icon node rendered before the label. */
  leftIcon?: React.ReactNode;
  /** Icon node rendered after the label. */
  rightIcon?: React.ReactNode;
}

export function Button(props: ButtonProps): JSX.Element;
