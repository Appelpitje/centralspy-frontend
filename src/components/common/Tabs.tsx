import React from 'react';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number | string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('flex items-center border-b border-sand-200 space-x-1 overflow-x-auto', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              'group relative flex items-center space-x-2 px-4 py-2.5 font-sans text-xs uppercase tracking-wide transition-colors duration-150 border-b-2 font-medium whitespace-nowrap focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed',
              isActive
                ? 'border-olive-600 text-ink'
                : 'border-transparent text-ink-faint hover:text-ink hover:border-sand-300'
            )}
          >
            {tab.icon && (
              <span
                className={cn(
                  'shrink-0 transition-colors',
                  isActive ? 'text-stamp-500' : 'text-ink-faint group-hover:text-ink'
                )}
              >
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 text-[10px] rounded-sm font-semibold',
                  isActive
                    ? 'bg-olive-500 text-paper-50 border border-olive-700'
                    : 'bg-paper-300 text-ink-muted border border-olive-400'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
