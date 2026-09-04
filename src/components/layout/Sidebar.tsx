import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Server,
  Trophy,
  Download,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';
import { GameSelector } from './GameSelector';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { isAdmin } = useAuthStore();

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      end: true,
    },
    {
      to: '/soldiers',
      label: 'Soldiers & Personas',
      icon: <Users className="w-4 h-4 shrink-0" />,
    },
    {
      to: '/servers',
      label: 'Server Browser',
      icon: <Server className="w-4 h-4 shrink-0" />,
    },
    {
      to: '/stats',
      label: 'Leaderboards',
      icon: <Trophy className="w-4 h-4 shrink-0" />,
    },
    {
      to: '/setup',
      label: 'Client Setup & Guides',
      icon: <Download className="w-4 h-4 shrink-0" />,
    },
  ];

  if (isAdmin) {
    navItems.push({
      to: '/admin',
      label: 'Protocol Inspector & Admin',
      icon: <ShieldAlert className="w-4 h-4 shrink-0 text-crimson-400" />,
    });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-carbon-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-carbon-900 border-r border-carbon-800 transition-all duration-200 flex flex-col justify-between shrink-0 select-none',
          isCollapsed ? 'w-16' : 'w-64',
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Navigation Section */}
        <div className="flex flex-col py-4 px-2 space-y-1">
          {/* Mobile Game Selector */}
          <div className="px-2 pb-3 mb-2 border-b border-carbon-800 md:hidden">
            <GameSelector className="w-full" />
          </div>

          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center justify-between">
            {!isCollapsed && <span>TACTICAL NAV</span>}
            <Activity className="w-3.5 h-3.5 text-cyan-400 opacity-60" />
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'group flex items-center space-x-3 px-3 py-2.5 rounded-sm font-mono text-xs transition-all duration-150',
                  isActive
                    ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan font-bold'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-carbon-800/70 border border-transparent'
                )
              }
              title={isCollapsed ? item.label : undefined}
            >
              <span className="text-cyan-400 transition-transform group-hover:scale-110">
                {item.icon}
              </span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Footer & Collapse Toggle */}
        <div className="p-3 border-t border-carbon-800 bg-carbon-950/40 flex flex-col space-y-2">
          {!isCollapsed && (
            <div className="px-2 py-1 bg-carbon-900 border border-carbon-800/80 rounded-sm">
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                <span>SYS // CORE</span>
                <span className="text-emerald-400 font-semibold">SYNCED</span>
              </div>
              <div className="text-[9px] font-mono text-gray-400 truncate mt-0.5">
                EA FESL & Theater Bridge
              </div>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="w-full hidden lg:flex items-center justify-center p-2 rounded-sm text-gray-400 hover:text-white hover:bg-carbon-800 transition-colors focus:outline-none"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            ) : (
              <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
                <ChevronLeft className="w-4 h-4 text-cyan-400" />
                <span>COLLAPSE HUD</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
