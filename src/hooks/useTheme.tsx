import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from './useLocalStorage';

// 主题类型：浅色 / 暗色
export type Theme = 'light' | 'dark';

// 主题持久化键名
export const THEME_KEY = 'markdown-notes-theme';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useLocalStorage<Theme>(THEME_KEY, 'light');

  // 同步到 <html class="dark">，Tailwind dark: 变体由该 class 控制
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, [setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, toggle, setTheme }),
    [theme, toggle, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme 必须在 ThemeProvider 内部使用');
  }
  return ctx;
}
