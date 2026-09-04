import React from 'react';
import { cn } from '../../utils/cn';

export type StatusType = 'online' | 'warning' | 'offline' | 'active' | 'busy';

export interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  sublabel?: string;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  sublabel,
  pulse = true,
  size = 'md',
  className,
}) => {
  const statusColors = {
    online: {
      dot: 'bg-emerald-400',
      glow: 'shadow-[0_0_8px_#10b981]',
      ping: 'bg-emerald-400',
      text: 'text-emerald-400',
    },
    warning: {
      dot: 'bg-amber-400',
      glow: 'shadow-[0_0_8px_#f59e0b]',
      ping: 'bg-amber-400',
      text: 'text-amber-400',
    },
    offline: {
      dot: 'bg-crimson-500',
      glow: 'shadow-[0_0_8px_#ef4444]',
      ping: 'bg-crimson-500',
      text: 'text-crimson-400',
    },
    active: {
      dot: 'bg-cyan-400',
      glow: 'shadow-[0_0_8px_#06b6d4]',
      ping: 'bg-cyan-400',
      text: 'text-cyan-400',
    },
    busy: {
      dot: 'bg-purple-400',
      glow: 'shadow-[0_0_8px_#a855f7]',
      ping: 'bg-purple-400',
      text: 'text-purple-400',
    },
  };

  const sizeStyles = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const current = statusColors[status] || statusColors.online;

  return (
    <div className={cn('inline-flex items-center space-x-2', className)}>
      <span className="relative flex items-center justify-center">
        {pulse && status !== 'offline' && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              current.ping
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full',
            sizeStyles[size],
            current.dot,
            current.glow
          )}
        />
      </span>

      {(label || sublabel) && (
        <div className="flex flex-col leading-none">
          {label && (
            <span className={cn('font-mono text-xs font-semibold tracking-wider uppercase', current.text)}>
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-[10px] font-mono text-gray-400 mt-0.5">{sublabel}</span>
          )}
        </div>
      )}
    </div>
  );
};
