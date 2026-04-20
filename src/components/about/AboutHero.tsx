'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import FaultyTerminal from '@/components/ui/FaultyTerminal';
import { ResumeModal } from './ResumeModal';
import { useReducedMotion } from 'framer-motion';
import { useDeviceCapabilities } from '@/hooks/useReducedMotion';

export const AboutHero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { isTouch, isLowEnd } = useDeviceCapabilities();
  const [shaderDpr, setShaderDpr] = useState(1);
  const [capabilitiesInView, setCapabilitiesInView] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Direct scroll transforms - NO useSpring (eliminates continuous animation overhead)
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  
  // Parallax horizontal scroll - direct transforms for max performance
  const moreX = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const meX = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const meScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  // Background parallax - slower than foreground for depth
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const wordReveal = {
    hidden: { y: 48, opacity: 0, filter: 'blur(12px)' },
    visible: (delay: number) => ({
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        delay,
        duration: 0.85,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
  };

  const title = "MORE";
  const subtitle = "ABOUT";
  const third = "ME";
  useEffect(() => {
    const raw = window.devicePixelRatio || 1;
    if (prefersReducedMotion) {
      setShaderDpr(1);
    } else if (isTouch) {
      setShaderDpr(Math.min(raw, 1.2));
    } else {
      setShaderDpr(Math.min(raw, isLowEnd ? 1 : 1.25));
    }
  }, [isLowEnd, isTouch, prefersReducedMotion]);

  useEffect(() => {
    const cap = document.getElementById('capabilities');
    if (!cap) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setCapabilitiesInView(entry.isIntersecting && entry.intersectionRatio > 0);
      },
      { threshold: [0, 0.02, 0.08], rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(cap);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={containerRef} className="min-h-[100dvh] bg-[#0D0D0D] relative overflow-hidden contain-layout gpu-accelerated">
      {/* Layer 0: Base dark background - GPU optimized */}
      <motion.div 
        className="absolute inset-0 z-0 gpu-accelerated"
        style={{ y: bgY, scale: bgScale, willChange: 'transform' }}
      >
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
            background: 'radial-gradient(ellipse 82% 72% at 42% 36%, transparent 40%, rgba(13, 13, 13, 0.45) 70%, rgba(13, 13, 13, 0.75) 100%)',
            willChange: 'opacity',
          }}
        />
      </motion.div>

      {/* Layer 8: Homepage shader field — single continuous motion (no ribbon/wave layer swap) */}
      <div
        className="absolute inset-0 z-[8] min-h-[100dvh] pointer-events-none overflow-hidden transition-opacity duration-700 ease-out"
        style={{ opacity: capabilitiesInView ? 0 : 1 }}
      >
        <FaultyTerminal
          scale={isTouch ? 1.26 : 1.42}
          gridMul={isTouch ? [2.28, 1.58] : [2.62, 1.74]}
          digitSize={1.0}
          timeScale={prefersReducedMotion ? 0.028 : isTouch ? 0.092 : 0.102}
          scanlineIntensity={0.028}
          glitchAmount={0.055}
          flickerAmount={0.02}
          noiseAmp={0.52}
          curvature={0.065}
          chromaticAberration={isTouch ? 0.0017 : 0.0022}
          dither={0.35}
          tint="#F5F5F3"
          mouseReact={false}
          mouseStrength={0}
          pageLoadAnimation={false}
          brightness={0.72}
          dpr={shaderDpr}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(13,13,13,0.38)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d0d0d]/40" />
      </div>

      {/* Layer 20: Typography - always on top, full viewport */}
      <motion.div style={{ opacity, scale }} className="sticky top-0 h-[100dvh] min-h-[100dvh] flex flex-col justify-center items-center w-full z-20">
        {/* Oversized typography composition - full viewport width */}
        <div className="relative w-full h-full px-6 md:px-12 lg:px-20 flex flex-col justify-center">
          {/* CI0 - positioned at bottom right */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="absolute bottom-[15vh] right-[5vw] pointer-events-none z-0"
          >
            <span className="font-display text-[80px] md:text-[140px] text-[#F2F2F0]/[0.015] leading-none tracking-wider">
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
              </motion.div>
            </motion.div>

            {/* Second line - ABOUT - centered */}
            <div 
              className="relative z-20 self-center overflow-hidden"
              onClick={() => setIsResumeOpen(true)}
            >
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
              </motion.div>

              <span 
                className="absolute -bottom-7 left-1/2 -translate-x-1/2 font-mono text-[10px] text-[#818cf8] uppercase tracking-[0.25em] whitespace-nowrap flex items-center gap-2 opacity-85"
              >
                <span>View Resume</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
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
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Descriptor + resume — one calm row: legible left, premium CTA right */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-[10vh] left-0 right-0 z-[25] px-6 md:px-12 lg:px-20 pointer-events-none"
        >
          <div className="flex flex-row flex-wrap items-center justify-between gap-x-8 gap-y-3 sm:flex-nowrap pointer-events-auto">
            <div className="flex min-w-0 max-w-[min(100%,32rem)] items-center gap-3 sm:gap-4">
              <div className="h-[2px] w-12 shrink-0 bg-gradient-to-r from-[#f59e0b] via-[#F2F2F0] to-transparent sm:w-20" aria-hidden />
              <span
                className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#F2F2F0] sm:text-[11px] sm:tracking-[0.24em]"
                style={{
                  textShadow:
                    '0 1px 2px rgba(0,0,0,0.95), 0 0 28px rgba(10,10,10,0.92), 0 0 1px rgba(245,245,243,0.4)',
                }}
              >
                Producer. Architect. Thinker
              </span>
            </div>

            <a
              href="/resume/Pratt_Majmudar_Resume.pdf"
              download="Pratt_Majmudar_Resume.pdf"
              className="group inline-flex shrink-0 items-center gap-2 transition-colors duration-300"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#F2F2F0] underline decoration-[#f59e0b]/55 underline-offset-[6px] transition-colors duration-300 group-hover:text-white group-hover:decoration-[#f59e0b] sm:text-[11px] sm:tracking-[0.26em]">
                Download resume
              </span>
              <svg
                className="h-3.5 w-3.5 shrink-0 text-[#f59e0b] transition-transform duration-300 group-hover:translate-y-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" />
              </svg>
            </a>
          </div>
        </motion.div>

        {/* Bottom fade extension - ensures clean transition to next section */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[35vh] pointer-events-none overflow-hidden z-[4] gpu-accelerated"
          style={{ willChange: 'opacity' }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/90 to-transparent" />
        </div>

      </motion.div>
      
      {/* Resume Modal */}
      <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
    </section>
  );
};
