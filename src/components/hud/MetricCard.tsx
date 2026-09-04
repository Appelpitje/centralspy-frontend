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
    cyan: 'border-l-2 border-l-cyan-500 shadow-[inset_2px_0_10px_-2px_rgba(6,182,212,0.3)]',
    emerald: 'border-l-2 border-l-emerald-500 shadow-[inset_2px_0_10px_-2px_rgba(16,185,129,0.3)]',
    amber: 'border-l-2 border-l-amber-500 shadow-[inset_2px_0_10px_-2px_rgba(245,158,11,0.3)]',
    crimson: 'border-l-2 border-l-crimson-500 shadow-[inset_2px_0_10px_-2px_rgba(239,68,68,0.3)]',
    purple: 'border-l-2 border-l-purple-500 shadow-[inset_2px_0_10px_-2px_rgba(168,85,247,0.3)]',
  };

  const accentIcon = {
    cyan: 'text-cyan-400 bg-cyan-950/50 border-cyan-800/60',
    emerald: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60',
    amber: 'text-amber-400 bg-amber-950/50 border-amber-800/60',
    crimson: 'text-crimson-400 bg-crimson-950/50 border-crimson-800/60',
    purple: 'text-purple-400 bg-purple-950/50 border-purple-800/60',
  };

  return (
    <div
      className={cn(
        'hud-card p-4 rounded-sm transition-all duration-200 hover:border-carbon-600',
        accentGlow[accentColor],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-gray-400 font-medium">
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
        <div className="font-hud font-bold text-2xl tracking-wide text-gray-100">
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
              <span className="text-gray-400 flex items-center">
                <Minus className="w-3.5 h-3.5 mr-0.5" />
                {trend.value}
              </span>
            )}
            {trend.label && <span className="text-gray-500 ml-1">{trend.label}</span>}
          </div>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[11px] font-mono text-gray-500 truncate">{subtitle}</p>
      )}
    </div>
  );
};
