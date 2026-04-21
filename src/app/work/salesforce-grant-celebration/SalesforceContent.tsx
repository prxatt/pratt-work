'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode, useState } from 'react';
import { Users } from 'lucide-react';
import { WorkProjectFooter } from '@/components/work/WorkProjectFooter';
import { AnimatedCounter } from '@/components/micro-animations/AnimatedCounter';
import { ScrambleText } from '@/components/micro-animations/ScrambleText';
import { CornerDraw } from '@/components/micro-animations/CornerDraw';
import { MagneticArrow } from '@/components/micro-animations/MagneticArrow';
import { getImageUrl } from '@/lib/media';

interface SalesforceContentProps {
  metadata: {
    title: string;
    description?: string;
    year: string;
    role: string;
  };
  content: string;
  mainDescriptionMdx: ReactNode;
  approachMdx: ReactNode[];
}

export default function SalesforceContent({ metadata, content, mainDescriptionMdx, approachMdx }: SalesforceContentProps) {
  const contentSections = content.split('---').filter(section => section.trim());
  
  const approachSections = contentSections.slice(1).filter(section => {
    const trimmed = section.trim();
    return trimmed.startsWith('##');
  }).map((section, index) => {
    const lines = section.trim().split('\n');
    const title = lines[0].replace('##', '').trim();
    return { title, index };
  });

  // Hover states for photo frames
  const [hoveredFrame, setHoveredFrame] = useState<number | null>(null);

  // Salesforce Corporate Tech Aesthetic - Bold & Geometric
  const sfBlue = '#0176D3';       // Salesforce blue
  const sfLight = '#1B96FF';      // Light blue accent
  const sfDark = '#032D60';       // Deep navy
  const white = '#FFFFFF';
  const graphite = '#181818';     // Dark background
  const grid = '#2D2D2D';         // Grid lines

  const stats = [
    { value: 18.2, prefix: '$', suffix: 'M', label: 'Grants Announced', icon: null, decimals: 1 },
    { value: 130, prefix: '', suffix: '', label: 'Volunteers', icon: Users, decimals: 0 },
    { value: 3, prefix: '', suffix: '', label: 'Weeks', icon: null, decimals: 0 },
  ];

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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
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

  const heroRef = useRef(null);
  const missionRef = useRef(null);
  const processRef = useRef(null);
  const impactRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const missionInView = useInView(missionRef, { once: true, margin: "-100px" });
  const processInView = useInView(processRef, { once: true, margin: "-100px" });
  const impactInView = useInView(impactRef, { once: true, margin: "-100px" });

  return (
    <article className="min-h-screen bg-[#0a0a0a]">
      {/* Geometric Grid Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Bold diagonal lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diagonal" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <line x1="0" y1="100" x2="100" y2="0" stroke={sfBlue} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal)" />
        </svg>

        {/* Vertical data lines */}
        <div className="absolute top-0 left-[15%] w-[1px] h-full opacity-[0.05]" style={{ background: `linear-gradient(to bottom, ${sfBlue}, transparent)` }} />
        <div className="absolute top-0 right-[20%] w-[1px] h-[60%] opacity-[0.05]" style={{ background: `linear-gradient(to bottom, ${sfBlue}, transparent)` }} />
        <div className="absolute top-[30%] left-0 w-[30%] h-[1px] opacity-[0.05]" style={{ background: `linear-gradient(to right, ${sfBlue}, transparent)` }} />

        {/* Bold corner accent */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] opacity-[0.08]" 
          style={{ 
            background: `conic-gradient(from 180deg at 100% 0%, ${sfBlue} 0deg, transparent 90deg)` 
          }} 
        />

        {/* Salesforce glow */}
        <div 
          className="absolute top-1/4 right-0 w-[600px] h-[600px] opacity-[0.06] blur-3xl"
          style={{ background: `radial-gradient(circle at center, ${sfBlue} 0%, transparent 60%)` }}
        />
      </div>

      {/* Hero - Bold Asymmetric Layout */}
      <header ref={heroRef} className="relative min-h-screen flex items-center px-6 md:px-12 lg:px-20 pt-32 pb-20">
        <motion.div 
          className="w-full max-w-7xl mx-auto"
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
            
            {/* Left: Main Title Block - 7 columns */}
            <div className="lg:col-span-7 space-y-6">
              {/* Top label bar */}
              <motion.div className="flex items-center gap-4" variants={slideInLeft}>
                <motion.div 
                  className="h-[2px] w-16" 
                  style={{ backgroundColor: sfBlue }}
                  initial={{ scaleX: 0 }}
                  animate={heroInView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: sfBlue }}>
                  <ScrambleText text="Dreamforce Activation" enabled={heroInView} delay={400} speed={35} />
                </span>
              </motion.div>

              {/* Bold stacked title - SALESFORCE one word, two colors */}
              <motion.div className="space-y-0" variants={fadeInUp}>
                <h1 className="font-display text-[clamp(2.85rem,19vw,15rem)] uppercase leading-[0.9] tracking-tight break-words text-balance">
                  <span className="text-white">SALES</span>
                  <wbr />
                  <span style={{ color: sfBlue }}>FORCE</span>
                </h1>
              </motion.div>

              {/* Grant Celebration subtitle - boxed */}
              <motion.div 
                className="inline-block px-4 md:px-6 py-2 md:py-3 border-2 break-words"
                style={{ borderColor: `${sfBlue}40` }}
                variants={fadeInUp}
              >
                <span className="font-display text-base md:text-lg lg:text-xl uppercase tracking-wide text-white">
                  Grant Celebration
                </span>
              </motion.div>

              {/* Mission statement */}
              <motion.p 
                className="font-sans text-base md:text-lg lg:text-xl text-[#888] max-w-xl leading-relaxed mt-6 md:mt-8 break-words hyphens-none text-pretty"
                variants={fadeInUp}
              >
                Transforming a corporate milestone into a human celebration. Technology means nothing if it doesn&apos;t lift the community.
              </motion.p>

              {/* Role badge */}
              <motion.div 
                className="flex items-center gap-3 pt-4"
                variants={itemVariants}
              >
                <motion.div 
                  className="w-3 h-3 rotate-45"
                  style={{ backgroundColor: sfLight }}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={heroInView ? { scale: 1, rotate: 45 } : { scale: 0, rotate: 0 }}
                  transition={{ duration: 0.4, delay: 0.8, type: "spring" }}
                />
                <span className="font-mono text-[10px] md:text-[11px] tracking-[0.2em] md:tracking-[0.25em] uppercase text-white break-all">
                  {metadata.role}
                </span>
                <span className="font-mono text-[9px] md:text-[10px] text-[#555] uppercase shrink-0">{metadata.year}</span>
              </motion.div>
            </div>

            {/* Right: Data Stats Block - 5 columns */}
            <motion.div 
              className="lg:col-span-5 lg:pl-8"
              variants={slideInRight}
            >
              <div 
                className="p-4 sm:p-6 md:p-8 border will-change-transform"
                style={{ 
                  borderColor: `${grid}`,
                  background: `linear-gradient(135deg, ${sfDark}10 0%, transparent 50%)`
                }}
              >
                {/* Stats header */}
                <div className="flex items-center justify-between mb-6 md:mb-8 pb-4 border-b border-[#333] gap-4">
                  <span className="font-mono text-[9px] md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] uppercase text-[#666] break-words">Impact Metrics</span>
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: sfBlue }}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="font-mono text-[9px] uppercase" style={{ color: sfBlue }}>Live</span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="space-y-6">
                  {stats.map((stat, i) => (
                    <motion.div 
                      key={i} 
                      className="flex items-baseline justify-between"
                      initial={{ opacity: 0, x: 20 }}
                      animate={heroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                      transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                    >
                      <div className="min-w-0">
                        <span className="font-display text-3xl md:text-4xl lg:text-5xl text-white block break-all">
                          <AnimatedCounter
                            value={stat.value}
                            prefix={stat.prefix}
                            suffix={stat.suffix}
                            decimals={stat.decimals}
                            duration={2000}
                            enabled={heroInView}
                          />
                        </span>
                        <span className="font-mono text-[9px] md:text-[10px] tracking-[0.1em] md:tracking-[0.15em] uppercase text-[#666] break-words">
                          {stat.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {stat.icon && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={heroInView ? { scale: 1 } : { scale: 0 }}
                            transition={{ delay: 0.5 + i * 0.15, type: "spring", stiffness: 200 }}
                          >
                            <stat.icon className="w-5 h-5" style={{ color: sfBlue }} />
                          </motion.div>
                        )}
                        <motion.span 
                          className="font-mono text-[10px] md:text-xs px-2 py-1 border cursor-default shrink-0 will-change-transform"
                          style={{ 
                            borderColor: `${sfBlue}30`,
                            color: sfBlue 
                          }}
                          whileHover={{ scale: 1.05, backgroundColor: `${sfBlue}15` }}
                          transition={{ duration: 0.2 }}
                        >
                          <ScrambleText text={stat.suffix || '—'} enabled={heroInView} delay={800 + i * 200} speed={60} />
                        </motion.span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom accent */}
                <div className="mt-6 md:mt-8 pt-4 border-t border-[#333] flex items-center justify-between gap-4">
                  <span className="font-mono text-[8px] md:text-[9px] text-[#444] uppercase break-words">Fundraising Event</span>
                  <div className="flex gap-1 shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <motion.div 
                        key={i} 
                        className="w-4 h-1" 
                        style={{ backgroundColor: i < 3 ? sfBlue : '#333' }}
                        initial={{ scaleX: 0 }}
                        animate={heroInView ? { scaleX: 1 } : { scaleX: 0 }}
                        transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom ticker bar */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 border-t border-[#222] bg-[#0a0a0a]"
          initial={{ y: 100, opacity: 0 }}
          animate={heroInView ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#666]">
                Category: <span className="text-white"><ScrambleText text="Corporate Events" enabled={heroInView} delay={1200} speed={50} /></span>
              </span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#666]">
                Year: <span className="text-white">{metadata.year}</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <span className="font-mono text-[10px] text-[#444] uppercase"><ScrambleText text="Grant Celebration" enabled={heroInView} delay={1400} speed={50} /></span>
              <span className="font-mono text-[10px] text-[#444]">•</span>
              <span className="font-mono text-[10px] text-[#444] uppercase"><ScrambleText text="Dreamforce" enabled={heroInView} delay={1500} speed={50} /></span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Main Content - Two Column with Photo Frames */}
      <section ref={missionRef} className="relative px-6 md:px-12 lg:px-20 py-24">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial="hidden"
          animate={missionInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Section header */}
          <motion.div className="flex items-center gap-4 mb-16" variants={slideInLeft}>
            <motion.span 
              className="font-mono text-[10px] tracking-[0.3em] uppercase" 
              style={{ color: sfBlue }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={missionInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.4 }}
            >
              01
            </motion.span>
            <motion.div 
              className="h-[1px] flex-1 max-w-xs" 
              style={{ backgroundColor: sfBlue }}
              initial={{ scaleX: 0 }}
              animate={missionInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#666]">
              <ScrambleText text="The Mission" enabled={missionInView} delay={400} speed={40} />
            </span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Content - 5 columns */}
            <motion.div className="lg:col-span-5" variants={fadeInUp}>
              <div className="prose prose-invert prose-lg max-w-none">
                <div className="font-sans text-lg md:text-xl uppercase tracking-wide leading-[1.9] text-[#888]">
                  {mainDescriptionMdx}
                </div>
              </div>
            </motion.div>

            {/* Right: Photo Frames Grid - 7 columns */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-4">
                {/* Frame 1 - Large */}
                <motion.div 
                  className="col-span-2"
                  variants={slideInRight}
                >
                  <motion.div 
                    className="relative aspect-[16/9] border overflow-hidden group cursor-pointer touch-manipulation"
                    style={{ borderColor: grid }}
                    whileHover={{ borderColor: `${sfBlue}60` }}
                    transition={{ duration: 0.3 }}
                    onHoverStart={() => setHoveredFrame(0)}
                    onHoverEnd={() => setHoveredFrame(null)}
                    onTap={() => setHoveredFrame(prev => prev === 0 ? null : 0)}
                  >
                    {/* Animated Corner Draw - hidden on touch devices for performance */}
                    <div className="hidden sm:block">
                      <CornerDraw color={sfBlue} size={24} strokeWidth={2} isHovered={hoveredFrame === 0} />
                    </div>
                    
                    {/* Image - Mayor Speaking - Optimized loading */}
                    <motion.div 
                      className="absolute inset-2 overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.4 }}
                    >
                      <picture>
                        <source srcSet={getImageUrl('/work/salesforce-mayor.webp', 1400, { format: 'webp' })} type="image/webp" />
                        <source srcSet={getImageUrl('/work/salesforce-mayor.jpeg', 1400, { format: 'jpg' })} type="image/jpeg" />
                        <img 
                          src={getImageUrl('/work/salesforce-mayor.jpeg', 1400, { format: 'jpg' })}
                          alt="Mayor speaking at Salesforce grant celebration event"
                          className="w-full h-full object-cover"
                          loading="eager"
                          decoding="async"
                          fetchPriority="high"
                        />
                      </picture>
                    </motion.div>

                    {/* Frame number */}
                    <div className="absolute bottom-3 md:bottom-4 left-4 md:left-6 font-mono text-[9px] md:text-[10px] text-[#555] uppercase">
                      IMG_01
                    </div>
                  </motion.div>
                </motion.div>

                {/* Frame 2 */}
                <motion.div variants={fadeInUp}>
                  <motion.div 
                    className="relative aspect-[4/3] border overflow-hidden group cursor-pointer touch-manipulation"
                    style={{ borderColor: grid }}
                    whileHover={{ borderColor: `${sfBlue}60` }}
                    transition={{ duration: 0.3 }}
                    onHoverStart={() => setHoveredFrame(1)}
                    onHoverEnd={() => setHoveredFrame(null)}
                    onTap={() => setHoveredFrame(prev => prev === 1 ? null : 1)}
                  >
                    <div className="hidden sm:block">
                      <CornerDraw color={sfBlue} size={16} strokeWidth={1} isHovered={hoveredFrame === 1} />
                    </div>
                    
                    {/* Image - Class Session - Lazy loaded */}
                    <motion.div 
                      className="absolute inset-2 overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.4 }}
                    >
                      <picture>
                        <source srcSet={getImageUrl('/work/salesforce-learn.webp', 1400, { format: 'webp' })} type="image/webp" />
                        <source srcSet={getImageUrl('/work/salesforce-learn.jpeg', 1400, { format: 'jpg' })} type="image/jpeg" />
                        <img 
                          src={getImageUrl('/work/salesforce-learn.webp', 1400, { format: 'webp' })}
                          alt="Students participating in STEM class activity"
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </picture>
                    </motion.div>

                    <div className="absolute bottom-3 left-3 font-mono text-[9px] text-[#555] uppercase">
                      IMG_02
                    </div>
                  </motion.div>
                </motion.div>

                {/* Frame 3 */}
                <motion.div variants={fadeInUp}>
                  <motion.div 
                    className="relative aspect-[4/3] border overflow-hidden group cursor-pointer touch-manipulation"
                    style={{ borderColor: grid }}
                    whileHover={{ borderColor: `${sfBlue}60` }}
                    transition={{ duration: 0.3 }}
                    onHoverStart={() => setHoveredFrame(2)}
                    onHoverEnd={() => setHoveredFrame(null)}
                    onTap={() => setHoveredFrame(prev => prev === 2 ? null : 2)}
                  >
                    <div className="hidden sm:block">
                      <CornerDraw color={sfBlue} size={16} strokeWidth={1} isHovered={hoveredFrame === 2} />
                    </div>
                    
                    {/* Image - Q&A Session - Lazy loaded */}
                    <motion.div 
                      className="absolute inset-2 overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.4 }}
                    >
                      <picture>
                        <source srcSet={getImageUrl('/work/salesforce-qa.webp', 1400, { format: 'webp' })} type="image/webp" />
                        <source srcSet={getImageUrl('/work/salesforce-qa.jpeg', 1400, { format: 'jpg' })} type="image/jpeg" />
                        <img 
                          src={getImageUrl('/work/salesforce-qa.jpeg', 1400, { format: 'jpg' })}
                          alt="Students asking questions during Q&A session"
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </picture>
                    </motion.div>

                    <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 font-mono text-[8px] md:text-[9px] text-[#555] uppercase">
                      IMG_03
                    </div>
                  </motion.div>
                </motion.div>

                {/* Frame 4 */}
                <motion.div 
                  className="col-span-2"
                  variants={slideInRight}
                >
                  <motion.div 
                    className="relative aspect-video border overflow-hidden group cursor-pointer touch-manipulation"
                    style={{ borderColor: grid }}
                    whileHover={{ borderColor: `${sfBlue}60` }}
                    transition={{ duration: 0.3 }}
                    onHoverStart={() => setHoveredFrame(3)}
                    onHoverEnd={() => setHoveredFrame(null)}
                    onTap={() => setHoveredFrame(prev => prev === 3 ? null : 3)}
                  >
                    <div className="hidden sm:block">
                      <CornerDraw color={sfBlue} size={24} strokeWidth={2} isHovered={hoveredFrame === 3} />
                    </div>
                    
                    {/* Image - Lab/VR Experience - Lazy loaded */}
                    <motion.div 
                      className="absolute inset-2 overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.4 }}
                    >
                      <picture>
                        <source srcSet={getImageUrl('/work/salesforce-lab.webp', 1400, { format: 'webp' })} type="image/webp" />
                        <source srcSet={getImageUrl('/work/salesforce-lab.jpeg', 1400, { format: 'jpg' })} type="image/jpeg" />
                        <img 
                          src={getImageUrl('/work/salesforce-lab.jpeg', 1400, { format: 'jpg' })}
                          alt="Students exploring VR and technology lab"
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </picture>
                    </motion.div>

                    <div className="absolute bottom-3 md:bottom-4 left-4 md:left-6 font-mono text-[9px] md:text-[10px] text-[#555] uppercase">
                      IMG_04
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Process Steps - Horizontal Bar Style */}
      <section ref={processRef} className="relative px-6 md:px-12 lg:px-20 py-24 bg-[#080808]">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial="hidden"
          animate={processInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Section header */}
          <motion.div className="flex items-center justify-between mb-16" variants={slideInLeft}>
            <div className="flex items-center gap-4">
              <motion.span 
                className="font-mono text-[10px] tracking-[0.3em] uppercase" 
                style={{ color: sfBlue }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={processInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.4 }}
              >
                02
              </motion.span>
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#666]">
                <ScrambleText text="Execution" enabled={processInView} delay={400} speed={40} />
              </span>
            </div>
            <motion.span 
              className="font-display text-2xl text-white uppercase"
              initial={{ opacity: 0, x: 20 }}
              animate={processInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ScrambleText text="Process" enabled={processInView} delay={600} speed={50} />
            </motion.span>
          </motion.div>

          {/* Horizontal step bars */}
          <div className="space-y-4 md:space-y-6">
            {approachSections.map((approach) => (
              <motion.div 
                key={approach.title}
                className="flex items-stretch border-l-4 will-change-transform"
                style={{ borderColor: approach.index === 0 ? sfBlue : approach.index === 1 ? sfLight : sfDark }}
                initial={{ opacity: 0, x: -30 }}
                animate={processInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                transition={{ delay: approach.index * 0.15, duration: 0.5 }}
              >
                {/* Step number */}
                <motion.div 
                  className="w-16 sm:w-20 md:w-32 flex items-center justify-center border-r border-[#222] shrink-0 touch-manipulation"
                  style={{ backgroundColor: approach.index === 0 ? `${sfBlue}10` : approach.index === 1 ? `${sfLight}10` : `${sfDark}10` }}
                  whileHover={{ backgroundColor: approach.index === 0 ? `${sfBlue}20` : approach.index === 1 ? `${sfLight}20` : `${sfDark}20` }}
                  whileTap={{ backgroundColor: approach.index === 0 ? `${sfBlue}30` : approach.index === 1 ? `${sfLight}30` : `${sfDark}30` }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="font-display text-2xl sm:text-3xl md:text-4xl text-white">
                    0{approach.index + 1}
                  </span>
                </motion.div>

                {/* Content */}
                <div className="flex-1 p-4 sm:p-6 md:p-8 min-w-0">
                  <h3 
                    className="font-display text-lg sm:text-xl md:text-2xl uppercase tracking-tight mb-3 md:mb-4 break-words"
                    style={{ color: approach.index === 0 ? sfBlue : approach.index === 1 ? sfLight : white }}
                  >
                    {approach.title}
                  </h3>
                  <div className="font-sans text-xs sm:text-sm uppercase tracking-wide leading-[1.8] md:leading-[1.9] text-[#888] max-w-3xl break-words">
                    {approachMdx[approach.index]}
                  </div>
                </div>

                {/* Magnetic Arrow indicator */}
                <MagneticArrow color={approach.index === 0 ? sfBlue : approach.index === 1 ? sfLight : sfDark}>
                  →
                </MagneticArrow>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Impact Section - Data Cards */}
      <section ref={impactRef} className="relative px-6 md:px-12 lg:px-20 py-24">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial="hidden"
          animate={impactInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Section header */}
          <motion.div className="flex items-center gap-4 mb-16" variants={slideInLeft}>
            <motion.span 
              className="font-mono text-[10px] tracking-[0.3em] uppercase" 
              style={{ color: sfBlue }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={impactInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.4 }}
            >
              03
            </motion.span>
            <motion.div 
              className="h-[1px] flex-1 max-w-xs" 
              style={{ backgroundColor: sfBlue }}
              initial={{ scaleX: 0 }}
              animate={impactInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#666]">
              <ScrambleText text="Impact" enabled={impactInView} delay={400} speed={40} />
            </span>
          </motion.div>

          {/* Impact cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { 
                color: sfBlue, 
                label: 'Activity', 
                title: 'STEM Festival', 
                desc: 'Interactive learning experiences engaging students with technology and innovation',
                delay: 0
              },
              { 
                color: sfLight, 
                label: 'Technology', 
                title: 'VR Experiences', 
                desc: 'Immersive virtual reality activations showcasing the future of education',
                delay: 0.1
              },
              { 
                color: sfDark, 
                label: 'Community', 
                title: 'Volunteer Corps', 
                desc: '130 dedicated volunteers building teacher kits and supporting the community',
                delay: 0.2
              },
            ].map((card) => (
              <motion.div 
                key={card.title}
                className="p-6 md:p-8 border group cursor-default touch-manipulation will-change-transform"
                style={{ borderColor: `${card.color}40` }}
                initial={{ opacity: 0, y: 20 }}
                animate={impactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: card.delay, duration: 0.5 }}
                whileHover={{ 
                  borderColor: `${card.color}80`,
                  backgroundColor: `${card.color}05`,
                  y: -3
                }}
                whileTap={{ 
                  borderColor: `${card.color}60`,
                  backgroundColor: `${card.color}08`,
                }}
              >
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <motion.div 
                    className="w-3 h-3 shrink-0" 
                    style={{ backgroundColor: card.color }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.2 }}
                  />
                  <span className="font-mono text-[9px] md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] uppercase text-[#666] break-words">{card.label}</span>
                </div>
                <h4 className="font-display text-lg md:text-xl uppercase text-white mb-2 md:mb-3 break-words">{card.title}</h4>
                <p className="font-sans text-xs md:text-sm text-[#666] uppercase tracking-wide leading-relaxed break-words">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Closing Statement */}
      <section className="relative px-4 sm:px-6 md:px-12 lg:px-20 py-16 md:py-24 bg-[#080808]">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-block p-6 sm:p-8 md:p-12 border-2 will-change-transform"
            style={{ borderColor: `${sfBlue}30` }}
            whileHover={{ borderColor: `${sfBlue}50` }}
            whileTap={{ borderColor: `${sfBlue}40` }}
            transition={{ duration: 0.3 }}
          >
            <motion.span 
              className="font-mono text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] uppercase block mb-4 md:mb-6" 
              style={{ color: sfBlue }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <ScrambleText text="Salesforce Ohana" enabled={true} delay={200} speed={45} />
            </motion.span>
            <h3 className="font-display text-2xl sm:text-3xl md:text-4xl text-white uppercase tracking-tight mb-4 md:mb-6 break-words">
              A Festival of Equity
            </h3>
            <p className="font-sans text-sm md:text-base text-[#888] max-w-xl mx-auto leading-relaxed uppercase tracking-wide break-words px-2">
              Turning corporate milestones into human celebrations. From custom login experiences to celebration confetti—technology in service of community.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Project Footer */}
      <WorkProjectFooter currentSlug="salesforce-grant-celebration" />
    </article>
  );
}
