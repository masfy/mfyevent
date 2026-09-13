'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('mfy_theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') {
      setThemeState(saved);
      document.documentElement.classList.toggle('dark', saved === 'dark');
    } else {
      // Default to dark mode for MfyEvent signature look
      setThemeState('dark');
      document.documentElement.classList.add('dark');
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'mfy_theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
        setThemeState(e.newValue);
        document.documentElement.classList.toggle('dark', e.newValue === 'dark');
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setTheme = (next: Theme) => {
    const applyTheme = () => {
      setThemeState(next);
      localStorage.setItem('mfy_theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      window.dispatchEvent(new CustomEvent('mfy_theme_update', { detail: next }));
    };

    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('theme-transitioning');
      window.setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 450);

      if ('startViewTransition' in document) {
        (document as any).startViewTransition(() => {
          applyTheme();
        });
      } else {
        applyTheme();
      }
    } else {
      applyTheme();
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'dark',
      isDark: true,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
};
