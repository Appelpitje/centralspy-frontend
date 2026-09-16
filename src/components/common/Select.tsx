import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      options,
      error,
      helperText,
      wrapperClassName,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={cn('w-full flex flex-col space-y-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-sans uppercase tracking-wide text-ink flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-stamp-500 text-[10px]">Required</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full bg-paper-50 border border-olive-500 text-ink rounded-none text-sm px-3 py-2 pr-9 transition-colors duration-150 appearance-none cursor-pointer',
              'focus:outline-none focus:border-stamp-500 focus:ring-1 focus:ring-stamp-500/40',
              'disabled:bg-paper-300 disabled:border-olive-400 disabled:text-ink-faint disabled:cursor-not-allowed',
              error ? 'border-stamp-500 focus:border-stamp-500' : '',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-paper-50 text-ink"
              >
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 pointer-events-none text-ink-muted">
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = 'Select';
