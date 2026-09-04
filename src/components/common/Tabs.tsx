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
    <div className={cn('flex items-center border-b border-carbon-800 space-x-1 overflow-x-auto', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              'group relative flex items-center space-x-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wider transition-all duration-150 border-b-2 font-medium whitespace-nowrap focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed',
              isActive
                ? 'border-cyan-500 text-cyan-400 bg-carbon-900/60 shadow-[inset_0_-2px_6px_rgba(6,182,212,0.15)]'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-carbon-600 hover:bg-carbon-900/30'
            )}
          >
            {tab.icon && (
              <span
                className={cn(
                  'shrink-0 transition-colors',
                  isActive ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'
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
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50'
                    : 'bg-carbon-800 text-gray-400 border border-carbon-700'
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
