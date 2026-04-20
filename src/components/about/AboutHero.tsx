'use client';

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LineWaves } from './LineWaves';
import { VideoFrame } from './VideoFrame';
import { ResumeModal } from './ResumeModal';
import { useReducedMotion } from 'framer-motion';

export const AboutHero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
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
  const particles = Array.from({ length: 26 }, (_, i) => ({
    id: i,
    left: `${(i * 137.5) % 100}%`,
    top: `${(i * 89.7) % 100}%`,
    size: 1 + (i % 4),
    duration: 10 + (i % 6) * 1.7,
    delay: (i % 8) * 0.23,
    drift: (i % 2 === 0 ? 1 : -1) * (8 + (i % 5) * 2),
    opacity: 0.08 + (i % 5) * 0.02,
  }));

  return (
    <section ref={containerRef} className="min-h-screen bg-[#0D0D0D] relative overflow-hidden contain-layout gpu-accelerated">
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

      {/* Layer 5: LineWaves - Full viewport coverage, subtle fade only at very bottom */}
      <div className="absolute inset-0 z-[1] opacity-66">
        <LineWaves 
          speed={0.12}
          innerLineCount={26}
          outerLineCount={30}
          warpIntensity={0.7}
          rotation={-32}
          edgeFadeWidth={0.2}
          colorCycleSpeed={0.22}
          brightness={0.2}
          color1="#F5F5F3"
          color2="#B8B8B3"
          color3="#7C84F7"
          enableMouseInteraction={false}
          mouseInfluence={0}
          reducedMotion={prefersReducedMotion || false}
        />
        {/* Minimal bottom gradient - just enough to blend, not cut off */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0D0D0D] to-transparent z-[2] pointer-events-none"
          style={{ willChange: 'opacity' }}
        />
      </div>

      {/* Layer 8: Refined atmospheric particles — cohesive with homepage texture language */}
      <div className="absolute inset-0 z-[8] pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background:
                p.id % 3 === 0
                  ? 'rgba(245, 245, 243, 0.7)'
                  : p.id % 3 === 1
                    ? 'rgba(184, 184, 179, 0.6)'
                    : 'rgba(124, 132, 247, 0.55)',
              opacity: p.opacity,
              boxShadow:
                p.id % 4 === 0
                  ? '0 0 12px rgba(124,132,247,0.35)'
                  : '0 0 8px rgba(245,245,243,0.2)',
            }}
            animate={{
              y: [0, -p.drift, 0],
              x: [0, p.drift * 0.35, 0],
              opacity: [p.opacity * 0.7, p.opacity, p.opacity * 0.7],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Layer 20: Typography - always on top, full viewport */}
      <motion.div style={{ opacity, scale }} className="sticky top-0 h-screen min-h-screen flex flex-col justify-center items-center w-full z-20">
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
          <div className="relative flex flex-col items-center gap-[2vh] md:gap-[3vh]">
            {/* First line - MORE - positioned left of center with parallax scroll */}
            <motion.div 
              className="overflow-hidden relative z-30 self-start ml-[2vw] md:ml-[12vw]"
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

            {/* Second line - ABOUT - centered, full white default, premium hover effect */}
            <div 
              className="overflow-hidden relative z-20"
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

        {/* Descriptor line - visible and positioned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-[10vh] left-6 md:left-12 lg:left-20"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-[2px] bg-gradient-to-r from-[#F2F2F0] to-transparent" />
            <span className="font-mono text-[11px] sm:text-[12px] text-[#C8C8C2] uppercase tracking-[0.28em] font-medium" style={{ textShadow: '0 1px 12px rgba(0,0,0,0.6)' }}>
              Producer. Architect. Thinker
            </span>
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
