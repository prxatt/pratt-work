'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';
import { WorkProjectFooter } from '@/components/work/WorkProjectFooter';
import { getVideoUrl, getImageUrl } from '@/lib/media';

interface BoubyanContentProps {
  metadata: {
    title: string;
    description?: string;
    year: string;
    role: string;
    client: string;
  };
  approachSections: Array<{title: string, content: ReactNode}>;
  mainContent: ReactNode;
}

export default function BoubyanContent({ metadata, mainContent, approachSections }: BoubyanContentProps) {
  // Architectural 3D Aesthetic - Steel/Concrete & Blueprint
  const steel = '#4A5568';      // Steel gray-blue
  const concrete = '#718096';  // Concrete gray
  const rebar = '#A0AEC0';     // Rebar light gray
  const rust = '#9C4221';      // Architectural rust accent
  const dark = '#0D0D0D';      // Deep structural black
  const blueprint = '#2C5282'; // Blueprint blue
  const amber = '#D69E2E';     // Construction amber

  // Animation variants - Architectural style
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const drawLine = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  const drawLineVertical = {
    hidden: { scaleY: 0 },
    visible: {
      scaleY: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  const slideUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
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

  const slideInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  const structuralReveal = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  // Refs for scroll-triggered animations
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const processRef = useRef(null);
  const deliverablesRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const contentInView = useInView(contentRef, { once: true, margin: "-100px" });
  const processInView = useInView(processRef, { once: true, margin: "-100px" });
  const deliverablesInView = useInView(deliverablesRef, { once: true, margin: "-100px" });

  // Architectural beam animation - draws from left to right
  const beamDraw = {
    hidden: { width: "0%" },
    visible: {
      width: "100%",
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <article className="min-h-screen bg-[#0a0a0a]">
      {/* Architectural Background - Structural Steel & Concrete */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Concrete texture pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              ${concrete} 0px,
              transparent 1px,
              transparent 80px,
              ${concrete} 80px,
              ${concrete} 81px
            )`
          }}
        />

        {/* Structural I-beams vertical with animations */}
        <motion.div 
          className="absolute left-[10%] top-0 bottom-0 w-1 opacity-[0.08]"
          style={{ 
            background: `linear-gradient(to bottom, transparent 0%, ${steel} 20%, ${steel} 80%, transparent 100%)`,
            originY: 0
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />
        <motion.div 
          className="absolute left-[30%] top-0 bottom-0 w-2 opacity-[0.06]"
          style={{ 
            background: `linear-gradient(to bottom, transparent 0%, ${concrete} 30%, ${concrete} 70%, transparent 100%)`,
            originY: 0
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
        />
        <motion.div 
          className="absolute right-[20%] top-0 bottom-0 w-1 opacity-[0.08]"
          style={{ 
            background: `linear-gradient(to bottom, transparent 0%, ${steel} 15%, ${steel} 85%, transparent 100%)`,
            originY: 0
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
        />

        {/* Horizontal floor lines - elevation markers with draw animation */}
        <motion.div 
          className="absolute left-0 right-0 top-[15%] h-[1px] opacity-[0.1]"
          style={{ backgroundColor: steel, originX: 0 }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.8 }}
        >
          <span className="absolute -top-4 left-[5%] font-mono text-[8px] tracking-wider" style={{ color: steel }}>EL. +45.00m</span>
        </motion.div>
        <motion.div 
          className="absolute left-0 right-0 top-[35%] h-[1px] opacity-[0.08]"
          style={{ backgroundColor: concrete, originX: 0 }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 1 }}
        >
          <span className="absolute -top-4 right-[10%] font-mono text-[8px] tracking-wider" style={{ color: concrete }}>EL. +30.00m</span>
        </motion.div>
      </div>

      {/* Hero - Architectural Blueprint Style */}
      <header ref={heroRef} className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-32 pb-20">
        {/* Architectural glow */}
        <div 
          className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.12] blur-3xl pointer-events-none"
          style={{ background: `radial-gradient(circle at top right, ${rust} 0%, transparent 60%)` }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-[0.08] blur-3xl pointer-events-none"
          style={{ background: `radial-gradient(circle at bottom left, ${steel} 0%, transparent 60%)` }}
        />

        {/* Hero Video - Full Background Underlay */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60"
            poster={getImageUrl('/work/boubyan-bank-thumb.webp', 800)}
          >
            <source src={getVideoUrl('/work/boubyan-bank-card.webm')} type="video/webm" />
            <source src={getVideoUrl('/work/boubyan-bank-card.mp4')} type="video/mp4" />
          </video>
        </div>

        <motion.div 
          className="relative z-10 max-w-6xl mx-auto"
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Top info bar - technical specs with slide animations */}
          <motion.div 
            className="flex flex-wrap items-center justify-between gap-4 mb-16 pb-8 border-b border-[#222]"
            variants={slideUp}
          >
            <div className="flex items-center gap-8">
              <motion.div variants={slideInLeft}>
                <span className="font-mono text-[9px] tracking-[0.3em] text-[#F2F2F0] uppercase block drop-shadow-md">Client</span>
                <span className="font-display text-sm text-[#F2F2F0] uppercase tracking-wide drop-shadow-md">{metadata.client}</span>
              </motion.div>
              <motion.div 
                className="w-[1px] h-8 bg-[#333]"
                variants={drawLineVertical}
              />
              <motion.div variants={slideInLeft}>
                <span className="font-mono text-[9px] tracking-[0.3em] text-[#F2F2F0] uppercase block drop-shadow-md">Year</span>
                <span className="font-display text-sm text-[#F2F2F0] uppercase tracking-wide drop-shadow-md">{metadata.year}</span>
              </motion.div>
              <motion.div 
                className="w-[1px] h-8 bg-[#333]"
                variants={drawLineVertical}
              />
              <motion.div variants={slideInLeft}>
                <span className="font-mono text-[9px] tracking-[0.3em] text-[#F2F2F0] uppercase block drop-shadow-md">Type</span>
                <span className="font-display text-sm uppercase tracking-wide drop-shadow-md" style={{ color: rust }}>3D Generative</span>
              </motion.div>
            </div>
            <motion.div 
              className="flex items-center gap-2"
              variants={slideInRight}
            >
              <motion.div 
                className="w-2 h-2 rounded-full drop-shadow-md" 
                style={{ backgroundColor: steel }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase drop-shadow-md" style={{ color: steel }}>Architectural Visualization</span>
            </motion.div>
          </motion.div>

          {/* Main Title - Structural Typography */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
            <motion.div className="lg:col-span-8" variants={slideUp}>
              <div className="mb-6">
                <motion.span 
                  className="font-mono text-xs tracking-[0.4em] uppercase text-[#666] block mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={heroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: 0.3 }}
                >
                  Project
                </motion.span>
                <motion.h1 
                  className="font-display text-[clamp(2.5rem,6vw,5rem)] text-[#F2F2F0] uppercase leading-[0.9] tracking-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  THE SHAPE OF FINANCE
                </motion.h1>
                <motion.h2 
                  className="font-display text-[clamp(1.5rem,4vw,3rem)] uppercase leading-[0.9] tracking-tight mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  style={{ color: rust }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  WITH BOUBYAN BANK
                </motion.h2>
              </div>

              {/* Tagline */}
              <motion.p 
                className="font-sans text-lg md:text-xl uppercase tracking-[0.15em] text-[#A3A3A3] max-w-2xl leading-[1.8]"
                variants={slideUp}
              >
                3D Previsualization for New Kuwait Headquarters. Photorealistic Renderings, Architectural Mockups, Lighting Designs, and Interactive Environments.
              </motion.p>
            </motion.div>

            {/* Right: 3D visualization indicator with structural reveal */}
            <motion.div 
              className="lg:col-span-4 flex justify-end"
              variants={structuralReveal}
            >
              <motion.div 
                className="relative w-48 h-48 p-6"
                style={{ 
                  border: `1px solid ${steel}30`,
                  backgroundColor: `${dark}80`
                }}
                whileHover={{ borderColor: `${steel}60` }}
                transition={{ duration: 0.3 }}
              >
                {/* Boubyan Bank HQ Wireframe with drawing animation */}
                <motion.svg 
                  viewBox="0 0 100 100" 
                  className="w-full h-full"
                  initial={{ opacity: 0 }}
                  animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  {/* Building silhouette - tower form with draw animation */}
                  <motion.path 
                    d="M35 85 L35 25 L40 20 L45 18 L50 15 L55 18 L60 20 L65 25 L65 85 Z" 
                    fill="none" 
                    stroke={steel} 
                    strokeWidth="0.8" 
                    opacity="0.7"
                    initial={{ pathLength: 0 }}
                    animate={heroInView ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 1.5, delay: 0.9 }}
                  />
                  {/* Crown/top structure */}
                  <motion.path 
                    d="M40 20 L42 12 L45 10 L50 8 L55 10 L58 12 L60 20" 
                    fill="none" 
                    stroke={steel} 
                    strokeWidth="0.6" 
                    opacity="0.6"
                    initial={{ pathLength: 0 }}
                    animate={heroInView ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 1, delay: 1.2 }}
                  />
                </motion.svg>

                {/* Data points */}
                <div className="absolute top-2 left-2 font-mono text-[8px] text-[#666] tracking-wider">ISO_01</div>
                <div className="absolute bottom-2 right-2 font-mono text-[8px]" style={{ color: steel }}>3D_GEN</div>
              </motion.div>
            </motion.div>
          </div>

          {/* Role Badge - Structural Frame with animation */}
          <motion.div 
            className="flex items-center gap-4"
            variants={slideUp}
          >
            <motion.div 
              className="inline-flex items-center gap-3 px-5 py-2.5"
              style={{ 
                border: `1px solid ${steel}40`,
                backgroundColor: `${blueprint}20`
              }}
              whileHover={{ borderColor: `${steel}70`, backgroundColor: `${blueprint}30` }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="w-[3px] h-4" 
                style={{ backgroundColor: rust }}
                initial={{ scaleY: 0 }}
                animate={heroInView ? { scaleY: 1 } : { scaleY: 0 }}
                transition={{ delay: 0.9, duration: 0.3 }}
              />
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#F2F2F0]">
                {metadata.role}
              </span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom blueprint data with slide up animation */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 px-6 md:px-12 lg:px-24 py-6 border-t border-[#222]"
          initial={{ y: 50, opacity: 0 }}
          animate={heroInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <span className="font-mono text-[9px] tracking-[0.3em] text-[#666] uppercase">LOC: KUWAIT</span>
              <span className="font-mono text-[9px] text-[#333]">|</span>
              <span className="font-mono text-[9px] tracking-[0.3em] text-[#666] uppercase">TYPE: HQ_PREVIS</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[9px] tracking-[0.2em] text-[#666] uppercase">COOR: 29.3759° N</span>
              <span className="font-mono text-[9px] text-[#333]">/</span>
              <span className="font-mono text-[9px] tracking-[0.2em] text-[#666] uppercase">47.9774° E</span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Main Content - Split Layout */}
      <section ref={contentRef} className="relative px-6 md:px-12 lg:px-24 py-32">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial="hidden"
          animate={contentInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Left: Content (7 cols) */}
            <motion.div className="lg:col-span-7" variants={slideUp}>
              {/* Section header with animated line */}
              <div className="flex items-center gap-4 mb-12">
                <motion.div 
                  className="h-[2px] w-20" 
                  style={{ backgroundColor: steel, originX: 0 }}
                  initial={{ scaleX: 0 }}
                  animate={contentInView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
                <motion.span 
                  className="font-mono text-[10px] tracking-[0.3em] uppercase block mb-6" 
                  style={{ color: rust }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={contentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ delay: 0.3 }}
                >
                  Project Brief
                </motion.span>
              </div>

              <div className="prose prose-invert prose-lg max-w-none">
                <div className="font-sans text-lg md:text-xl uppercase tracking-wide leading-[1.9] text-[#A3A3A3]">
                  {mainContent}
                </div>
              </div>
            </motion.div>

            {/* Right: Tech Specs (5 cols) */}
            <motion.div 
              className="lg:col-span-5 space-y-6"
              variants={slideInRight}
            >
              <motion.div 
                className="p-8 border"
                style={{ 
                  borderColor: `${steel}20`,
                  backgroundColor: `${dark}60` 
                }}
                whileHover={{ borderColor: `${steel}40` }}
                transition={{ duration: 0.3 }}
              >
                <motion.span 
                  className="font-mono text-[10px] tracking-[0.3em] uppercase block mb-6" 
                  style={{ color: steel }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={contentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ delay: 0.4 }}
                >
                  Technical Specifications
                </motion.span>

                <div className="space-y-4">
                  {[
                    { label: 'Render Engine', value: 'V-Ray / Corona' },
                    { label: 'Output Format', value: '4K / 8K' },
                    { label: 'Lighting', value: 'HDR / IES' },
                    { label: 'Interactive', value: 'Real-time' },
                    { label: 'Delivery', value: 'Web / VR' },
                  ].map((spec, i) => (
                    <motion.div 
                      key={spec.label}
                      className="flex justify-between items-center py-3 border-b border-[#222] last:border-0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={contentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <span className="font-mono text-[10px] text-[#666] uppercase tracking-wider">{spec.label}</span>
                      <span className="font-display text-sm text-[#F2F2F0] uppercase">{spec.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Project type indicator */}
              <motion.div 
                className="p-6 border border-[#222] flex items-center justify-between"
                style={{ backgroundColor: `${blueprint}10` }}
                whileHover={{ borderColor: `${steel}40`, backgroundColor: `${blueprint}15` }}
                transition={{ duration: 0.3 }}
              >
                <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#666]">Category</span>
                <span className="font-display text-sm" style={{ color: steel }}>ARCHITECTURAL VISUALIZATION</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Process Timeline - Structural Beam Style */}
      <section ref={processRef} className="relative px-6 md:px-12 lg:px-24 py-32 bg-[#0a0a0a]">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial="hidden"
          animate={processInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Section header */}
          <motion.div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-12 sm:mb-20 min-w-0" variants={slideUp}>
            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
              <motion.div 
                className="h-[3px] w-16 sm:w-24 shrink-0" 
                style={{ backgroundColor: steel, originX: 0 }}
                initial={{ scaleX: 0 }}
                animate={processInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.8 }}
              />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase truncate" style={{ color: rust }}>Workflow</span>
            </div>
            <motion.span 
              className="font-display text-[clamp(1.35rem,5.5vw,1.875rem)] sm:text-3xl text-[#F2F2F0] uppercase leading-[1.05] text-balance max-w-full"
              initial={{ opacity: 0, x: 20 }}
              animate={processInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ delay: 0.2 }}
            >
              Process Architecture
            </motion.span>
          </motion.div>

          {/* Structural beam timeline */}
          <div className="relative">
            {/* Main structural beam with draw animation */}
            <motion.div 
              className="hidden lg:block absolute top-24 left-0 right-0 h-2 bg-[#2D3748]/30"
              style={{ originX: 0 }}
              initial={{ scaleX: 0 }}
              animate={processInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <motion.div 
                className="absolute top-0 left-0 w-1/3 h-full"
                style={{ backgroundColor: steel }}
                initial={{ scaleX: 0 }}
                animate={processInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
              {approachSections.map((approach, index) => (
                <motion.div 
                  key={approach.title} 
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={processInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ delay: 0.3 + index * 0.2, duration: 0.6 }}
                >
                  {/* Structural node on beam */}
                  <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 z-10">
                    <motion.div 
                      className="w-12 h-12 flex items-center justify-center border-2"
                      style={{ 
                        borderColor: index === 0 ? steel : index === 1 ? concrete : rust,
                        backgroundColor: dark
                      }}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={processInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                      transition={{ delay: 0.5 + index * 0.2, type: "spring", stiffness: 200 }}
                      whileHover={{ scale: 1.1, borderColor: index === 0 ? steel : index === 1 ? concrete : rust }}
                    >
                      <span className="font-display text-lg font-bold text-[#F2F2F0]">{index + 1}</span>
                    </motion.div>
                    {/* Vertical connector with draw animation */}
                    <motion.div 
                      className="w-[2px] h-12 mx-auto"
                      style={{ 
                        backgroundColor: index === 0 ? steel : index === 1 ? concrete : rust,
                        originY: 0
                      }}
                      initial={{ scaleY: 0 }}
                      animate={processInView ? { scaleY: 1 } : { scaleY: 0 }}
                      transition={{ delay: 0.7 + index * 0.2, duration: 0.4 }}
                    />
                  </div>

                  {/* Mobile indicator */}
                  <div className="lg:hidden mb-6 flex items-center gap-4">
                    <motion.div 
                      className="w-14 h-14 flex items-center justify-center border-2"
                      style={{ 
                        borderColor: steel,
                        backgroundColor: dark
                      }}
                      initial={{ scale: 0 }}
                      animate={processInView ? { scale: 1 } : { scale: 0 }}
                      transition={{ delay: 0.3 + index * 0.2, type: "spring" }}
                    >
                      <span className="font-display text-xl font-bold text-[#F2F2F0]">{index + 1}</span>
                    </motion.div>
                    <motion.div 
                      className="h-[2px] flex-1"
                      style={{ backgroundColor: `${steel}30` }}
                      initial={{ scaleX: 0 }}
                      animate={processInView ? { scaleX: 1 } : { scaleX: 0 }}
                      transition={{ delay: 0.5 + index * 0.2 }}
                    />
                  </div>

                  {/* Content panel - architectural slab with hover */}
                  <motion.div 
                    className="lg:mt-28 p-8 border-l-4 bg-[#0f0f0f]" 
                    style={{ 
                      borderLeftColor: index === 0 ? steel : index === 1 ? concrete : rust,
                    }}
                    whileHover={{ 
                      x: 5,
                      backgroundColor: '#141414',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.h3 
                      className="font-display text-2xl uppercase tracking-tight mb-6"
                      style={{ color: index === 0 ? steel : index === 1 ? concrete : rust }}
                      initial={{ opacity: 0 }}
                      animate={processInView ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: 0.6 + index * 0.2 }}
                    >
                      {approach.title}
                    </motion.h3>
                    <div className="font-sans text-sm uppercase tracking-wide leading-[1.9] text-[#A3A3A3]">
                      {approach.content}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3D Render Showcase - Grid Layout with architectural animations */}
      <section ref={deliverablesRef} className="relative px-6 md:px-12 lg:px-24 py-24">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial="hidden"
          animate={deliverablesInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Section label */}
          <motion.div className="flex items-center gap-4 mb-12" variants={slideUp}>
            <motion.div 
              className="h-[2px] w-16" 
              style={{ backgroundColor: concrete, originX: 0 }}
              initial={{ scaleX: 0 }}
              animate={deliverablesInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.8 }}
            />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: steel }}>Deliverables</span>
          </motion.div>

          {/* Grid of render views with staggered animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                webp: getImageUrl('/work/boubyan1.webp', 1920, { format: 'webp' }), 
                jpg: getImageUrl('/work/boubyan1.jpg', 1920, { format: 'jpg' }), 
                alt: 'Exterior View', 
                label: 'EXT_NIGHT_01',
                borderColor: steel
              },
              { 
                webp: getImageUrl('/work/boubyan-2.webp', 1920, { format: 'webp' }), 
                jpg: getImageUrl('/work/boubyan-2.jpg', 1920, { format: 'jpg' }), 
                alt: 'Interior Lobby', 
                label: 'INT_LOBBY_02',
                borderColor: concrete
              },
              { 
                webp: getImageUrl('/work/boubyan-3.webp', 1920, { format: 'webp' }), 
                jpg: getImageUrl('/work/boubyan-3.jpg', 1920, { format: 'jpg' }), 
                alt: 'Aerial View', 
                label: 'DRONE_04K',
                borderColor: rust
              },
            ].map((render, i) => (
              <motion.div 
                key={render.label}
                className="relative aspect-[4/3] p-1 group cursor-pointer overflow-hidden"
                style={{ backgroundColor: `${steel}20` }}
                initial={{ opacity: 0, y: 30 }}
                animate={deliverablesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
                whileHover={{ 
                  backgroundColor: `${steel}40`,
                  y: -5
                }}
              >
                <motion.div 
                  className="absolute inset-0 border z-10"
                  style={{ borderColor: render.borderColor }}
                  initial={{ opacity: 0 }}
                  animate={deliverablesInView ? { opacity: 0 } : { opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div 
                  className="w-full h-full relative bg-[#0a0a0a] overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                >
                  <picture>
                    <source srcSet={render.webp} type="image/webp" />
                    <img 
                      src={render.jpg}
                      alt={render.alt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </motion.div>
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-black/80 border-t border-[#222] z-10"
                  initial={{ y: 20, opacity: 0 }}
                  animate={deliverablesInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                  transition={{ delay: 0.4 + i * 0.15 }}
                >
                  <span className="font-mono text-[8px] tracking-wider text-[#666] uppercase">{render.label}</span>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Project Footer */}
      <WorkProjectFooter currentSlug="boubyan-bank-hq" />
    </article>
  );
}
