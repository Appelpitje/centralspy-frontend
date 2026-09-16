import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      wrapperClassName,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={cn('w-full flex flex-col space-y-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-ink flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-ink-faint text-[10px]">Required</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-ink-muted pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full bg-sand-50 border border-sand-300 text-ink placeholder-ink-faint rounded-lg text-sm px-3 py-2 transition-colors duration-150',
              'focus:outline-none focus:border-olive-400 focus:ring-2 focus:ring-olive-500/20',
              'disabled:bg-sand-100 disabled:border-sand-200 disabled:text-ink-faint disabled:cursor-not-allowed',
              leftIcon ? 'pl-9' : '',
              rightIcon ? 'pr-9' : '',
              error ? 'border-stamp-500 focus:border-stamp-500 focus:ring-stamp-500/40' : '',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-ink-muted flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-[11px] font-sans text-stamp-600 mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] font-sans text-ink-faint mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
