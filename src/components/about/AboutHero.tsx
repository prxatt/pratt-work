'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const FaultyTerminal = dynamic(() => import('@/components/ui/FaultyTerminal'), {
  ssr: false,
});

const HERO_VEIL_MS = 1100;
const HERO_VEIL_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

function readClientTouch(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  );
}

function readClientLowEnd(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return cores <= 2 || mem <= 4;
}

export const AboutHero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [veilLifted, setVeilLifted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const clientTouch = hasMounted && readClientTouch();
  const clientLowEnd = hasMounted && readClientLowEnd();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Direct scroll transforms - NO useSpring (eliminates continuous animation overhead)
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // Parallax horizontal scroll - softened on touch/low-end to avoid stutter.
  const moreX = useTransform(scrollYProgress, [0, 1], [0, clientTouch || clientLowEnd ? -120 : -220]);
  const meX = useTransform(scrollYProgress, [0, 1], [0, clientTouch || clientLowEnd ? 52 : 88]);
  const meScale = useTransform(scrollYProgress, [0, 1], [1, clientTouch || clientLowEnd ? 1.02 : 1.06]);

  const liteMotion = prefersReducedMotion || clientLowEnd;

  const wordReveal = {
    hidden: liteMotion
      ? { y: 20, opacity: 0 }
      : { y: 38, opacity: 0 },
    visible: (delay: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay,
        duration: liteMotion ? 0.6 : 1.05,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
  };

  const shaderDpr = useMemo(() => {
    if (!hasMounted || typeof window === 'undefined') return 1;
    const raw = window.devicePixelRatio || 1;
    if (prefersReducedMotion) return 1;
    if (clientTouch) return Math.min(raw, 0.85);
    return Math.min(raw, clientLowEnd ? 0.9 : 0.95);
  }, [hasMounted, prefersReducedMotion, clientTouch, clientLowEnd]);
  const enablePrismaticSweep = !liteMotion && !clientTouch;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    let innerId: number | null = null;
    const outerId = requestAnimationFrame(() => {
      innerId = requestAnimationFrame(() => setVeilLifted(true));
    });
    return () => {
      cancelAnimationFrame(outerId);
      if (innerId !== null) cancelAnimationFrame(innerId);
    };
  }, [hasMounted]);

  const title = 'MORE';
  const subtitle = 'ABOUT';
  const third = 'ME';

  const staticFieldBg: React.CSSProperties = {
    background:
      'radial-gradient(ellipse 85% 70% at 50% 40%, rgba(245,245,243,0.07) 0%, rgba(10,10,10,1) 55%, #0a0a0a 100%)',
  };

  return (
    <section
      ref={containerRef}
      className="min-h-[145dvh] md:min-h-[155dvh] bg-[#0D0D0D] relative overflow-hidden contain-layout gpu-accelerated"
    >
      {/* Layer 0: Base dark background — static (parallax removed: was repainting above WebGL) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        {/* Homepage-inspired scanline texture for brand cohesion */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.015) 4px, rgba(255,255,255,0.015) 8px)',
            backgroundSize: '100% 8px',
          }}
        />

        {/* Noise texture overlay - static for performance */}
        <div
          className="absolute inset-0 opacity-[0.02] gpu-accelerated"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            willChange: 'auto',
          }}
        />

        {/* Vignette overlay - GPU layer */}
        <div
          className="absolute inset-0 gpu-accelerated"
          style={{
            background:
              'radial-gradient(ellipse 82% 72% at 42% 36%, transparent 40%, rgba(13, 13, 13, 0.45) 70%, rgba(13, 13, 13, 0.75) 100%)',
            willChange: 'opacity',
          }}
        />
      </div>

      {/* Layer 8: field — placeholder matches WebGL fallback so first paint never “pops” */}
      <div className="absolute inset-0 z-[8] min-h-[100dvh] pointer-events-none overflow-hidden">
        {!hasMounted ? (
          <div className="absolute inset-0" style={staticFieldBg} />
        ) : (
          <FaultyTerminal
            scale={clientTouch ? 1.24 : 1.5}
            gridMul={clientTouch ? [2.02, 2.04] : [2.24, 2.16]}
            digitSize={1.0}
            timeScale={prefersReducedMotion ? 0.034 : clientTouch ? 0.102 : 0.116}
            scanlineIntensity={0.01}
            glitchAmount={1}
            flickerAmount={0}
            noiseAmp={clientLowEnd ? 0.26 : 0.32}
            curvature={0.055}
            chromaticAberration={0}
            dither={0}
            tint="#F5F5F3"
            mouseReact={false}
            mouseStrength={0}
            pageLoadAnimation={false}
            brightness={0.72}
            flowJitter={0.12}
            dpr={shaderDpr}
            pause={false}
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(13,13,13,0.28)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d0d0d]/14" />
      </div>

      {/* Mist veil: same palette as static field; lifts after mount so WebGL never flashes in raw */}
      {hasMounted && (
        <div
          className="pointer-events-none absolute inset-0 z-[10] min-h-[100dvh] select-none"
          style={{
            background:
              'radial-gradient(ellipse 88% 74% at 50% 38%, rgba(245,245,243,0.06) 0%, rgba(10,10,10,0.92) 52%, #0a0a0a 100%)',
            opacity: veilLifted ? 0 : 1,
            transition: `opacity ${HERO_VEIL_MS}ms ${HERO_VEIL_EASE}`,
          }}
          aria-hidden
        />
      )}

      {/* Layer 20: Typography - always on top, full viewport; transparent so the field reads through empty areas */}
      <motion.div
        style={{ opacity, scale }}
        className="sticky top-0 h-[100dvh] min-h-[100dvh] flex flex-col justify-center items-center w-full z-20 bg-transparent"
      >
        {/* Oversized typography composition - full viewport width */}
        <div className="relative w-full h-full px-6 md:px-12 lg:px-20 flex flex-col justify-center">
          {/* CI0 - positioned at bottom right */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[15vh] right-[5vw] pointer-events-none z-0"
          >
            <span
              className="font-display text-[80px] md:text-[140px] text-[#F2F2F0]/[0.02] leading-none tracking-wider"
              style={{
                filter: liteMotion ? 'blur(6px)' : 'blur(18px)',
                textShadow: liteMotion ? 'none' : '0 0 36px rgba(242,242,240,0.2), 0 0 90px rgba(242,242,240,0.1)',
              }}
            >
              CI0
            </span>
          </motion.div>

          {/* Text stack container - equal vertical spacing with offset positioning */}
          <div className="relative flex w-full max-w-[100%] flex-col items-stretch gap-[2vh] md:gap-[3vh]">
            {/* First line - MORE — anchored left; avoids parent items-center “centering” */}
            <motion.div
              className="relative z-30 w-max max-w-[92vw] self-start overflow-hidden pl-[max(0px,env(safe-area-inset-left))] ml-[clamp(0.25rem,7vw,6.5rem)] md:ml-[clamp(1.25rem,12vw,9rem)] lg:ml-[clamp(2rem,14vw,11rem)]"
              style={{
                x: moreX,
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            >
              <motion.div
                className="relative"
                initial="hidden"
                animate="visible"
                custom={0.12}
              >
                <motion.span
                  variants={wordReveal}
                  className="font-display leading-[0.85] inline-block text-[#F2F2F0]"
                  style={{ fontSize: 'clamp(5rem, 15vw, 11rem)' }}
                >
                  {title}
                </motion.span>
                {enablePrismaticSweep && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 font-display leading-[0.85] inline-block pointer-events-none"
                    style={{
                      fontSize: 'clamp(5rem, 15vw, 11rem)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      backgroundImage:
                        'linear-gradient(110deg, rgba(245,245,243,0) 0%, rgba(245,245,243,0.95) 42%, rgba(124,132,247,0.7) 56%, rgba(245,245,243,0) 100%)',
                      backgroundSize: '230% 100%',
                    }}
                    initial={{ opacity: 0, backgroundPosition: '0% 0%' }}
                    animate={{ opacity: [0, 1, 0], backgroundPosition: ['0% 0%', '100% 0%', '160% 0%'] }}
                    transition={{ delay: 0.28, duration: 1.05, ease: 'easeInOut' }}
                  >
                    {title}
                  </motion.span>
                )}
              </motion.div>
            </motion.div>

            {/* Second line - ABOUT - centered (no resume affordance) */}
            <div className="relative z-20 self-center overflow-hidden">
              <motion.div
                className="relative"
                initial="hidden"
                animate="visible"
                custom={0.24}
              >
                <motion.span
                  variants={wordReveal}
                  className="font-display text-[#F2F2F0] leading-[0.85] inline-block"
                  style={{ fontSize: 'clamp(5rem, 15vw, 11rem)' }}
                >
                  {subtitle}
                </motion.span>
                {enablePrismaticSweep && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 font-display leading-[0.85] inline-block pointer-events-none"
                    style={{
                      fontSize: 'clamp(5rem, 15vw, 11rem)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      backgroundImage:
                        'linear-gradient(110deg, rgba(245,245,243,0) 0%, rgba(245,245,243,0.95) 42%, rgba(124,132,247,0.7) 56%, rgba(245,245,243,0) 100%)',
                      backgroundSize: '230% 100%',
                    }}
                    initial={{ opacity: 0, backgroundPosition: '0% 0%' }}
                    animate={{ opacity: [0, 1, 0], backgroundPosition: ['0% 0%', '100% 0%', '160% 0%'] }}
                    transition={{ delay: 0.42, duration: 1.1, ease: 'easeInOut' }}
                  >
                    {subtitle}
                  </motion.span>
                )}
              </motion.div>
            </div>

            {/* Third line - ME - largest, positioned far right maintaining equal spacing */}
            <motion.div
              className="overflow-hidden relative z-30 self-end mr-[5vw] md:mr-[8vw] -mt-[2vh]"
              style={{
                x: meX,
                scale: meScale,
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            >
              <motion.div
                className="relative"
                initial="hidden"
                animate="visible"
                custom={0.36}
              >
                <motion.span
                  variants={wordReveal}
                  className="font-display text-[#F2F2F0] leading-[0.85] inline-block"
                  style={{ fontSize: 'clamp(7rem, 24vw, 18rem)' }}
                >
                  {third}
                </motion.span>
                {enablePrismaticSweep && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 font-display leading-[0.85] inline-block pointer-events-none"
                    style={{
                      fontSize: 'clamp(7rem, 24vw, 18rem)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      backgroundImage:
                        'linear-gradient(110deg, rgba(245,245,243,0) 0%, rgba(245,245,243,0.95) 42%, rgba(124,132,247,0.7) 56%, rgba(245,245,243,0) 100%)',
                      backgroundSize: '230% 100%',
                    }}
                    initial={{ opacity: 0, backgroundPosition: '0% 0%' }}
                    animate={{ opacity: [0, 1, 0], backgroundPosition: ['0% 0%', '100% 0%', '160% 0%'] }}
                    transition={{ delay: 0.56, duration: 1.15, ease: 'easeInOut' }}
                  >
                    {third}
                  </motion.span>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Descriptor + resume — one calm row: legible left, premium CTA right */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-[10vh] left-0 right-0 z-[25] px-6 md:px-12 lg:px-20 pointer-events-none"
        >
          <div className="flex flex-row flex-wrap items-center justify-between gap-x-8 gap-y-3 sm:flex-nowrap pointer-events-auto">
            <div className="flex min-w-0 max-w-[min(100%,32rem)] items-center gap-3 sm:gap-4">
              <div
                className="h-[2px] w-12 shrink-0 bg-gradient-to-r from-[#f59e0b] via-[#F2F2F0] to-transparent sm:w-20"
                aria-hidden
              />
              <span
                className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#F2F2F0] sm:text-[11px] sm:tracking-[0.24em]"
                style={{
                  textShadow:
                    '0 1px 2px rgba(0,0,0,0.55), 0 0 12px rgba(10,10,10,0.35), 0 0 1px rgba(245,245,243,0.45)',
                }}
              >
                Producer. Architect. Thinker
              </span>
            </div>

            <a
              href="/resume/Pratt_Majmudar_Resume.pdf"
              download="Pratt_Majmudar_Resume.pdf"
              className="inline-flex shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-[#F2F2F0] no-underline decoration-transparent transition-[text-shadow,filter] duration-500 ease-out sm:text-[11px] sm:tracking-[0.26em] hover:text-[#F2F2F0] hover:[text-shadow:0_0_20px_rgba(242,242,240,0.45),0_0_42px_rgba(242,242,240,0.12)]"
            >
              resume
            </a>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
