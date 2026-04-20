import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UiPreferencesState = {
  /** Reduz animações e transições na interface (além da preferência do sistema). */
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
};

export const useUiPreferences = create<UiPreferencesState>()(
  persist(
    (set) => ({
      reduceMotion: false,
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
    }),
    { name: 'codepath-ui-prefs' },
  ),
);
