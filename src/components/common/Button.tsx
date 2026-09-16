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
      'inline-flex items-center justify-center font-medium tracking-tight transition-colors duration-150 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sand-100 disabled:opacity-50 disabled:cursor-not-allowed select-none font-sans';

    const sizeStyles = {
      xs: 'px-2.5 py-1 text-xs gap-1',
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2',
    };

    const variantStyles = {
      primary:
        'bg-olive-600 text-white hover:bg-olive-700 active:bg-olive-800 border border-transparent',
      secondary:
        'bg-sand-200 text-ink hover:bg-sand-300 border border-sand-300',
      tactical:
        'bg-olive-700 text-white hover:bg-olive-800 border border-transparent',
      danger:
        'bg-stamp-500 text-white hover:bg-stamp-600 border border-transparent',
      ghost:
        'bg-transparent text-ink-muted hover:bg-sand-200 hover:text-ink border border-transparent',
      outline:
        'bg-transparent text-olive-700 hover:bg-olive-50 border border-olive-200',
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
