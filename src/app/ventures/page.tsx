'use client';

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView, useReducedMotion } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';
import { ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import Lightning from '@/components/Lightning';

// ============================================
// RULE: NO EMOJIS IN DESIGN OR CONTENT
// ============================================

// ============================================
// TYPEWRITER - RUNS ONCE, SLOWER BLINK
// ============================================
const TypewriterText = ({ text, className, style, delay = 0, speed = 30 }: { text: string; className: string; style?: React.CSSProperties; delay?: number; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [hasRun, setHasRun] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !hasRun) setHasRun(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasRun]);

  useEffect(() => {
    if (!hasRun) return;
    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= text.length) {
          setDisplayedText(text.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
          setTimeout(() => setShowCursor(false), 10000);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [hasRun, text, delay, speed]);

  return (
    <span ref={ref} className={className} style={style}>
      {displayedText}
      {showCursor && (
        <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} className="inline-block w-[2px] h-[1em] bg-current ml-1 align-middle" />
      )}
    </span>
  );
};

// ============================================
// SOEN LOGO - Animated Geometric Crystal
const SOENLogo = ({ color, isHovered }: { color: string; isHovered?: boolean }) => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <defs>
      <linearGradient id="soenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
      <filter id="soenGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Outer ring with orbital animation */}
    <motion.circle 
      cx="40" cy="40" r="36" 
      stroke="url(#soenGrad)" 
      strokeWidth="1.5" 
      fill="none" 
      initial={{ pathLength: 0, rotate: 0 }}
      animate={{ 
        pathLength: 1, 
        rotate: isHovered ? [0, 360] : 0,
        strokeWidth: isHovered ? 2.5 : 1.5
      }}
      transition={{ 
        pathLength: { duration: 1.2, ease: 'easeOut' },
        rotate: { duration: 8, repeat: isHovered ? Infinity : 0, ease: 'linear' },
        strokeWidth: { duration: 0.3 }
      }}
      style={{ transformOrigin: 'center' }}
    />
    {/* Inner hexagon with pulse */}
    <motion.path 
      d="M40 12 L62 24 L62 48 L40 60 L18 48 L18 24 Z" 
      stroke={color} 
      strokeWidth="2" 
      fill={`${color}20`}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ 
        scale: isHovered ? [1, 1.08, 1] : 1, 
        opacity: 1,
        fill: isHovered ? `${color}35` : `${color}20`
      }}
      transition={{ 
        scale: { duration: 0.8, repeat: isHovered ? Infinity : 0, ease: 'easeInOut' },
        opacity: { duration: 0.5, delay: 0.4 },
        fill: { duration: 0.3 }
      }}
    />
    {/* Center node with glow pulse */}
    <motion.circle 
      cx="40" cy="40" r="6" 
      fill="url(#soenGrad)"
      filter="url(#soenGlow)"
      initial={{ scale: 0 }}
      animate={{ 
        scale: isHovered ? [1, 1.3, 1] : 1,
      }}
      transition={{ 
        scale: { duration: 1.5, repeat: isHovered ? Infinity : 0, ease: 'easeInOut' },
        delay: 0.6
      }}
    />
    {/* Orbiting dots */}
    {isHovered && [
      { angle: 0, delay: 0 },
      { angle: 120, delay: 0.3 },
      { angle: 240, delay: 0.6 }
    ].map((dot, i) => (
      <motion.circle
        key={i}
        r="2.5"
        fill="#22d3ee"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: dot.delay, duration: 0.3 }}
      >
        <animateMotion
          dur="4s"
          repeatCount="indefinite"
          path="M40,4 A36,36 0 1,1 40,76 A36,36 0 1,1 40,4"
          begin={`${dot.delay}s`}
        />
      </motion.circle>
    ))}
  </svg>
);

// ============================================
// CULTUREPULSE LOGO - Animated Orbital Pulse
const CulturePulseLogo = ({ color, isHovered }: { color: string; isHovered?: boolean }) => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <defs>
      <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={color} />
        <stop offset="50%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor={color} />
      </linearGradient>
      <filter id="pulseGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Outer rotating ring */}
    <motion.circle 
      cx="40" cy="40" r="36" 
      stroke={color} 
      strokeWidth="1" 
      strokeDasharray="8 4"
      fill="none" 
      opacity={0.4}
      initial={{ rotate: 0 }}
      animate={{ 
        rotate: isHovered ? [0, -360] : [0, -360],
        opacity: isHovered ? 0.7 : 0.4
      }}
      transition={{ 
        rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
        opacity: { duration: 0.3 }
      }}
      style={{ transformOrigin: 'center' }}
    />
    {/* Secondary orbital ring */}
    <motion.circle 
      cx="40" cy="40" r="30" 
      stroke="url(#pulseGrad)" 
      strokeWidth="1.5" 
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0, rotate: 0 }}
      animate={{ 
        pathLength: 1,
        rotate: isHovered ? [0, 360] : 0,
      }}
      transition={{ 
        pathLength: { duration: 1, ease: 'easeOut' },
        rotate: { duration: 12, repeat: isHovered ? Infinity : 0, ease: 'linear' }
      }}
      style={{ transformOrigin: 'center' }}
    />
    {/* Waveform path */}
    <motion.path 
      d="M8 40 Q22 18, 40 40 T72 40" 
      stroke="url(#pulseGrad)" 
      strokeWidth="3.5" 
      fill="none" 
      strokeLinecap="round"
      filter="url(#pulseGlow)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ 
        pathLength: 1, 
        opacity: 1,
        y: isHovered ? [0, -3, 0] : 0
      }}
      transition={{ 
        pathLength: { duration: 0.8, ease: 'easeOut' },
        opacity: { duration: 0.3, delay: 0.5 },
        y: { duration: 2, repeat: isHovered ? Infinity : 0, ease: 'easeInOut' }
      }}
    />
    {/* Pulsing center */}
    <motion.circle 
      cx="40" cy="40" r="8" 
      fill={color}
      filter="url(#pulseGlow)"
      initial={{ scale: 0 }}
      animate={{ 
        scale: isHovered ? [1, 1.25, 1] : 1,
      }}
      transition={{ 
        scale: { duration: 1.2, repeat: isHovered ? Infinity : 0, ease: 'easeInOut' },
        delay: 0.5
      }}
    />
    {/* Pulse rings when hovered */}
    {isHovered && [1, 2, 3].map((ring) => (
      <motion.circle
        key={ring}
        cx="40"
        cy="40"
        r={18 + ring * 8}
        stroke={color}
        strokeWidth="0.5"
        fill="none"
        initial={{ scale: 0.8, opacity: 0.6 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          delay: ring * 0.4,
          ease: 'easeOut'
        }}
      />
    ))}
  </svg>
);

// ============================================
// VENTURE DATA
// ============================================
const ventures = {
  parent: {
    id: 'surface-tension',
    name: 'SURFACE TENSION',
    tagline: 'Experiential Production & Creative Technology Studio',
    description: 'A multi-dimensional experiential company specializing in high-fidelity physical and digital experiences for global brands.',
    url: 'https://surfacetension.co',
    features: ['Experiential Production', 'Creative Technology', 'Global Brand Experiences'],
  },
  products: [
    {
      id: 'soen',
      name: 'SOEN',
      tagline: 'AI for Humans',
      status: 'COMING SOON',
      color: '#06b6d4',
      description: 'An intelligent operating layer that orchestrates complex creative tasks using advanced multi-modal models.',
      url: 'https://soen.ai',
      features: ['AI Productivity OS', 'Multi-Modal Models', 'Workflow Automation'],
      launchDate: '2026',
      subtitle: 'IN DEVELOPMENT',
    },
    {
      id: 'culturepulse',
      name: 'CULTUREPULSE',
      tagline: 'Enterprise Intelligence Platform',
      status: 'ENTERPRISE',
      color: '#6366f1',
      description: 'Leveraging large-scale data analysis to predict and visualize shifting cultural paradigms.',
      url: '#',
      features: ['Cultural Trend Mapping', 'Strategic Positioning', 'Enterprise Solutions'],
      locked: true,
      subtitle: 'PRIVATE',
    },
  ],
};

// ============================================
// STATUS ORB WITH CSS PULSE - GPU OPTIMIZED
// ============================================
const StatusOrb = React.memo(({ status, color }: { status: string; color: string }) => {
  const isPulse = status === 'ACTIVE' || status === 'COMING SOON';
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        {isPulse && (
          <span 
            className="absolute inset-0 rounded-full animate-ping"
            style={{ 
              backgroundColor: color,
              animationDuration: '3s',
              opacity: 0.4
            }} 
          />
        )}
        <span className="relative w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: color }} />
      </div>
      <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/60">{status}</span>
    </div>
  );
});
StatusOrb.displayName = 'StatusOrb';

// ============================================
// LETTER REVEAL - GPU OPTIMIZED
// Uses CSS will-change, memoized, reduced motion support
// ============================================
const LetterReveal = React.memo(({ text, className, delay = 0, staggerDelay = 0.03, style }: { text: string; className: string; delay?: number; staggerDelay?: number; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobileHook();
  
  // Memoize letter array to prevent re-splitting
  const letters = useMemo(() => text.split(''), [text]);
  
  // If mobile or reduced motion, render without letter animation
  if (isMobile || prefersReducedMotion) {
    return (
      <h1 ref={ref} className={`${className} break-words overflow-wrap-anywhere will-change-transform`} style={style}>
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
        >
          {text}
        </motion.span>
      </h1>
    );
  }
  
  return (
    <h1 ref={ref} className={`${className} break-words overflow-wrap-anywhere`} style={style}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ y: 100, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{
            duration: 0.6,
            delay: delay + i * staggerDelay,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="inline-block will-change-transform"
          style={{ transformOrigin: 'center bottom' }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </h1>
  );
});
LetterReveal.displayName = 'LetterReveal';

// Shared mobile hook for consistency
const useIsMobileHook = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
};

// ============================================
// 3D TILT CARD - ZERO RE-RENDER
// Uses CSS custom properties, no React state, RAF only on hover
// ============================================
const TiltCard = React.memo(({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const rafRef = useRef<number | null>(null);
  const isHoveringRef = useRef(false);
  const currentRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  
  // RAF loop only runs when hovering - no React state updates
  const runLoop = useCallback(() => {
    if (!isHoveringRef.current && Math.abs(currentRef.current.x) < 0.01 && Math.abs(currentRef.current.y) < 0.01) {
      currentRef.current = { x: 0, y: 0 };
      targetRef.current = { x: 0, y: 0 };
      if (ref.current) {
        ref.current.style.setProperty('--rotateX', '0deg');
        ref.current.style.setProperty('--rotateY', '0deg');
      }
      rafRef.current = null;
      return; // Stop RAF
    }
    
    // Lerp towards target
    currentRef.current.x += (targetRef.current.y - currentRef.current.x) * 0.1;
    currentRef.current.y += (targetRef.current.x - currentRef.current.y) * 0.1;
    
    // Apply directly to DOM - NO REACT STATE
    if (ref.current) {
      ref.current.style.setProperty('--rotateX', `${currentRef.current.x}deg`);
      ref.current.style.setProperty('--rotateY', `${currentRef.current.y}deg`);
    }
    
    rafRef.current = requestAnimationFrame(runLoop);
  }, []);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || prefersReducedMotion) return;
    const rect = ref.current.getBoundingClientRect();
    targetRef.current = {
      x: ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 5,
      y: ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -5
    };
  }, [prefersReducedMotion]);
  
  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    if (!rafRef.current) rafRef.current = requestAnimationFrame(runLoop);
  }, [runLoop]);
  
  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    targetRef.current = { x: 0, y: 0 };
    // RAF continues until settled
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);
  
  // Skip 3D transforms if reduced motion preferred
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }
  
  return (
    <div 
      ref={ref} 
      className={`${className} will-change-transform`} 
      style={{ 
        transform: 'perspective(1000px) rotateX(var(--rotateX, 0deg)) rotateY(var(--rotateY, 0deg))',
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
});
TiltCard.displayName = 'TiltCard';

// ============================================
// MAGNETIC BUTTON - ZERO RE-RENDER
// Uses CSS custom properties, no React state, RAF only on hover
// ============================================
const MagneticButton = React.memo(({ children, className, onClick, onMouseEnter: onMouseEnterProp, onMouseLeave: onMouseLeaveProp }: { children: React.ReactNode; className?: string; onClick?: () => void; onMouseEnter?: () => void; onMouseLeave?: () => void }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const rafRef = useRef<number | null>(null);
  const isHoveringRef = useRef(false);
  const currentRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  
  // RAF loop only runs when needed - no React state
  const runLoop = useCallback(() => {
    if (!isHoveringRef.current && Math.abs(currentRef.current.x) < 0.01 && Math.abs(currentRef.current.y) < 0.01) {
      currentRef.current = { x: 0, y: 0 };
      targetRef.current = { x: 0, y: 0 };
      if (ref.current) {
        ref.current.style.setProperty('--magX', '0px');
        ref.current.style.setProperty('--magY', '0px');
      }
      rafRef.current = null;
      return; // Stop RAF
    }
    
    // Lerp
    currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.15;
    currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.15;
    
    // Direct DOM update - NO REACT STATE
    if (ref.current) {
      ref.current.style.setProperty('--magX', `${currentRef.current.x}px`);
      ref.current.style.setProperty('--magY', `${currentRef.current.y}px`);
    }
    
    rafRef.current = requestAnimationFrame(runLoop);
  }, []);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    targetRef.current = {
      x: (e.clientX - rect.left - rect.width / 2) * 0.2,
      y: (e.clientY - rect.top - rect.height / 2) * 0.2
    };
  }, []);
  
  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    onMouseEnterProp?.();
    if (!rafRef.current) rafRef.current = requestAnimationFrame(runLoop);
  }, [runLoop, onMouseEnterProp]);
  
  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    targetRef.current = { x: 0, y: 0 };
    onMouseLeaveProp?.();
    // RAF continues until settled
  }, [onMouseLeaveProp]);
  
  // Cleanup
  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);
  
  return (
    <button 
      ref={ref} 
      className={`${className} will-change-transform`} 
      onClick={onClick} 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave} 
      onMouseEnter={handleMouseEnter}
      style={{ transform: 'translate(var(--magX, 0px), var(--magY, 0px))' }}
    >
      {children}
    </button>
  );
});
MagneticButton.displayName = 'MagneticButton';

// ============================================
// SURFACE TENSION - GPU OPTIMIZED SCROLL
// Uses memoized transforms, will-change hints
// ============================================
const SurfaceTensionSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ 
    target: containerRef, 
    offset: ["start end", "end start"]
  });
  const { setCursorState } = useCursor();
  const [isHovered, setIsHovered] = useState(false);
  
  // Scroll transforms with spring smoothing for reduced jank
  const rawLine1X = useTransform(scrollYProgress, [0, 0.4], [50, 0]);
  const rawLine2X = useTransform(scrollYProgress, [0.1, 0.5], [0, 0]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  
  // Smooth the scroll values to reduce frame drops
  const line1X = useSpring(rawLine1X, { stiffness: 100, damping: 30, mass: 1 });
  const line2X = useSpring(rawLine2X, { stiffness: 100, damping: 30, mass: 1 });
  const opacity = useSpring(rawOpacity, { stiffness: 100, damping: 30, mass: 1 });

  return (
    <section ref={containerRef} className="relative py-16 md:py-24 overflow-hidden">
      <div className="px-6 md:px-12 lg:px-20">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-[1px] bg-[#333]" />
            <span className="font-mono text-[11px] text-[#8A8A85] uppercase tracking-[0.4em]">Parent Company</span>
          </div>
        </motion.div>

        {/* Massive Typography - More About Me Style */}
        <motion.div style={{ opacity }} className="relative mb-16 will-change-transform">
          {/* SURFACE - FIXED: Responsive font sizing with word-break protection */}
          <div className="overflow-hidden">
            <motion.div style={{ x: line1X }} className="will-change-transform">
              <LetterReveal 
                text="SURFACE" 
                className="font-display text-[#F2F2F0] uppercase leading-[0.85] block break-words"
                style={{ fontSize: 'clamp(2.5rem, 9vw, 9rem)' }}
                delay={0.1}
                staggerDelay={0.05}
              />
            </motion.div>
          </div>
          
          {/* TENSION - offset, faded - FIXED: Responsive sizing + mobile margin */}
          <div className="overflow-hidden ml-[2vw] sm:ml-[3vw] md:ml-[8vw]">
            <motion.div style={{ x: line2X }} className="will-change-transform">
              <LetterReveal 
                text="TENSION" 
                className="font-display text-[#F2F2F0]/60 uppercase leading-[0.85] block break-words"
                style={{ fontSize: 'clamp(2.5rem, 9vw, 9rem)' }}
                delay={0.4}
                staggerDelay={0.05}
              />
            </motion.div>
          </div>

          {/* Decorative large number */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="absolute right-0 top-[40%] -translate-y-1/2 pointer-events-none"
          >
            <span className="font-display text-[120px] md:text-[200px] text-[#F2F2F0]/[0.02] leading-none">
              01
            </span>
          </motion.div>
        </motion.div>

        {/* Description & CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-8 h-[1px] bg-[#6366f1]/50 mb-6" />
              <p className="font-sans text-[15px] text-[#A3A3A3] leading-[1.8] max-w-sm">
                {ventures.parent.description}
              </p>
            </motion.div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="lg:text-right"
            >
              {/* Status */}
              <div className="flex items-center gap-3 mb-6 lg:justify-end">
                <StatusOrb status="ACTIVE" color="#22c55e" />
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-3 mb-8 lg:justify-end">
                {ventures.parent.features.map((feature, i) => (
                  <motion.span 
                    key={feature} 
                    className="font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 border border-[#525252] text-[#A3A3A3] cursor-default transition-all duration-300 hover:text-[#22c55e] hover:border-[#22c55e] hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    {feature}
                  </motion.span>
                ))}
              </div>

              {/* CTA */}
              <MagneticButton
                className="group inline-flex items-center gap-3 font-display text-sm tracking-widest uppercase text-[#F2F2F0] hover:text-white/70 transition-colors"
                onClick={() => typeof window !== 'undefined' && window.open(ventures.parent.url, '_blank')}
                onMouseEnter={() => setCursorState('hover')}
                onMouseLeave={() => setCursorState('default')}
              >
                <span>Explore Surface Tension</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
            </motion.div>
          </div>
        </div>

        {/* Bottom decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 h-[2px] bg-gradient-to-r from-transparent via-[#333] to-transparent origin-center"
        />

        {/* Products indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 mb-4 flex items-center justify-center gap-2"
        >
          <span className="font-mono text-xs text-[#F2F2F0] uppercase tracking-[0.3em] font-medium">Products</span>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================
// PRODUCT CARD - GPU OPTIMIZED
// Memoized, CSS hover states, content-visibility
// ============================================
const ProductCard = React.memo(({ venture, index }: { venture: typeof ventures.products[0]; index: number }) => {
  const { setCursorState } = useCursor();
  const [isHovered, setIsHovered] = useState(false);
  const LogoComponent = venture.id === 'soen' ? SOENLogo : CulturePulseLogo;
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  // Memoize feature tags to prevent re-renders
  const featureTags = useMemo(() => venture.features, [venture.features]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative content-visibility-auto contain-layout"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TiltCard className="w-full gpu-accelerated">
        <div className={`relative p-6 sm:p-8 md:p-10 bg-[#0D0D0D] border h-full min-h-[480px] sm:min-h-[520px] flex flex-col touch-manipulation transition-colors duration-500 will-change-transform ${isHovered ? 'border-[#333]' : 'border-[#1a1a1a]'}`}>
          {/* Large Logo with enhanced animation */}
          <div className="mb-10">
            <LogoComponent color={venture.color} isHovered={isHovered} />
          </div>

          {/* Content */}
          <div className="space-y-6 flex-grow">
            <div className="flex items-center justify-between">
              <StatusOrb status={venture.status} color={venture.color} />
              {venture.subtitle && (
                <span 
                  className="font-mono text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 border rounded-sm"
                  style={{ 
                    color: venture.subtitle === 'IN DEVELOPMENT' ? '#f59e0b' : venture.subtitle === 'PRIVATE' ? '#c2410c' : venture.color,
                    borderColor: venture.subtitle === 'IN DEVELOPMENT' ? 'rgba(245, 158, 11, 0.4)' : venture.subtitle === 'PRIVATE' ? 'rgba(194, 65, 12, 0.4)' : `${venture.color}40`
                  }}
                >
                  {venture.subtitle}
                </span>
              )}
            </div>

            {/* FIXED: No mid-word cutoff with break-words and responsive sizing */}
            <h3 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#F2F2F0] break-words hyphens-auto min-w-0">
              {venture.name}
            </h3>

            <p className="text-[#8A8A85] text-base leading-relaxed">
              {venture.description}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {featureTags.map((feature) => (
                <span 
                  key={feature} 
                  className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 border border-[#3A3A3A] text-[#A3A3A3] transition-all duration-300 hover:scale-105 cursor-default"
                  style={{
                    ['--hover-color' as string]: venture.color,
                    ['--hover-shadow' as string]: `0 0 15px ${venture.color}30`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = venture.color;
                    e.currentTarget.style.color = venture.color;
                    e.currentTarget.style.boxShadow = `0 0 15px ${venture.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#3A3A3A';
                    e.currentTarget.style.color = '#A3A3A3';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {feature}
                </span>
              ))}
            </div>

            <div className="pt-8 mt-auto">
              {venture.locked ? (
                <div className="flex items-center gap-2 text-[#525252]">
                  <Lock className="w-4 h-4" />
                  <span className="font-mono text-xs tracking-widest uppercase">Enterprise Access</span>
                </div>
              ) : (
                <MagneticButton
                  className="group flex items-center gap-2 font-display text-sm tracking-widest uppercase text-[#F2F2F0] hover:text-white/60 transition-colors"
                  onClick={() => typeof window !== 'undefined' && window.open(venture.url, '_blank')}
                  onMouseEnter={() => setCursorState('hover')}
                  onMouseLeave={() => setCursorState('default')}
                >
                  <span>Explore {venture.name}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </MagneticButton>
              )}

              {venture.launchDate && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse" />
                  <span className="font-mono text-xs text-white/50 tracking-wider uppercase">Launch {venture.launchDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Hover indicator line - CSS transition instead of framer motion */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6366f1]/50 to-transparent transition-transform duration-400 ease-out will-change-transform"
            style={{ 
              transformOrigin: 'center',
              transform: isHovered ? 'scaleX(1)' : 'scaleX(0)'
            }}
          />
        </div>
      </TiltCard>
    </motion.div>
  );
});
ProductCard.displayName = 'ProductCard';

// ============================================
// MAIN PAGE
// ============================================
export default function VenturesPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative bg-[#0D0D0D] min-h-screen">
      {/* Lightning Background - Spans Hero + Surface Tension */}
      <div className="absolute top-0 left-0 right-0 h-[140vh] z-0 pointer-events-none">
        <Lightning
          hue={189}
          xOffset={0}
          speed={0.9}
          intensity={0.55}
          size={0.7}
          className="opacity-80"
        />
        {/* Top fade for seamless nav blend */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0D0D0D] to-transparent z-10" />
        {/* Bottom fade for transition to products */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/80 to-transparent z-10" />
      </div>

      {/* HERO */}
      <section className="min-h-[50vh] flex flex-col justify-end px-6 md:px-12 lg:px-20 pt-8 pb-2 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <motion.span
            className="font-mono text-[11px] tracking-[0.4em] text-[#8A8A85] uppercase block mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Built by Pratt
          </motion.span>

          {/* FIXED: Increased minimum size for mobile readability + word-break protection */}
          <LetterReveal
            text="VENTURES"
            className="font-display text-[#F2F2F0] uppercase leading-none tracking-tighter block break-words"
            style={{ fontSize: 'clamp(1.25rem, 4vw, 3rem)' }}
            delay={0.3}
            staggerDelay={0.06}
          />

          <motion.p
            className="font-mono text-base text-[#8A8A85] mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            Where ideas become infrastructure
          </motion.p>
        </div>
      </section>

      {/* SURFACE TENSION - More About Me Aesthetic (with lightning background continuing) */}
      <div className="relative z-10">
        <SurfaceTensionSection />
      </div>

      {/* DIVIDER */}
      <div className="px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="h-[1px] bg-gradient-to-r from-transparent via-[#1a1a1a] to-transparent origin-center"
        />
      </div>

      {/* PRODUCTS - CLEAR VISUAL HIERARCHY */}
      <section className="py-8 md:py-12">
        <div className="px-6 md:px-12 lg:px-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ventures.products.map((venture, index) => (
                <ProductCard key={venture.id} venture={venture} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section className="py-24 border-t border-[#1a1a1a]">
        <motion.div
          className="max-w-4xl mx-auto text-center px-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="font-mono text-[11px] tracking-[0.3em] text-[#6366f1] uppercase block mb-6">
            Always Exploring
          </span>
          <h2 className="font-display text-4xl md:text-6xl text-[#F2F2F0] uppercase tracking-tight mb-6">
            What&apos;s Next?
          </h2>
          <p className="font-mono text-sm text-[#8A8A85] max-w-md mx-auto mb-10">
            New ventures are constantly in development. The lab never sleeps.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-3 font-display text-base tracking-widest uppercase text-[#F2F2F0] hover:text-[#6366f1] transition-colors duration-300 group"
          >
            <span>Return Home</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
