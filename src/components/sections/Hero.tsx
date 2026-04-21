'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useDeviceCapabilities } from '@/hooks/useReducedMotion';

const FaultyTerminal = dynamic(() => import('@/components/ui/FaultyTerminal'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0a0a0a]" />,
});

const HERO_EASE = [0.16, 1, 0.3, 1] as const;

// Rotating role labels (unchanged copy)
const roles = [
  'Creative Technologist + Producer',
  'Stories That Move People',
  'Worlds Built in 3D',
  'Brands Brought to Life',
  'Experiences Worth Sharing',
  'Ideas Made Real',
  'Teams That Create',
];

const RotatingRoles = ({ isTouch }: { isTouch: boolean }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const startTimeout = setTimeout(() => setHasStarted(true), 2400);
    return () => clearTimeout(startTimeout);
  }, [isInView]);

  useEffect(() => {
    if (!hasStarted) return;
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % roles.length);
        setIsVisible(true);
      }, 600);
    }, 4500);
    return () => clearInterval(interval);
  }, [hasStarted]);

  return (
    <div
      ref={ref}
      className="relative h-10 flex items-center overflow-hidden px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] gpu-accelerated"
    >
      {isTouch && (
        <>
          <div
            className="absolute inset-[-7px_-14px] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 78% at 50% 50%, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.48) 52%, rgba(10,10,10,0) 100%)',
              filter: 'blur(0.3px)',
            }}
          />
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ boxShadow: '0 0 28px rgba(10,10,10,0.55) inset' }}
          />
        </>
      )}
      <motion.span
        className="relative z-[1] font-mono text-xs md:text-sm tracking-[0.2em] uppercase text-[#B8B8B3] whitespace-nowrap gpu-accelerated"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -6 }}
        transition={{ duration: 0.5, ease: HERO_EASE }}
        style={{
          textShadow:
            '0 0 30px rgba(208, 208, 204, 0.4), 0 0 60px rgba(208, 208, 204, 0.15)',
          fontWeight: 400,
          letterSpacing: '0.18em',
          willChange: 'transform, opacity',
        }}
      >
        {roles[currentIndex]}
      </motion.span>
    </div>
  );
};

// ============================================
// CORNER BRACKETS — editorial cinematic markers
// ============================================
const CornerBrackets = ({ visible }: { visible: boolean }) => {
  const common =
    'absolute w-6 h-6 md:w-8 md:h-8 pointer-events-none border-[#F5F5F3]/22';
  const stroke = 1;
  const positions = [
    { key: 'tl', className: `top-4 left-4 md:top-6 md:left-8 border-t border-l`, delay: 0.1 },
    { key: 'tr', className: `top-4 right-4 md:top-6 md:right-8 border-t border-r`, delay: 0.16 },
    { key: 'bl', className: `bottom-24 left-4 md:bottom-28 md:left-8 border-b border-l`, delay: 0.22 },
    { key: 'br', className: `bottom-24 right-4 md:bottom-28 md:right-8 border-b border-r`, delay: 0.28 },
  ] as const;

  return (
    <>
      {positions.map((p) => (
        <motion.div
          key={p.key}
          className={`${common} ${p.className}`}
          style={{ borderWidth: stroke }}
          initial={{ opacity: 0, scale: 0.82 }}
          animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.82 }}
          transition={{ duration: 0.7, delay: p.delay, ease: HERO_EASE }}
        />
      ))}
    </>
  );
};

// ============================================
// LETTER REVEAL — editorial per-glyph stagger
// ============================================
const LetterLockup = ({
  text,
  ariaLabel,
  reveal,
  delay,
  lite,
}: {
  text: string;
  ariaLabel: string;
  reveal: boolean;
  delay: number;
  lite: boolean;
}) => {
  const letters = useMemo(() => Array.from(text), [text]);
  const perLetter = lite ? 0.032 : 0.045;
  return (
    <span className="inline-flex" aria-label={ariaLabel} role="text">
      {letters.map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          aria-hidden="true"
          className="inline-block"
          initial={{
            opacity: 0,
            y: lite ? 14 : 28,
            filter: lite ? 'blur(0px)' : 'blur(6px)',
          }}
          animate={
            reveal
              ? { opacity: 1, y: 0, filter: 'blur(0px)' }
              : {
                  opacity: 0,
                  y: lite ? 14 : 28,
                  filter: lite ? 'blur(0px)' : 'blur(6px)',
                }
          }
          transition={{
            duration: lite ? 0.55 : 0.75,
            delay: delay + i * perLetter,
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

// ============================================
// HERO — Editorial-Tech visual system
// ============================================
export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isTouch, isLowEnd, prefersReducedMotion } = useDeviceCapabilities();
  const [terminalDpr, setTerminalDpr] = useState(1);
  const [showTerminal, setShowTerminal] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Breakpoint-aware profile
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

  // Breakpoint-aware shader parameter profile — prevents elongated mobile
  // field and keeps cohesive editorial rhythm on desktop.
  const shaderProfile = useMemo(() => {
    const base =
      viewport === 'mobile'
        ? {
            scale: 1.3,
            gridMul: [2.44, 2.44] as [number, number],
            timeScale: prefersReducedMotion ? 0.036 : 0.104,
            noiseAmp: 0.34,
            curvature: 0.092,
            flowJitter: 0.32,
          }
        : viewport === 'tablet'
        ? {
            scale: 1.48,
            gridMul: [2.38, 2.36] as [number, number],
            timeScale: prefersReducedMotion ? 0.038 : 0.112,
            noiseAmp: 0.32,
            curvature: 0.078,
            flowJitter: 0.3,
          }
        : {
            scale: 1.62,
            gridMul: [2.34, 2.3] as [number, number],
            timeScale: prefersReducedMotion ? 0.042 : 0.118,
            noiseAmp: 0.32,
            curvature: 0.072,
            flowJitter: 0.3,
          };
    if (isLowEnd) {
      base.timeScale *= 0.85;
      base.noiseAmp *= 0.9;
    }
    return base;
  }, [viewport, prefersReducedMotion, isLowEnd]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.devicePixelRatio || 1;
    if (prefersReducedMotion) {
      setTerminalDpr(1);
      return;
    }
    if (isTouch) setTerminalDpr(Math.min(raw, 0.9));
    else setTerminalDpr(Math.min(raw, isLowEnd ? 0.9 : 1));
  }, [isLowEnd, isTouch, prefersReducedMotion]);

  useEffect(() => {
    const bgDelay = prefersReducedMotion ? 1150 : isTouch ? 900 : 700;
    const terminalTimer = window.setTimeout(() => setShowTerminal(true), bgDelay);
    return () => window.clearTimeout(terminalTimer);
  }, [isTouch, prefersReducedMotion]);

  useEffect(() => {
    const contentTimer = window.setTimeout(() => setContentReady(true), 120);
    return () => window.clearTimeout(contentTimer);
  }, []);

  const lite = prefersReducedMotion || isLowEnd;

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden flex flex-col bg-[#0a0a0a]">
      {/* Deep background */}
      <div className="absolute inset-0 z-0 bg-[#0a0a0a]" />

      {/* Shader field */}
      <div className="absolute inset-0 z-[1] will-change-transform" style={{ contain: 'strict' }}>
        {showTerminal ? (
          <FaultyTerminal
            scale={shaderProfile.scale}
            gridMul={shaderProfile.gridMul}
            digitSize={1.0}
            timeScale={shaderProfile.timeScale}
            scanlineIntensity={0}
            glitchAmount={1}
            flickerAmount={0}
            noiseAmp={shaderProfile.noiseAmp}
            curvature={shaderProfile.curvature}
            chromaticAberration={0}
            tint="#F5F5F3"
            mouseReact={false}
            mouseStrength={0}
            pageLoadAnimation={false}
            brightness={0.95}
            flowJitter={shaderProfile.flowJitter}
            dpr={terminalDpr}
          />
        ) : (
          <div className="absolute inset-0 bg-[#0a0a0a]" />
        )}
      </div>

      {/* Directional light plane — upper-right key light for depth */}
      <motion.div
        aria-hidden
        className="absolute inset-0 z-[2] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={contentReady ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.6, ease: HERO_EASE }}
        style={{
          background:
            viewport === 'mobile'
              ? 'radial-gradient(ellipse 75% 55% at 78% 18%, rgba(245,245,243,0.10) 0%, rgba(245,245,243,0.02) 38%, transparent 64%)'
              : 'radial-gradient(ellipse 60% 55% at 72% 22%, rgba(245,245,243,0.11) 0%, rgba(245,245,243,0.03) 40%, transparent 68%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Organic vignette — asymmetric on desktop, centered on mobile */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none md:hidden"
        style={{
          background:
            'radial-gradient(ellipse 96% 62% at 50% 40%, transparent 44%, rgba(0,0,0,0.12) 72%, rgba(0,0,0,0.24) 100%)',
        }}
      />
      <div
        className="absolute inset-0 z-[2] pointer-events-none hidden md:block"
        style={{
          background:
            'radial-gradient(ellipse 86% 62% at 28% 42%, transparent 48%, rgba(0,0,0,0.16) 100%)',
        }}
      />

      {/* Fine scanlines */}
      <div
        className="absolute inset-0 z-[3] pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.015) 4px, rgba(255,255,255,0.015) 8px)',
          backgroundSize: '100% 8px',
        }}
      />

      {/* Grain */}
      <div
        className="absolute inset-0 z-[3] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.025,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Corner bracket markers — editorial */}
      <div className="absolute inset-0 z-[4] pointer-events-none">
        <CornerBrackets visible={contentReady} />
      </div>

      {/* Main content */}
      <motion.div
        ref={containerRef}
        className="flex-1 flex flex-col items-center justify-center z-10 px-6 relative group"
        data-cursor="hover"
        initial={{ opacity: 0 }}
        animate={contentReady ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.55, ease: HERO_EASE }}
      >
        <div className="flex flex-col items-center text-center">
          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={contentReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.55, delay: 0.08, ease: HERO_EASE }}
            className="flex items-center gap-1.5 mb-5 md:mb-6 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] group-hover:bg-white/[0.08] group-hover:border-white/[0.15] transition-all duration-500"
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="font-mono text-[9px] tracking-[0.25em] text-[#9A9A95] uppercase">
              Available
            </span>
          </motion.div>

          {/* Name lockup — editorial per-letter reveal */}
          <h1
            className="font-display uppercase cursor-pointer transition-all duration-700 hover:tracking-widest hover:text-white"
            style={{
              fontSize: 'clamp(3.25rem, 12vw, 10rem)',
              lineHeight: '0.9',
              letterSpacing: '-0.02em',
              color: '#F5F5F3',
              textShadow:
                '0 0 80px rgba(245, 245, 243, 0.15), 0 0 160px rgba(245, 245, 243, 0.08)',
              fontWeight: 400,
            }}
          >
            <LetterLockup
              text="PRATT"
              ariaLabel="PRATT"
              reveal={contentReady}
              delay={0.22}
              lite={lite}
            />
          </h1>

          {/* Editorial measurement rule — draws in between name lines */}
          <motion.div
            aria-hidden
            className="my-1 md:my-1.5 h-px origin-center bg-gradient-to-r from-transparent via-[#F5F5F3]/28 to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={contentReady ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.9, delay: 0.52, ease: HERO_EASE }}
            style={{ width: 'clamp(6rem, 22vw, 16rem)' }}
          />

          <h1
            className="font-display uppercase -mt-1 md:-mt-2 cursor-pointer transition-all duration-700 hover:tracking-widest hover:text-white"
            style={{
              fontSize: 'clamp(3.25rem, 12vw, 10rem)',
              lineHeight: '0.9',
              letterSpacing: '-0.02em',
              color: '#F5F5F3',
              textShadow:
                '0 0 80px rgba(245, 245, 243, 0.15), 0 0 160px rgba(245, 245, 243, 0.08)',
              fontWeight: 400,
            }}
          >
            <LetterLockup
              text="MAJMUDAR"
              ariaLabel="MAJMUDAR"
              reveal={contentReady}
              delay={0.6}
              lite={lite}
            />
          </h1>

          {/* Rotating roles */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={contentReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.6, delay: 1.05, ease: HERO_EASE }}
            className="mt-6 md:mt-8"
          >
            <RotatingRoles isTouch={isTouch} />
          </motion.div>

          {/* Final hairline divider — expands after roles settle */}
          <motion.div
            className="mt-10 h-px origin-center bg-gradient-to-r from-transparent via-[#F5F5F3]/20 to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={contentReady ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.9, delay: 1.25, ease: HERO_EASE }}
            style={{ width: '8rem' }}
          />
        </div>
      </motion.div>

      {/* Bottom meta row */}
      <motion.div
        className="w-full px-6 md:px-12 lg:px-20 py-6 md:py-8 flex flex-row flex-nowrap justify-between items-center gap-3 z-10 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={contentReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.7, delay: 1.35, ease: HERO_EASE }}
      >
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={contentReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
          transition={{ duration: 0.45, delay: 1.46, ease: HERO_EASE }}
          className="font-mono text-[10px] sm:text-[11px] tracking-[0.18em] sm:tracking-[0.2em] uppercase whitespace-nowrap text-[#B5B5B0] shrink-0 min-w-0"
          style={{
            textShadow:
              '0 1px 3px rgba(0,0,0,0.9), 0 0 20px rgba(10,10,10,0.5)',
          }}
        >
          BASED IN SAN FRANCISCO
        </motion.span>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={contentReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
          transition={{ duration: 0.45, delay: 1.56, ease: HERO_EASE }}
          className="shrink-0"
        >
          <Link
            href="/work"
            className="flex flex-row items-center gap-2 sm:gap-3 text-[#B5B5B0] hover:text-[#F5F5F3] transition-colors duration-500 group py-1 -my-1"
            style={{
              textShadow:
                '0 1px 3px rgba(0,0,0,0.9), 0 0 20px rgba(10,10,10,0.5)',
            }}
          >
            <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.14em] sm:tracking-[0.15em] uppercase whitespace-nowrap">
              Latest Work
            </span>
            <div className="w-8 h-8 shrink-0 rounded-full border border-[#7A7A75]/80 bg-[#0a0a0a]/35 flex items-center justify-center group-hover:border-[#A8A8A3] group-hover:bg-[#0a0a0a]/55 group-hover:scale-110 transition-all duration-500">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="opacity-95"
              >
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};
