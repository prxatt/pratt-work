'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef, ReactNode, useState, useMemo } from 'react';
import { WorkProjectFooter } from '@/components/work/WorkProjectFooter';
import { AnimatedCounter } from '@/components/micro-animations/AnimatedCounter';
import { ScrambleText } from '@/components/micro-animations/ScrambleText';
import { CornerDraw } from '@/components/micro-animations/CornerDraw';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import Image from 'next/image';
import { getImageUrl, getVideoUrl } from '@/lib/media';

interface WeightsBiasesContentProps {
  metadata: {
    title: string;
    description?: string;
    year: string;
    client: string;
    role: string;
    category?: string[];
  };
  content: string;
  mainContentMdx: ReactNode;
  approachMdx: ReactNode[];
  approachSections: Array<{ title: string; index: number }>;
}

export default function WeightsBiasesContent({
  metadata,
  content,
  mainContentMdx,
  approachMdx,
  approachSections,
}: WeightsBiasesContentProps) {
  const [hoveredFrame, setHoveredFrame] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // W&B Brand colors - amber/gold palette
  const accentColor = '#F59E0B'; // Amber-500
  const accentSecondary = '#D97706'; // Amber-600

  // Stats with numeric values for counter animation
  const stats = useMemo(() => [
    { value: 5000, prefix: '', suffix: '', label: 'Attendees', displayValue: '5,000' },
    { value: 3, prefix: '', suffix: '', label: 'Week Timeline', displayValue: '3' },
    { value: 1, prefix: '', suffix: 'st', label: 'MLOps Conference', displayValue: '1st' },
  ], []);

  // Refs for scroll-triggered animations
  const heroRef = useRef(null);
  const manifestoRef = useRef(null);
  const photosRef = useRef(null);
  const processRef = useRef(null);
  const videoRef = useRef(null);

  // InView states
  const heroInView = useInView(heroRef, { once: true, margin: '-100px' });
  const manifestoInView = useInView(manifestoRef, { once: true, margin: '-100px' });
  const photosInView = useInView(photosRef, { once: true, margin: '-100px' });
  const processInView = useInView(processRef, { once: true, margin: '-100px' });
  const videoInView = useInView(videoRef, { once: true, margin: '-100px' });

  // Animation variants - memoized for performance
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: prefersReducedMotion ? 0 : 0.2,
      },
    },
  }), [prefersReducedMotion]);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  }), [prefersReducedMotion]);

  const slideInLeft = useMemo(() => ({
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  }), [prefersReducedMotion]);

  const slideInRight = useMemo(() => ({
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  }), [prefersReducedMotion]);

  const fadeInUp = useMemo(() => ({
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  }), [prefersReducedMotion]);

  const scaleIn = useMemo(() => ({
    hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  }), [prefersReducedMotion]);

  // Neural pulse animation for nodes
  const pulseVariants = useMemo(() => ({
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  }), []);

  return (
    <article className="min-h-screen bg-[#0a0a0a]">
      {/* Neural Network Grid Background - Optimized */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${accentColor} 1px, transparent 1px),
              linear-gradient(to bottom, ${accentColor} 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        />
        {/* Glowing nodes - neural network metaphor */}
        {!prefersReducedMotion && (
          <>
            <motion.div
              className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-amber-500/20 blur-sm"
              variants={pulseVariants}
              animate="pulse"
            />
            <motion.div
              className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-amber-500/10 blur-md"
              variants={pulseVariants}
              animate="pulse"
              style={{ animationDelay: '0.5s' }}
            />
            <motion.div
              className="absolute bottom-1/4 left-1/2 w-2 h-2 rounded-full bg-amber-500/15 blur-sm"
              variants={pulseVariants}
              animate="pulse"
              style={{ animationDelay: '1s' }}
            />
            <motion.div
              className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-amber-500/10 blur-sm"
              variants={pulseVariants}
              animate="pulse"
              style={{ animationDelay: '1.5s' }}
            />
          </>
        )}
        {/* Connection lines - subtle, GPU accelerated */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
        >
          <line x1="25%" y1="25%" x2="33%" y2="33%" stroke={accentColor} strokeWidth="1" />
          <line x1="33%" y1="33%" x2="50%" y2="75%" stroke={accentColor} strokeWidth="1" />
          <line x1="50%" y1="75%" x2="75%" y2="50%" stroke={accentColor} strokeWidth="1" />
        </svg>
      </div>

      {/* Hero Section */}
      <header ref={heroRef} className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 pt-32 pb-20">
        {/* Gradient orb - data glow */}
        <motion.div
          className="absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full opacity-[0.08] blur-3xl pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={heroInView ? { opacity: 0.08, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: prefersReducedMotion ? 0 : 1.2, ease: 'easeOut' }}
        />

        <motion.div
          className="relative z-10 max-w-7xl"
          initial="hidden"
          animate={heroInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* Top meta line */}
          <motion.div className="flex items-center gap-4 mb-12" variants={slideInLeft}>
            <motion.div
              className="w-12 h-[2px]"
              style={{ backgroundColor: accentColor }}
              initial={{ scaleX: 0 }}
              animate={heroInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.3 }}
            />
            <span className="font-mono text-[11px] tracking-[0.3em] uppercase" style={{ color: accentColor }}>
              <ScrambleText
                text={`${metadata.year} — ${metadata.category?.[0] || 'AI + TECH'}`}
                enabled={heroInView}
                delay={400}
                speed={35}
              />
            </span>
          </motion.div>

          {/* Main Title - Responsive without mid-word cut-off */}
          <motion.div className="space-y-2 mb-12" variants={fadeInUp}>
            {/* WEIGHTS & BIASES - scales responsively */}
            <h1 className="font-display text-[clamp(1.75rem,5.5vw,4rem)] text-[#F2F2F0] uppercase leading-[0.95] tracking-tight">
              WEIGHTS & BIASES
            </h1>
            {/* FULLY CONNECTED - gradient text */}
            <motion.h2
              className="font-display text-[clamp(2.5rem,8vw,6.5rem)] uppercase leading-[0.9] tracking-tight"
              style={{
                background: `linear-gradient(135deg, ${accentColor} 0%, ${accentSecondary} 50%, ${accentColor} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.2 }}
            >
              FULLY CONNECTED
            </motion.h2>
            {/* USER CONFERENCE - smaller subtitle */}
            <h3 className="font-display text-[clamp(1.25rem,3.5vw,2rem)] text-[#A3A3A3] uppercase tracking-widest mt-4">
              USER CONFERENCE
            </h3>
          </motion.div>

          {/* Role tag - developer focused */}
          <motion.div
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded border mb-16"
            style={{
              borderColor: `${accentColor}40`,
              backgroundColor: `${accentColor}08`,
            }}
            variants={itemVariants}
            whileHover={{ borderColor: `${accentColor}60`, backgroundColor: `${accentColor}12` }}
            transition={{ duration: 0.2 }}
          >
            <motion.span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: accentColor }}
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1],
                    }
              }
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: accentColor }}>
              <ScrambleText text={metadata.role} enabled={heroInView} delay={600} speed={40} />
            </span>
          </motion.div>

          {/* Stats Grid - Technical/Data aesthetic with animated counters */}
          <motion.div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl" variants={containerVariants}>
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                className="relative min-w-0"
                variants={scaleIn}
                custom={i}
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.3 + i * 0.15, duration: prefersReducedMotion ? 0 : 0.5 }}
              >
                <div
                  className="absolute -left-4 top-0 bottom-0 w-[2px] hidden md:block"
                  style={{ backgroundColor: `${accentColor}30` }}
                />
                <span
                  className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl block mb-2"
                  style={{
                    background: `linear-gradient(180deg, #F2F2F0 0%, ${accentColor} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={0}
                    duration={2000}
                    enabled={heroInView}
                  />
                </span>
                <span className="font-mono text-[9px] md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] text-[#666] uppercase block">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom info bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 px-6 md:px-12 lg:px-20 py-8 border-t border-[#262626]"
          initial={{ y: 50, opacity: 0 }}
          animate={heroInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.8 }}
        >
          <div className="flex flex-wrap items-center gap-6 md:gap-12">
            <div className="min-w-0">
              <span className="font-mono text-[9px] tracking-[0.3em] text-[#666] uppercase block mb-1">
                Client
              </span>
              <span className="font-display text-base md:text-lg text-[#F2F2F0] uppercase tracking-wide block truncate">
                {metadata.client}
              </span>
            </div>
            <div className="min-w-0">
              <span className="font-mono text-[9px] tracking-[0.3em] text-[#666] uppercase block mb-1">
                Focus
              </span>
              <span className="font-display text-base md:text-lg text-[#F2F2F0] uppercase tracking-wide block truncate">
                MLOps / LLMs
              </span>
            </div>
            <div className="min-w-0 hidden sm:block">
              <span className="font-mono text-[9px] tracking-[0.3em] text-[#666] uppercase block mb-1">
                Category
              </span>
              <span className="font-display text-base md:text-lg text-[#F2F2F0] uppercase tracking-wide block truncate">
                AI Conference
              </span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Main Content - Engineering Manifesto */}
      <section ref={manifestoRef} className="relative px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          animate={manifestoInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* Section header */}
          <motion.div className="flex items-center gap-4 mb-12" variants={slideInLeft}>
            <motion.span
              className="font-mono text-[10px] tracking-[0.3em] uppercase"
              style={{ color: accentColor }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={manifestoInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
            >
              Manifesto
            </motion.span>
            <motion.div
              className="flex-1 h-[1px] bg-[#262626] origin-left"
              initial={{ scaleX: 0 }}
              animate={manifestoInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.2 }}
            />
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#666] uppercase">
              <ScrambleText text="001" enabled={manifestoInView} delay={300} speed={50} />
            </span>
          </motion.div>

          {/* Content - engineering focused, uppercase, technical */}
          <motion.div className="prose prose-invert prose-lg max-w-none" variants={fadeInUp}>
            <div className="font-sans text-base md:text-lg lg:text-xl uppercase tracking-wide leading-[1.8] md:leading-[1.9] text-[#A3A3A3]">
              {mainContentMdx}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Photo Grid - Event Documentation */}
      <section ref={photosRef} className="relative px-6 md:px-12 lg:px-20 py-16">
        <motion.div
          className="max-w-7xl mx-auto"
          initial="hidden"
          animate={photosInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* Section header */}
          <motion.div className="flex items-center gap-4 mb-12" variants={slideInLeft}>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: accentColor }}>
              <ScrambleText text="Documentation" enabled={photosInView} delay={200} speed={40} />
            </span>
            <motion.div
              className="flex-1 h-[1px] bg-[#262626] origin-left"
              initial={{ scaleX: 0 }}
              animate={photosInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.3 }}
            />
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#666] uppercase">002</span>
          </motion.div>

          {/* Asymmetric Grid - referencing the images */}
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            {/* Large frame - crowd/atmosphere */}
            <motion.div
              className="col-span-12 lg:col-span-8"
              variants={fadeInUp}
            >
              <motion.div
                className="relative aspect-[16/9] bg-[#141414] overflow-hidden group cursor-pointer touch-manipulation"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)',
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                }}
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.01 }}
                transition={{ duration: 0.3 }}
                onHoverStart={() => setHoveredFrame(0)}
                onHoverEnd={() => setHoveredFrame(null)}
                onTap={() => setHoveredFrame(prev => prev === 0 ? null : 0)}
              >
                {/* Corner accents with animated draw */}
                <div className="hidden sm:block">
                  <CornerDraw color={accentColor} size={24} strokeWidth={2} isHovered={hoveredFrame === 0} />
                </div>
                {/* Static corner accents for mobile */}
                <div className="absolute top-0 left-0 w-12 h-[2px] z-10 sm:hidden" style={{ backgroundColor: accentColor }} />
                <div className="absolute top-0 left-0 w-[2px] h-12 z-10 sm:hidden" style={{ backgroundColor: accentColor }} />

                <motion.div
                  className="absolute inset-0"
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                  transition={{ duration: 0.4 }}
                >
                  <picture>
                    <source srcSet={getImageUrl('/work/conference-wb.webp', 1600, { format: 'webp' })} type="image/webp" />
                    <Image
                      src={getImageUrl('/work/conference-wb.jpg', 1600, { format: 'jpg' })}
                      alt="Conference atmosphere at Weights & Biases Fully Connected"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      priority
                      loading="eager"
                    />
                  </picture>
                </motion.div>

                {/* Data/code overlay decoration */}
                <div className="absolute bottom-4 left-4 font-mono text-[8px] text-white/40 tracking-wider z-10">
                  ATTENDEES: 5000
                </div>
              </motion.div>
            </motion.div>

            {/* Side frames stack */}
            <div className="col-span-12 lg:col-span-4 space-y-4 md:space-y-6">
              {/* Frame 2 - stage/keynote */}
              <motion.div
                variants={slideInRight}
                transition={{ delay: prefersReducedMotion ? 0 : 0.2 }}
              >
                <motion.div
                  className="relative aspect-[4/3] bg-[#141414] overflow-hidden group cursor-pointer touch-manipulation"
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)',
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                  }}
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.01 }}
                  transition={{ duration: 0.3 }}
                  onHoverStart={() => setHoveredFrame(1)}
                  onHoverEnd={() => setHoveredFrame(null)}
                  onTap={() => setHoveredFrame(prev => prev === 1 ? null : 1)}
                >
                  <div className="hidden sm:block">
                    <CornerDraw color={accentColor} size={16} strokeWidth={1} isHovered={hoveredFrame === 1} />
                  </div>
                  <div className="absolute top-0 left-0 w-8 h-[2px] z-10 sm:hidden" style={{ backgroundColor: `${accentColor}60` }} />
                  <div className="absolute top-0 left-0 w-[2px] h-8 z-10 sm:hidden" style={{ backgroundColor: `${accentColor}60` }} />

                  <motion.div
                    className="absolute inset-0"
                    whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                    transition={{ duration: 0.4 }}
                  >
                    <picture>
                      <source srcSet={getImageUrl('/work/keynote-wb.webp', 1200, { format: 'webp' })} type="image/webp" />
                      <Image
                        src={getImageUrl('/work/keynote-wb.jpg', 1200, { format: 'jpg' })}
                        alt="Keynote stage at Weights & Biases Fully Connected"
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        loading="lazy"
                      />
                    </picture>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Frame 3 - LLM/Weave announcement */}
              <motion.div
                variants={slideInRight}
                transition={{ delay: prefersReducedMotion ? 0 : 0.35 }}
              >
                <motion.div
                  className="relative aspect-[4/3] bg-[#141414] overflow-hidden group cursor-pointer touch-manipulation"
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)',
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                  }}
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.01 }}
                  transition={{ duration: 0.3 }}
                  onHoverStart={() => setHoveredFrame(2)}
                  onHoverEnd={() => setHoveredFrame(null)}
                  onTap={() => setHoveredFrame(prev => prev === 2 ? null : 2)}
                >
                  <div className="hidden sm:block">
                    <CornerDraw color={accentColor} size={16} strokeWidth={1} isHovered={hoveredFrame === 2} />
                  </div>
                  <div className="absolute top-0 left-0 w-8 h-[2px] z-10 sm:hidden" style={{ backgroundColor: `${accentColor}60` }} />
                  <div className="absolute top-0 left-0 w-[2px] h-8 z-10 sm:hidden" style={{ backgroundColor: `${accentColor}60` }} />

                  <motion.div
                    className="absolute inset-0"
                    whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                    transition={{ duration: 0.4 }}
                  >
                    <picture>
                      <source srcSet={getImageUrl('/work/weave-wb.webp', 1200, { format: 'webp' })} type="image/webp" />
                      <Image
                        src={getImageUrl('/work/weave-wb.jpg', 1200, { format: 'jpg' })}
                        alt="Weave launch at Weights & Biases Fully Connected"
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        style={{ objectPosition: 'left center' }}
                        loading="lazy"
                      />
                    </picture>
                  </motion.div>

                  {/* Building LLM-Powered Applications reference */}
                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    <span className="font-mono text-[8px] text-white/40 uppercase tracking-wider">
                      LLM-POWERED APPS
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Three Pillars - Challenge, Execution, Impact */}
      <section ref={processRef} className="relative px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-[#0a0a0a]">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="hidden"
          animate={processInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* Section header */}
          <motion.div className="flex items-center gap-4 md:gap-6 mb-16 md:mb-20" variants={slideInLeft}>
            <motion.div
              className="h-[1px] flex-1 bg-[#262626] origin-right"
              initial={{ scaleX: 0 }}
              animate={processInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
            />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: accentColor }}>
              <ScrambleText text="Process" enabled={processInView} delay={200} speed={40} />
            </span>
            <span className="font-display text-2xl md:text-3xl lg:text-4xl text-[#F2F2F0] uppercase">
              Execution Log
            </span>
            <motion.div
              className="h-[1px] flex-1 bg-[#262626] origin-left"
              initial={{ scaleX: 0 }}
              animate={processInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
            />
          </motion.div>

          {/* Timeline with neural network nodes */}
          <div className="relative">
            {/* Vertical connection line - hidden on mobile */}
            <motion.div
              className="absolute left-8 md:left-16 top-0 bottom-0 w-[2px] hidden md:block origin-top"
              style={{
                background: `linear-gradient(to bottom, ${accentColor}40, ${accentSecondary}40, ${accentColor}40)`,
              }}
              initial={{ scaleY: 0 }}
              animate={processInView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 1.2, delay: 0.3 }}
            />

            <div className="space-y-12 md:space-y-16">
              {approachSections.map((approach, index) => (
                <motion.div
                  key={approach.title}
                  className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-16"
                  variants={fadeInUp}
                  custom={index}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 40 }}
                  animate={processInView ? { opacity: 1, y: 0 } : { opacity: 0, y: prefersReducedMotion ? 0 : 40 }}
                  transition={{ delay: prefersReducedMotion ? 0 : 0.2 + index * 0.15, duration: prefersReducedMotion ? 0 : 0.5 }}
                >
                  {/* Node - neural network style */}
                  <div className="flex-shrink-0 w-16 md:w-32 flex justify-center">
                    <motion.div
                      className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center bg-[#0a0a0a] relative"
                      style={{ borderColor: `${accentColor}60` }}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.1, borderColor: accentColor }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Inner glow with pulse */}
                      <motion.div
                        className="absolute inset-1 rounded-full opacity-20"
                        style={{ backgroundColor: accentColor }}
                        animate={
                          prefersReducedMotion
                            ? {}
                            : {
                                opacity: [0.2, 0.4, 0.2],
                                scale: [1, 1.05, 1],
                              }
                        }
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                      />
                      <span className="font-display text-xl md:text-2xl text-[#F2F2F0] relative z-10">
                        0{index + 1}
                      </span>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-0 md:pt-2 min-w-0">
                    <motion.h3
                      className="font-display text-2xl md:text-3xl lg:text-4xl uppercase tracking-tight mb-4 md:mb-6"
                      style={{ color: accentColor }}
                      initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }}
                      animate={processInView ? { opacity: 1, x: 0 } : { opacity: 0, x: prefersReducedMotion ? 0 : -20 }}
                      transition={{ delay: prefersReducedMotion ? 0 : 0.3 + index * 0.15, duration: prefersReducedMotion ? 0 : 0.4 }}
                    >
                      <ScrambleText text={approach.title} enabled={processInView} delay={400 + index * 150} speed={40} />
                    </motion.h3>
                    <div className="prose prose-invert prose-sm max-w-none uppercase tracking-wide leading-[1.7] md:leading-[1.8] text-[#A3A3A3]">
                      {approachMdx[approach.index]}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Video Frame - Documentation */}
      <section ref={videoRef} className="relative px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="hidden"
          animate={videoInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* Section header */}
          <motion.div className="flex items-center gap-4 mb-8 md:mb-12" variants={slideInLeft}>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: accentColor }}>
              <ScrambleText text="Recording" enabled={videoInView} delay={200} speed={40} />
            </span>
            <motion.div
              className="flex-1 h-[1px] bg-[#262626] origin-left"
              initial={{ scaleX: 0 }}
              animate={videoInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.2 }}
            />
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#666] uppercase">003</span>
          </motion.div>

          <motion.div variants={scaleIn}>
            <VideoPlayer
              webmSrc={getVideoUrl('/work/wb-teaser.webm')}
              mp4Src={getVideoUrl('/work/wb-teaser.mp4')}
              poster={getImageUrl('/work/conference-wb.jpg', 1600, { format: 'jpg' })}
              accentColor={accentColor}
              title="Conference Recap"
              subtitle="YOUTUBE MARKETING CONTENT"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Project Footer */}
      <WorkProjectFooter currentSlug="weights-and-biases-fully-connected" />
    </article>
  );
}
