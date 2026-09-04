import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tactical' | 'danger' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium uppercase tracking-wider transition-all duration-150 rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-carbon-950 disabled:opacity-50 disabled:cursor-not-allowed select-none font-mono text-xs';

    const sizeStyles = {
      xs: 'px-2 py-1 text-[10px] gap-1',
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-xs gap-2',
      lg: 'px-5 py-2.5 text-sm gap-2.5',
    };

    const variantStyles = {
      primary:
        'bg-cyan-600 text-white hover:bg-cyan-500 active:bg-cyan-700 shadow-glow-cyan focus:ring-cyan-500 border border-cyan-400/40',
      secondary:
        'bg-carbon-800 text-gray-200 hover:bg-carbon-700 active:bg-carbon-900 border border-carbon-600 focus:ring-gray-400',
      tactical:
        'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-glow-emerald focus:ring-emerald-500 border border-emerald-400/40',
      danger:
        'bg-crimson-600 text-white hover:bg-crimson-500 active:bg-crimson-700 shadow-glow-crimson focus:ring-crimson-500 border border-crimson-400/40',
      ghost:
        'bg-transparent text-gray-300 hover:bg-carbon-800/80 hover:text-white focus:ring-cyan-500 border border-transparent',
      outline:
        'bg-transparent text-cyan-400 hover:bg-cyan-950/40 hover:text-cyan-300 border border-cyan-500/60 focus:ring-cyan-500',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
