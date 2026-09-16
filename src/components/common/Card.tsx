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
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-sand-50 border border-sand-200 rounded-xl shadow-soft overflow-hidden flex flex-col',
        className
      )}
      {...props}
    >
      <div>
        {(title || headerAction) && (
          <div className="px-5 py-4 border-b border-sand-200 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              {icon && <span className="text-olive-600 shrink-0">{icon}</span>}
              <div>
                {typeof title === 'string' ? (
                  <h3 className="font-sans font-semibold text-base text-ink">{title}</h3>
                ) : (
                  title
                )}
                {subtitle && (
                  <p className="text-sm text-ink-muted mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            {headerAction && <div className="flex items-center space-x-2">{headerAction}</div>}
          </div>
        )}

        <div className="p-5">{children}</div>
      </div>

      {footer && (
        <div className="px-5 py-3 border-t border-sand-200 bg-sand-100/60 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};
