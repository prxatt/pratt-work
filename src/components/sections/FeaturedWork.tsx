'use client';

import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';
import { getImageUrl, getVideoUrl } from '@/lib/media';

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE CAPS — ONE call at FeaturedWork root, passed as props.
// Previous version called this inside MagneticWrapper, LazyVideo, CardContent,
// BoubyanCard, ImageCard AND FeaturedWork = 6 hook instances per render.
// ─────────────────────────────────────────────────────────────────────────────

interface DeviceCaps {
  isTouch: boolean;
  isMobile: boolean;
  isLowEnd: boolean;
  prefersReducedMotion: boolean;
}

const DEFAULT_CAPS: DeviceCaps = {
  isTouch: false, isMobile: false, isLowEnd: false, prefersReducedMotion: false,
};

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const useDeviceCaps = (): DeviceCaps => {
  const [caps, setCaps] = useState<DeviceCaps>(DEFAULT_CAPS);
  // useIsomorphicLayoutEffect: apply caps before first paint so LetterReveal doesn't switch
  // lite mode mid-animation (useEffect caused mobile titles stuck at opacity 0).
  useIsomorphicLayoutEffect(() => {
    setCaps({
      isTouch: window.matchMedia('(pointer: coarse)').matches,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isLowEnd: typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory !== 'undefined' && (navigator as Navigator & { deviceMemory?: number }).deviceMemory! < 4,
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
  }, []);
  return caps;
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA + HELPERS
// ─────────────────────────────────────────────────────────────────────────────

interface Project {
  title: string; category: string; year: string; slug: string; subtitle: string;
}

const projects: Project[] = [
  {
    title: 'THE SHAPE OF FINANCE WITH BOUBYAN BANK',
    category: 'EXPERIENTIAL', year: '2024', slug: 'boubyan-bank-hq',
    subtitle: '3D GENERATIVE EXPERIENCE | EXPERIENTIAL',
  },
  {
    title: "WEIGHTS & BIASES 'FULLY CONNECTED'",
    category: 'AI + TECH', year: '2025', slug: 'weights-and-biases-fully-connected',
    subtitle: 'AI CONFERENCE | MLOPS',
  },
  {
    title: 'SURFACE TENSION: DIGITAL DRIP',
    category: 'EXPERIENTIAL', year: '2025', slug: 'surface-tension-digital-drip',
    subtitle: 'EXPERIENTIAL | IMMERSIVE ART',
  },
];

const getCategoryColor = (c: string) => {
  const u = c.toUpperCase();
  if (u.includes('EXPERIENTIAL')) return '#22C55E';
  if (u.includes('AI') || u.includes('TECH')) return '#3B82F6';
  if (u.includes('FILM')) return '#F59E0B';
  if (u.includes('R&D')) return '#A855F7';
  return '#8A8A85';
};

const getCategoryGradient = (c: string) => {
  const u = c.toUpperCase();
  if (u.includes('EXPERIENTIAL')) return 'linear-gradient(135deg, #0f1f12 0%, #1a3a1f 100%)';
  if (u.includes('AI') || u.includes('TECH')) return 'linear-gradient(135deg, #0a0f1e 0%, #0f1a38 100%)';
  if (u.includes('FILM')) return 'linear-gradient(135deg, #1e1208 0%, #3a2010 100%)';
  if (u.includes('R&D')) return 'linear-gradient(135deg, #150a1e 0%, #2a0f3a 100%)';
  return 'linear-gradient(135deg, #141414 0%, #1a1a1a 100%)';
};

const noiseStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
};

// ─────────────────────────────────────────────────────────────────────────────
// MAGNETIC WRAPPER — Steve Jobs level: CSS-only, zero JavaScript overhead
//
// Removed useMotionValue/useSpring that caused 60fps physics calculations.
// Now uses CSS transform on :hover with transition — butter smooth, zero lag.
// ─────────────────────────────────────────────────────────────────────────────

const MagneticWrapper = ({
  children, className, isTouch,
}: {
  children: React.ReactNode; className?: string; isTouch: boolean;
}) => {
  if (isTouch) return <div className={className}>{children}</div>;

  return (
    <div className={`${className} transition-transform duration-300 ease-out hover:scale-[1.02]`}>
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LAZY VIDEO — Ultra-optimized for Boubyan Bank
// Reduced resolution, hardware-accelerated, instant poster display
// ─────────────────────────────────────────────────────────────────────────────

const LazyVideo = ({
  src,
  poster,
  caps,
  eagerRootMargin = '100px 0px 100px 0px',
  priority = false,
}: {
  src: { webm: string; mp4: string };
  poster?: string;
  caps: DeviceCaps;
  eagerRootMargin?: string;
  priority?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(priority);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    if (priority) {
      setLoad(true);
    }
    const video = videoRef.current;
    if (!video) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        const in_ = entry.isIntersecting;
        setVis(in_);
        if (in_) setLoad(true);
      },
      { threshold: 0.08, rootMargin: eagerRootMargin }
    );
    obs.observe(video);
    return () => obs.disconnect();
  }, [eagerRootMargin, priority]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (vis) {
      video.muted = true;
      video.playsInline = true;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [vis]);

  // Low-end devices: show gradient only, no video overhead
  if (caps.isMobile && caps.isLowEnd) {
    return <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #0f1f12, #0a0a0a)' }} />;
  }

  const fadeMs = priority ? 280 : 500;

  return (
    <div className="relative w-full h-full">
      {poster && (
        <img
          src={getImageUrl(poster, 1400)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
        />
      )}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload={priority ? 'auto' : 'metadata'}
        className="absolute inset-0 w-full h-full object-cover gpu-accelerated"
        style={{
          opacity: vis ? 1 : 0,
          transition: `opacity ${fadeMs}ms ease-out`,
        }}
      >
        {load && (
          <>
            <source src={getVideoUrl(src.webm)} type="video/webm" />
            <source src={getVideoUrl(src.mp4)} type="video/mp4" />
          </>
        )}
      </video>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED CARD OVERLAYS — Upgraded with brand color reveals
// CSS-first approach with strategic Framer Motion for premium feel
// ─────────────────────────────────────────────────────────────────────────────

const CardOverlays = ({ index, isInView, category }: { index: number; isInView: boolean; category: string }) => {
  const color = getCategoryColor(category);
  
  return (
    <>
      {/* Noise texture - instant, no animation, GPU accelerated */}
      <div
        className="absolute inset-0 pointer-events-none z-[2] opacity-[0.04] gpu-accelerated"
        style={noiseStyle}
      />
      
      {/* Unified hover overlay - cohesive, performant, GPU accelerated */}
      <div 
        className="absolute inset-0 z-[3] opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none bg-black/40 gpu-accelerated"
      />
      
      {/* Center content - slides up on hover, GPU accelerated */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[4] opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:-translate-y-[60%] gpu-accelerated">
        <span 
          className="font-display text-xs tracking-[0.2em] uppercase px-6 py-3 rounded-full border flex items-center gap-2"
          style={{ 
            borderColor: `${color}60`, 
            color,
            backgroundColor: `${color}10`,
            boxShadow: `0 0 30px ${color}20`
          }}
        >
          View Case Study
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
      
      {/* Border accent - CSS only, no motion.div lag */}
      <div 
        className="absolute top-0 left-0 w-full h-[1px] z-10 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
        style={{ backgroundColor: color, opacity: 0.6 }}
      />
      <div 
        className="absolute bottom-0 right-0 w-full h-[1px] z-10 origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-100"
        style={{ backgroundColor: color, opacity: 0.6 }}
      />
      
      {/* Corner accents - subtle on hover */}
      <div 
        className="absolute top-4 left-4 w-6 h-6 border-l border-t z-10 opacity-0 group-hover:opacity-60 transition-opacity duration-500"
        style={{ borderColor: color }}
      />
      <div 
        className="absolute bottom-4 right-4 w-6 h-6 border-r border-b z-10 opacity-0 group-hover:opacity-60 transition-opacity duration-500"
        style={{ borderColor: color }}
      />
    </>
  );
};

// Steve Jobs level: Simplified text reveal - no per-character lag
// Per-character animation removed - now uses clean blur-to-clear for performance
const LetterReveal = ({
  text, className, delay = 0, lite = false, reveal = true,
}: { text: string; className: string; delay?: number; lite?: boolean; reveal?: boolean }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const hidden = lite
    ? { opacity: 0, y: 10, filter: 'blur(0px)' }
    : { opacity: 0, y: 20, filter: 'blur(8px)' };
  const visible = lite
    ? { opacity: 1, y: 0, filter: 'blur(0px)' }
    : { opacity: 1, y: 0, filter: 'blur(0px)' };
  return (
    <motion.h3 
      ref={ref} 
      className={className}
      initial={hidden}
      animate={reveal ? visible : hidden}
      transition={{ duration: lite ? 0.45 : 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {text}
    </motion.h3>
  );
};

const CardContent = ({
  project, index, isInView, featured, caps,
}: {
  project: Project; index: number; isInView: boolean; featured?: boolean; caps: DeviceCaps;
}) => {
  const color = getCategoryColor(project.category);
  const titleLite = caps.isMobile || caps.isTouch || caps.prefersReducedMotion;
  return (
    <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-start gap-4">
      <div className="flex flex-col gap-1 sm:gap-2">
        <motion.span
          className="font-mono text-[9px] sm:text-[10px] tracking-widest uppercase"
          style={{ color }}
          initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 + index * 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {project.category}
        </motion.span>
        <div className="overflow-hidden">
          <LetterReveal
            text={project.title}
            className={`font-display text-primary leading-[1.15] whitespace-normal break-normal [word-break:normal] [overflow-wrap:normal] max-w-full ${featured ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl' : 'text-xl sm:text-2xl md:text-3xl'}`}
            delay={0.3 + index * 0.15}
            lite={titleLite}
            reveal={isInView}
          />
        </div>
        <motion.span
          className="font-mono text-[9px] sm:text-[10px] tracking-widest uppercase text-tertiary"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 + index * 0.15 }}
        >
          {project.subtitle}
        </motion.span>
      </div>
      {!caps.isMobile && (
        <div className="mt-2 sm:mt-4 group/line">
          <motion.div
            className="h-[2px] bg-primary group-hover/line:w-20 group-hover/line:bg-[color:var(--hover-color)] transition-all duration-300"
            style={{ '--hover-color': color } as React.CSSProperties}
            initial={{ width: 0 }} animate={isInView ? { width: 48 } : {}}
            transition={{ duration: 0.6, delay: 0.4 + index * 0.15 }}
          />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// BOUBYAN CARD — Steve Jobs level: no scroll-linked parallax (eliminates lag)
//
// Removed useScroll/useTransform that caused massive scroll lag.
// Video now plays smoothly without constant transform recalculations.
// ─────────────────────────────────────────────────────────────────────────────

const BoubyanCard = ({
  project, index, featured = false, caps,
}: {
  project: Project; index: number; featured?: boolean; caps: DeviceCaps;
}) => {
  const { setCursorState } = useCursor();
  const ref      = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px 40% 0px', amount: 0.15 });
  const aspectClass = featured ? 'aspect-[16/9] sm:aspect-[21/9] md:aspect-[21/8]' : 'aspect-[16/10]';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      <Link href={`/work/${project.slug}`} className="block w-full h-full"
        onMouseEnter={() => setCursorState('hover')} onMouseLeave={() => setCursorState('default')}>
        {/* Fixed clip boundary — overflow-hidden lives HERE only */}
        <div className={`relative ${aspectClass} rounded-sm overflow-hidden`}>
          {/* Static video container - no parallax lag */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.2, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 scale-[1.02]">
              <LazyVideo
                src={{ webm: '/work/boubyan-bank-card.webm', mp4: '/work/boubyan-bank-card.mp4' }}
                poster="/work/boubyan-bank-thumb.webp"
                caps={caps}
                eagerRootMargin="480px 0px 75vh 0px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.15)_100%)]" />
              <div className="absolute inset-0 opacity-[0.02]" style={noiseStyle} />
            </div>
          </motion.div>
          <CardOverlays index={index} isInView={isInView} category={project.category} />
        </div>
        <CardContent project={project} index={index} isInView={isInView} featured={featured} caps={caps} />
      </Link>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE CARD — Ultra-optimized instant loading with upgraded hover
// Next.js Image with blur placeholder + CSS-only magnetic effect
// ─────────────────────────────────────────────────────────────────────────────

const ImageCard = ({
  project, index, featured = false, caps,
}: {
  project: Project; index: number; featured?: boolean; caps: DeviceCaps;
}) => {
  const { setCursorState } = useCursor();
  const ref      = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px 40% 0px', amount: 0.15 });
  const aspectClass = featured ? 'aspect-[16/9] sm:aspect-[21/9] md:aspect-[21/8]' : 'aspect-[16/10]';

  const isWeights = project.slug === 'weights-and-biases-fully-connected';
  const isSurface = project.slug === 'surface-tension-digital-drip';
  const gradient  = getCategoryGradient(project.category);
  const color = getCategoryColor(project.category);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative group contain-layout"
    >
      <Link href={`/work/${project.slug}`} className="block w-full h-full"
        onMouseEnter={() => setCursorState('hover')} onMouseLeave={() => setCursorState('default')}>
        <div className={`relative ${aspectClass} rounded-sm overflow-hidden`}>
          {/* Entry animation + hardware accelerated image */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            initial={{ scale: 1.05, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 1.05, opacity: 0 }}
            transition={{ duration: 1.2, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {isWeights ? (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                <img 
                  src={getImageUrl('/work/weights-biases-card.webp', 1600)} 
                  alt={project.title}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  style={{ objectPosition: 'center center' }}
                />
              </div>
            ) : isSurface ? (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                <img
                  src={getImageUrl('/work/surface-tension-drip.webp', 1600)}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={index <= 2 ? 'high' : 'auto'}
                  style={{ objectPosition: 'center center' }}
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (el.dataset.fallback === '1') return;
                    el.dataset.fallback = '1';
                    el.removeAttribute('srcset');
                    el.src = '/work/surface-tension-drip.jpg';
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-full" style={{ background: gradient }} />
            )}
            
            {/* Overlays - always present, animated via CSS */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.15)_100%)]" />
            <div className="absolute inset-0 opacity-[0.02]" style={noiseStyle} />
          </motion.div>
          
          {/* Unified hover overlay - cohesive, performant */}
          <div 
            className="absolute inset-0 z-[3] opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none bg-black/40"
          />
          
          {/* View Case Study button - slides up */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[4] opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:-translate-y-[60%]">
            <span 
              className="font-display text-xs tracking-[0.2em] uppercase px-6 py-3 rounded-full border flex items-center gap-2"
              style={{ 
                borderColor: `${color}60`, 
                color,
                backgroundColor: `${color}10`,
                boxShadow: `0 0 30px ${color}20`
              }}
            >
              View Case Study
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
          
          {/* Corner accents - subtle on hover */}
          <div 
            className="absolute top-4 left-4 w-6 h-6 border-l border-t z-10 opacity-0 group-hover:opacity-60 transition-opacity duration-500"
            style={{ borderColor: color }}
          />
          <div 
            className="absolute bottom-4 right-4 w-6 h-6 border-r border-b z-10 opacity-0 group-hover:opacity-60 transition-opacity duration-500"
            style={{ borderColor: color }}
          />
        </div>
        <CardContent project={project} index={index} isInView={isInView} featured={featured} caps={caps} />
      </Link>
    </motion.div>
  );
};

const AnimatedHeader = ({ isMobile }: { isMobile: boolean }) => {
  const ref      = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px 100px 0px' });
  if (isMobile) {
    return (
      <div ref={ref} className="flex flex-col gap-4 sm:gap-6">
        <motion.span
          className="font-mono text-[9px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.4em] text-tertiary uppercase"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          SELECTED PROJECTS
        </motion.span>
        <motion.h2
          className="text-section-header text-primary uppercase text-balance max-w-full"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="block">FEATURED</span>
          <span className="block">WORK</span>
        </motion.h2>
      </div>
    );
  }
  return (
    <div ref={ref} className="flex flex-col gap-4 sm:gap-6">
      <motion.span
        className="font-mono text-[9px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.4em] text-tertiary uppercase"
        initial={{ opacity: 0, letterSpacing: '0.1em' }}
        animate={isInView ? { opacity: 1, letterSpacing: '0.4em' } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        SELECTED PROJECTS
      </motion.span>
      <h2 className="text-section-header text-primary uppercase text-balance max-w-full">
        {['FEATURED', 'WORK'].map((word, wi) => (
          <span key={wi} className="block overflow-hidden">
            {word.split('').map((letter, li) => (
              <motion.span key={li} className="inline-block"
                initial={{ y: 80, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: wi * 0.2 + li * 0.03, ease: [0.16, 1, 0.3, 1] }}
              >
                {letter}
              </motion.span>
            ))}
          </span>
        ))}
      </h2>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURED WORK — main export
// caps detected ONCE here, passed as props. No child calls useDeviceCaps().
// ─────────────────────────────────────────────────────────────────────────────

export const FeaturedWork = () => {
  const { setCursorState } = useCursor();
  const caps = useDeviceCaps(); // ONE call for the entire tree

  return (
    <section className="py-16 sm:py-24 md:py-40 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 sm:mb-24 gap-6 sm:gap-8">
        <AnimatedHeader isMobile={caps.isMobile} />
        <motion.div
          initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '0px 0px 100px 0px' }} transition={{ duration: 0.55, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/work"
            className="group flex items-center gap-3 sm:gap-4 text-tertiary hover:text-primary transition-colors duration-500 min-h-[44px]"
            onMouseEnter={() => setCursorState('hover')} onMouseLeave={() => setCursorState('default')}
          >
            <motion.span
              className="font-display text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase"
              whileHover={caps.isTouch ? {} : { x: 4 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              VIEW ALL PROJECTS
            </motion.span>
            <div className="w-8 sm:w-10 h-px bg-tertiary group-hover:w-12 sm:group-hover:w-16 group-hover:bg-primary transition-all duration-500" />
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div className="md:col-span-2">
          <BoubyanCard project={projects[0]} index={0} featured caps={caps} />
        </div>
        <ImageCard project={projects[1]} index={1} caps={caps} />
        <ImageCard project={projects[2]} index={2} caps={caps} />
      </div>
    </section>
  );
};
