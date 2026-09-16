import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number | string;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'crimson' | 'purple';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'cyan',
  className,
}) => {
  const accentGlow = {
    cyan: '',
    emerald: '',
    amber: '',
    crimson: '',
    purple: '',
  };

  const accentIcon = {
    cyan: 'text-olive-700 bg-olive-50 border-olive-200',
    emerald: 'text-olive-700 bg-olive-50 border-olive-200',
    amber: 'text-amber-600 bg-sand-100 border-sand-300',
    crimson: 'text-stamp-700 bg-stamp-50 border-stamp-500/30',
    purple: 'text-olive-700 bg-olive-50 border-olive-200',
  };

  return (
    <div
      className={cn(
        'bg-sand-50 border border-sand-200 p-4 rounded-xl shadow-soft',
        accentGlow[accentColor],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-sans text-[11px] uppercase tracking-wide text-ink-muted font-medium">
          {title}
        </span>
        {icon && (
          <div
            className={cn(
              'p-2 rounded-sm border shrink-0 flex items-center justify-center',
              accentIcon[accentColor]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <div className="font-display text-2xl tracking-wide text-ink">
          {value}
        </div>

        {trend && (
          <div className="flex items-center space-x-1 font-mono text-[11px]">
            {trend.direction === 'up' && (
              <span className="text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                {trend.value}
              </span>
            )}
            {trend.direction === 'down' && (
              <span className="text-crimson-400 flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                {trend.value}
              </span>
            )}
            {trend.direction === 'neutral' && (
              <span className="text-ink-muted flex items-center">
                <Minus className="w-3.5 h-3.5 mr-0.5" />
                {trend.value}
              </span>
            )}
            {trend.label && <span className="text-ink-muted ml-1">{trend.label}</span>}
          </div>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[11px] font-sans text-ink-faint truncate">{subtitle}</p>
      )}
    </div>
  );
};
