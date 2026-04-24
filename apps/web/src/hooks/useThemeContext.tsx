import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useUiPreferences, type ColorScheme } from '../stores/uiPreferencesStore';

type ThemeValue = {
  isDark: boolean;
  colorScheme: ColorScheme;
  setColorScheme: (v: ColorScheme) => void;
  toggleLightDark: () => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const colorScheme = useUiPreferences((s) => s.colorScheme);
  const setColorScheme = useUiPreferences((s) => s.setColorScheme);

  const [mediaDark, setMediaDark] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setMediaDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const isDark =
    colorScheme === 'dark' || (colorScheme === 'system' && mediaDark);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.setProperty(
      'color-scheme',
      isDark ? 'dark' : 'light',
    );
  }, [isDark]);

  const toggleLightDark = useCallback(() => {
    if (colorScheme === 'system') {
      setColorScheme(mediaDark ? 'light' : 'dark');
    } else {
      setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
    }
  }, [colorScheme, mediaDark, setColorScheme]);

  const value = useMemo(
    (): ThemeValue => ({ isDark, colorScheme, setColorScheme, toggleLightDark }),
    [isDark, colorScheme, setColorScheme, toggleLightDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const v = useContext(ThemeContext);
  if (!v) throw new Error('useTheme must be used inside <ThemeProvider>');
  return v;
}
