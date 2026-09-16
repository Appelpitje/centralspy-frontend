import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Server,
  Trophy,
  Download,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

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
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/soldiers', label: 'Soldiers', icon: Users },
    { to: '/servers', label: 'Servers', icon: Server },
    { to: '/stats', label: 'Stats', icon: Trophy },
    { to: '/setup', label: 'Setup', icon: Download },
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin', label: 'Admin', icon: ShieldAlert });
  }

  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-ink/30 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-14 left-0 z-40 h-[calc(100vh-3.5rem)] bg-sand-50 border-r border-sand-200 transition-all duration-200 flex flex-col justify-between shrink-0',
          isCollapsed ? 'w-16' : 'w-56',
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <nav className="flex flex-col gap-0.5 p-3">
          {navItems.map((item) => {
            const isDashboard = item.to === '/';
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onCloseMobile}
                className={({ isActive }) => {
                  const active = isActive || (isDashboard && location.pathname === '/dashboard');
                  return cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-olive-50 text-olive-800 font-medium'
                      : 'text-ink-muted hover:bg-sand-100 hover:text-ink'
                  );
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sand-200">
          <button
            onClick={onToggleCollapse}
            className="w-full hidden lg:flex items-center justify-center gap-2 p-2 rounded-lg text-ink-faint hover:text-ink hover:bg-sand-100 transition-colors text-sm"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
