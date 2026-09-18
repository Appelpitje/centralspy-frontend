import React, { useEffect } from 'react';
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
  Github,
} from 'lucide-react';

const GITHUB_REPOS = [
  { href: 'https://github.com/Appelpitje/mohPA-frontend', label: 'Portal source' },
  { href: 'https://github.com/Appelpitje/mohPA-backend', label: 'Master server source' },
  { href: 'https://github.com/Appelpitje/mohPA-website', label: 'Website source' },
] as const;
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

  useEffect(() => {
    if (!isOpenMobile) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpenMobile]);

  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 top-14 z-50 lg:hidden"
          style={{ backgroundColor: 'rgba(31, 33, 28, 0.55)' }}
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-14 left-0 z-50 h-[calc(100vh-3.5rem)] border-r border-sand-200 bg-sand-50 transition-transform duration-200 flex flex-col justify-between shrink-0',
          isCollapsed ? 'w-56 lg:w-16' : 'w-56',
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ isolation: 'isolate' }}
      >
        <nav className="flex flex-col gap-0.5 p-3 overflow-y-auto overscroll-contain">
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
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 lg:py-2 text-sm min-h-11 lg:min-h-0 transition-colors',
                    active
                      ? 'bg-olive-50 text-olive-800 font-medium'
                      : 'text-ink-muted hover:bg-sand-100 hover:text-ink'
                  );
                }}
                title={isCollapsed && !isOpenMobile ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {(!isCollapsed || isOpenMobile) && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sand-200 space-y-1">
          {isCollapsed && !isOpenMobile ? (
            <a
              href="https://github.com/Appelpitje/mohPA-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-sand-100 hover:text-ink transition-colors"
              title="Source on GitHub"
              aria-label="Source on GitHub"
            >
              <Github className="w-4 h-4 shrink-0" />
            </a>
          ) : (
            GITHUB_REPOS.map((repo) => (
              <a
                key={repo.href}
                href={repo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-sand-100 hover:text-ink transition-colors"
              >
                <Github className="w-4 h-4 shrink-0" />
                <span>{repo.label}</span>
              </a>
            ))
          )}
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
