import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'mohpa-theme';
const LEGACY_STORAGE_KEY = 'theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (_) {}
  return 'light';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', theme === 'dark' ? '#121511' : '#f4f0e6');
  }
}

// Global listeners for multi-tab and system changes
const listeners = new Set<(theme: Theme) => void>();

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (_) {}
    listeners.forEach((l) => l(newTheme));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  useEffect(() => {
    // Sync initial state on mount
    applyTheme(theme);

    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY || e.key === LEGACY_STORAGE_KEY) {
        const val = e.newValue;
        if (val === 'light' || val === 'dark') {
          setThemeState(val);
          applyTheme(val);
        }
      }
    };

    const mediaQuery = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const onMediaChange = (e: MediaQueryListEvent) => {
      try {
        const hasManual = window.localStorage.getItem(THEME_STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (!hasManual) {
          const autoTheme: Theme = e.matches ? 'dark' : 'light';
          setThemeState(autoTheme);
          applyTheme(autoTheme);
        }
      } catch (_) {}
    };

    const onSync = (newTheme: Theme) => {
      setThemeState(newTheme);
    };

    listeners.add(onSync);
    window.addEventListener('storage', onStorage);
    if (mediaQuery && mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onMediaChange);
    }

    return () => {
      listeners.delete(onSync);
      window.removeEventListener('storage', onStorage);
      if (mediaQuery && mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', onMediaChange);
      }
    };
  }, [theme]);

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  };
}
