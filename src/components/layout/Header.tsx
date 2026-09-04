import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  User as UserIcon,
  LogOut,
  Key,
  ChevronDown,
  Menu,
  Terminal,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { GameSelector } from './GameSelector';
import { StatusIndicator } from '../hud/StatusIndicator';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
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

  return (
    <header className="h-16 bg-carbon-900/90 border-b border-carbon-800 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Hamburger & Brand */}
      <div className="flex items-center space-x-3 sm:space-x-6">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-sm bg-carbon-800 text-gray-400 hover:text-white hover:bg-carbon-700 transition-colors lg:hidden focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-sm bg-cyan-950 border border-cyan-500/60 flex items-center justify-center shadow-glow-cyan group-hover:border-cyan-400 transition-all">
            <Terminal className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-hud font-bold text-base tracking-widest text-gray-100 group-hover:text-cyan-400 transition-colors flex items-center space-x-1.5">
              <span>CENTRALSPY</span>
              <span className="text-[10px] text-cyan-400 font-mono tracking-normal font-normal">
                v1.0
              </span>
            </span>
            <span className="text-[9px] font-mono tracking-wider text-gray-400 hidden sm:inline">
              EA FESL & THEATER NETWORK
            </span>
          </div>
        </Link>

        {/* Game Selector */}
        <div className="hidden md:block">
          <GameSelector />
        </div>
      </div>

      {/* Right: Network Status & User Auth */}
      <div className="flex items-center space-x-4 sm:space-x-6">
        {/* Network Status Pill */}
        <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 bg-carbon-950/80 border border-carbon-800 rounded-sm">
          <StatusIndicator status="online" size="sm" />
          <span className="text-[10px] font-mono text-gray-300 uppercase tracking-wider font-semibold">
            FESL NET // OK
          </span>
        </div>

        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center space-x-2.5 px-3 py-1.5 rounded-sm bg-carbon-950 border border-carbon-700 hover:border-cyan-500/60 transition-all text-left focus:outline-none"
              aria-expanded={userDropdownOpen}
            >
              <div className="w-6 h-6 rounded-full bg-cyan-900/60 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-mono text-xs font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col pr-1">
                <span className="text-xs font-mono font-bold text-gray-200 leading-tight">
                  {user.username}
                </span>
                <span className="text-[9px] font-mono text-gray-400 leading-none">
                  {user.countryCode || 'GLOBAL'}
                </span>
              </div>
              {isAdmin && <Badge variant="ADMIN" size="sm">ADMIN</Badge>}
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-gray-400 transition-transform duration-150',
                  userDropdownOpen ? 'rotate-180 text-cyan-400' : ''
                )}
              />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-carbon-900 border border-carbon-700 rounded-sm shadow-2xl py-1.5 z-50 backdrop-blur-md animate-fade-in divide-y divide-carbon-800">
                <div className="px-3.5 py-2">
                  <p className="text-xs font-mono font-semibold text-gray-200">{user.username}</p>
                  <p className="text-[10px] font-mono text-gray-400 truncate">{user.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/account"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center space-x-2 px-3.5 py-2 text-xs font-mono text-gray-300 hover:bg-carbon-800 hover:text-cyan-400 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span>Master Account</span>
                  </Link>
                  <Link
                    to="/account?tab=licenses"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center space-x-2 px-3.5 py-2 text-xs font-mono text-gray-300 hover:bg-carbon-800 hover:text-cyan-400 transition-colors"
                  >
                    <Key className="w-3.5 h-3.5 text-gray-400" />
                    <span>CD Keys & Licenses</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3.5 py-2 text-xs font-mono text-crimson-400 hover:bg-carbon-800 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-crimson-400" />
                      <span>Admin Console</span>
                    </Link>
                  )}
                </div>

                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs font-mono text-crimson-400 hover:bg-carbon-800 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-crimson-400" />
                    <span>Terminate Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Join Network
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
