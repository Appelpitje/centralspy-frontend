import React from 'react';
import { cn } from '../../utils/cn';

export type BadgeVariant =
  | 'ONLINE'
  | 'OFFLINE'
  | 'RANKED'
  | 'OFFICIAL'
  | 'ADMIN'
  | 'BANNED'
  | 'PENDING'
  | 'DEFAULT'
  | 'CYAN'
  | 'EMERALD'
  | 'AMBER'
  | 'CRIMSON';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'DEFAULT',
  dot = false,
  size = 'md',
  className,
  children,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    ONLINE: { container: 'bg-olive-50 text-olive-800', dot: 'bg-olive-600' },
    OFFLINE: { container: 'bg-sand-200 text-ink-muted', dot: 'bg-ink-faint' },
    RANKED: { container: 'bg-olive-100 text-olive-800', dot: 'bg-olive-600' },
    OFFICIAL: { container: 'bg-olive-600 text-white', dot: 'bg-white' },
    ADMIN: { container: 'bg-olive-100 text-olive-800', dot: 'bg-olive-600' },
    BANNED: { container: 'bg-stamp-50 text-stamp-700', dot: 'bg-stamp-500' },
    PENDING: { container: 'bg-sand-200 text-ink-muted', dot: 'bg-olive-400' },
    DEFAULT: { container: 'bg-sand-200 text-ink-muted', dot: 'bg-olive-500' },
    CYAN: { container: 'bg-olive-50 text-olive-800', dot: 'bg-olive-600' },
    EMERALD: { container: 'bg-olive-50 text-olive-800', dot: 'bg-olive-600' },
    AMBER: { container: 'bg-sand-200 text-ink', dot: 'bg-amber-500' },
    CRIMSON: { container: 'bg-stamp-50 text-stamp-700', dot: 'bg-stamp-500' },
  };

  const currentVariant = variantStyles[variant] || variantStyles.DEFAULT;

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full select-none',
        currentVariant.container,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', currentVariant.dot)} />}
      <span>{children}</span>
    </span>
  );
};
