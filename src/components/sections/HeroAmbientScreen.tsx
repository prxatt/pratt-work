'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDeviceCapabilities } from '@/hooks/useReducedMotion';

const HERO_EASE = [0.16, 1, 0.3, 1] as const;

export type HeroAmbientScreenVariant = 'hero' | 'global';

type HeroAmbientScreenProps = {
  /** Deepest solid layer (Tailwind class) */
  baseBgClass?: string;
  /** `hero`: absolute fill inside a positioned parent. `global`: fixed full viewport (e.g. long pages). */
  variant?: HeroAmbientScreenVariant;
  /**
   * Caps the key-light / vignette layers so a WebGL/WebGPU layer behind them stays visible.
   * Use on the home hero only (default 1 = unchanged).
   */
  overlayStrength?: number;
};

/**
 * Shared ambient layers from the home hero: key light, vignettes, scanlines, grain.
 * Used on the home Hero and on long-form pages (e.g. Crypt) for visual continuity.
 */
export function HeroAmbientScreen({
  baseBgClass = 'bg-[#0a0a0a]',
  variant = 'hero',
  overlayStrength = 1,
}: HeroAmbientScreenProps) {
  const { prefersReducedMotion, isLowEnd } = useDeviceCapabilities();
  const lite = prefersReducedMotion || isLowEnd;
  const [contentReady, setContentReady] = useState(false);
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  const shellClass =
    variant === 'global'
      ? 'pointer-events-none fixed inset-0 z-0'
      : 'pointer-events-none absolute inset-0';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const compute = () => {
      const w = window.innerWidth;
      if (w < 768) setViewport('mobile');
      else if (w < 1280) setViewport('tablet');
      else setViewport('desktop');
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  useEffect(() => {
    const contentTimer = window.setTimeout(() => setContentReady(true), 120);
    const failSafe = window.setTimeout(() => setContentReady(true), 2500);
    return () => {
      window.clearTimeout(contentTimer);
      window.clearTimeout(failSafe);
    };
  }, []);

  return (
    <div className={shellClass} aria-hidden>
      <div className={`absolute inset-0 z-0 ${baseBgClass}`} />

      <motion.div
        className="absolute inset-0 z-[2]"
        initial={{ opacity: 0 }}
        animate={
          contentReady
            ? {
                opacity: (lite ? 0.88 : 1) * overlayStrength,
              }
            : { opacity: 0 }
        }
        transition={{ duration: lite ? 0.4 : 1.6, ease: HERO_EASE }}
        style={{
          background:
            viewport === 'mobile'
              ? 'radial-gradient(ellipse 75% 55% at 78% 18%, rgba(245,245,243,0.10) 0%, rgba(245,245,243,0.02) 38%, transparent 64%)'
              : 'radial-gradient(ellipse 60% 55% at 72% 22%, rgba(245,245,243,0.11) 0%, rgba(245,245,243,0.03) 40%, transparent 68%)',
          mixBlendMode: 'screen',
        }}
      />

      <div
        className="absolute inset-0 z-[2] md:hidden"
        style={{
          background:
            'radial-gradient(ellipse 96% 62% at 50% 40%, transparent 44%, rgba(0,0,0,0.12) 72%, rgba(0,0,0,0.24) 100%)',
          opacity: overlayStrength,
        }}
      />
      <div
        className="absolute inset-0 z-[2] hidden md:block"
        style={{
          background:
            'radial-gradient(ellipse 86% 62% at 28% 42%, transparent 48%, rgba(0,0,0,0.16) 100%)',
          opacity: overlayStrength,
        }}
      />

      <div
        className="absolute inset-0 z-[3] opacity-[0.02]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.015) 4px, rgba(255,255,255,0.015) 8px)',
          backgroundSize: '100% 8px',
        }}
      />

      <div
        className="absolute inset-0 z-[3]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.025,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}
