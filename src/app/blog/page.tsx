'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion, Variants } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';
import Link from 'next/link';
import { ArrowUpRight, Lock } from 'lucide-react';

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

// Optimized letter animation component with GPU acceleration
const LetterReveal = ({ 
  text, 
  className, 
  delay = 0,
  isInView,
  isHovered = false,
  accentColor = '#6366f1'
}: { 
  text: string; 
  className?: string; 
  delay?: number;
  isInView: boolean;
  isHovered?: boolean;
  accentColor?: string;
}) => {
  const words = text.split(' ');
  
  return (
    <span className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-[0.25em]">
          {word.split('').map((letter, letterIndex) => {
            const globalIndex = words.slice(0, wordIndex).join(' ').length + letterIndex + wordIndex;
            const staggerDelay = globalIndex * 0.02;
            
            return (
              <motion.span
                key={letterIndex}
                initial={{ opacity: 0, y: 20, rotateX: -90 }}
                animate={isInView ? { 
                  opacity: 1, 
                  y: 0, 
                  rotateX: 0,
                  color: isHovered ? accentColor : undefined
                } : { 
                  opacity: 0, 
                  y: 20, 
                  rotateX: -90 
                }}
                transition={{
                  duration: 0.5,
                  delay: delay + staggerDelay,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inline-block will-change-transform gpu-accelerated"
                style={{ 
                  transformOrigin: 'bottom center',
                  backfaceVisibility: 'hidden'
                }}
                whileHover={{
                  y: -3,
                  scale: 1.05,
                  transition: { duration: 0.15 }
                }}
              >
                {letter}
              </motion.span>
            );
          })}
        </span>
      ))}
    </span>
  );
};

// ============================================
// COMING SOON LOCK SCREEN - Premium Edition (Optimized)
// ============================================
const ComingSoonLock = ({ onUnlock }: { onUnlock: () => void }) => {
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const keysPressedRef = useRef<Set<string>>(new Set());
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

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
      className="fixed inset-0 z-[100] bg-[#0a0a0a]/95 backdrop-blur-xl overflow-hidden"
    >
      {/* Click overlay for taps - positioned below navbar */}
      <div 
        className="absolute inset-x-0 bottom-0 z-0"
        style={{ top: '80px' }}
        onClick={handleTap}
      />
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Ambient glow - warm amber tone */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#f59e0b]/[0.03] blur-[200px] pointer-events-none" />

      {/* Content Container - above click overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 pointer-events-none">
        {/* Geometric Crystal Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <div className="relative w-32 h-32">
            {/* Slow rotating outer ring - reduced motion support */}
            <motion.div
              className="absolute inset-0 rounded-full border border-[#f59e0b]/[0.15] will-change-transform gpu-accelerated"
              animate={prefersReducedMotion ? {} : { rotate: 360 }}
              transition={{ duration: isMobile ? 60 : 30, repeat: Infinity, ease: 'linear' }}
            />
            {/* Counter-rotating middle ring */}
            <motion.div
              className="absolute inset-2 rounded-full border border-[#f59e0b]/[0.08] will-change-transform gpu-accelerated"
              animate={prefersReducedMotion ? {} : { rotate: -360 }}
              transition={{ duration: isMobile ? 80 : 40, repeat: Infinity, ease: 'linear' }}
            />
            {/* Hexagon with draw animation */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 128" fill="none">
              <defs>
                <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <motion.path
                d="M64 24 L100 44 L100 84 L64 104 L28 84 L28 44 Z"
                stroke="url(#hexGrad)"
                strokeWidth="1"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
              />
              <motion.circle
                cx="64"
                cy="64"
                r="6"
                fill="#f59e0b"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.8 }}
              />
              {/* Inner connecting lines */}
              <motion.path
                d="M64 24 L64 64 M100 44 L64 64 M100 84 L64 64 M64 104 L64 64 M28 84 L64 64 M28 44 L64 64"
                stroke="#f59e0b"
                strokeWidth="0.5"
                strokeOpacity="0.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 2 }}
              />
            </svg>
            {/* Corner bracket accents */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 border-t border-l border-[#f59e0b]/30" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 border-b border-r border-[#f59e0b]/30" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 border-t border-r border-[#f59e0b]/30" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 border-b border-l border-[#f59e0b]/30" />
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-[clamp(3.5rem,12vw,10rem)] text-[#F2F2F0] uppercase leading-[0.8] tracking-tighter">
            PRISM
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-[2px] w-40 bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent mx-auto mt-8 mb-5"
          />
          <p className="font-mono text-[11px] tracking-[0.5em] text-[#8A8A85] uppercase">
            Coming Soon
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="font-sans text-lg text-[#8A8A85] text-center max-w-lg mb-16 leading-relaxed"
        >
          The lab is preparing something extraordinary.
          <br />
          <span className="text-[#f59e0b]/50 font-mono text-sm tracking-widest mt-3 inline-block">Stay tuned.</span>
        </motion.p>

        {/* Decorative corner frame - larger and more refined */}
        <div className="absolute top-16 left-16 w-16 h-16 border-l-2 border-t-2 border-[#2a2a3a]" />
        <div className="absolute top-16 right-16 w-16 h-16 border-r-2 border-t-2 border-[#2a2a3a]" />
        <div className="absolute bottom-16 left-16 w-16 h-16 border-l-2 border-b-2 border-[#2a2a3a]" />
        <div className="absolute bottom-16 right-16 w-16 h-16 border-r-2 border-b-2 border-[#2a2a3a]" />
      </div>
    </motion.div>
  );
};

const posts = [
  {
    title: 'THE FUTURE OF CREATIVE TECH',
    subtitle: 'Exploring the intersection of AI and experiential production. Where imagination meets computation and the boundaries of human creativity are redrawn.',
    category: 'VISION',
    date: '2026',
    slug: 'the-future-of-creative-tech',
    imageColor: '#0a1628',
    accentColor: '#6366f1',
    theme: 'futuristic',
  },
  {
    title: 'BUILDING SOEN',
    subtitle: 'Behind the scenes of creating an AI-native productivity platform. The architecture of intention in a world of infinite possibility.',
    category: 'BUILD',
    date: '2026',
    slug: 'building-soen',
    imageColor: '#1a1814',
    accentColor: '#f59e0b',
    theme: 'construction',
  },
  {
    title: 'PRODUCTION AT SCALE',
    subtitle: 'Lessons learned from directing $1M+ budget activations. The craft of orchestrating chaos into unforgettable moments.',
    category: 'CRAFT',
    date: '2026',
    slug: 'production-at-scale',
    imageColor: '#1a1410',
    accentColor: '#d97706',
    theme: 'magnitude',
  },
];

export default function BlogPage() {
  const { setCursorState } = useCursor();
  const [recentPost, ...otherPosts] = posts;
  const [isLocked, setIsLocked] = useState(true);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);

  // Optimized animation variants
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0.05 : 0.1,
        delayChildren: 0.1,
      },
    },
  }), [isMobile]);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: isMobile ? 20 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0.5 : 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  }), [isMobile]);

  return (
    <>
      <AnimatePresence>
        {isLocked && <ComingSoonLock onUnlock={() => setIsLocked(false)} />}
      </AnimatePresence>
      
    <div className="relative z-0 min-h-screen bg-[#0a0a0a]">
      {/* Header: 50-50 Split - PRISM left, Image right (same height) */}
      <header className="px-6 md:px-12 lg:px-20 py-12 md:py-16 border-b border-[#2a2a2a]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: PRISM Text with letter animation */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? -20 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: isMobile ? 0.6 : 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="order-2 lg:order-1"
          >
            <motion.span 
              className="font-mono text-[10px] tracking-[0.4em] text-tertiary uppercase block mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              THOUGHTS ON TECHNOLOGY, PHILOSOPHY & THE HUMAN CONDITION
            </motion.span>
            <h1 className="font-display text-[clamp(4rem,12vw,10rem)] leading-[0.85] tracking-tighter text-primary uppercase break-words">
              <LetterReveal text="PRISM" isInView={true} delay={0.1} accentColor="#f59e0b" />
            </h1>
            <motion.p 
              className="font-mono text-xs tracking-[0.2em] text-secondary uppercase mt-6 max-w-md leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              REFRACTING IDEAS THROUGH MULTIPLE LENSES
            </motion.p>
          </motion.div>

          {/* Right: Image (same height as PRISM text) with hover effect */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 20 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: isMobile ? 0.6 : 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="order-1 lg:order-2 group"
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          >
            <div 
              className="w-full aspect-[4/3] lg:aspect-[16/9] relative overflow-hidden"
              style={{ backgroundColor: recentPost.imageColor }}
            >
              {/* Texture layers - dynamic based on theme */}
              <div 
                className="absolute inset-0"
                style={{
                  background: recentPost.theme === 'futuristic' 
                    ? 'linear-gradient(to bottom right, rgba(99, 102, 241, 0.2), transparent, rgba(6, 182, 212, 0.15))'
                    : recentPost.theme === 'construction'
                    ? 'linear-gradient(to bottom right, rgba(245, 158, 11, 0.2), transparent, rgba(120, 113, 108, 0.15))'
                    : 'linear-gradient(to bottom right, rgba(217, 119, 6, 0.2), transparent, rgba(180, 83, 9, 0.15))'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/50 via-transparent to-transparent" />
              <div className="absolute inset-0 opacity-25">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="headerGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <circle cx="15" cy="15" r="0.8" fill="#4a4a5a" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#headerGrid)" />
                </svg>
              </div>
              
              {/* Category badge with accent color and hover glow */}
              <motion.div 
                className="absolute top-4 left-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
              >
                <span 
                  className="font-mono text-[9px] tracking-[0.25em] uppercase bg-[#0a0a0a]/80 backdrop-blur-sm px-3 py-1.5 border border-[#2a2a2a] transition-all duration-300 group-hover:border-[#f59e0b]/50"
                  style={{ 
                    color: recentPost.accentColor,
                    textShadow: '0 0 20px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  {recentPost.category}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Recent Post: Centered, Two images left, Text right */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <Link
          href={`/blog/${recentPost.slug}`}
          onMouseEnter={() => setCursorState('hover')}
          onMouseLeave={() => setCursorState('default')}
        >
          <motion.article
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="group max-w-6xl mx-auto"
            onMouseEnter={() => setHoveredPost(recentPost.slug)}
            onMouseLeave={() => setHoveredPost(null)}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left: Two Stacked Images */}
              <div className="flex flex-col gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="aspect-[16/9] w-full relative overflow-hidden"
                  style={{ backgroundColor: recentPost.imageColor }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-amber-500/10" />
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="recentGrid1" width="25" height="25" patternUnits="userSpaceOnUse">
                          <circle cx="12.5" cy="12.5" r="0.6" fill="#3a3a4a" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#recentGrid1)" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="aspect-[16/9] w-full relative overflow-hidden"
                  style={{ backgroundColor: '#1e1e28' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-emerald-500/10" />
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="recentGrid2" width="25" height="25" patternUnits="userSpaceOnUse">
                          <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#3a3a4a" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#recentGrid2)" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              </div>

              {/* Right: Text Content */}
              <div className="flex flex-col">
                <span 
                  className="font-mono text-[10px] tracking-[0.3em] uppercase mb-4"
                  style={{ color: recentPost.accentColor }}
                >
                  {recentPost.category} — {recentPost.date}
                </span>
                
                <h2 
                  className="font-display text-2xl md:text-3xl lg:text-4xl text-primary uppercase leading-[1.1] mb-6 break-words"
                >
                  <LetterReveal 
                    text={recentPost.title} 
                    isInView={true} 
                    delay={0.2}
                    isHovered={hoveredPost === recentPost.slug}
                    accentColor={recentPost.accentColor}
                  />
                </h2>
                
                <p className="font-sans text-sm md:text-base text-secondary leading-relaxed mb-8">
                  {recentPost.subtitle}
                </p>
                
                {/* Scattered READ MORE with letter animation */}
                <motion.div 
                  className="flex items-center gap-[3px] font-mono text-xs tracking-[0.25em] text-tertiary uppercase cursor-pointer"
                  whileHover="hover"
                  initial="rest"
                >
                  {'READ MORE'.split('').map((letter, i) => (
                    <motion.span 
                      key={i} 
                      className="inline-block will-change-transform"
                      variants={{
                        rest: { y: 0, color: '#666' },
                        hover: { 
                          y: -3, 
                          color: recentPost.accentColor,
                          transition: { delay: i * 0.03, duration: 0.2 }
                        }
                      }}
                    >
                      {letter === ' ' ? '\u00A0' : letter}
                    </motion.span>
                  ))}
                  <motion.div
                    variants={{
                      rest: { x: 0, y: 0 },
                      hover: { x: 2, y: -2 }
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowUpRight 
                      className="w-4 h-4 ml-2 transition-colors duration-300"
                      style={{ color: hoveredPost === recentPost.slug ? recentPost.accentColor : undefined }}
                    />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.article>
        </Link>
      </section>

      {/* Separator */}
      <div className="px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto h-px bg-[#2a2a2a]" />
      </div>

      {/* Other Posts: Alternating Symmetric Pattern */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="max-w-6xl mx-auto space-y-24">
          {otherPosts.map((post, index) => {
            const isEven = index % 2 === 0;
            
            return (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block"
                  onMouseEnter={() => setCursorState('hover')}
                  onMouseLeave={() => setCursorState('default')}
                >
                  {isEven ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                      {/* Pattern A: 3 images right (75%), Text left (25%) */}
                      {/* Left: Title + Desc (25%) */}
                      <div className="lg:col-span-1 flex flex-col justify-center order-2 lg:order-1">
                        <motion.span 
                          className="font-mono text-[9px] tracking-[0.25em] text-tertiary uppercase mb-3"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 }}
                        >
                          {post.date}
                        </motion.span>
                        <h3 
                          className="font-display text-lg md:text-xl text-primary uppercase leading-[1.15] mb-4 break-words"
                        >
                          <LetterReveal 
                            text={post.title} 
                            isInView={true} 
                            delay={0.1}
                            isHovered={hoveredPost === post.slug}
                            accentColor={post.accentColor}
                          />
                        </h3>
                        <p className="font-sans text-sm text-secondary leading-relaxed mb-4">
                          {post.subtitle}
                        </p>
                        <motion.span 
                          className="font-mono text-[10px] tracking-[0.2em] text-tertiary uppercase flex items-center gap-2 cursor-pointer group/link"
                          whileHover="hover"
                          initial="rest"
                        >
                          {'READ MORE'.split('').map((letter, i) => (
                            <motion.span 
                              key={i}
                              className="inline-block will-change-transform"
                              variants={{
                                rest: { y: 0 },
                                hover: { 
                                  y: -2,
                                  transition: { delay: i * 0.02, duration: 0.15 }
                                }
                              }}
                              style={{ color: hoveredPost === post.slug ? post.accentColor : undefined }}
                            >
                              {letter === ' ' ? '\u00A0' : letter}
                            </motion.span>
                          ))}
                          <motion.div
                            variants={{
                              rest: { x: 0, y: 0 },
                              hover: { x: 1.5, y: -1.5 }
                            }}
                            transition={{ duration: 0.15 }}
                          >
                            <ArrowUpRight 
                              className="w-3 h-3 transition-colors duration-200" 
                              style={{ color: hoveredPost === post.slug ? post.accentColor : undefined }}
                            />
                          </motion.div>
                        </motion.span>
                      </div>
                      
                      {/* Right: 3 Images (75%) */}
                      <div className="lg:col-span-3 order-1 lg:order-2">
                        <div className="grid grid-cols-3 gap-3">
                          <motion.div 
                            className="aspect-[3/4] relative overflow-hidden gpu-accelerated" 
                            style={{ backgroundColor: post.imageColor }}
                            whileHover={prefersReducedMotion ? {} : { y: -4 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </motion.div>
                          <motion.div 
                            className="aspect-[3/4] relative overflow-hidden mt-6 gpu-accelerated" 
                            style={{ backgroundColor: '#252530' }}
                            whileHover={prefersReducedMotion ? {} : { y: -4 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent" />
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </motion.div>
                          <motion.div 
                            className="aspect-[3/4] relative overflow-hidden mt-12 gpu-accelerated" 
                            style={{ backgroundColor: '#1e1e28' }}
                            whileHover={prefersReducedMotion ? {} : { y: -4 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </motion.div>
                        </div>
                        
                        {/* Category tag */}
                        <div className="mt-4">
                          <span 
                            className="font-mono text-[9px] tracking-[0.25em] uppercase bg-[#0a0a0a] px-2 py-1 border border-[#2a2a2a]"
                            style={{ color: post.accentColor }}
                          >
                            {post.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                      {/* Pattern B: Text right (25%), 3 images left (75%) */}
                      {/* Left: 3 Images (75%) */}
                      <div className="lg:col-span-3">
                        <div className="grid grid-cols-3 gap-3">
                          <motion.div 
                            className="aspect-[3/4] relative overflow-hidden mt-12 gpu-accelerated" 
                            style={{ backgroundColor: '#2a2a3a' }}
                            whileHover={prefersReducedMotion ? {} : { y: -4 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </motion.div>
                          <motion.div 
                            className="aspect-[3/4] relative overflow-hidden mt-6 gpu-accelerated" 
                            style={{ backgroundColor: post.imageColor }}
                            whileHover={prefersReducedMotion ? {} : { y: -4 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent" />
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </motion.div>
                          <motion.div 
                            className="aspect-[3/4] relative overflow-hidden gpu-accelerated" 
                            style={{ backgroundColor: '#1f1f2e' }}
                            whileHover={prefersReducedMotion ? {} : { y: -4 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </motion.div>
                        </div>
                        
                        {/* Category tag */}
                        <div className="mt-4">
                          <span 
                            className="font-mono text-[9px] tracking-[0.25em] uppercase bg-[#0a0a0a] px-2 py-1 border border-[#2a2a2a]"
                            style={{ color: post.accentColor }}
                          >
                            {post.category}
                          </span>
                        </div>
                      </div>
                      
                      {/* Right: Title + Desc (25%) */}
                      <div className="lg:col-span-1 flex flex-col justify-center">
                        <motion.span 
                          className="font-mono text-[9px] tracking-[0.25em] text-tertiary uppercase mb-3"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 }}
                        >
                          {post.date}
                        </motion.span>
                        <h3 
                          className="font-display text-lg md:text-xl text-primary uppercase leading-[1.15] mb-4 break-words"
                        >
                          <LetterReveal 
                            text={post.title} 
                            isInView={true} 
                            delay={0.1}
                            isHovered={hoveredPost === post.slug}
                            accentColor={post.accentColor}
                          />
                        </h3>
                        <p className="font-sans text-sm text-secondary leading-relaxed mb-4">
                          {post.subtitle}
                        </p>
                        <motion.span 
                          className="font-mono text-[10px] tracking-[0.2em] text-tertiary uppercase flex items-center gap-2 cursor-pointer group/link"
                          whileHover="hover"
                          initial="rest"
                        >
                          {'READ MORE'.split('').map((letter, i) => (
                            <motion.span 
                              key={i}
                              className="inline-block will-change-transform"
                              variants={{
                                rest: { y: 0 },
                                hover: { 
                                  y: -2,
                                  transition: { delay: i * 0.02, duration: 0.15 }
                                }
                              }}
                              style={{ color: hoveredPost === post.slug ? post.accentColor : undefined }}
                            >
                              {letter === ' ' ? '\u00A0' : letter}
                            </motion.span>
                          ))}
                          <motion.div
                            variants={{
                              rest: { x: 0, y: 0 },
                              hover: { x: 1.5, y: -1.5 }
                            }}
                            transition={{ duration: 0.15 }}
                          >
                            <ArrowUpRight 
                              className="w-3 h-3 transition-colors duration-200" 
                              style={{ color: hoveredPost === post.slug ? post.accentColor : undefined }}
                            />
                          </motion.div>
                        </motion.span>
                      </div>
                    </div>
                  )}
                </Link>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 md:px-12 lg:px-20 py-20 border-t border-[#2a2a2a]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 max-w-6xl mx-auto"
        >
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] tracking-[0.3em] text-tertiary uppercase">
              HAVE AN IDEA?
            </span>
            <p className="font-sans text-sm text-secondary max-w-md leading-relaxed">
              Thoughts, collaborations, or just want to say hello? I&apos;m always open to meaningful conversations.
            </p>
          </div>
          
          <Link
            href="/contact"
            className="group flex items-center gap-4"
            onMouseEnter={() => setCursorState('magnetic')}
            onMouseLeave={() => setCursorState('default')}
          >
            <span className="font-mono text-sm tracking-[0.2em] text-primary uppercase group-hover:text-amber-500 transition-colors duration-300">
              GET IN TOUCH
            </span>
            <div className="w-12 h-12 rounded-full border border-tertiary flex items-center justify-center group-hover:border-amber-500 transition-colors duration-300">
              <ArrowUpRight className="w-5 h-5 text-primary group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
            </div>
          </Link>
        </motion.div>
      </section>

      {/* Return Home Footer */}
      <section className="px-6 md:px-12 lg:px-20 py-16 border-t border-[#2a2a2a]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-[1px] bg-[#f59e0b]/30" />
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#8A8A85] uppercase">
              Return
            </span>
          </div>
          
          <Link
            href="/"
            className="group flex items-center gap-4 font-display text-xl md:text-2xl text-[#F2F2F0] uppercase tracking-tight hover:text-[#f59e0b] transition-colors duration-300"
            onMouseEnter={() => setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            <span>Home</span>
            <motion.div
              className="w-10 h-10 rounded-full border border-[#2a2a3a] flex items-center justify-center group-hover:border-[#f59e0b] group-hover:bg-[#f59e0b]/10 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <ArrowUpRight className="w-4 h-4 text-[#F2F2F0] group-hover:text-[#f59e0b] transition-colors" />
            </motion.div>
          </Link>
        </motion.div>
      </section>
    </div>
    </>
  );
}
