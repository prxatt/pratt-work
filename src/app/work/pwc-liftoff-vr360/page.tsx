'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef, useMemo } from 'react';
import { WorkProjectFooter } from '@/components/work/WorkProjectFooter';
import Video360Player from '@/components/Video360Player';
import { ScrambleText } from '@/components/micro-animations/ScrambleText';

// ─────────────────────────────────────────────────────────────────────────────
// PWC LIFTOFF PAGE - Enhanced with Microanimations
// ─────────────────────────────────────────────────────────────────────────────

export default function PwcLiftoffPage() {
  const prefersReducedMotion = useReducedMotion();

  const metadata = {
    title: 'PwC Liftoff Accelerators Conference in VR 360',
    year: '2023',
    category: ['EXPERIENTIAL', 'VR 360'],
    role: 'Videographer + Producer',
    description: 'Large-scale conference captured in immersive 360° VR for global distribution.',
  };

  const mainContent = `TRANSFORMING A TRADITIONAL CONFERENCE INTO AN IMMERSIVE DIGITAL EXPERIENCE THAT TRANSCENDS PHYSICAL BOUNDARIES.

THE PWC LIFTOFF ACCELERATORS PROGRAM REQUIRED A CAPTURE SOLUTION THAT COULD PRESERVE THE ENERGY AND COLLABORATION OF THEIR FLAGSHIP EVENT WHILE MAKING IT ACCESSIBLE TO GLOBAL AUDIENCES.

OUR APPROACH COMBINED CUTTING-EDGE 360° SPHERICAL VIDEO CAPTURE WITH ENTERPRISE-GRADE STREAMING INFRASTRUCTURE, DELIVERING AN 8K RESOLUTION EXPERIENCE THAT PUTS VIEWERS IN THE CENTER OF THE ACTION.`;

  const approachSections = [
    {
      title: 'SPHERICAL CAPTURE',
      content: '8-CAMERA ARRAY SYNCHRONIZED FOR SEAMLESS 360° COVERAGE. EQUIRECTANGULAR PROJECTION PRESERVING SPATIAL RELATIONSHIPS AND IMMERSIVE DEPTH.'
    },
    {
      title: 'REAL-TIME STITCHING',
      content: 'ON-SITE PROCESSING PIPELINE DELIVERING EDIT-READY FOOTAGE WITHIN MINUTES. COLOR MATCHING AND EXPOSURE NORMALIZATION ACROSS ALL CAMERA ANGLES.'
    },
    {
      title: 'DISTRIBUTION',
      content: 'MULTI-FORMAT OUTPUT FOR WEB VR, MOBILE, AND STANDALONE HEADSETS. SPATIAL AUDIO MIX FOR FULL IMMERSIVE EXPERIENCE.'
    }
  ];

  const graphite = '#1C1C1C';
  const graphiteLight = '#2D2D2D';
  const pwcOrange = '#E85D04';
  const dataBlue = '#00D4AA';

  // Refs for scroll-triggered animations
  const heroRef = useRef(null);
  const manifestoRef = useRef(null);
  const processRef = useRef(null);
  const video2Ref = useRef(null);

  // InView states
  const heroInView = useInView(heroRef, { once: true, margin: '-100px' });
  const manifestoInView = useInView(manifestoRef, { once: true, margin: '-100px' });
  const processInView = useInView(processRef, { once: true, margin: '-100px' });
  const video2InView = useInView(video2Ref, { once: true, margin: '-100px' });

  // Memoized animation variants for performance
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

  // Pulse animation for data points
  const pulseVariants = useMemo(() => ({
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  }), []);

  return (
    <article className="min-h-screen bg-[#0a0a0a]">
      {/* Data Grid Background - GPU Optimized */}
      <div className="fixed inset-0 pointer-events-none" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(to right, ${pwcOrange} 1px, transparent 1px), linear-gradient(to bottom, ${pwcOrange} 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        {!prefersReducedMotion && (
          <>
            <motion.div
              className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full"
              style={{ backgroundColor: dataBlue }}
              variants={pulseVariants}
              animate="pulse"
            />
            <motion.div
              className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full"
              style={{ backgroundColor: pwcOrange, opacity: 0.15 }}
              variants={pulseVariants}
              animate="pulse"
              transition={{ delay: 0.5 }}
            />
          </>
        )}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
          <line x1="25%" y1="25%" x2="66%" y2="33%" stroke={pwcOrange} strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* Hero */}
      <header ref={heroRef} className="relative min-h-screen grid grid-cols-1 lg:grid-cols-12">
        <motion.div
          className="lg:col-span-5 flex flex-col justify-center px-6 md:px-12 lg:px-16 py-32 lg:py-0 relative z-10"
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div
            className="absolute top-0 right-0 w-[500px] h-[600px] opacity-[0.08] blur-3xl pointer-events-none"
            style={{ background: `radial-gradient(circle at top right, ${pwcOrange} 0%, transparent 60%)` }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={heroInView ? { opacity: 0.08, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: prefersReducedMotion ? 0 : 1.2, ease: 'easeOut' }}
          />
          <div className="absolute top-20 left-0 w-[2px] h-32 opacity-40" style={{ backgroundColor: dataBlue }} />
          <div className="absolute top-20 left-0 w-24 h-[2px] opacity-40" style={{ backgroundColor: dataBlue }} />

          <div className="relative min-w-0">
            <motion.div className="flex items-center gap-4 mb-12" variants={slideInLeft}>
              <motion.div
                className="h-[3px] w-16"
                style={{ backgroundColor: pwcOrange }}
                initial={{ scaleX: 0 }}
                animate={heroInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.3 }}
              />
              <span className="font-mono text-[10px] tracking-[0.4em] uppercase" style={{ color: dataBlue }}>
                <ScrambleText text={`${metadata.year} — ${metadata.category[0]}`} enabled={heroInView} delay={400} speed={35} />
              </span>
            </motion.div>

            <motion.div className="space-y-1 mb-8 min-w-0" variants={fadeInUp}>
              <span className="font-mono text-sm tracking-[0.3em] uppercase text-[#666] block">PWC</span>
              <h1 className="font-display text-[clamp(2.5rem,8vw,6rem)] text-[#F2F2F0] uppercase leading-[0.85] tracking-tight">
                LIFTOFF
              </h1>
              <h2 className="font-display text-[clamp(1.25rem,4vw,2.5rem)] uppercase leading-[0.9] tracking-widest" style={{ color: pwcOrange }}>
                Accelerators
              </h2>
              <h3 className="font-display text-[clamp(1.25rem,4vw,2.5rem)] text-[#A3A3A3] uppercase tracking-wide">
                Conference
              </h3>
            </motion.div>

            <motion.div
              className="inline-flex items-center gap-3 px-5 py-2.5 mb-8"
              style={{ backgroundColor: `${graphite}80`, borderLeft: `4px solid ${pwcOrange}` }}
              variants={fadeInUp}
              whileHover={{ borderLeftColor: dataBlue, backgroundColor: `${graphite}A0` }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: dataBlue }}
                animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: pwcOrange }}>
                <ScrambleText text="VR 360° Experience" enabled={heroInView} delay={600} speed={40} />
              </span>
            </motion.div>

            <motion.div className="flex items-center gap-3" variants={slideInLeft}>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#666] break-words">
                {metadata.role}
              </span>
              <motion.div
                className="flex-1 h-[1px] bg-[#333] origin-left"
                initial={{ scaleX: 0 }}
                animate={heroInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.5 }}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Right: Data Visualization Panel */}
        <motion.div
          className="lg:col-span-7 relative bg-[#0d0d0d] overflow-hidden flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.3 }}
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${graphiteLight}10 10px, ${graphiteLight}10 20px)` }} />
          </div>

          <motion.div
            className="relative w-72 h-72 md:w-80 md:h-80"
            initial={{ scale: prefersReducedMotion ? 1 : 0.8, opacity: 0 }}
            animate={heroInView ? { scale: 1, opacity: 1 } : { scale: prefersReducedMotion ? 1 : 0.8, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-dashed opacity-30"
              style={{ borderColor: pwcOrange }}
              animate={prefersReducedMotion ? {} : { rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: i % 2 === 0 ? pwcOrange : dataBlue,
                  top: `${50 + 42 * Math.sin((angle * Math.PI) / 180)}%`,
                  left: `${50 + 42 * Math.cos((angle * Math.PI) / 180)}%`,
                  transform: 'translate(-50%, -50%) rotate(45deg)',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={heroInView ? { opacity: 0.6, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.6 + i * 0.05, duration: prefersReducedMotion ? 0 : 0.3 }}
              />
            ))}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 md:w-32 md:h-32 rounded-full border-4 flex items-center justify-center overflow-hidden"
              style={{ borderColor: graphiteLight, backgroundColor: graphite }}
              initial={{ scale: prefersReducedMotion ? 1 : 0.5 }}
              animate={heroInView ? { scale: 1 } : { scale: prefersReducedMotion ? 1 : 0.5 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.8, duration: prefersReducedMotion ? 0 : 0.5, type: 'spring' }}
            >
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `linear-gradient(to right, ${pwcOrange}40 1px, transparent 1px), linear-gradient(to bottom, ${pwcOrange}40 1px, transparent 1px)`, backgroundSize: '8px 8px' }} />
              <span className="font-display text-2xl md:text-3xl text-[#F2F2F0] relative z-10">360°</span>
            </motion.div>

            {/* Stats below orb */}
            <motion.div
              className="absolute -bottom-16 md:-bottom-20 left-0 right-0 flex justify-center gap-4 md:gap-8"
              variants={containerVariants}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
            >
              {[
                { value: '360°', label: 'Capture' },
                { value: '8K', label: 'Spherical' },
                { value: 'VR', label: 'Ready' },
              ].map((stat, i) => (
                <motion.div key={stat.label} className="text-center" variants={fadeInUp} custom={i}>
                  <span className="font-display text-xl md:text-2xl text-[#F2F2F0] block">{stat.value}</span>
                  <span className="font-mono text-[8px] md:text-[9px] text-[#666] uppercase tracking-wider">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Corner brackets */}
          <motion.div
            className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2"
            style={{ borderColor: pwcOrange }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ delay: prefersReducedMotion ? 0 : 1, duration: prefersReducedMotion ? 0 : 0.3 }}
          />
          <motion.div
            className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2"
            style={{ borderColor: pwcOrange }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ delay: prefersReducedMotion ? 0 : 1.1, duration: prefersReducedMotion ? 0 : 0.3 }}
          />
          <motion.div
            className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2"
            style={{ borderColor: pwcOrange }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ delay: prefersReducedMotion ? 0 : 1.2, duration: prefersReducedMotion ? 0 : 0.3 }}
          />
          <motion.div
            className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2"
            style={{ borderColor: pwcOrange }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ delay: prefersReducedMotion ? 0 : 1.3, duration: prefersReducedMotion ? 0 : 0.3 }}
          />
        </motion.div>
      </header>

      {/* Manifesto Section */}
      <section ref={manifestoRef} className="relative px-6 md:px-12 lg:px-20 py-24">
        <motion.div
          className="max-w-7xl mx-auto"
          initial="hidden"
          animate={manifestoInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-8 min-w-0">
              <motion.div className="flex items-center gap-4 mb-12" variants={slideInLeft}>
                <motion.div
                  className="h-[2px] flex-1 max-w-32 origin-left"
                  style={{ backgroundColor: pwcOrange }}
                  initial={{ scaleX: 0 }}
                  animate={manifestoInView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.2 }}
                />
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: dataBlue }}>
                  <ScrambleText text="Project Manifesto" enabled={manifestoInView} delay={300} speed={40} />
                </span>
              </motion.div>
              <motion.div
                className="font-sans text-base md:text-lg lg:text-xl uppercase tracking-wide leading-[1.8] md:leading-[1.9] text-[#A3A3A3] whitespace-pre-line"
                variants={fadeInUp}
              >
                {mainContent}
              </motion.div>
            </div>

            <div className="lg:col-span-4 space-y-4 md:space-y-6">
              <motion.div
                className="p-6 border-l-4"
                style={{ borderLeftColor: pwcOrange, backgroundColor: `${graphite}40` }}
                variants={slideInRight}
                whileHover={{ borderLeftColor: dataBlue, backgroundColor: `${graphite}60` }}
                transition={{ duration: 0.2 }}
              >
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase block mb-4" style={{ color: dataBlue }}>
                  <ScrambleText text="Production Data" enabled={manifestoInView} delay={400} speed={45} />
                </span>
                <div className="space-y-4">
                  {[
                    { label: 'Format', value: 'EQUIRECTANGULAR' },
                    { label: 'Resolution', value: '8K x 8K' },
                    { label: 'Audio', value: 'SPATIAL' },
                    { label: 'Output', value: 'VR / WEB' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      className="flex justify-between items-center"
                      initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 20 }}
                      animate={manifestoInView ? { opacity: 1, x: 0 } : { opacity: 0, x: prefersReducedMotion ? 0 : 20 }}
                      transition={{ delay: prefersReducedMotion ? 0 : 0.5 + i * 0.1, duration: prefersReducedMotion ? 0 : 0.4 }}
                    >
                      <span className="font-mono text-xs text-[#666] uppercase">{item.label}</span>
                      <span className="font-display text-sm text-[#F2F2F0] break-all">{item.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="p-6 border border-[#222]"
                variants={slideInRight}
                transition={{ delay: prefersReducedMotion ? 0 : 0.2 }}
                whileHover={{ borderColor: pwcOrange }}
              >
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#666] block mb-4">
                  <ScrambleText text="Distribution" enabled={manifestoInView} delay={600} speed={40} />
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {['Onboarding', 'Recruitment', 'Training', 'Events'].map((tag, i) => (
                    <motion.span
                      key={tag}
                      className="font-mono text-[9px] tracking-wider uppercase px-3 py-2 text-center cursor-default"
                      style={{ backgroundColor: `${graphite}60`, color: pwcOrange, border: `1px solid ${pwcOrange}30` }}
                      initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.8 }}
                      animate={manifestoInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: prefersReducedMotion ? 1 : 0.8 }}
                      transition={{ delay: prefersReducedMotion ? 0 : 0.7 + i * 0.1, duration: prefersReducedMotion ? 0 : 0.3 }}
                      whileHover={{ scale: 1.05, backgroundColor: `${pwcOrange}20`, borderColor: `${pwcOrange}60` }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Video 1: Main 360° capture ── */}
      <section className="relative">
        <div className="relative w-full">
          <Video360Player
            youtubeId="cqqiTtDw7wI"
            accentColor="#E85D04"
            label="360° · Live Capture"
          />
        </div>
      </section>

      {/* Process Timeline */}
      <section ref={processRef} className="relative px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-[#0a0a0a]">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="hidden"
          animate={processInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div className="flex flex-col md:flex-row md:items-center justify-between mb-12 md:mb-20 gap-4" variants={slideInLeft}>
            <div className="flex items-center gap-4 md:gap-6">
              <motion.div
                className="h-[3px] w-16 md:w-24 origin-left"
                style={{ backgroundColor: pwcOrange }}
                initial={{ scaleX: 0 }}
                animate={processInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
              />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: dataBlue }}>
                <ScrambleText text="Process" enabled={processInView} delay={200} speed={40} />
              </span>
            </div>
            <span className="font-display text-2xl md:text-3xl lg:text-4xl text-[#F2F2F0] uppercase">
              Workflow Architecture
            </span>
          </motion.div>

          <div className="relative">
            {/* Timeline line - desktop only */}
            <motion.div
              className="absolute top-20 left-0 right-0 h-[2px] hidden lg:block origin-left"
              style={{ backgroundColor: graphiteLight }}
              initial={{ scaleX: 0 }}
              animate={processInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.3 }}
            />
            <motion.div
              className="absolute top-20 left-0 w-1/3 h-[2px] hidden lg:block origin-left"
              style={{ background: `linear-gradient(90deg, ${pwcOrange}, ${dataBlue})` }}
              initial={{ scaleX: 0 }}
              animate={processInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.5 }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
              {approachSections.map((approach, index) => (
                <motion.div
                  key={approach.title}
                  className="relative group"
                  variants={fadeInUp}
                  custom={index}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 40 }}
                  animate={processInView ? { opacity: 1, y: 0 } : { opacity: 0, y: prefersReducedMotion ? 0 : 40 }}
                  transition={{ delay: prefersReducedMotion ? 0 : 0.2 + index * 0.15, duration: prefersReducedMotion ? 0 : 0.5 }}
                >
                  {/* Desktop step number */}
                  <div className="hidden lg:flex absolute top-0 left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      className="w-10 h-10 flex items-center justify-center"
                      style={{ backgroundColor: graphite, border: `2px solid ${index === 1 ? dataBlue : pwcOrange}` }}
                      whileHover={{ scale: 1.1, borderColor: dataBlue }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="font-mono text-sm font-bold text-[#F2F2F0]">{index + 1}</span>
                    </motion.div>
                  </div>

                  {/* Mobile step number */}
                  <div className="lg:hidden mb-4 flex items-center gap-4">
                    <motion.div
                      className="w-12 h-12 flex items-center justify-center"
                      style={{ backgroundColor: graphite, border: `2px solid ${pwcOrange}` }}
                      whileHover={{ scale: 1.05, borderColor: dataBlue }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="font-mono text-lg font-bold text-[#F2F2F0]">{index + 1}</span>
                    </motion.div>
                    <div className="h-[2px] flex-1" style={{ backgroundColor: graphiteLight }} />
                  </div>

                  <motion.div
                    className="lg:mt-28 p-6 md:p-8 border cursor-default touch-manipulation"
                    style={{ borderColor: graphiteLight, backgroundColor: `${graphite}20` }}
                    whileHover={{ borderColor: index === 1 ? dataBlue : pwcOrange, backgroundColor: `${graphite}40`, y: -3 }}
                    whileTap={{ borderColor: `${pwcOrange}60`, backgroundColor: `${graphite}30` }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="font-display text-xl md:text-2xl uppercase tracking-tight mb-4 md:mb-6" style={{ color: index === 1 ? dataBlue : pwcOrange }}>
                      <ScrambleText text={approach.title} enabled={processInView} delay={400 + index * 150} speed={40} />
                    </h3>
                    <div className="font-sans text-xs md:text-sm uppercase tracking-wide leading-[1.8] md:leading-[1.9] text-[#A3A3A3]">
                      {approach.content}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Video 2: Secondary 360° capture ── */}
      <section ref={video2Ref} className="relative px-6 md:px-12 lg:px-20 py-24">
        <motion.div
          className="max-w-7xl mx-auto"
          initial="hidden"
          animate={video2InView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div className="flex items-center gap-4 mb-8 md:mb-12" variants={slideInLeft}>
            <motion.div
              className="h-[2px] w-12 md:w-16 origin-left"
              style={{ backgroundColor: dataBlue }}
              initial={{ scaleX: 0 }}
              animate={video2InView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.2 }}
            />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: pwcOrange }}>
              <ScrambleText text="Experience" enabled={video2InView} delay={300} speed={40} />
            </span>
          </motion.div>

          <motion.div variants={scaleIn}>
            <Video360Player
              youtubeId="jPrEkBih0K8"
              accentColor="#00D4AA"
              label="360° · Data Field"
            />
          </motion.div>
        </motion.div>
      </section>

      <WorkProjectFooter currentSlug="pwc-liftoff-vr360" />
    </article>
  );
}

