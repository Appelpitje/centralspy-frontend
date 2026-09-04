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
            className="text-xs font-mono uppercase tracking-wider text-gray-300 flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-cyan-400 text-[10px]">*REQ</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full bg-carbon-900 border border-carbon-700 text-gray-100 rounded-sm text-sm px-3 py-2 pr-9 transition-all duration-150 appearance-none cursor-pointer',
              'focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50',
              'disabled:bg-carbon-950 disabled:border-carbon-800 disabled:text-gray-600 disabled:cursor-not-allowed',
              error ? 'border-crimson-500 focus:border-crimson-500' : '',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-carbon-900 text-gray-200"
              >
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 pointer-events-none text-gray-400">
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = 'Select';
