'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useInView, AnimatePresence, useReducedMotion, Variants } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

// Mobile detection hook for performance optimization
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const check = () => {
      setIsMobile(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
    };
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);
  
  return isMobile;
};

// Particle count based on device capability
const getParticleCount = (isMobile: boolean) => isMobile ? 8 : 15;

// ============================================
// PLAYGROUND LOCK SCREEN - Fun & Exciting Edition
// ============================================
const PlaygroundLock = ({ onUnlock }: { onUnlock: () => void }) => {
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const keysPressedRef = useRef<Set<string>>(new Set());
  const isTouchDevice = useRef(typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0));

  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const particleCount = getParticleCount(isMobile);

  // Touch devices: Tap 10 times anywhere (no visual feedback)
  const handleTap = useCallback(() => {
    if (!isMobile) return;
    
    tapCountRef.current += 1;
    
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0; }, 2500);

    if (tapCountRef.current >= 10) {
      onUnlock();
    }
  }, [onUnlock, isMobile]);

  // Desktop: Press C + 1 + 0 simultaneously
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressedRef.current.add(key);
      
      const keys = keysPressedRef.current;
      if (keys.has('c') && keys.has('1') && keys.has('0')) {
        onUnlock();
        keysPressedRef.current.clear();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown, { passive: true });
    window.addEventListener('keyup', handleKeyUp, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onUnlock]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[100] bg-[#0D0D0D]/95 backdrop-blur-xl overflow-hidden"
    >
      {/* Click overlay for taps - positioned below navbar */}
      <div 
        className="absolute inset-x-0 bottom-0 z-0"
        style={{ top: '80px' }}
        onClick={handleTap}
      />
      {/* Animated gradient orbs - reduced on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-[#06b6d4]/[0.08] blur-[80px] md:blur-[120px] will-change-transform gpu-accelerated"
          animate={prefersReducedMotion ? {} : {
            x: ['-20%', '60%', '-20%'],
            y: ['20%', '60%', '20%'],
          }}
          transition={{ duration: isMobile ? 25 : 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        {!isMobile && (
          <>
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full bg-[#8b5cf6]/[0.06] blur-[100px] will-change-transform gpu-accelerated"
              animate={prefersReducedMotion ? {} : {
                x: ['60%', '-10%', '60%'],
                y: ['50%', '-20%', '50%'],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute w-[300px] h-[300px] rounded-full bg-[#f59e0b]/[0.05] blur-[80px] will-change-transform gpu-accelerated"
              animate={prefersReducedMotion ? {} : {
                x: ['30%', '70%', '30%'],
                y: ['70%', '30%', '70%'],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}
      </div>

      {/* Floating particles - reduced count on mobile */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(particleCount)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20 will-change-transform gpu-accelerated"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={prefersReducedMotion ? {} : {
              y: [0, -80, 0],
              opacity: [0.15, 0.4, 0.15],
            }}
            transition={{
              duration: isMobile ? 5 + Math.random() * 3 : 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Content Container - above click overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 pointer-events-none">
        {/* Playful geometric icon */}
        <motion.div
          initial={{ scale: 0.5, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 relative"
        >
          <div className="relative w-40 h-40">
            {/* Rotating outer square - reduced motion support */}
            <motion.div
              className="absolute inset-0 border-2 border-[#06b6d4]/30 will-change-transform gpu-accelerated"
              style={{ transform: 'rotate(45deg)' }}
              animate={prefersReducedMotion ? {} : { rotate: [45, 135, 45] }}
              transition={{ duration: isMobile ? 35 : 20, repeat: Infinity, ease: 'linear' }}
            />
            {/* Counter-rotating inner square */}
            <motion.div
              className="absolute inset-4 border border-[#8b5cf6]/20 will-change-transform gpu-accelerated"
              style={{ transform: 'rotate(0deg)' }}
              animate={prefersReducedMotion ? {} : { rotate: [0, -90, 0] }}
              transition={{ duration: isMobile ? 25 : 15, repeat: Infinity, ease: 'linear' }}
            />
            {/* Center pulsing circle */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={prefersReducedMotion ? {} : { scale: [1, 1.08, 1] }}
              transition={{ duration: isMobile ? 3 : 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#8b5cf6] flex items-center justify-center">
                <motion.div
                  className="w-12 h-12 rounded-full bg-[#0D0D0D] flex items-center justify-center"
                  animate={prefersReducedMotion ? {} : { scale: [1, 0.92, 1] }}
                  transition={{ duration: isMobile ? 2.5 : 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span className="font-display text-2xl text-white">+</span>
                </motion.div>
              </div>
            </motion.div>
            {/* Corner sparkles - reduced on mobile */}
            {!isMobile && [0, 90, 180, 270].map((rotation, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 will-change-transform gpu-accelerated"
                style={{
                  top: rotation === 0 || rotation === 180 ? (rotation === 0 ? '-6px' : 'auto') : '50%',
                  bottom: rotation === 180 ? '-6px' : 'auto',
                  left: rotation === 90 || rotation === 270 ? (rotation === 270 ? '-6px' : 'auto') : '50%',
                  right: rotation === 90 ? '-6px' : 'auto',
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                }}
                animate={prefersReducedMotion ? {} : { opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
              >
                <div className="w-full h-full bg-[#f59e0b]" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Title with bounce */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <motion.h1
            className="font-display text-[clamp(4rem,14vw,12rem)] text-transparent uppercase leading-[0.75] tracking-tighter break-words will-change-transform gpu-accelerated"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
            }}
            animate={prefersReducedMotion ? {} : { y: [0, -6, 0] }}
            transition={{ duration: isMobile ? 4 : 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            PLAY
          </motion.h1>
          <motion.h2
            className="font-display text-[clamp(2.5rem,8vw,7rem)] text-[#F2F2F0]/30 uppercase leading-[0.85] tracking-tight mt-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            GROUND
          </motion.h2>
        </motion.div>

        {/* Animated divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-10"
        >
          <div className="h-[2px] w-48 bg-gradient-to-r from-[#06b6d4] via-[#8b5cf6] to-[#f59e0b]" />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#F2F2F0]"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Fun description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="text-center"
        >
          <p className="font-mono text-sm tracking-[0.15em] text-[#8A8A85] uppercase mb-3">
            Something Fun Is Cooking
          </p>
          <motion.p
            className="font-sans text-lg text-[#8A8A85]/60"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            Interactive experiments coming soon
          </motion.p>
        </motion.div>

        {/* Decorative floating shapes - reduced on mobile */}
        {!isMobile && (
          <>
            <motion.div
              className="absolute top-20 left-20 w-8 h-8 border border-[#06b6d4]/20 will-change-transform gpu-accelerated"
              animate={prefersReducedMotion ? {} : { y: [0, 20, 0], rotate: [0, 45, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute top-32 right-24 w-6 h-6 rounded-full border border-[#8b5cf6]/20 will-change-transform gpu-accelerated"
              animate={prefersReducedMotion ? {} : { y: [0, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-24 left-32 w-10 h-10 border border-[#f59e0b]/20 rotate-45 will-change-transform gpu-accelerated"
              animate={prefersReducedMotion ? {} : { y: [0, 25, 0], rotate: [45, 90, 45] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-20 right-20 w-4 h-4 bg-[#06b6d4]/10 rounded-full will-change-transform gpu-accelerated"
              animate={prefersReducedMotion ? {} : { y: [0, -30, 0], x: [0, 10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}
      </div>
    </motion.div>
  );
};

const experiments = [
  {
    title: 'NEURAL PUPPETRY',
    type: 'AI + MOTION',
    slug: 'neural-puppetry',
    description: 'Real-time motion capture driven by LLM agents.',
  },
  {
    title: 'SPATIAL CANVAS',
    type: 'INTERFACE',
    slug: 'spatial-canvas',
    description: 'Infinite zoomable interface for multi-modal AI models.',
  },
  {
    title: 'AMBIENT COMPUTE',
    type: 'HARDWARE',
    slug: 'ambient-compute',
    description: 'Zero-UI interaction patterns for smart environments.',
  },
  {
    title: 'GENERATIVE ZINE',
    type: 'PUBLICATION',
    slug: 'generative-zine',
    description: 'CSS 3D page-turn experience with AI-generated typography.',
  },
];

const getContainerVariants = (isMobile: boolean): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: isMobile ? 0.05 : 0.1,
      delayChildren: 0.1,
    },
  },
});

const getItemVariants = (isMobile: boolean): Variants => ({
  hidden: { opacity: 0, y: isMobile ? 25 : 40, filter: isMobile ? 'blur(5px)' : 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: isMobile ? 0.5 : 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
});

const ExperimentCard = ({ exp, index, isMobile }: { exp: typeof experiments[0]; index: number; isMobile: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: isMobile ? '-50px' : '-100px' });
  const [isHovered, setIsHovered] = useState(false);
  const { setCursorState } = useCursor();
  const prefersReducedMotion = useReducedMotion();
  const itemVariants = useMemo(() => getItemVariants(isMobile), [isMobile]);

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="group relative overflow-hidden"
    >
      <Link
        href={`/playground/${exp.slug}`}
        onMouseEnter={() => {
          setCursorState('hover');
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setCursorState('default');
          setIsHovered(false);
        }}
        className="block relative h-full"
      >
        <div
          className={`relative h-full border border-[#1a1a1a] bg-[#0D0D0D] transition-all duration-500 ${
            isHovered ? 'border-[#333] bg-[#111]' : ''
          }`}
        >
          {/* Subtle gradient overlay on hover */}
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-700 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.03) 0%, transparent 60%)',
              opacity: isHovered ? 1 : 0,
            }}
          />

          <div className="relative z-10 p-6 md:p-8 flex flex-col h-full min-h-[280px]">
            {/* Type label */}
            <span className="font-mono text-[9px] text-[#555] uppercase tracking-[0.2em] mb-auto">
              {exp.type}
            </span>

            {/* Title and description */}
            <div className="mt-8">
              <motion.h3
                className="font-display uppercase leading-[0.95] text-[#F2F2F0] text-xl md:text-2xl lg:text-3xl"
                animate={{ y: isHovered ? -4 : 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
              >
                {exp.title}
              </motion.h3>

              <motion.p
                className="font-sans text-[13px] text-[#666] leading-[1.7] mt-4"
                initial={{ opacity: 0.6, y: 5 }}
                animate={{ opacity: isHovered ? 1 : 0.6, y: isHovered ? 0 : 5 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
              >
                {exp.description}
              </motion.p>
            </div>

            {/* Bottom indicator */}
            <div className="mt-auto pt-8">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#6366f1] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Explore →
                </span>
                <div className="h-[1px] bg-[#1a1a1a] flex-grow ml-4 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#6366f1]"
                    initial={{ width: 0 }}
                    whileInView={{ width: isInView ? '100%' : 0 }}
                    transition={{ duration: isMobile ? 0.5 : 0.8, delay: 0.2 + index * (isMobile ? 0.05 : 0.1), ease: [0.16, 1, 0.3, 1] as const }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function PlaygroundPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const isHeaderInView = useInView(headerRef, { once: true, margin: isMobile ? '-50px' : '-100px' });
  const [isLocked, setIsLocked] = useState(true);
  const { setCursorState } = useCursor();
  
  const containerVariants = useMemo(() => getContainerVariants(isMobile), [isMobile]);
  
  return (
    <>
      <AnimatePresence>
        {isLocked && <PlaygroundLock onUnlock={() => setIsLocked(false)} />}
      </AnimatePresence>
      
    <main className="relative z-0 min-h-screen bg-[#0D0D0D]">
      <div ref={containerRef} className="px-6 md:px-12 lg:px-20 py-24 md:py-32 lg:py-40">
        <div className="max-w-7xl mx-auto">
          {/* Header - Optimized for all devices */}
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: isMobile ? 30 : 60, filter: isMobile ? 'blur(5px)' : 'blur(10px)' }}
            animate={isHeaderInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: isMobile ? 0.6 : 1, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-16 md:mb-24 lg:mb-32"
          >
            <span className="font-mono text-[10px] text-[#444] uppercase tracking-[0.4em] block mb-6">
              Interactive Experiments
            </span>
            <h1 className="font-display text-[#F2F2F0] uppercase text-4xl md:text-6xl lg:text-7xl leading-[0.9] tracking-tight">
              Playground
            </h1>
          </motion.div>

          {/* Experiments Grid - Bento style with optimized animations */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: isMobile ? '-50px' : '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
          >
            {experiments.map((exp, index) => (
              <ExperimentCard key={exp.slug} exp={exp} index={index} isMobile={isMobile} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Return Home Footer */}
      <section className="px-6 md:px-12 lg:px-20 py-16 border-t border-[#1a1a1a]">
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 15 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: isMobile ? 0.5 : 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-[2px] bg-gradient-to-r from-[#06b6d4] via-[#8b5cf6] to-[#f59e0b]" />
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#8A8A85] uppercase">
              Exit
            </span>
          </div>
          
          <Link
            href="/"
            className="group flex items-center gap-4"
            onMouseEnter={() => setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            <span 
              className="font-display text-2xl md:text-3xl uppercase tracking-tight transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Home
            </span>
            <motion.div
              className="w-12 h-12 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center overflow-hidden"
              whileHover={{ scale: 1.1, rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #f59e0b 100%)',
                }}
              >
                <ArrowUpRight className="w-5 h-5 text-[#0D0D0D]" />
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </section>
    </main>
    </>
  );
}
