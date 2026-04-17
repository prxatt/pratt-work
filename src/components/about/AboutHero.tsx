'use client';

import React, { useRef, useState, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LineWaves } from './LineWaves';
import { VideoFrame } from './VideoFrame';
import { ResumeModal } from './ResumeModal';
import { useReducedMotion } from 'framer-motion';

export const AboutHero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);
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

  // Memoized letter variants - faster loading animation
  const letterVariants = useMemo(() => ({
    hidden: { y: 60, opacity: 0, scale: 0.95 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.04,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
  }), []);

  const title = "MORE";
  const subtitle = "ABOUT";
  const third = "ME";

  return (
    <section ref={containerRef} className="min-h-screen bg-[#0D0D0D] relative overflow-hidden contain-layout gpu-accelerated">
      {/* Layer 0: Base dark background - GPU optimized */}
      <motion.div 
        className="absolute inset-0 z-0 gpu-accelerated"
        style={{ y: bgY, scale: bgScale, willChange: 'transform' }}
      >
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        
        {/* Noise texture overlay - static for performance */}
        <div 
          className="absolute inset-0 opacity-[0.03] gpu-accelerated"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            willChange: 'auto',
          }}
        />
        
        {/* Vignette overlay - GPU layer */}
        <div 
          className="absolute inset-0 gpu-accelerated"
          style={{
            background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(13, 13, 13, 0.6) 100%)',
            willChange: 'opacity',
          }}
        />
      </motion.div>

      {/* Layer 5: LineWaves - Full viewport coverage, subtle fade only at very bottom */}
      <div className="absolute inset-0 z-[1] opacity-60">
        <LineWaves 
          speed={0.15}
          innerLineCount={24}
          outerLineCount={28}
          warpIntensity={0.8}
          rotation={-30}
          edgeFadeWidth={0.2}
          colorCycleSpeed={0.3}
          brightness={0.15}
          color1="#F2F2F0"
          color2="#8A8A85"
          color3="#6366f1"
          enableMouseInteraction={true}
          mouseInfluence={1.5}
          reducedMotion={prefersReducedMotion || false}
        />
        {/* Minimal bottom gradient - just enough to blend, not cut off */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0D0D0D] to-transparent z-[2] pointer-events-none"
          style={{ willChange: 'opacity' }}
        />
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
              className="overflow-hidden relative z-30 cursor-pointer self-start ml-[8vw] md:ml-[12vw]"
              style={{ 
                x: moreX,
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
              onMouseEnter={() => setHoveredLine('more')}
              onMouseLeave={() => setHoveredLine(null)}
            >
              <motion.div
                className="flex"
                initial="hidden"
                animate="visible"
              >
                {title.split('').map((letter, i) => (
                  <motion.span
                    key={`title-${i}`}
                    custom={i}
                    variants={letterVariants}
                    className="font-display text-[#F2F2F0] leading-[0.85] inline-block"
                    style={{ 
                      fontSize: 'clamp(5rem, 15vw, 11rem)',
                    }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>

            {/* Second line - ABOUT - centered, full white default, premium hover effect */}
            <div 
              className="overflow-hidden relative z-20 cursor-pointer group"
              onMouseEnter={() => setHoveredLine('about')}
              onMouseLeave={() => setHoveredLine(null)}
              onClick={() => setIsResumeOpen(true)}
            >
              {/* Background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#6366f1]/10 to-transparent opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-700 ease-out scale-150" />
              
              <motion.div
                className="flex relative"
                initial="hidden"
                animate="visible"
              >
                {subtitle.split('').map((letter, i) => (
                  <motion.span
                    key={`subtitle-${i}`}
                    custom={i + 5}
                    variants={letterVariants}
                    className="font-display text-[#F2F2F0] leading-[0.85] inline-block transition-all duration-500 ease-out group-hover:text-[#818cf8]"
                    style={{ 
                      fontSize: 'clamp(5rem, 15vw, 11rem)',
                      transitionDelay: `${i * 25}ms`,
                    }}
                    whileHover={{ 
                      y: -6, 
                      scale: 1.02,
                      transition: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] } 
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.div>
              
              {/* Premium animated underline */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-gradient-to-r from-transparent via-[#818cf8] to-transparent group-hover:w-[85%] transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]" />
              
              {/* Refined click hint */}
              <span 
                className="absolute -bottom-7 left-1/2 -translate-x-1/2 font-mono text-[10px] text-[#818cf8]/0 group-hover:text-[#818cf8] uppercase tracking-[0.25em] transition-all duration-400 whitespace-nowrap flex items-center gap-2 opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 ease-out"
              >
                <span>View Resume</span>
                <svg className="w-3 h-3 transform group-hover:translate-x-1.5 transition-transform duration-400 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>

            {/* Third line - ME - largest, positioned far right maintaining equal spacing */}
            <motion.div 
              className="overflow-hidden relative z-30 cursor-pointer self-end mr-[5vw] md:mr-[8vw] -mt-[2vh]"
              style={{ 
                x: meX, 
                scale: meScale,
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            >
              <motion.div
                className="flex"
                initial="hidden"
                animate="visible"
              >
                {third.split('').map((letter, i) => (
                  <motion.span
                    key={`third-${i}`}
                    custom={i + 10}
                    variants={letterVariants}
                    className="font-display text-[#F2F2F0] leading-[0.85] inline-block"
                    style={{ 
                      fontSize: 'clamp(7rem, 24vw, 18rem)',
                    }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  >
                    {letter}
                  </motion.span>
                ))}
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
            <span className="font-mono text-[12px] text-[#F2F2F0] uppercase tracking-[0.3em] font-medium" style={{ textShadow: '0 0 20px rgba(242,242,240,0.5), 0 0 40px rgba(242,242,240,0.3)' }}>
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
