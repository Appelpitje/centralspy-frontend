import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  User as UserIcon,
  LogOut,
  Key,
  ChevronDown,
  Menu,
  Github,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ThemeToggle } from '../common/ThemeToggle';
import { cn } from '../../utils/cn';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const initials = user?.username
    ? user.username
        .split(/[\s._-]+/)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  return (
    <header
      className="h-14 border-b border-sand-200 sticky top-0 z-50 px-4 sm:px-6 flex items-center justify-between bg-sand-50/95 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-ink-muted hover:bg-sand-200 hover:text-ink transition-colors lg:hidden"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link to="/" className="flex items-center gap-2">
          <span className="font-sans font-semibold text-lg tracking-tight text-ink">
            mohPA
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <a
          href="https://github.com/Appelpitje/mohPA-frontend"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-ink-muted hover:bg-sand-200 hover:text-ink transition-colors"
          aria-label="Portal source on GitHub"
        >
          <Github className="w-4 h-4" />
        </a>
        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg hover:bg-sand-200 transition-colors text-left"
              aria-expanded={userDropdownOpen}
            >
              <span className="hidden sm:inline text-sm font-medium text-ink">
                {user.username}
              </span>
              <div className="w-8 h-8 rounded-full bg-olive-100 text-olive-800 flex items-center justify-center text-xs font-semibold">
                {initials || user.username.charAt(0).toUpperCase()}
              </div>
              {isAdmin && (
                <Badge variant="ADMIN" size="sm">
                  Admin
                </Badge>
              )}
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-ink-faint transition-transform duration-150',
                  userDropdownOpen ? 'rotate-180' : ''
                )}
              />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-sand-50 border border-sand-200 rounded-xl shadow-soft py-1.5 z-50">
                <div className="px-3.5 py-2 border-b border-sand-200">
                  <p className="text-sm font-medium text-ink">{user.username}</p>
                  <p className="text-xs text-ink-faint truncate">{user.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-sm text-ink hover:bg-sand-100"
                  >
                    <UserIcon className="w-4 h-4 text-ink-faint" />
                    <span>Account</span>
                  </Link>
                  {/* Licenses link hidden for now while license section is hidden on profile page */}
                  {/*
                  <Link
                    to="/entitlements"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-sm text-ink hover:bg-sand-100"
                  >
                    <Key className="w-4 h-4 text-ink-faint" />
                    <span>Licenses</span>
                  </Link>
                  */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-sm text-ink hover:bg-sand-100"
                    >
                      <Shield className="w-4 h-4 text-ink-faint" />
                      <span>Admin</span>
                    </Link>
                  )}
                </div>

                <div className="py-1 border-t border-sand-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-ink-muted hover:bg-sand-100 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
