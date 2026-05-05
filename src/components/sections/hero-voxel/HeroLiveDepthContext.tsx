'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type HeroLiveDepthContextValue = {
  liveDepthActive: boolean;
  setLiveDepthActive: (v: boolean) => void;
};

const HeroLiveDepthContext = createContext<HeroLiveDepthContextValue | null>(
  null
);

export function HeroLiveDepthProvider({ children }: { children: ReactNode }) {
  const [liveDepthActive, setLiveDepthActive] = useState(false);
  const value = useMemo(
    () => ({ liveDepthActive, setLiveDepthActive }),
    [liveDepthActive]
  );
  return (
    <HeroLiveDepthContext.Provider value={value}>
      {children}
    </HeroLiveDepthContext.Provider>
  );
}

export function useHeroLiveDepth(): HeroLiveDepthContextValue {
  const ctx = useContext(HeroLiveDepthContext);
  if (!ctx) {
    throw new Error('useHeroLiveDepth must be used within HeroLiveDepthProvider');
  }
  return ctx;
}
