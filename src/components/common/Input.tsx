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
            className="text-xs font-mono uppercase tracking-wider text-gray-300 flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-cyan-400 text-[10px]">*REQ</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-gray-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full bg-carbon-900 border border-carbon-700 text-gray-100 placeholder-gray-500 rounded-sm text-sm px-3 py-2 transition-all duration-150',
              'focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50',
              'disabled:bg-carbon-950 disabled:border-carbon-800 disabled:text-gray-600 disabled:cursor-not-allowed',
              leftIcon ? 'pl-9' : '',
              rightIcon ? 'pr-9' : '',
              error ? 'border-crimson-500 focus:border-crimson-500 focus:ring-crimson-500/50' : '',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-gray-400 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-[11px] font-mono text-crimson-400 mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] font-mono text-gray-500 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
