'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { AnimatedCounter } from '@/components/micro-animations/AnimatedCounter';
import { getImageUrl } from '@/lib/media';

// Memoized animation variants for performance - Denim/Industrial aesthetic
const useLevisAnimationVariants = (prefersReducedMotion: boolean | null) => {
  return useMemo(() => ({
    // Slide up fade - smooth like breaking in denim
    fadeInUp: {
      hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 40 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: prefersReducedMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }
      }
    },
    // Slide from right - industrial precision
    slideInRight: {
      hidden: { opacity: 0, x: prefersReducedMotion ? 0 : 60 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: prefersReducedMotion ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }
      }
    },
    // Scale up - like a rivet popping
    scaleIn: {
      hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: prefersReducedMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }
      }
    },
    // Rivet pulse - metallic heartbeat
    rivetPulse: {
      pulse: {
        boxShadow: [
          '0 0 0 0 rgba(184,115,51,0)',
          '0 0 0 4px rgba(184,115,51,0.3)',
          '0 0 0 8px rgba(184,115,51,0)'
        ],
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
      }
    },
    // Stitch draw - thread pulling through
    stitchDraw: {
      hidden: { scaleX: 0 },
      visible: { 
        scaleX: 1,
        transition: { duration: prefersReducedMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }
      }
    },
    // Card hover - denim press
    cardPress: {
      rest: { scale: 1, y: 0 },
      hover: { 
        scale: 1.02, 
        y: -4,
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
      }
    }
  }), [prefersReducedMotion]);
};

// Static Denim Background - zero animation cost, same visual appearance
const DenimTexture = ({ fullBleed = false }: { fullBleed?: boolean }) => (
  <div
    className={`${fullBleed ? 'absolute' : 'fixed'} inset-0 pointer-events-none`}
    aria-hidden
    style={{
      backgroundImage: `
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(255,255,255,0.015) 2px,
          rgba(255,255,255,0.015) 4px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 3px,
          rgba(255,255,255,0.01) 3px,
          rgba(255,255,255,0.01) 6px
        ),
        repeating-linear-gradient(
          45deg,
          rgba(0,0,0,0.08) 0px,
          rgba(0,0,0,0.08) 1px,
          transparent 1px,
          transparent 8px
        )
      `,
      opacity: 0.6,
    }}
  />
);

// Floating Levi's Red Tab Component
const FloatingRedTab = () => {
  return (
    <motion.div
      className="relative inline-block"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        {/* Shadow */}
        <div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[80%] h-3 rounded-[100%]"
          style={{ 
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 70%)',
            filter: 'blur(4px)'
          }}
        />
        
        {/* Tab body */}
        <div 
          className="relative px-3 py-4 rounded-sm"
          style={{
            background: 'linear-gradient(180deg, #DC2626 0%, #B91C1C 50%, #991B1B 100%)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -1px 1px rgba(0,0,0,0.2)',
          }}
        >
          <span 
            className="font-display text-xs font-bold tracking-widest uppercase text-white"
            style={{ 
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed'
            }}
          >
            LEVI'S
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Levi's Leather Patch Component with Metrics
const LevisLeatherPatch = () => {
  return (
    <div 
      className="relative p-8 rounded-sm"
      style={{
        background: `
          linear-gradient(135deg, #3D2914 0%, #2A1D0F 50%, #3D2914 100%),
          url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")
        `,
        backgroundBlendMode: 'multiply',
        border: '2px solid #4A3728',
        boxShadow: `
          inset 0 2px 4px rgba(0,0,0,0.5),
          inset 0 -1px 1px rgba(255,255,255,0.05),
          0 20px 60px rgba(0,0,0,0.4),
          0 8px 20px rgba(184,115,51,0.15)
        `,
      }}
    >
      {/* Corner rivets */}
      <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full z-20" style={{ background: 'radial-gradient(circle at 30% 30%, #E8A96F, #B87333 60%, #5C4020)' }} />
      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full z-20" style={{ background: 'radial-gradient(circle at 30% 30%, #E8A96F, #B87333 60%, #5C4020)' }} />
      <div className="absolute -bottom-2 -left-2 w-5 h-5 rounded-full z-20" style={{ background: 'radial-gradient(circle at 30% 30%, #E8A96F, #B87333 60%, #5C4020)' }} />
      <div className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full z-20" style={{ background: 'radial-gradient(circle at 30% 30%, #E8A96F, #B87333 60%, #5C4020)' }} />
      
      {/* Top decorative line - stitching style */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="h-[1px] w-12 bg-[#B87333]/60" style={{ background: 'repeating-linear-gradient(90deg, #B87333 0px, #B87333 4px, transparent 4px, transparent 8px)' }} />
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#B87333]">Quality</span>
        <div className="h-[1px] w-12 bg-[#B87333]/60" style={{ background: 'repeating-linear-gradient(90deg, #B87333 0px, #B87333 4px, transparent 4px, transparent 8px)' }} />
      </div>
      
      {/* Main title */}
      <div className="text-center mb-6">
        <h3 className="font-display text-3xl md:text-4xl text-[#E8D4B8] uppercase tracking-tight mb-1" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          LEVI'S
        </h3>
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#B87333]">
          Innovation Labs
        </p>
      </div>
      
      {/* Metrics row */}
      <div className="flex justify-center gap-6 pb-4 border-b border-[#5C4020]/50 mb-4">
        <div className="text-center">
          <span className="font-display text-2xl text-[#E8D4B8]">8</span>
          <p className="font-mono text-[9px] tracking-wider uppercase text-[#B87333]">Cameras</p>
        </div>
        <div className="text-center">
          <span className="font-display text-2xl text-[#E8D4B8]">360°</span>
          <p className="font-mono text-[9px] tracking-wider uppercase text-[#B87333]">Video</p>
        </div>
        <div className="text-center">
          <span className="font-display text-2xl text-[#E8D4B8]">8K</span>
          <p className="font-mono text-[9px] tracking-wider uppercase text-[#B87333]">Resolution</p>
        </div>
      </div>
      
      {/* Bottom text */}
      <p className="text-center font-mono text-[9px] tracking-[0.15em] uppercase text-[#8B7355]">
        San Francisco • 2023
      </p>
    </div>
  );
};

// Photo Frame Component
interface PhotoFrameProps {
  label: string;
  index: number;
  webp: string;
  jpeg: string;
  alt: string;
  isTouchDevice: boolean;
  onOpen?: () => void;
}

const PhotoFrame = ({ label, index, webp, jpeg, alt, isTouchDevice, onOpen }: PhotoFrameProps) => (
  <motion.div 
    className="relative group h-full flex flex-col min-w-0"
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.15 }}
    style={{ willChange: 'transform', transform: 'translateZ(0)' }}
    whileTap={{ scale: 0.99 }}
    onClick={() => {
      if (isTouchDevice && onOpen) onOpen();
    }}
  >
    {/* Full-bleed image container - fixed aspect ratio for consistency */}
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A0A0A]">
      <picture className="w-full h-full block">
        <source srcSet={webp} type="image/webp" />
        <source srcSet={jpeg} type="image/jpeg" />
        <img 
          src={jpeg}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 active:scale-[1.02]"
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
          style={{ minHeight: '100%', minWidth: '100%' }}
        />
      </picture>
    </div>
    
    {/* Minimal label below - mobile optimized */}
    <motion.div 
      className="mt-4 flex items-center gap-2 min-w-0"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.15 + 0.3 }}
    >
      <div className="w-2 h-2 rounded-full bg-[#B87333] shrink-0" />
      <span className="font-mono text-[9px] md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] uppercase text-[#888] [overflow-wrap:anywhere]">
        {label}
      </span>
    </motion.div>
  </motion.div>
);

// Stitched seam decoration
const StitchLine = ({ className = '' }: { className?: string }) => (
  <div 
    className={`h-[2px] ${className}`}
    style={{
      background: `repeating-linear-gradient(
        90deg,
        #B87333 0px,
        #B87333 6px,
        transparent 6px,
        transparent 10px
      )`,
      opacity: 0.6
    }}
  />
);

// Leather Patch Style Badge
const LeatherBadge = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div 
    className={`inline-flex items-center gap-3 px-5 py-3 ${className}`}
    style={{
      background: 'linear-gradient(135deg, #3D2914 0%, #2A1D0F 50%, #3D2914 100%)',
      border: '1px solid #5C4020',
      boxShadow: `
        inset 0 1px 1px rgba(255,255,255,0.1),
        0 2px 8px rgba(0,0,0,0.4),
        inset 0 -1px 1px rgba(0,0,0,0.3)
      `,
      borderRadius: '2px'
    }}
  >
    {/* Leather texture overlay */}
    <div 
      className="absolute inset-0 opacity-20 pointer-events-none rounded-[2px]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='leather'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23leather)'/%3E%3C/svg%3E")`
      }}
    />
    <div className="relative z-10 flex items-center gap-3">
      {children}
    </div>
  </div>
);

// Red Tab Component (iconic Levi's element)
const RedTab = ({ text }: { text: string }) => (
  <div 
    className="relative px-3 py-1.5 overflow-hidden"
    style={{
      background: '#C41E3A',
      clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 0 100%)'
    }}
  >
    <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white font-semibold">
      {text}
    </span>
    {/* Tab fold shadow */}
    <div className="absolute right-0 top-0 bottom-0 w-[6px] bg-black/20" />
  </div>
);

// Levi's Leather Patch Visual Component with Red Tab
const LeatherPatchVisual = () => {
  return (
    <motion.div 
      className="relative w-full max-w-[400px] mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3 }}
    >
      {/* Levi's Red Tab - positioned on right side like real Levi's */}
      <div 
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 py-3 px-1 rounded-sm"
        style={{
          background: 'linear-gradient(180deg, #DC2626 0%, #B91C1C 50%, #991B1B 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.4), inset -1px 0 1px rgba(255,255,255,0.1)',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
        }}
      >
        <span className="font-display text-[10px] font-bold tracking-widest uppercase text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
          LEVI'S
        </span>
      </div>

      {/* Main leather patch container */}
      <div 
        className="relative p-8 rounded-sm mr-4"
        style={{
          background: `
            linear-gradient(135deg, #3D2914 0%, #2A1D0F 50%, #3D2914 100%),
            url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")
          `,
          backgroundBlendMode: 'multiply',
          border: '2px solid #4A3728',
          boxShadow: `
            inset 0 2px 4px rgba(0,0,0,0.5),
            inset 0 -1px 1px rgba(255,255,255,0.05),
            0 20px 60px rgba(0,0,0,0.4),
            0 8px 20px rgba(184,115,51,0.15)
          `,
        }}
      >
        {/* Corner rivets */}
        <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full z-20" style={{ background: 'radial-gradient(circle at 30% 30%, #E8A96F, #B87333 60%, #5C4020)' }} />
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full z-20" style={{ background: 'radial-gradient(circle at 30% 30%, #E8A96F, #B87333 60%, #5C4020)' }} />
        <div className="absolute -bottom-2 -left-2 w-5 h-5 rounded-full z-20" style={{ background: 'radial-gradient(circle at 30% 30%, #E8A96F, #B87333 60%, #5C4020)' }} />
        <div className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full z-20" style={{ background: 'radial-gradient(circle at 30% 30%, #E8A96F, #B87333 60%, #5C4020)' }} />
        
        {/* Top decorative line - stitching style */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-[1px] w-12 bg-[#B87333]/60" style={{ background: 'repeating-linear-gradient(90deg, #B87333 0px, #B87333 4px, transparent 4px, transparent 8px)' }} />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#B87333]">Quality</span>
          <div className="h-[1px] w-12 bg-[#B87333]/60" style={{ background: 'repeating-linear-gradient(90deg, #B87333 0px, #B87333 4px, transparent 4px, transparent 8px)' }} />
        </div>
        
        {/* Main title */}
        <div className="text-center mb-6">
          <h3 className="font-display text-3xl md:text-4xl text-[#E8D4B8] uppercase tracking-tight mb-1" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            LEVI'S
          </h3>
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#B87333]">
            Innovation Labs 360°
          </p>
        </div>
        
        {/* Camera Rig Visualization - replacing video thumbnail */}
        <div className="relative mb-6 p-4 bg-[#1A1A1A]/80 rounded border border-[#5C4020]">
          {/* 8-camera rig SVG representation */}
          <svg viewBox="0 0 200 120" className="w-full h-auto">
            {/* Central hub */}
            <circle cx="100" cy="60" r="12" fill="#2D4A6F" stroke="#B87333" strokeWidth="1" />
            <circle cx="100" cy="60" r="6" fill="#0A1428" />
            
            {/* 8 cameras arranged in arc */}
            {[30, 50, 70, 90, 110, 130, 150, 170].map((x, i) => {
              const y = 60 - Math.abs(x - 100) * 0.3;
              return (
                <g key={i}>
                  {/* Connection line to center */}
                  <line x1="100" y1="60" x2={x} y2={y} stroke="#2D4A6F" strokeWidth="0.5" opacity="0.5" />
                  {/* Camera body */}
                  <rect x={x - 8} y={y - 6} width="16" height="12" rx="2" fill="#141414" stroke="#B87333" strokeWidth="1" />
                  {/* Camera lens */}
                  <circle cx={x} cy={y} r="4" fill="#0A1428" stroke="#1E3A5F" strokeWidth="0.5" />
                  {/* Recording dot */}
                  <circle cx={x + 3} cy={y - 3} r="1.5" fill="#DC2626">
                    <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
                  </circle>
                </g>
              );
            })}
            
            {/* Arc line representing 360 capture */}
            <path d="M 20 80 Q 100 20 180 80" fill="none" stroke="#B87333" strokeWidth="1" strokeDasharray="4 2" opacity="0.4" />
          </svg>
          
          {/* Label below rig */}
          <p className="text-center font-mono text-[10px] tracking-wider uppercase text-[#B87333] mt-2">
            8-Camera Array
          </p>
        </div>
        
        {/* Stats row */}
        <div className="flex justify-center gap-6 pb-4 border-b border-[#5C4020]/50 mb-4">
          <div className="text-center">
            <span className="font-display text-xl text-[#E8D4B8]">8</span>
            <p className="font-mono text-[9px] tracking-wider uppercase text-[#B87333]">Cameras</p>
          </div>
          <div className="text-center">
            <span className="font-display text-xl text-[#E8D4B8]">8K</span>
            <p className="font-mono text-[9px] tracking-wider uppercase text-[#B87333]">Resolution</p>
          </div>
          <div className="text-center">
            <span className="font-display text-xl text-[#E8D4B8]">SF</span>
            <p className="font-mono text-[9px] tracking-wider uppercase text-[#B87333]">Location</p>
          </div>
        </div>
        
        {/* Bottom text */}
        <p className="text-center font-mono text-[9px] tracking-[0.15em] uppercase text-[#8B7355]">
          San Francisco • 2023
        </p>
      </div>
      
      {/* Shadow reflection */}
      <div 
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-8 rounded-[100%]"
        style={{ 
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 70%)',
          filter: 'blur(8px)'
        }}
      />
    </motion.div>
  );
};

// Enhanced Stats Counter with circular indicators
const StatCounter = ({ value, label, suffix = '', type = 'default' }: { value: string; label: string; suffix?: string; type?: 'default' | 'circle' | 'arc' }) => {
  const [displayValue, setDisplayValue] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const numValue = parseInt(value);
          const duration = 1500;
          const startTime = Date.now();
          
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.floor(numValue * easeOut).toString());
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplayValue(value);
            }
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div ref={ref} className="text-center">
      <div className="flex items-baseline justify-center gap-1">
        <span className="font-display text-4xl md:text-5xl text-[#F2F2F0]">
          {displayValue}
        </span>
        {suffix && (
          <span className="font-mono text-lg text-[#B87333]">{suffix}</span>
        )}
      </div>
      <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#666] block mt-2">
        {label}
      </span>
    </div>
  );
};

// Main Page Component
export default function LevisInnovationLabsPage() {
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [activePublicationIndex, setActivePublicationIndex] = useState<number | null>(null);
  const galleryTouchStartX = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  
  // Get memoized animation variants
  const variants = useLevisAnimationVariants(prefersReducedMotion);

  // Technical specs with numeric values for AnimatedCounter - Levi's industrial aesthetic
  const technicalSpecs = useMemo(() => [
    { label: 'Synchronized Cameras', value: 8, displayValue: '8', unit: '', prefix: '', suffix: '' },
    { label: 'Spherical Capture', value: 360, displayValue: '360', unit: '°', prefix: '', suffix: '°' },
    { label: 'Resolution', value: 8, displayValue: '8', unit: 'K', prefix: '', suffix: 'K' },
  ], []);

  const processSteps = [
    {
      number: '01',
      title: 'Rig Assembly',
      description: '8-camera robotic array synchronized to genlock precision. Industrial-grade mounts calibrated for sub-millimeter alignment.'
    },
    {
      number: '02', 
      title: 'Live Capture',
      description: 'Real-time spherical recording with 8K output. On-site production management ensuring seamless execution across all angles.'
    },
    {
      number: '03',
      title: 'Post Production',
      description: 'Stitching, color grading, and VR optimization. Multi-platform delivery for web, mobile, and headset experiences.'
    }
  ];

  const galleryImages = [
    {
      src: getImageUrl('/work/levis-thumb.jpg', 2200, { format: 'jpg' }),
      alt: "Levi's rig assembly thumbnail",
      label: 'RIG ASSEMBLY',
      id: 'IMG_01',
    },
    {
      src: getImageUrl('/work/levis-lab.jpg', 2200, { format: 'jpg' }),
      alt: "Levi's live capture lab",
      label: 'LIVE CAPTURE',
      id: 'IMG_02',
    },
    {
      src: getImageUrl('/work/levis-collection.jpg', 2200, { format: 'jpg' }),
      alt: "Levi's collection post production",
      label: 'POST PRODUCTION',
      id: 'IMG_03',
    },
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const detectTouch = () => {
      setIsTouchDevice(('ontouchstart' in window) || navigator.maxTouchPoints > 0);
    };
    detectTouch();
    window.addEventListener('resize', detectTouch);
    return () => window.removeEventListener('resize', detectTouch);
  }, []);

  useEffect(() => {
    if (activeImageIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveImageIndex(null);
      if (e.key === 'ArrowRight') setActiveImageIndex((prev) => (prev === null ? 0 : (prev + 1) % galleryImages.length));
      if (e.key === 'ArrowLeft') setActiveImageIndex((prev) => (prev === null ? 0 : (prev - 1 + galleryImages.length) % galleryImages.length));
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeImageIndex, galleryImages.length]);

  const onGalleryTouchStart = (e: React.TouchEvent) => {
    galleryTouchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onGalleryTouchEnd = (e: React.TouchEvent) => {
    if (galleryTouchStartX.current === null || activeImageIndex === null) return;
    const endX = e.changedTouches[0]?.clientX ?? galleryTouchStartX.current;
    const delta = galleryTouchStartX.current - endX;
    const threshold = 40;
    if (delta > threshold) {
      setActiveImageIndex((activeImageIndex + 1) % galleryImages.length);
    } else if (delta < -threshold) {
      setActiveImageIndex((activeImageIndex - 1 + galleryImages.length) % galleryImages.length);
    }
    galleryTouchStartX.current = null;
  };

  return (
    <main 
      className="min-h-screen bg-[#0F1729] text-[#F2F2F0] relative overflow-x-hidden"
    >
      <DenimTexture fullBleed />

      {/* HERO SECTION - The Denim Canvas */}
      <section 
        className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 pt-32 pb-20 overflow-hidden"
      >
        {/* Main Content Stack */}
        <div className="max-w-6xl mx-auto w-full flex flex-col items-center text-center">
          
          {/* LEVI'S - Main Title with Red Tab attached to S */}
          <motion.div
            className="mb-2 relative inline-block pr-6 md:pr-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.h1 
              className="font-display text-[clamp(3.2rem,13.5vw,11rem)] text-[#F5F5DC] uppercase leading-[0.85] tracking-[0.02em]"
              style={{
                textShadow: `
                  0 4px 8px rgba(0,0,0,0.5),
                  0 8px 32px rgba(0,0,0,0.4),
                  0 16px 64px rgba(0,0,0,0.3),
                  0 0 120px rgba(184,115,51,0.15)
                `,
              }}
              initial={{ y: '100%', scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              LEVI'S
            </motion.h1>
            
            {/* Red Tab attached to right of S */}
            <motion.div
              className="absolute right-0 md:-right-2 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="px-2 py-3 rounded-sm"
                style={{
                  background: 'linear-gradient(180deg, #DC2626 0%, #B91C1C 50%, #991B1B 100%)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.1)',
                }}
              >
                <span className="font-display text-[8px] md:text-[10px] font-bold tracking-widest uppercase text-white" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  LEVI'S
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* INNOVATION LABS */}
          <motion.div
            className="overflow-hidden mb-4 px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <motion.p 
              className="font-display text-[clamp(0.95rem,3.7vw,2.4rem)] uppercase tracking-[0.18em] sm:tracking-[0.24em] md:tracking-[0.3em] text-[#B87333] [overflow-wrap:anywhere]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              Innovation Labs
            </motion.p>
          </motion.div>
          
          {/* Levi's Leather Patch with Metrics */}
          <motion.div
            className="w-full max-w-md mb-12"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <LevisLeatherPatch />
          </motion.div>

          {/* Metadata Line - Mobile optimized with break-words */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-x-4 md:gap-x-6 gap-y-2 font-mono text-[10px] md:text-[11px] tracking-[0.15em] md:tracking-[0.2em] uppercase min-w-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          >
            <span className="text-[#D4A574] [overflow-wrap:anywhere]">Producer + Editor</span>
            <span className="w-1 h-1 rounded-full bg-[#555] shrink-0" />
            <span className="text-[#888] break-words">2023</span>
            <span className="w-1 h-1 rounded-full bg-[#555] shrink-0" />
            <span className="text-[#888] break-words">San Francisco</span>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
          >
            {/* Animated stitch line */}
            <div 
              className="w-[1px] h-12 origin-top"
              style={{
                background: 'repeating-linear-gradient(180deg, #B87333 0px, #B87333 4px, transparent 4px, transparent 8px)',
              }}
            />
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#666]">
              Scroll
            </span>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 border-t border-[#B87333]/20 bg-[#0F1729]/80 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#888]">
                Category: <span className="text-[#F2F2F0]">360° Production</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <span className="font-mono text-[10px] text-[#666] uppercase [overflow-wrap:anywhere]">Inc Magazine</span>
              <span className="font-mono text-[10px] text-[#555]">•</span>
              <span className="font-mono text-[10px] text-[#666] uppercase [overflow-wrap:anywhere]">Fast Company</span>
              <span className="font-mono text-[10px] text-[#555]">•</span>
              <span className="font-mono text-[10px] text-[#666] uppercase [overflow-wrap:anywhere]">YouTube</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURED PLACEMENTS */}
      <section className="relative px-6 md:px-12 lg:px-20 py-24 border-t border-[#B87333]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <motion.div 
              className="h-[1px] w-12 bg-[#B87333]/40 origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
            <span className="font-mono text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase text-[#666]">
              Featured
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {['INC Magazine', 'Fast Company', 'YouTube 360'].map((pub, i) => (
              <motion.div
                key={pub}
                className={`group p-5 md:p-6 border transition-all duration-300 min-w-0 touch-manipulation ${
                  activePublicationIndex === i ? 'border-[#B87333]/60 bg-[#B87333]/10' : 'border-[#222] hover:border-[#B87333]/40'
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={isTouchDevice ? {} : { y: -4, transition: { duration: 0.3 } }}
                whileTap={{ scale: 0.99 }}
                onTapStart={() => setActivePublicationIndex(i)}
                onTapCancel={() => setActivePublicationIndex(null)}
                onTap={() => setActivePublicationIndex(null)}
                style={{ willChange: 'transform' }}
              >
                <div className="flex items-center justify-between mb-4 min-w-0">
                  <span className="font-display text-lg md:text-xl text-[#F2F2F0] uppercase [overflow-wrap:anywhere]">{pub}</span>
                  <motion.div
                    initial={{ x: 0, y: 0 }}
                    whileHover={isTouchDevice ? {} : { x: 2, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowUpRight className={`w-5 h-5 transition-colors shrink-0 ${activePublicationIndex === i ? 'text-[#B87333]' : 'text-[#444] group-hover:text-[#B87333]'}`} />
                  </motion.div>
                </div>
                <motion.div 
                  className="w-full mb-4 origin-left"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 + 0.2 }}
                >
                  <StitchLine className="w-full" />
                </motion.div>
                <span className="font-mono text-[9px] md:text-[10px] tracking-[0.12em] md:tracking-[0.15em] uppercase text-[#777] [overflow-wrap:anywhere]">
                  {i === 0 ? 'Official Coverage' : i === 1 ? 'Innovation Spotlight' : 'Platform Launch'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PHOTO GALLERY - 3 Frames */}
      <section className="relative px-6 md:px-12 lg:px-20 py-24 bg-[#0A0F1A]">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-12">
            <motion.div 
              className="h-[1px] w-12 bg-[#B87333]/40 origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
            <span className="font-mono text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase text-[#666]">
              The Experience
            </span>
          </div>

          {/* 3 Photo Frames */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            <PhotoFrame 
              label="Rig Assembly" 
              index={0} 
              webp={getImageUrl('/work/levis-thumb.webp', 1600, { format: 'webp' })}
              jpeg={getImageUrl('/work/levis-thumb.jpg', 1600, { format: 'jpg' })}
              alt="Levi's rig assembly thumbnail"
              isTouchDevice={isTouchDevice}
              onOpen={() => setActiveImageIndex(0)}
            />
            <PhotoFrame 
              label="Live Capture" 
              index={1}
              webp={getImageUrl('/work/levis-lab.webp', 1600, { format: 'webp' })}
              jpeg={getImageUrl('/work/levis-lab.jpg', 1600, { format: 'jpg' })}
              alt="Levi's live capture lab"
              isTouchDevice={isTouchDevice}
              onOpen={() => setActiveImageIndex(1)}
            />
            <PhotoFrame 
              label="Post Production" 
              index={2}
              webp={getImageUrl('/work/levis-collection.webp', 1600, { format: 'webp' })}
              jpeg={getImageUrl('/work/levis-collection.jpg', 1600, { format: 'jpg' })}
              alt="Levi's collection post production"
              isTouchDevice={isTouchDevice}
              onOpen={() => setActiveImageIndex(2)}
            />
          </div>
        </div>
      </section>

      {/* PRODUCTION PROCESS */}
      <section className="relative px-6 md:px-12 lg:px-20 py-32">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-16 md:mb-20">
            <motion.div 
              className="h-[1px] w-16 md:w-24 bg-[#B87333]/30 origin-right"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
            <span className="font-mono text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase text-[#B87333]">
              Production
            </span>
            <span className="font-display text-xl md:text-2xl text-[#F2F2F0] uppercase">Workflow</span>
            <motion.div 
              className="h-[1px] w-16 md:w-24 bg-[#B87333]/30 origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Timeline */}
          <div className="space-y-12 md:space-y-16">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.number}
                className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start min-w-0"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                style={{ willChange: 'transform' }}
              >
                {/* Number + connector */}
                <div className="lg:col-span-2 flex lg:flex-col items-center lg:items-start gap-4 min-w-0">
                  <motion.span 
                    className="font-display text-4xl md:text-5xl text-[#B87333]"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.15 + 0.1 }}
                  >
                    {step.number}
                  </motion.span>
                  {index < processSteps.length - 1 && (
                    <motion.div 
                      className="hidden lg:block w-[2px] h-24 bg-gradient-to-b from-[#B87333]/40 to-transparent"
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.15 + 0.3 }}
                      style={{ originY: 0 }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="lg:col-span-7 min-w-0">
                  <h3 className="font-display text-xl md:text-2xl lg:text-3xl text-[#F2F2F0] uppercase tracking-tight mb-3 md:mb-4 [overflow-wrap:anywhere]">
                    {step.title}
                  </h3>
                  <p className="font-sans text-sm md:text-base text-[#AAA] leading-[1.7] md:leading-[1.8] [overflow-wrap:anywhere] hyphens-none">
                    {step.description}
                  </p>
                </div>

                {/* Rivet accent with pulse animation */}
                <div className="hidden lg:flex lg:col-span-3 justify-end">
                  <motion.div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.15 + 0.2 }}
                    whileHover={!prefersReducedMotion ? {
                      boxShadow: ['0 0 0 0 rgba(184,115,51,0)', '0 0 0 8px rgba(184,115,51,0.2)', '0 0 0 0 rgba(184,115,51,0)'],
                      transition: { duration: 1.5, repeat: Infinity }
                    } : {}}
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, rgba(232,169,111,0.3), rgba(184,115,51,0.1))',
                      border: '1px solid rgba(184,115,51,0.3)'
                    }}
                  >
                    <ChevronRight className="w-5 h-5 text-[#B87333]" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 360° VIDEO PLAYER */}
      <section className="relative px-6 md:px-12 lg:px-20 py-24 bg-[#0A0F1A]">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-12">
            <RedTab text="360°" />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#666]">
              Experience
            </span>
            <div className="flex-1 h-[1px] bg-[#B87333]/20" />
          </div>

          {/* A-Frame 360 Video Player */}
          <div className="relative">
            {/* Copper frame with rivets */}
            <div className="absolute -inset-3 border border-[#B87333]/30 rounded-sm z-10 pointer-events-none" />
            <div className="absolute -top-1.5 left-8 w-3 h-3 rounded-full bg-[#B87333] z-10" />
            <div className="absolute -top-1.5 right-8 w-3 h-3 rounded-full bg-[#B87333] z-10" />
            <div className="absolute -bottom-1.5 left-8 w-3 h-3 rounded-full bg-[#B87333] z-10" />
            <div className="absolute -bottom-1.5 right-8 w-3 h-3 rounded-full bg-[#B87333] z-10" />

            {/* YouTube Video Embed */}
            <div 
              className="relative bg-[#0A1428] overflow-hidden rounded-sm aspect-video w-full"
              style={{ minHeight: 'clamp(220px, 52vw, 680px)' }}
            >
              <iframe
                src="https://www.youtube.com/embed/ZkxKeUF7G9I?controls=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                title="Levi's 360° Innovation Labs Experience"
                style={{ border: 'none' }}
                loading="lazy"
              />
              {/* Label badge */}
              <div
                className="absolute top-3 left-3 z-20 pointer-events-none select-none"
                aria-hidden
              >
                <span
                  className="font-mono text-[9px] tracking-[0.2em] uppercase px-2 py-1"
                  style={{
                    color: '#B87333',
                    border: '0.5px solid #B8733355',
                    background: 'rgba(0,0,0,0.6)',
                  }}
                >
                  LEVI'S 360° EXPERIENCE
                </span>
              </div>
            </div>
          </div>

          {/* Distribution tags */}
          <div className="mt-8 flex flex-wrap gap-3">
            {['Desktop 360°', 'Mobile Gyroscope', 'Touch Navigation'].map((tag) => (
              <RedTab key={tag} text={tag} />
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activeImageIndex !== null && (
          <motion.div
            className="fixed inset-0 z-[220] bg-black/95 backdrop-blur-sm p-3 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImageIndex(null)}
          >
            <motion.div
              className="relative w-full h-full max-w-7xl mx-auto"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onGalleryTouchStart}
              onTouchEnd={onGalleryTouchEnd}
            >
              <img
                src={galleryImages[activeImageIndex].src}
                alt={galleryImages[activeImageIndex].alt}
                className="w-full h-full object-contain"
                loading="eager"
                decoding="async"
              />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6 pointer-events-none">
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#B87333]">
                  {galleryImages[activeImageIndex].id}
                </p>
                <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-white/60 mt-1">
                  {galleryImages[activeImageIndex].label}
                </p>
                <p className="font-mono text-[8px] tracking-[0.1em] uppercase text-white/40 mt-2 sm:hidden">
                  Swipe left/right
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveImageIndex(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full border border-white/30 bg-black/60 text-white text-lg leading-none"
                aria-label="Close image"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CLOSING STATEMENT */}
      <section className="relative px-6 md:px-12 lg:px-20 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Rivet decorations */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-2 h-2 rounded-full bg-[#B87333]" />
              <div className="h-[1px] w-16 bg-[#B87333]/30" />
              <div className="w-2 h-2 rounded-full bg-[#B87333]" />
            </div>

            <h3 className="font-display text-3xl md:text-4xl text-[#F2F2F0] uppercase tracking-tight mb-6">
              Crafted in San Francisco
            </h3>
            <p className="font-sans text-base text-[#999] max-w-xl mx-auto leading-relaxed">
              A collaboration between Levi's Innovation Labs and Microsoft, 
              pushing the boundaries of immersive storytelling.
            </p>

            {/* Two Sides reference */}
            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 border border-[#B87333]/20 rounded-sm">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#666]">
                A Production by
              </span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#B87333]">
                Two Sides
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Navigation */}
      <section className="relative px-6 md:px-12 lg:px-20 py-12 border-t border-[#B87333]/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            href="/work" 
            className="group flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-[#666] hover:text-[#B87333] transition-colors"
          >
            <span>←</span>
            <span>All Projects</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-[#333] uppercase">2023</span>
            <span className="font-mono text-[9px] text-[#333]">•</span>
            <span className="font-mono text-[9px] text-[#333] uppercase">Levi's</span>
          </div>
        </div>
      </section>
    </main>
  );
}
