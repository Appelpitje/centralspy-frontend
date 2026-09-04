import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  accent?: 'cyan' | 'emerald' | 'amber' | 'crimson' | 'none';
  hasCornerAccents?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  icon,
  headerAction,
  footer,
  accent = 'none',
  hasCornerAccents = true,
  className,
  children,
  ...props
}) => {
  const accentClasses = {
    cyan: 'border-t-2 border-t-cyan-500',
    emerald: 'border-t-2 border-t-emerald-500',
    amber: 'border-t-2 border-t-amber-500',
    crimson: 'border-t-2 border-t-crimson-500',
    none: '',
  };

  return (
    <div
      className={cn(
        'hud-card rounded-sm overflow-hidden transition-all duration-200 flex flex-col justify-between',
        hasCornerAccents && 'hud-border-corners',
        accentClasses[accent],
        className
      )}
      {...props}
    >
      <div>
        {(title || headerAction) && (
          <div className="px-5 py-3.5 border-b border-carbon-800/80 bg-carbon-900/50 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              {icon && <span className="text-cyan-400 shrink-0">{icon}</span>}
              <div>
                {typeof title === 'string' ? (
                  <h3 className="font-hud font-semibold text-sm tracking-wider uppercase text-gray-100">
                    {title}
                  </h3>
                ) : (
                  title
                )}
                {subtitle && (
                  <p className="text-[11px] font-mono text-gray-400 mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            {headerAction && <div className="flex items-center space-x-2">{headerAction}</div>}
          </div>
        )}

        <div className="p-5">{children}</div>
      </div>

      {footer && (
        <div className="px-5 py-3 border-t border-carbon-800/80 bg-carbon-900/30 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};
