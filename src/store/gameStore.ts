import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameConfig, GAMES, SupportedGameSlug } from '../types/game';

interface GameState {
  activeGame: SupportedGameSlug;
  games: GameConfig[];
  setActiveGame: (slug: SupportedGameSlug) => void;
  getActiveGameConfig: () => GameConfig;
}

// Immediately purge stale localStorage cache from legacy multi-game versions
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    window.localStorage.removeItem('centralspy-game-storage');
  } catch (_) {}
}

const getStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    key: () => null,
    length: 0,
  };
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      activeGame: 'mohpa',
      games: GAMES,
      setActiveGame: (slug: SupportedGameSlug) => {
        set({ activeGame: 'mohpa' });
      },
      getActiveGameConfig: () => {
        return GAMES[0];
      },
    }),
    {
      name: 'centralspy-game-storage-v2',
      storage: createJSONStorage(getStorage),
      partialize: () => ({ activeGame: 'mohpa' as const }),
      merge: () => ({
        activeGame: 'mohpa',
        games: GAMES,
        setActiveGame: (_slug: SupportedGameSlug) => {},
        getActiveGameConfig: () => GAMES[0],
      }),
    }
  )
);
