import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UiPreferencesState = {
  /** Reduz animações e transições na interface (além da preferência do sistema). */
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
  /** Toca sons curtos em ações de gamificação (acerto, erro, level up). Opt-in. */
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
};

export const useUiPreferences = create<UiPreferencesState>()(
  persist(
    (set) => ({
      reduceMotion: false,
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      soundEnabled: false,
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
    }),
    { name: 'codepath-ui-prefs' },
  ),
);
