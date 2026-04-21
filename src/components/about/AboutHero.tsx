'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const FaultyTerminal = dynamic(() => import('@/components/ui/FaultyTerminal'), {
  ssr: false,
});

const HERO_VEIL_MS = 1100;
const HERO_VEIL_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const HERO_EASE = [0.16, 1, 0.3, 1] as const;

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

// ============================================
// CORNER BRACKETS — editorial viewport markers
// (mirrors homepage hero grammar; locked to the sticky viewport container)
// ============================================
const CornerBrackets = ({ visible }: { visible: boolean }) => {
  const common =
    'absolute w-6 h-6 md:w-8 md:h-8 pointer-events-none border-[#F2F2F0]/22';
  const positions = [
    { key: 'tl', className: 'top-4 left-4 md:top-6 md:left-8 border-t border-l', delay: 0.1 },
    { key: 'tr', className: 'top-4 right-4 md:top-6 md:right-8 border-t border-r', delay: 0.16 },
    { key: 'bl', className: 'bottom-4 left-4 md:bottom-6 md:left-8 border-b border-l', delay: 0.22 },
    { key: 'br', className: 'bottom-4 right-4 md:bottom-6 md:right-8 border-b border-r', delay: 0.28 },
  ] as const;
  return (
    <>
      {positions.map((p) => (
        <motion.div
          key={p.key}
          className={`${common} ${p.className}`}
          style={{ borderWidth: 1 }}
          initial={{ opacity: 0, scale: 0.82 }}
          animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.82 }}
          transition={{ duration: 0.7, delay: p.delay, ease: HERO_EASE }}
        />
      ))}
    </>
  );
};

// ============================================
// EDITORIAL COLUMN RULE — thin left rail with three baseline ticks
// ============================================
const ColumnRule = ({ visible }: { visible: boolean }) => {
  const ticks = [
    { top: '30%', delay: 0.38 },
    { top: '50%', delay: 0.5 },
    { top: '70%', delay: 0.62 },
  ];
  return (
    <div
      aria-hidden
      className="absolute top-[12%] bottom-[12%] left-4 md:left-8 pointer-events-none"
    >
      <motion.div
        className="w-px h-full bg-gradient-to-b from-transparent via-[#F2F2F0]/18 to-transparent origin-top"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={visible ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
        transition={{ duration: 0.9, delay: 0.32, ease: HERO_EASE }}
      />
      {ticks.map((t, i) => (
        <motion.div
          key={i}
          className="absolute h-px w-2.5 md:w-3.5 bg-[#F2F2F0]/28"
          style={{ top: t.top, left: 0 }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={visible ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
          transition={{ duration: 0.5, delay: t.delay, ease: HERO_EASE }}
        />
      ))}
    </div>
  );
};

// ============================================
// LETTER CASCADE — per-glyph stagger with blur-clear entry
// ============================================
const LetterCascade = ({
  text,
  reveal,
  delay,
  lite,
  className,
  style,
}: {
  text: string;
  reveal: boolean;
  delay: number;
  lite: boolean;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const letters = useMemo(() => Array.from(text), [text]);
  const per = lite ? 0.034 : 0.05;
  return (
    <span className={className} style={style} aria-label={text} role="text">
      {letters.map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          aria-hidden
          className="inline-block"
          initial={{
            opacity: 0,
            y: lite ? 18 : 42,
            filter: lite ? 'blur(0px)' : 'blur(8px)',
          }}
          animate={
            reveal
              ? { opacity: 1, y: 0, filter: 'blur(0px)' }
              : {
                  opacity: 0,
                  y: lite ? 18 : 42,
                  filter: lite ? 'blur(0px)' : 'blur(8px)',
                }
          }
          transition={{
            duration: lite ? 0.6 : 0.9,
            delay: delay + i * per,
            ease: HERO_EASE,
          }}
          style={{ willChange: 'transform, opacity, filter' }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
};

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

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const moreX = useTransform(scrollYProgress, [0, 1], [0, clientTouch || clientLowEnd ? -120 : -220]);
  const meX = useTransform(scrollYProgress, [0, 1], [0, clientTouch || clientLowEnd ? 52 : 88]);
  const meScale = useTransform(scrollYProgress, [0, 1], [1, clientTouch || clientLowEnd ? 1.02 : 1.06]);

  const liteMotion = !!prefersReducedMotion || clientLowEnd;

  const shaderDpr = useMemo(() => {
    if (!hasMounted || typeof window === 'undefined') return 1;
    const raw = window.devicePixelRatio || 1;
    if (prefersReducedMotion) return 1;
    if (clientTouch) return Math.min(raw, 0.85);
    return Math.min(raw, clientLowEnd ? 0.9 : 0.95);
  }, [hasMounted, prefersReducedMotion, clientTouch, clientLowEnd]);
  const enablePrismaticSweep = !liteMotion && !clientTouch;
  const enableBreath = !liteMotion && !clientTouch;

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
      {/* Layer 0: base dark field — static */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.015) 4px, rgba(255,255,255,0.015) 8px)',
            backgroundSize: '100% 8px',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02] gpu-accelerated"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            willChange: 'auto',
          }}
        />
        <div
          className="absolute inset-0 gpu-accelerated"
          style={{
            background:
              'radial-gradient(ellipse 82% 72% at 42% 36%, transparent 40%, rgba(13, 13, 13, 0.45) 70%, rgba(13, 13, 13, 0.75) 100%)',
            willChange: 'opacity',
          }}
        />
      </div>

      {/* Layer 8: shader field (profile preserved — stutter fix + flower character) */}
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

      {/* Layer 9: directional key light — upper-right radial, screen blend
          (matches homepage hero; lifts with veil for a cohesive reveal) */}
      {hasMounted && (
        <motion.div
          aria-hidden
          className="absolute inset-0 z-[9] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: veilLifted ? 1 : 0 }}
          transition={{ duration: 1.4, ease: HERO_EASE }}
          style={{
            background:
              clientTouch
                ? 'radial-gradient(ellipse 78% 52% at 80% 18%, rgba(245,245,243,0.09) 0%, rgba(245,245,243,0.02) 40%, transparent 66%)'
                : 'radial-gradient(ellipse 58% 52% at 74% 20%, rgba(245,245,243,0.11) 0%, rgba(245,245,243,0.03) 42%, transparent 68%)',
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* Mist veil: lifts after mount so shader never flashes in raw */}
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

      {/* Layer 20: typography composition (sticky viewport-locked) */}
      <motion.div
        style={{ opacity, scale }}
        className="sticky top-0 h-[100dvh] min-h-[100dvh] flex flex-col justify-center items-center w-full z-20 bg-transparent"
      >
        {/* Editorial overlay — corner brackets + left column rule */}
        <div className="absolute inset-0 z-[21] pointer-events-none">
          <CornerBrackets visible={veilLifted} />
          <ColumnRule visible={veilLifted} />
        </div>

        {/* Oversized typography — full viewport width */}
        <div className="relative w-full h-full px-6 md:px-12 lg:px-20 flex flex-col justify-center">
          {/* CI0 — editorial ghost with optional gentle breath */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={
              enableBreath
                ? { opacity: [0, 1, 0.88, 1] }
                : { opacity: 1 }
            }
            transition={
              enableBreath
                ? {
                    delay: 0.35,
                    duration: 6.5,
                    times: [0, 0.18, 0.6, 1],
                    ease: 'easeInOut',
                    repeat: Infinity,
                    repeatType: 'mirror',
                  }
                : { delay: 0.35, duration: 1, ease: [0.22, 1, 0.36, 1] }
            }
            className="absolute bottom-[15vh] right-[5vw] pointer-events-none z-0"
          >
            <span
              className="font-display text-[80px] md:text-[140px] text-[#F2F2F0]/[0.02] leading-none tracking-wider"
              style={{
                filter: liteMotion ? 'blur(6px)' : 'blur(18px)',
                textShadow: liteMotion
                  ? 'none'
                  : '0 0 36px rgba(242,242,240,0.2), 0 0 90px rgba(242,242,240,0.1)',
              }}
            >
              CI0
            </span>
          </motion.div>

          {/* Text stack */}
          <div className="relative flex w-full max-w-[100%] flex-col items-stretch gap-[2vh] md:gap-[3vh]">
            {/* MORE — left parallax */}
            <motion.div
              className="relative z-30 w-max max-w-[92vw] self-start overflow-hidden pl-[max(0px,env(safe-area-inset-left))] ml-[clamp(0.25rem,7vw,6.5rem)] md:ml-[clamp(1.25rem,12vw,9rem)] lg:ml-[clamp(2rem,14vw,11rem)]"
              style={{
                x: moreX,
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            >
              <div className="relative">
                <LetterCascade
                  text={title}
                  reveal={hasMounted}
                  delay={0.22}
                  lite={liteMotion}
                  className="font-display leading-[0.85] inline-block text-[#F2F2F0]"
                  style={{ fontSize: 'clamp(5rem, 15vw, 11rem)' }}
                />
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
                    transition={{ delay: 0.62, duration: 1.1, ease: 'easeInOut' }}
                  >
                    {title}
                  </motion.span>
                )}
              </div>
            </motion.div>

            {/* ABOUT — centered */}
            <div className="relative z-20 self-center overflow-hidden">
              <div className="relative">
                <LetterCascade
                  text={subtitle}
                  reveal={hasMounted}
                  delay={0.48}
                  lite={liteMotion}
                  className="font-display text-[#F2F2F0] leading-[0.85] inline-block"
                  style={{ fontSize: 'clamp(5rem, 15vw, 11rem)' }}
                />
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
                    transition={{ delay: 0.92, duration: 1.15, ease: 'easeInOut' }}
                  >
                    {subtitle}
                  </motion.span>
                )}
              </div>
            </div>

            {/* ME — right parallax, largest */}
            <motion.div
              className="overflow-hidden relative z-30 self-end mr-[5vw] md:mr-[8vw] -mt-[2vh]"
              style={{
                x: meX,
                scale: meScale,
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            >
              <div className="relative">
                <LetterCascade
                  text={third}
                  reveal={hasMounted}
                  delay={0.74}
                  lite={liteMotion}
                  className="font-display text-[#F2F2F0] leading-[0.85] inline-block"
                  style={{ fontSize: 'clamp(7rem, 24vw, 18rem)' }}
                />
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
                    transition={{ delay: 1.18, duration: 1.2, ease: 'easeInOut' }}
                  >
                    {third}
                  </motion.span>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Descriptor + resume row — unchanged */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
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
