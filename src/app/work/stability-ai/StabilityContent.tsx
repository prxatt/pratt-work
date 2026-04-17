'use client';

import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { WorkProjectFooter } from '@/components/work/WorkProjectFooter';
import { AnimatedCounter } from '@/components/micro-animations/AnimatedCounter';
import { ScrambleText } from '@/components/micro-animations/ScrambleText';
import { CornerDraw } from '@/components/micro-animations/CornerDraw';

interface StabilityContentProps {
  metadata: {
    title: string;
    description?: string;
    year: string;
    role: string;
    client: string;
    category?: string[];
  };
  mainDescription: string;
  approachSections: Array<{ title: string; body: string }>;
}

export default function StabilityContent({
  metadata,
  mainDescription,
  approachSections,
}: StabilityContentProps) {
  const prefersReducedMotion = useReducedMotion();

  // Generative AI Aesthetic - Neural Networks & Diffusion
  const neural = '#00D4AA';
  const diffusion = '#7C3AED';
  const signal = '#F59E0B';
  const void_ = '#0D0D0D';
  const grid = '#1A1A2E';

  const [hoveredFrame, setHoveredFrame] = useState<number | null>(null);

  // Stats data for animated counters
  const stats = [
    { value: 10, suffix: 'M', label: 'Users in 60 Days', sub: 'Fastest Growing', color: neural, displayValue: '10M' },
    { value: 1, suffix: 'B', prefix: '$', label: 'Valuation', sub: 'AI Unicorn', color: diffusion, displayValue: '$1B' },
    { value: 101, suffix: 'M', prefix: '$', label: 'Seed Round', sub: 'Open Source', color: signal, displayValue: '$101M' },
  ];

  // Animation variants
  const createVariants = (variants: Variants): Variants => {
    if (prefersReducedMotion) {
      return {
        hidden: { opacity: 0.8 },
        visible: { opacity: 1, transition: { duration: 0.1 } },
      };
    }
    return variants;
  };

  const containerVariants = createVariants({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  });

  const fadeInUp = createVariants({
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  });

  const fadeIn = createVariants({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
  });

  const slideInLeft = createVariants({
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  });

  const scaleIn = createVariants({
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  });

  const drawLine = createVariants({
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  });

  // Refs for scroll-triggered animations
  const heroRef = useRef(null);
  const manifestoRef = useRef(null);
  const slideshowRef = useRef(null);
  const processRef = useRef(null);
  const culturalRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: '-50px' });
  const manifestoInView = useInView(manifestoRef, { once: true, margin: '-50px' });
  const slideshowInView = useInView(slideshowRef, { once: true, margin: '-50px' });
  const processInView = useInView(processRef, { once: true, margin: '-50px' });
  const culturalInView = useInView(culturalRef, { once: true, margin: '-50px' });

  // Neural pulse animation
  const pulseAnimation = prefersReducedMotion
    ? {}
    : {
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.5, 0.2],
      };

  // Parse main description paragraphs
  const descriptionParagraphs = mainDescription.split('\n\n').filter(p => p.trim());

  return (
    <article className="min-h-screen bg-[#0a0a0f]">
      {/* Neural Network Background - Performance optimized */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Animated diffusion noise field - reduced opacity on mobile */}
        <motion.div
          className="absolute inset-0 opacity-[0.02] sm:opacity-[0.03] will-change-transform"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, ${neural} 0%, transparent 50%),
                              radial-gradient(circle at 80% 30%, ${diffusion} 0%, transparent 40%),
                              radial-gradient(circle at 40% 80%, ${signal} 0%, transparent 45%)`,
          }}
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.05, 1],
            opacity: [0.02, 0.03, 0.02],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Neural node grid - static on mobile for performance */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] sm:opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="neural" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
              <circle cx="75" cy="75" r="1.5" fill={neural}>
                {!prefersReducedMotion && (
                  <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
                )}
              </circle>
              <circle cx="25" cy="25" r="1" fill={diffusion} opacity="0.5" />
              <circle cx="125" cy="125" r="1" fill={diffusion} opacity="0.5" />
              <line x1="75" y1="75" x2="25" y2="25" stroke={neural} strokeWidth="0.3" opacity="0.3" />
              <line x1="75" y1="75" x2="125" y2="125" stroke={neural} strokeWidth="0.3" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#neural)" />
        </svg>

        {/* Glowing neural nodes - reduced on mobile */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-2 h-2 sm:w-3 sm:h-3 rounded-full blur-sm will-change-transform"
          style={{ backgroundColor: neural }}
          animate={pulseAnimation}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="hidden sm:block absolute top-1/3 right-1/3 w-2 h-2 rounded-full blur-md will-change-transform"
          style={{ backgroundColor: diffusion }}
          animate={pulseAnimation}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/2 w-2 h-2 sm:w-3 sm:h-3 rounded-full blur-sm will-change-transform"
          style={{ backgroundColor: signal }}
          animate={pulseAnimation}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        {/* Latent space glow - reduced blur on mobile */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[1000px] h-[300px] sm:h-[600px] opacity-[0.03] sm:opacity-[0.04] blur-[80px] sm:blur-[120px] will-change-transform"
          style={{
            background: `radial-gradient(ellipse at center, ${neural} 0%, ${diffusion}30%, transparent 70%)`,
          }}
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.1, 1],
            opacity: [0.03, 0.04, 0.03],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Hero - Generative Breakthrough - Contain paint for performance */}
      <header
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-12 lg:px-24 pt-32 pb-20 overflow-hidden contain-paint"
      >
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="/work/stability-ai-thumb.webp"
          >
            <source src="/work/stability-vid.webm" type="video/webm" />
            <source src="/work/stability-vid.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Left-side gradient for text readability */}
        <div
          className="absolute inset-0 z-[5] pointer-events-none"
          style={{
            background: `linear-gradient(to right,
              rgba(10, 10, 15, 0.95) 0%,
              rgba(10, 10, 15, 0.8) 40%,
              rgba(10, 10, 15, 0.4) 60%,
              transparent 75%)`,
          }}
        />

        {/* Latent space activation glow - mobile optimized */}
        <motion.div
          className="absolute top-0 right-0 w-[200px] sm:w-[400px] md:w-[600px] h-[200px] sm:h-[400px] md:h-[600px] opacity-[0.04] sm:opacity-[0.06] blur-2xl sm:blur-3xl pointer-events-none z-[1] will-change-transform"
          style={{ background: `radial-gradient(circle at top right, ${neural} 0%, transparent 60%)` }}
          animate={prefersReducedMotion ? {} : {
            opacity: [0.04, 0.08, 0.04],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="relative z-10 w-full max-w-xl"
          initial="hidden"
          animate={heroInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* AI Tag with scramble text */}
          <motion.div className="flex items-center gap-3 mb-6" variants={slideInLeft}>
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 border"
              style={{ borderColor: `${neural}40` }}
            >
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: neural }}
                animate={prefersReducedMotion ? {} : {
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: neural }}>
                <ScrambleText text="Generative AI Revolution" enabled={heroInView} delay={400} speed={35} />
              </span>
            </motion.div>
            <motion.span
              className="font-mono text-[10px] text-[#666] uppercase hidden sm:inline"
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.8 }}
            >
              Stable Diffusion
            </motion.span>
          </motion.div>

          {/* Main Title + Role Badge Inline - Mobile-safe typography */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-6">
            <motion.div variants={fadeInUp} className="flex-1 min-w-0">
              <span className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#F2F2F0] uppercase tracking-tight block leading-[1.1] sm:leading-[1.05]">
                STABILITY
              </span>
              <motion.span
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-tight block mt-1 sm:mt-2 leading-[1.1] sm:leading-[1]"
                style={{
                  color: neural,
                  textShadow: `0 0 30px ${neural}40`,
                }}
                animate={prefersReducedMotion ? {} : {
                  textShadow: [
                    `0 0 30px ${neural}40`,
                    `0 0 50px ${neural}60`,
                    `0 0 30px ${neural}40`,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                AI
              </motion.span>
            </motion.div>

            {/* Role/Year Badge - Stacked on mobile, inline on desktop */}
            <motion.div
              className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1.5 mt-1 sm:mt-2 shrink-0"
              variants={fadeIn}
            >
              <div
                className="px-2 sm:px-3 py-1 sm:py-1.5 border font-mono text-[9px] sm:text-[10px] tracking-[0.15em] uppercase"
                style={{
                  borderColor: `${neural}40`,
                  backgroundColor: `${void_}60`,
                  backdropFilter: 'blur(4px)',
                }}
              >
                <span style={{ color: neural }}>{metadata.role}</span>
              </div>
              <span className="font-mono text-[9px] sm:text-[10px] text-[#666] tracking-wider">{metadata.year}</span>
            </motion.div>
          </div>

          {/* Subtitle - Open Source Badge - Mobile-optimized */}
          <motion.div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6" variants={fadeInUp}>
            <motion.div
              className="px-2 sm:px-3 py-1 sm:py-1.5 border font-mono text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase"
              style={{
                borderColor: `${signal}40`,
                color: signal,
                backgroundColor: `${signal}08`,
              }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, borderColor: signal }}
              transition={{ duration: 0.2 }}
            >
              OPEN SOURCE
            </motion.div>
            <motion.div
              className="px-2 sm:px-3 py-1 sm:py-1.5 border font-mono text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase"
              style={{
                borderColor: `${diffusion}40`,
                color: diffusion,
                backgroundColor: `${diffusion}08`,
              }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, borderColor: diffusion }}
              transition={{ duration: 0.2 }}
            >
              SDXL 1.0
            </motion.div>
          </motion.div>

          {/* Description - Constrained width */}
          <motion.p
            className="font-sans text-base md:text-lg text-[#A3A3A3] max-w-md leading-relaxed"
            variants={fadeInUp}
          >
            Brand launch for Stable Diffusion. Shattering the barriers between language and image, gathering 10 million users in sixty days.
          </motion.p>
        </motion.div>

          {/* Stats - Neural Cards with Animated Counters */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 px-3 sm:px-6 md:px-12 lg:px-24 py-4 sm:py-6 border-t border-[#1A1A2E] z-20 bg-[#0a0a0f]/80 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6"
              initial="hidden"
              animate={heroInView ? 'visible' : 'hidden'}
              variants={containerVariants}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center p-2 sm:p-3 md:p-4 relative"
                  style={{
                    borderLeft: index > 0 ? `1px solid ${grid}` : 'none',
                  }}
                  variants={fadeInUp}
                  whileHover={prefersReducedMotion ? {} : { y: -2 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Animated vertical accent line */}
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-[2px]"
                    style={{ backgroundColor: stat.color, opacity: 0.3 }}
                    initial={{ scaleY: 0 }}
                    animate={heroInView ? { scaleY: 1 } : { scaleY: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 + index * 0.15 }}
                  />
                  <div
                    className="font-display text-xl sm:text-2xl md:text-4xl mb-1"
                    style={{ color: stat.color }}
                  >
                    <AnimatedCounter
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      enabled={heroInView}
                      duration={2000}
                    />
                  </div>
                  <div className="font-mono text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.12em] sm:tracking-[0.15em] uppercase text-[#666] mb-1">
                    {stat.label}
                  </div>
                  <div className="font-mono text-[7px] sm:text-[8px] md:text-[9px] uppercase" style={{ color: stat.color, opacity: 0.6 }}>
                    {stat.sub}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </header>

      {/* Main Content - Latent Space - Content visibility for performance */}
      <section ref={manifestoRef} className="relative px-4 sm:px-6 md:px-12 lg:px-24 py-24 md:py-32 content-visibility-auto">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="hidden"
          animate={manifestoInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* Section header */}
          <motion.div className="flex items-center gap-4 mb-12" variants={slideInLeft}>
            <motion.div
              className="h-[2px] w-20 origin-left"
              style={{ backgroundColor: neural }}
              variants={drawLine}
            />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: neural }}>
              <ScrambleText text="The Breakthrough" enabled={manifestoInView} delay={200} speed={40} />
            </span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left: Content with staggered paragraph animation */}
            <div className="lg:col-span-7">
              <motion.div className="prose prose-invert prose-lg max-w-none" variants={fadeInUp}>
                {descriptionParagraphs.map((paragraph, index) => (
                  <motion.div
                    key={index}
                    className="font-sans text-base md:text-lg lg:text-xl uppercase tracking-wide leading-[1.8] md:leading-[1.9] text-[#A3A3A3] mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={manifestoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  >
                    {paragraph}
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right: Tech Specs */}
            <motion.div
              className="lg:col-span-5"
              variants={scaleIn}
            >
              <motion.div
                className="p-6 border font-mono text-xs relative overflow-hidden"
                style={{
                  borderColor: grid,
                  backgroundColor: `${void_}80`,
                }}
                whileHover={prefersReducedMotion ? {} : { borderColor: `${neural}60` }}
                transition={{ duration: 0.3 }}
              >
                {/* Corner draw on hover */}
                <CornerDraw color={neural} size={20} strokeWidth={1.5} isHovered={true} />

                {/* Animated corner accent */}
                <motion.div
                  className="absolute top-0 left-0 w-8 h-[2px]"
                  style={{ backgroundColor: signal }}
                  initial={{ scaleX: 0 }}
                  animate={manifestoInView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                />
                <motion.div
                  className="absolute top-0 left-0 w-[2px] h-8"
                  style={{ backgroundColor: signal }}
                  initial={{ scaleY: 0 }}
                  animate={manifestoInView ? { scaleY: 1 } : { scaleY: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                />

                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#222]">
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: signal }}
                    animate={prefersReducedMotion ? {} : {
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#666]">System Status</span>
                </div>

                <div className="space-y-3 text-[#888]">
                  {[
                    { label: 'MODEL', value: 'SDXL 1.0', color: neural },
                    { label: 'TYPE', value: 'TEXT-TO-IMAGE', color: diffusion },
                    { label: 'LICENSE', value: 'OPEN SOURCE', color: signal },
                    { label: 'ADOPTION', value: '10M USERS', color: neural },
                    { label: 'TIMELINE', value: '60 DAYS', color: '#888' },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      className="flex justify-between"
                      initial={{ opacity: 0, x: -10 }}
                      animate={manifestoInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    >
                      <span>{item.label}</span>
                      <span style={{ color: item.color }}>{item.value}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="mt-4 pt-4 border-t border-[#222] text-[9px] text-[#444] uppercase tracking-wider"
                  initial={{ opacity: 0 }}
                  animate={manifestoInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  latentspace_v1.0 // initialized
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Image Slideshow Section - Content visibility for performance */}
      <section ref={slideshowRef} className="relative px-4 sm:px-6 md:px-12 lg:px-24 py-16 bg-[#0a0a0f] content-visibility-auto">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="hidden"
          animate={slideshowInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* Section header */}
          <motion.div className="flex items-center gap-4 mb-12" variants={slideInLeft}>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: diffusion }}>
              <ScrambleText text="Documentation" enabled={slideshowInView} delay={200} speed={45} />
            </span>
            <motion.div
              className="flex-1 h-[1px] bg-[#262626] origin-left"
              variants={drawLine}
            />
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#666] uppercase">
              001
            </span>
          </motion.div>

          {/* Photo Grid with hover effects */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Large frame */}
            <motion.div
              className="col-span-1 lg:col-span-8"
              variants={scaleIn}
              onMouseEnter={() => setHoveredFrame(0)}
              onMouseLeave={() => setHoveredFrame(null)}
            >
              <motion.div
                className="relative aspect-[16/9] bg-[#141414] overflow-hidden group will-change-transform"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)',
                }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
                transition={{ duration: 0.4 }}
              >
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-12 h-[2px] z-10" style={{ backgroundColor: neural }} />
                <div className="absolute top-0 left-0 w-[2px] h-12 z-10" style={{ backgroundColor: neural }} />

                <CornerDraw color={neural} size={24} strokeWidth={2} isHovered={hoveredFrame === 0} />

                <picture>
                  <source srcSet="/work/stability-imad.webp" type="image/webp" />
                  <Image
                    src="/work/stability-imad.jpg"
                    alt="Imad at Stability AI"
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                    loading="eager"
                  />
                </picture>
              </motion.div>
            </motion.div>

            {/* Side frames stack */}
            <div className="col-span-1 lg:col-span-4 space-y-6">
              <motion.div
                variants={scaleIn}
                onMouseEnter={() => setHoveredFrame(1)}
                onMouseLeave={() => setHoveredFrame(null)}
              >
                <motion.div
                  className="relative aspect-[4/3] bg-[#141414] overflow-hidden group will-change-transform"
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)',
                  }}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="absolute top-0 left-0 w-8 h-[2px] z-10" style={{ backgroundColor: `${neural}60` }} />
                  <div className="absolute top-0 left-0 w-[2px] h-8 z-10" style={{ backgroundColor: `${neural}60` }} />
                  <CornerDraw color={neural} size={20} strokeWidth={1.5} isHovered={hoveredFrame === 1} />

                  <picture>
                    <source srcSet="/work/stability-team.webp" type="image/webp" />
                    <Image
                      src="/work/stability-team.jpg"
                      alt="Stability AI Team"
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      loading="lazy"
                    />
                  </picture>
                </motion.div>
              </motion.div>

              <motion.div
                variants={scaleIn}
                onMouseEnter={() => setHoveredFrame(2)}
                onMouseLeave={() => setHoveredFrame(null)}
              >
                <motion.div
                  className="relative aspect-[4/3] bg-[#141414] overflow-hidden group will-change-transform"
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)',
                  }}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="absolute top-0 left-0 w-8 h-[2px] z-10" style={{ backgroundColor: `${diffusion}60` }} />
                  <div className="absolute top-0 left-0 w-[2px] h-8 z-10" style={{ backgroundColor: `${diffusion}60` }} />
                  <CornerDraw color={diffusion} size={20} strokeWidth={1.5} isHovered={hoveredFrame === 2} />

                  <picture>
                    <source srcSet="/work/stability-led.webp" type="image/webp" />
                    <Image
                      src="/work/stability-led.jpeg"
                      alt="LED Installation"
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      loading="lazy"
                    />
                  </picture>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Process - Neural Timeline - Content visibility for performance */}
      <section ref={processRef} className="relative px-4 sm:px-6 md:px-12 lg:px-24 py-24 md:py-32 bg-[#0a0a0f] content-visibility-auto">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="hidden"
          animate={processInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div className="flex items-center gap-6 mb-16 md:mb-20" variants={fadeIn}>
            <motion.div
              className="h-[1px] w-24 origin-left"
              style={{ backgroundColor: diffusion }}
              variants={drawLine}
            />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: diffusion }}>
              <ScrambleText text="Execution" enabled={processInView} delay={200} speed={40} />
            </span>
            <span className="font-display text-2xl sm:text-3xl text-[#F2F2F0] uppercase">Three Phases</span>
          </motion.div>

          {/* Neural Path Timeline */}
          <div className="relative">
            {/* Connection line with gradient animation */}
            <motion.div
              className="hidden lg:block absolute left-6 lg:left-16 top-0 bottom-0 w-[2px]"
              style={{
                background: `linear-gradient(to bottom, ${neural}, ${diffusion}, ${signal})`,
              }}
              initial={{ scaleY: 0, originY: 0 }}
              animate={processInView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />

            <div className="space-y-12 md:space-y-16">
              {approachSections.map((approach, index) => {
                const color = index === 0 ? neural : index === 1 ? diffusion : signal;
                return (
                  <motion.div
                    key={approach.title}
                    className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-16"
                    variants={fadeInUp}
                  >
                    {/* Node - neural network style */}
                    <div className="flex-shrink-0 w-12 lg:w-32 flex md:justify-center">
                      <motion.div
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center bg-[#0a0a0f] relative"
                        style={{ borderColor: `${color}60` }}
                        whileHover={prefersReducedMotion ? {} : { scale: 1.1, borderColor: color }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Inner glow with pulse */}
                        <motion.div
                          className="absolute inset-1 rounded-full"
                          style={{ backgroundColor: color, opacity: 0.2 }}
                          animate={prefersReducedMotion ? {} : {
                            opacity: [0.2, 0.4, 0.2],
                            scale: [1, 1.1, 1],
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                        />
                        <span className="font-display text-xl md:text-2xl text-[#F2F2F0] relative z-10">
                          0{index + 1}
                        </span>
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-0 md:pt-2">
                      <motion.h3
                        className="font-display text-xl sm:text-2xl md:text-3xl uppercase tracking-tight mb-4 md:mb-6"
                        style={{ color }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={processInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.5, delay: 0.1 + index * 0.15 }}
                      >
                        {approach.title}
                      </motion.h3>
                      <motion.div
                        className="font-sans text-sm uppercase tracking-wide leading-[1.7] md:leading-[1.8] text-[#A3A3A3]"
                        initial={{ opacity: 0 }}
                        animate={processInView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                      >
                        {approach.body}
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Cultural Moment Banner - Content visibility for performance */}
      <section ref={culturalRef} className="relative px-4 sm:px-6 md:px-12 lg:px-24 py-16 md:py-24 content-visibility-auto">
        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          animate={culturalInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          <motion.div
            className="relative p-8 md:p-12 text-center border overflow-hidden"
            style={{
              borderColor: `${neural}20`,
              backgroundColor: `${void_}80`,
            }}
            variants={scaleIn}
            whileHover={prefersReducedMotion ? {} : { borderColor: `${neural}40` }}
            transition={{ duration: 0.3 }}
          >
            {/* Diffusion particles - reduced count for mobile */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    backgroundColor: Math.random() > 0.5 ? neural : diffusion,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                  animate={prefersReducedMotion ? {} : {
                    y: [0, -20, 0],
                    opacity: [0.1, 0.3, 0.1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            <motion.span
              className="font-mono text-[10px] tracking-[0.4em] uppercase block mb-4"
              style={{ color: signal }}
              variants={fadeIn}
            >
              <ScrambleText text="Cultural Moment" enabled={culturalInView} delay={200} speed={50} />
            </motion.span>
            <motion.h3
              className="font-display text-xl sm:text-2xl md:text-3xl text-[#F2F2F0] uppercase tracking-tight mb-6 relative z-10"
              variants={fadeInUp}
            >
              Not Watched. Witnessed.
            </motion.h3>
            <motion.p
              className="font-sans text-sm md:text-base text-[#A3A3A3] max-w-xl mx-auto leading-relaxed relative z-10"
              variants={fadeInUp}
            >
              This was not a standard software release. It was a cultural event that unlocked the power of text-to-image models for the masses.
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      {/* Project Footer */}
      <WorkProjectFooter currentSlug="stability-ai" />
    </article>
  );
}
