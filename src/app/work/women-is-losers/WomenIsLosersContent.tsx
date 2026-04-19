'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef, ReactNode } from 'react';
import { WorkProjectFooter } from '@/components/work/WorkProjectFooter';
import { FilmVideoPlayer } from '@/components/work/FilmVideoPlayer';
import { EnterCinemaButton } from '@/components/work/EnterCinemaButton';
import { AnimatedCounter } from '@/components/micro-animations/AnimatedCounter';
import { ScrambleText } from '@/components/micro-animations/ScrambleText';
import { CornerDraw } from '@/components/micro-animations/CornerDraw';
import { getImageUrl, getVideoUrl } from '@/lib/media';

interface WomenIsLosersContentProps {
  metadata: {
    title: string;
    description?: string;
    year: string;
    role: string;
    category?: string[];
  };
  mainContent: ReactNode;
  approachSections: Array<{ title: string; content: ReactNode; index: number }>;
}

export default function WomenIsLosersContent({
  metadata,
  mainContent,
  approachSections,
}: WomenIsLosersContentProps) {
  // Cinematic 1960s Film Aesthetic - Warm Organic Tones
  const amber = '#C9A86C'; // Warm organic amber
  const warmBrown = '#8B6914'; // Vintage warm brown
  const cream = '#F5F0E1'; // Aged paper cream
  const filmOrange = '#E07B39'; // Kodak film orange
  const deepSepia = '#5D3A1A'; // Deep organic sepia
  const gold = '#D4AF37'; // Oscar gold

  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  // Refs for scroll-triggered animations
  const heroRef = useRef(null);
  const filmRef = useRef(null);
  const timelineRef = useRef(null);
  const festivalRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: '-100px' });
  const filmInView = useInView(filmRef, { once: true, margin: '-100px' });
  const timelineInView = useInView(timelineRef, { once: true, margin: '-100px' });
  const festivalInView = useInView(festivalRef, { once: true, margin: '-100px' });

  // Film reel rotation animation
  const reelAnimation = prefersReducedMotion
    ? {}
    : {
        rotate: [0, 360],
        transition: { duration: 60, repeat: Infinity, ease: 'linear' as const },
      };

  return (
    <article className="min-h-screen bg-[#0f0f0f]">
      {/* Organic Film Grain - More Natural - Reduced on mobile */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] sm:opacity-[0.06] z-50 mix-blend-overlay will-change-transform">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="filmGrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#filmGrain)" />
        </svg>
      </div>

      {/* 35mm Film Sprocket Holes - Realistic Border - Hidden on mobile */}
      <div className="fixed left-6 top-0 bottom-0 w-6 pointer-events-none opacity-30 hidden lg:flex flex-col justify-around py-4 z-40">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="w-4 h-3 bg-[#1a1a1a] rounded-sm border border-[#333] relative overflow-hidden">
            <div className="absolute inset-0.5 bg-[#2a2520] rounded-sm" />
          </div>
        ))}
      </div>
      <div className="fixed right-6 top-0 bottom-0 w-6 pointer-events-none opacity-30 hidden lg:flex flex-col justify-around py-4 z-40">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="w-4 h-3 bg-[#1a1a1a] rounded-sm border border-[#333] relative overflow-hidden">
            <div className="absolute inset-0.5 bg-[#2a2520] rounded-sm" />
          </div>
        ))}
      </div>

      {/* Film Reel Rotation Effect - Subtle */}
      <motion.div
        className="fixed top-20 right-20 w-32 h-32 pointer-events-none opacity-[0.03] z-30 will-change-transform"
        animate={reelAnimation}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke={amber} strokeWidth="0.5" />
          <circle cx="50" cy="50" r="35" fill="none" stroke={amber} strokeWidth="0.5" />
          <circle cx="50" cy="50" r="25" fill="none" stroke={amber} strokeWidth="0.5" />
          <circle cx="50" cy="50" r="8" fill={amber} opacity="0.3" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1="50"
              y1="50"
              x2={50 + 40 * Math.cos((angle * Math.PI) / 180)}
              y2={50 + 40 * Math.sin((angle * Math.PI) / 180)}
              stroke={amber}
              strokeWidth="0.3"
            />
          ))}
        </svg>
      </motion.div>

      {/* Warm Organic Glow - Natural Film Look - Reduced on mobile */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] sm:w-[900px] h-[400px] sm:h-[700px] opacity-[0.08] sm:opacity-[0.12] blur-3xl pointer-events-none will-change-transform"
        style={{
          background: `radial-gradient(ellipse at center, ${filmOrange}30 0%, ${amber}10 40%, transparent 70%)`,
        }}
      />

      {/* Natural Light Leaks - Organic - Reduced on mobile */}
      <div
        className="fixed top-0 left-0 w-[150px] sm:w-[300px] h-[200px] sm:h-[400px] opacity-[0.05] sm:opacity-[0.08] blur-2xl pointer-events-none will-change-transform"
        style={{ background: `radial-gradient(circle at top left, ${filmOrange}, transparent 60%)` }}
      />
      <div
        className="fixed bottom-0 right-0 w-[200px] sm:w-[400px] h-[150px] sm:h-[300px] opacity-[0.03] sm:opacity-[0.05] blur-2xl pointer-events-none will-change-transform"
        style={{ background: `radial-gradient(circle at bottom right, ${amber}, transparent 60%)` }}
      />

      {/* Vintage Vignette - Organic Film Edge */}
      <div
        className="fixed inset-0 pointer-events-none z-30"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(20,15,10,0.5) 100%)',
        }}
      />

      {/* Hero - Organic Cinematic Title Treatment with Film Video Background - Contain paint for performance */}
      <header
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-12 lg:px-24 pt-32 pb-20 overflow-hidden contain-paint"
      >
        {/* Film Video Background - Full Viewport */}
        <div className="absolute inset-0 z-0">
          <FilmVideoPlayer
            webmSrc={getVideoUrl('/work/wil-trailer.webm')}
            mp4Src={getVideoUrl('/work/wil-trailer.mp4')}
            posterSrc={getImageUrl('/work/wil-poster.webp', 1920, { format: 'webp' })}
            className="w-full h-full"
          />
        </div>

        {/* Warm organic glow from below - natural film lighting - Reduced on mobile */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[800px] h-[300px] sm:h-[500px] opacity-[0.1] sm:opacity-[0.15] blur-3xl pointer-events-none z-[1] will-change-transform"
          style={{ background: `radial-gradient(ellipse at bottom, ${amber}40 0%, transparent 60%)` }}
        />

        {/* Dark gradient overlay for text readability */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, 
              rgba(15,10,8,0.7) 0%, 
              rgba(15,10,8,0.4) 40%, 
              rgba(15,10,8,0.5) 60%, 
              rgba(15,10,8,0.8) 100%)`,
          }}
        />

        <motion.div
          className="relative z-10 max-w-5xl mx-auto text-center"
          initial="hidden"
          animate={heroInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* Festival Badges - SXSW & HBO Max - Mobile-optimized */}
          <motion.div className="flex justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 flex-wrap" variants={fadeInUp}>
            {/* SXSW Laurel Badge */}
            <motion.div
              className="inline-flex flex-col items-center px-3 sm:px-6 py-2 sm:py-3 border-2 rounded-lg will-change-transform"
              style={{ borderColor: `${gold}50`, backgroundColor: `${gold}08` }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02, borderColor: gold }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.3em] sm:tracking-[0.4em] uppercase" style={{ color: gold }}>
                <ScrambleText text="Official Selection" enabled={heroInView} delay={300} speed={50} />
              </span>
              <span className="font-display text-sm sm:text-lg uppercase tracking-wider mt-1" style={{ color: amber }}>
                SXSW <AnimatedCounter value={2021} enabled={heroInView} duration={1500} />
              </span>
            </motion.div>

            {/* HBO Max Badge */}
            <motion.div
              className="inline-flex flex-col items-center px-3 sm:px-6 py-2 sm:py-3 border-2 rounded-lg will-change-transform"
              style={{ borderColor: `${filmOrange}50`, backgroundColor: `${filmOrange}08` }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02, borderColor: filmOrange }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.3em] uppercase" style={{ color: filmOrange }}>
                <ScrambleText text="Now Streaming On" enabled={heroInView} delay={500} speed={50} />
              </span>
              <span className="font-display text-sm sm:text-lg uppercase tracking-wider mt-1" style={{ color: cream }}>
                HBO MAX
              </span>
            </motion.div>
          </motion.div>

          {/* Year & Category - Mobile-safe */}
          <motion.div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8" variants={fadeIn}>
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase" style={{ color: amber }}>
              {metadata.year}
            </span>
            <motion.div
              className="w-8 sm:w-12 h-[1px]"
              style={{ backgroundColor: amber }}
              initial={{ scaleX: 0 }}
              animate={heroInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[#666]">
              {metadata.category?.[1] || metadata.category?.[0]}
            </span>
          </motion.div>

          {/* Title - Cinematic Style - Mobile-safe typography */}
          <motion.div className="space-y-1 sm:space-y-2 mb-6 sm:mb-12" variants={fadeInUp}>
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[clamp(3rem,10vw,8rem)] text-[#F2F2F0] uppercase leading-[0.9] sm:leading-[0.85] tracking-tight">
              WOMEN IS
            </h1>
            <h2
              className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[clamp(3rem,10vw,8rem)] uppercase leading-[0.9] sm:leading-[0.85] tracking-tight"
              style={{ color: filmOrange }}
            >
              LOSERS
            </h2>
          </motion.div>

          {/* Tagline - Mobile-safe */}
          <motion.p
            className="font-sans text-sm sm:text-lg md:text-xl uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#A3A3A3] max-w-2xl mx-auto mb-8 sm:mb-12 leading-[1.6] sm:leading-[1.8] px-2 sm:px-0"
            variants={fadeInUp}
          >
            A powerful story of resilience set against the backdrop of 1960s San Francisco
          </motion.p>

          {/* Role Badge - Film Canister Style */}
          <motion.div className="flex justify-center" variants={fadeInUp}>
            <motion.div
              className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full border will-change-transform"
              style={{
                borderColor: `${deepSepia}60`,
                backgroundColor: `rgba(20,15,10,0.8)`,
              }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                style={{ backgroundColor: filmOrange }}
                animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] uppercase" style={{ color: cream }}>
                {metadata.role}
              </span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enter Cinema Button - Bottom Left */}
        <EnterCinemaButton />

        {/* Bottom Info Bar - Film Slate Style - Mobile-optimized */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 md:px-12 lg:px-24 py-4 sm:py-8 border-t border-[#222]"
          initial={{ y: 50, opacity: 0 }}
          animate={heroInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <div className="text-center">
              <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.3em] text-[#666] uppercase block mb-1">
                Setting
              </span>
              <span className="font-display text-sm sm:text-base text-[#F2F2F0] uppercase tracking-wide">1960s San Francisco</span>
            </div>
            <div className="w-[1px] h-6 sm:h-8 bg-[#333]" />
            <div className="text-center">
              <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.3em] text-[#666] uppercase block mb-1">
                Format
              </span>
              <span className="font-display text-sm sm:text-base text-[#F2F2F0] uppercase tracking-wide">Feature Film</span>
            </div>
            <div className="w-[1px] h-6 sm:h-8 bg-[#333]" />
            <div className="text-center">
              <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.3em] text-[#666] uppercase block mb-1">
                Distribution
              </span>
              <span className="font-display text-sm sm:text-base" style={{ color: filmOrange }}>
                HBO Max
              </span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Main Content - Two Column with Film Still - Content visibility for performance */}
      <section ref={filmRef} className="relative px-4 sm:px-6 md:px-12 lg:px-24 py-16 sm:py-24 md:py-32 content-visibility-auto">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="hidden"
          animate={filmInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
            {/* Left: Content */}
            <motion.div variants={fadeInUp}>
              {/* Section header */}
              <motion.div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-12" variants={slideInLeft}>
                <motion.div
                  className="w-12 sm:w-16 h-[2px]"
                  style={{ backgroundColor: amber }}
                  initial={{ scaleX: 0 }}
                  animate={filmInView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
                <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase" style={{ color: amber }}>
                  <ScrambleText text="The Film" enabled={filmInView} delay={400} speed={40} />
                </span>
              </motion.div>

              <div className="prose prose-invert prose-lg max-w-none">
                <div className="font-sans text-base sm:text-lg md:text-xl uppercase tracking-wide leading-[1.7] sm:leading-[1.9] text-[#A3A3A3]">
                  {mainContent}
                </div>
              </div>
            </motion.div>

            {/* Right: Film Still Placeholder */}
            <motion.div variants={fadeInUp}>
              {/* Film frame container */}
              <motion.div
                className="relative aspect-[3/4] bg-[#1a1a1a] overflow-hidden will-change-transform"
                style={{
                  boxShadow: `0 0 40px sm:80px ${filmOrange}15, 0 10px sm:20px 30px sm:60px rgba(0,0,0,0.5)`,
                }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
                transition={{ duration: 0.4 }}
              >
                {/* Film sprocket holes - more organic */}
                <div className="absolute left-1 sm:left-2 top-0 bottom-0 w-3 sm:w-4 flex flex-col justify-around py-2 sm:py-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="w-2 sm:w-3 h-1.5 sm:h-2 bg-[#2a2520] rounded-sm border border-[#3a3530]" />
                  ))}
                </div>
                <div className="absolute right-1 sm:right-2 top-0 bottom-0 w-3 sm:w-4 flex flex-col justify-around py-2 sm:py-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="w-2 sm:w-3 h-1.5 sm:h-2 bg-[#2a2520] rounded-sm border border-[#3a3530]" />
                  ))}
                </div>

                {/* Film poster image */}
                <div className="absolute inset-4 sm:inset-8 overflow-hidden bg-[#151210]">
                  <picture>
                    <source srcSet={getImageUrl('/work/wil-poster.webp', 1200, { format: 'webp' })} type="image/webp" />
                    <img
                      src={getImageUrl('/work/wil-poster.jpg', 1200, { format: 'jpg' })}
                      alt="Women Is Losers Film Poster"
                      className="w-full h-full object-cover"
                      style={{
                        filter: 'sepia(15%) contrast(1.05) brightness(0.95)',
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </div>

                {/* Frame number */}
                <div className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 font-mono text-[7px] sm:text-[8px] text-[#555] tracking-wider">
                  24fps | FRAME 001 | KODAK 35mm
                </div>
              </motion.div>

              {/* Decorative film curl - organic */}
              <div
                className="absolute -bottom-2 sm:-bottom-4 left-4 sm:left-8 right-4 sm:right-8 h-4 sm:h-8 opacity-30 sm:opacity-40"
                style={{
                  background: `linear-gradient(to bottom, ${filmOrange}30, transparent)`,
                  filter: 'blur(4px)',
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Three Pillars - Film Reel Style - Content visibility for performance */}
      <section ref={timelineRef} className="relative px-4 sm:px-6 md:px-12 lg:px-24 py-16 sm:py-24 md:py-32 bg-[#0a0a0a] content-visibility-auto">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="hidden"
          animate={timelineInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* Section header - Mobile-safe */}
          <motion.div className="flex items-center justify-center gap-2 sm:gap-6 mb-12 sm:mb-20" variants={fadeIn}>
            <motion.div
              className="h-[1px] w-12 sm:w-24"
              style={{ backgroundColor: deepSepia }}
              initial={{ scaleX: 0 }}
              animate={timelineInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase" style={{ color: filmOrange }}>
              <ScrambleText text="Production" enabled={timelineInView} delay={300} speed={40} />
            </span>
            <span className="font-display text-xl sm:text-3xl text-[#F2F2F0] uppercase">Timeline</span>
            <motion.div
              className="h-[1px] w-12 sm:w-24"
              style={{ backgroundColor: deepSepia }}
              initial={{ scaleX: 0 }}
              animate={timelineInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </motion.div>

          {/* Horizontal timeline - film strip style */}
          <div className="relative">
            {/* Film strip line - more organic - Hidden on mobile */}
            <div className="absolute top-16 sm:top-24 left-0 right-0 h-6 sm:h-8 bg-[#1a1510] hidden lg:block border-y border-[#2a2520]">
              <div className="absolute left-0 top-1 bottom-1 w-2 sm:w-3 flex flex-col justify-around">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-1.5 sm:w-2 h-0.5 sm:h-1 bg-[#3a3530] rounded-sm" />
                ))}
              </div>
              <div className="absolute right-0 top-1 bottom-1 w-2 sm:w-3 flex flex-col justify-around">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-1.5 sm:w-2 h-0.5 sm:h-1 bg-[#3a3530] rounded-sm" />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-8">
              {approachSections.map((approach, index) => (
                <motion.div key={approach.title} className="relative group" variants={fadeInUp}>
                  {/* Film reel node - Hidden on mobile */}
                  <div className="hidden lg:flex absolute top-0 left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      className="w-14 sm:w-20 h-14 sm:h-20 rounded-full border-4 flex items-center justify-center relative will-change-transform"
                      style={{
                        borderColor: index === 0 ? filmOrange : index === 1 ? deepSepia : gold,
                        backgroundColor: '#0f0a0a',
                      }}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.05, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Reel holes */}
                      <div className="absolute inset-2 rounded-full border border-[#3a3530]" />
                      <div className="absolute top-1.5 sm:top-2 left-1/2 -translate-x-1/2 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#3a3530]" />
                      <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#3a3530]" />
                      <div className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#3a3530]" />
                      <div className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#3a3530]" />
                      <span className="font-display text-lg sm:text-xl text-[#F2F2F0] relative z-10">0{index + 1}</span>
                    </motion.div>
                  </div>

                  {/* Mobile indicator */}
                  <div className="lg:hidden mb-4 sm:mb-6">
                    <motion.div
                      className="w-12 sm:w-16 h-12 sm:h-16 rounded-full border-4 flex items-center justify-center will-change-transform"
                      style={{
                        borderColor: filmOrange,
                        backgroundColor: '#0f0a0a',
                      }}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="font-display text-lg sm:text-xl text-[#F2F2F0]">0{index + 1}</span>
                    </motion.div>
                  </div>

                  {/* Content card */}
                  <motion.div
                    className="lg:mt-24 sm:lg:mt-32 p-4 sm:p-8 border border-[#2a2520] bg-[#0f0f0f] will-change-transform"
                    whileHover={prefersReducedMotion ? {} : { borderColor: '#3a3530', y: -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3
                      className="font-display text-lg sm:text-2xl uppercase tracking-tight mb-3 sm:mb-6 leading-[1.2]"
                      style={{ color: index === 0 ? filmOrange : index === 1 ? deepSepia : amber }}
                    >
                      {approach.title}
                    </h3>
                    <div className="font-sans text-xs sm:text-sm uppercase tracking-wide leading-[1.7] sm:leading-[1.9] text-[#A3A3A3]">
                      {approach.content}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Festival Recognition - Theater Marquee Style - Content visibility for performance */}
      <section ref={festivalRef} className="relative px-4 sm:px-6 md:px-12 lg:px-24 py-16 sm:py-24 content-visibility-auto">
        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          animate={festivalInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* Marquee header */}
          <motion.div
            className="relative p-4 sm:p-8 mb-6 sm:mb-12 border-2 will-change-transform"
            style={{
              borderColor: `${deepSepia}50`,
              backgroundColor: `rgba(15,10,8,0.8)`,
            }}
            variants={scaleIn}
            whileHover={prefersReducedMotion ? {} : { borderColor: `${deepSepia}70` }}
            transition={{ duration: 0.3 }}
          >
            {/* Light bulbs effect corners */}
            <motion.div
              className="absolute -top-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 rounded-full"
              style={{ backgroundColor: filmOrange }}
              animate={prefersReducedMotion ? {} : { opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute -top-1 -right-1 w-2 sm:w-3 h-2 sm:h-3 rounded-full"
              style={{ backgroundColor: filmOrange }}
              animate={prefersReducedMotion ? {} : { opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
            <motion.div
              className="absolute -bottom-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 rounded-full"
              style={{ backgroundColor: filmOrange }}
              animate={prefersReducedMotion ? {} : { opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            />
            <motion.div
              className="absolute -bottom-1 -right-1 w-2 sm:w-3 h-2 sm:h-3 rounded-full"
              style={{ backgroundColor: filmOrange }}
              animate={prefersReducedMotion ? {} : { opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
            />

            <div className="text-center">
              <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] uppercase" style={{ color: filmOrange }}>
                <ScrambleText text="Festival Recognition & Distribution" enabled={festivalInView} delay={200} speed={45} />
              </span>
              <h3 className="font-display text-xl sm:text-3xl md:text-4xl text-[#F2F2F0] uppercase mt-2 sm:mt-4 tracking-tight leading-[1.1]">
                Critical Acclaim
              </h3>
            </div>
          </motion.div>

          {/* Accolades grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
            {[
              { label: 'SXSW', sub: 'Official Selection 2021', color: filmOrange },
              { label: 'HBO', sub: 'Max Streaming', color: gold },
              { label: '★★★★', sub: 'Critical Reception', color: amber },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="p-4 sm:p-6 border border-[#2a2520] text-center bg-[#0f0a0a] will-change-transform"
                initial={{ opacity: 0, y: 20 }}
                animate={festivalInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={prefersReducedMotion ? {} : { borderColor: '#3a3530', y: -2 }}
              >
                <span className="font-display text-3xl sm:text-5xl block mb-1 sm:mb-2" style={{ color: item.color }}>
                  {item.label}
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[#666]">
                  {item.sub}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Project Footer */}
      <WorkProjectFooter currentSlug="women-is-losers" />
    </article>
  );
}
