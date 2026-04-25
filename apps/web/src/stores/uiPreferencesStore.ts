import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ColorScheme = 'light' | 'dark' | 'system';

/** Chave alinhada ao script anti-FOUC em `index.html` */
export const UI_PREFS_STORAGE_KEY = 'codepath-ui-prefs';

type UiPreferencesState = {
  /** Reduz animações e transições na interface (além da preferência do sistema). */
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
  /** Toca sons curtos em ações de gamificação (acerto, erro, level up). Opt-in. */
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  /** Esquema de cor preferido: 'light' | 'dark' | 'system'. */
  colorScheme: ColorScheme;
  setColorScheme: (value: ColorScheme) => void;
};

function isColorScheme(x: unknown): x is ColorScheme {
  return x === 'light' || x === 'dark' || x === 'system';
}

/**
 * Lê o snapshot persistido de forma síncrona, para o primeiro render bater
 * com o script em index.html (evita flash: default 'system' + rehidratação).
 */
function readInitialFromLocalStorage(): Pick<
  UiPreferencesState,
  'colorScheme' | 'reduceMotion' | 'soundEnabled'
> {
  if (typeof window === 'undefined') {
    return { colorScheme: 'system', reduceMotion: false, soundEnabled: false };
  }
  try {
    const raw = window.localStorage.getItem(UI_PREFS_STORAGE_KEY);
    if (!raw) {
      return { colorScheme: 'system', reduceMotion: false, soundEnabled: false };
    }
    const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
    const s = parsed.state;
    if (!s || typeof s !== 'object') {
      return { colorScheme: 'system', reduceMotion: false, soundEnabled: false };
    }
    return {
      colorScheme: isColorScheme(s.colorScheme) ? s.colorScheme : 'system',
      reduceMotion: typeof s.reduceMotion === 'boolean' ? s.reduceMotion : false,
      soundEnabled: typeof s.soundEnabled === 'boolean' ? s.soundEnabled : false,
    };
  } catch {
    return { colorScheme: 'system', reduceMotion: false, soundEnabled: false };
  }
}

const initial = readInitialFromLocalStorage();

export const useUiPreferences = create<UiPreferencesState>()(
  persist(
    (set) => ({
      reduceMotion: initial.reduceMotion,
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      soundEnabled: initial.soundEnabled,
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      colorScheme: initial.colorScheme,
      setColorScheme: (colorScheme) => set({ colorScheme }),
    }),
    { name: UI_PREFS_STORAGE_KEY },
  ),
);
