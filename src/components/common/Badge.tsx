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
    ONLINE: {
      container: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40',
      dot: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
    },
    OFFLINE: {
      container: 'bg-carbon-900 text-gray-400 border-carbon-700',
      dot: 'bg-gray-500',
    },
    RANKED: {
      container: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-glow-cyan',
      dot: 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]',
    },
    OFFICIAL: {
      container: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
      dot: 'bg-amber-400',
    },
    ADMIN: {
      container: 'bg-crimson-950/60 text-crimson-300 border-crimson-500/50 shadow-glow-crimson',
      dot: 'bg-crimson-400 shadow-[0_0_8px_#ef4444]',
    },
    BANNED: {
      container: 'bg-crimson-950/90 text-crimson-400 border-crimson-600',
      dot: 'bg-crimson-500',
    },
    PENDING: {
      container: 'bg-amber-950/40 text-amber-400 border-amber-600/40',
      dot: 'bg-amber-400 animate-pulse',
    },
    DEFAULT: {
      container: 'bg-carbon-800 text-gray-300 border-carbon-600',
      dot: 'bg-gray-400',
    },
    CYAN: {
      container: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40',
      dot: 'bg-cyan-400',
    },
    EMERALD: {
      container: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
      dot: 'bg-emerald-400',
    },
    AMBER: {
      container: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
      dot: 'bg-amber-400',
    },
    CRIMSON: {
      container: 'bg-crimson-950/60 text-crimson-300 border-crimson-500/40',
      dot: 'bg-crimson-400',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.DEFAULT;

  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-semibold uppercase tracking-wider rounded-sm border select-none',
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
