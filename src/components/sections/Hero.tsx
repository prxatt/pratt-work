'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useDeviceCapabilities } from '@/hooks/useReducedMotion';
import { CustomCursor } from '@/components/ui/CustomCursor';

// Dynamically import FaultyTerminal with mobile optimization
const FaultyTerminal = dynamic(() => import('@/components/ui/FaultyTerminal'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0a0a0a]" />
});

// ============================================
// ROTATING ROLES - Evocative + Outcome Focused
// ============================================
const roles = [
  "Creative Technologist + Producer",
  "Stories That Move People",
  "Worlds Built in 3D",
  "Brands Brought to Life",
  "Experiences Worth Sharing",
  "Ideas Made Real",
  "Teams That Create"
];

const RotatingRoles = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    const startTimeout = setTimeout(() => {
      setHasStarted(true);
    }, 2200);

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
    <div ref={ref} className="h-10 flex items-center overflow-hidden px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] gpu-accelerated">
      <motion.span
        className="font-mono text-xs md:text-sm tracking-[0.2em] uppercase text-[#B8B8B3] whitespace-nowrap gpu-accelerated"
        initial={{ opacity: 0, y: 8 }}
        animate={{ 
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : -6
        }}
        transition={{ 
          duration: 0.5, 
          ease: [0.16, 1, 0.3, 1]
        }}
        style={{
          textShadow: '0 0 30px rgba(208, 208, 204, 0.4), 0 0 60px rgba(208, 208, 204, 0.15)',
          fontWeight: 400,
          letterSpacing: '0.18em',
          willChange: 'transform, opacity'
        }}
      >
        {roles[currentIndex]}
      </motion.span>
    </div>
  );
};

// ============================================
// FAULTY TERMINAL BACKGROUND
// ============================================
// FaultyTerminal is dynamically imported above to avoid SSR issues

// ============================================
// MAIN HERO - Steve Jobs Level Minimalism
// ============================================
export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isTouch, isLowEnd, prefersReducedMotion } = useDeviceCapabilities();
  const [terminalDpr, setTerminalDpr] = useState(1);

  useEffect(() => {
    setTerminalDpr(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, isLowEnd ? 1 : 1.2));
  }, [isLowEnd]);

  // Entry animation sequence - background loads first, then content
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
        staggerChildren: 0.2,
        delayChildren: 1.5, // Background animates for 1.5s before content appears
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(15px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 1.0,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden flex flex-col bg-[#0a0a0a]">
      {/* Deep background */}
      <div className="absolute inset-0 z-0 bg-[#0a0a0a]" />

      {/* Faulty Terminal WebGL Background - Optimized for performance */}
      <div className="absolute inset-0 z-[1] will-change-transform" style={{ contain: 'strict' }}>
        <FaultyTerminal
          scale={isTouch ? 1.65 : 1.8}
          gridMul={[3, 2]}
          digitSize={1.0}
          timeScale={prefersReducedMotion ? 0.05 : isTouch ? 0.13 : 0.12}
          scanlineIntensity={0.04}
          glitchAmount={0.08}
          flickerAmount={0.02}
          noiseAmp={0.5}
          curvature={0.08}
          chromaticAberration={isTouch && !prefersReducedMotion ? 0.002 : 0}
          tint="#F5F5F3"
          mouseReact={true}
          mouseStrength={isTouch ? 1.45 : 1.2}
          pageLoadAnimation={true}
          brightness={0.95}
          dpr={terminalDpr}
        />
      </div>

      {/* Organic Vignette - Lighter for visibility */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 30% 40%, transparent 50%, rgba(0,0,0,0.12) 100%)'
        }}
      />

      {/* Barely-There Scanlines */}
      <div 
        className="absolute inset-0 z-[2] pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.015) 4px, rgba(255,255,255,0.015) 8px)',
          backgroundSize: '100% 8px'
        }}
      />

      {/* Subtle grain texture */}
      <div 
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.02,
        }}
      />

      <CustomCursor />

      {/* Main content - Centered with smooth entry animation */}
      <motion.div 
        ref={containerRef} 
        className="flex-1 flex flex-col items-center justify-center z-10 px-6 relative group" 
        data-cursor="hover"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* Hero Name - Centered */}
        <div className="flex flex-col items-center text-center">
          
          {/* Status indicator - Compact pill with hover glow */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-1.5 mb-5 md:mb-6 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm group-hover:bg-white/[0.08] group-hover:border-white/[0.15] transition-all duration-500"
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

          <motion.h1
            variants={itemVariants}
            className="font-display uppercase cursor-pointer transition-all duration-700 hover:tracking-widest hover:text-white"
            style={{ 
              fontSize: 'clamp(3.5rem, 12vw, 10rem)',
              lineHeight: '0.9',
              letterSpacing: '-0.02em',
              color: '#F5F5F3',
              textShadow: '0 0 80px rgba(245, 245, 243, 0.15), 0 0 160px rgba(245, 245, 243, 0.08)',
              fontWeight: 400,
            }}
          >
            PRATT
          </motion.h1>

          <motion.h1
            variants={itemVariants}
            className="font-display uppercase -mt-1 md:-mt-2 cursor-pointer transition-all duration-700 hover:tracking-widest hover:text-white"
            style={{ 
              fontSize: 'clamp(3.5rem, 12vw, 10rem)',
              lineHeight: '0.9',
              letterSpacing: '-0.02em',
              color: '#F5F5F3',
              textShadow: '0 0 80px rgba(245, 245, 243, 0.15), 0 0 160px rgba(245, 245, 243, 0.08)',
              fontWeight: 400,
            }}
          >
            MAJMUDAR
          </motion.h1>

          {/* Role - Rotating, Centered Below */}
          <motion.div
            variants={itemVariants}
            className="mt-6 md:mt-8"
          >
            <RotatingRoles />
          </motion.div>

          {/* Decorative Element */}
          <motion.div
            variants={itemVariants}
            className="mt-10"
          >
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#F5F5F3]/20 to-transparent" />
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom bar - appears after main content sequence */}
      <motion.div 
        className="w-full px-6 md:px-12 lg:px-20 py-8 flex justify-between items-end z-10 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, delay: 2.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.7 }}
        >
          <span className="font-mono text-[10px] tracking-[0.2em] text-[#5A5A55] uppercase">
            BASED IN SAN FRANCISCO
          </span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.9 }}
        >
          <Link 
            href="/work" 
            className="flex items-center gap-3 text-[#6A6A65] hover:text-[#F2F2F0] transition-colors duration-500 group"
          >
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase">Latest Work</span>
            <div className="w-8 h-8 rounded-full border border-[#5A5A55] flex items-center justify-center group-hover:border-[#8A8A85] group-hover:scale-110 transition-all duration-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};
