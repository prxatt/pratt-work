'use client';

import React, { useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Method {
  title: string;
  visual: 'vision' | 'orchestration' | 'impact';
  items: string[];
  color: string;
  glow: string;
}

const methods: Method[] = [
  {
    title: 'vision',
    visual: 'vision',
    items: ['STRATEGIC PLANNING', 'CONCEPT DEVELOPMENT', 'TEAM ASSEMBLY'],
    color: '#f59e0b', // Amber - visionary, warm
    glow: 'rgba(245,158,11,0.3)',
  },
  {
    title: 'orchestration',
    visual: 'orchestration',
    items: ['CREATIVE DIRECTION', 'PROJECT MANAGEMENT', 'PRODUCTION OVERSIGHT'],
    color: '#6366f1', // Violet - professional, organized
    glow: 'rgba(99,102,241,0.3)',
  },
  {
    title: 'MEASURABLE IMPACT',
    visual: 'impact',
    items: ['AI INTEGRATION', 'STAKEHOLDER REPORTING', 'PERFORMANCE ANALYSIS'],
    color: '#06b6d4', // Cyan - data-driven, analytical
    glow: 'rgba(6,182,212,0.3)',
  },
];

const MethodVisual = ({ visual, color }: { visual: Method['visual']; color: string }) => {
  if (visual === 'vision') {
    return (
      <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none" aria-hidden>
        <path d="M8 24C12 15 18 10 24 10C30 10 36 15 40 24C36 33 30 38 24 38C18 38 12 33 8 24Z" stroke={color} strokeWidth="2.2" />
        <circle cx="24" cy="24" r="6.5" stroke={color} strokeWidth="2.2" />
        <circle cx="24" cy="24" r="2" fill={color} />
      </svg>
    );
  }

  if (visual === 'orchestration') {
    return (
      <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none" aria-hidden>
        <rect x="7" y="7" width="14" height="14" rx="2.5" stroke={color} strokeWidth="2.2" />
        <rect x="27" y="7" width="14" height="14" rx="2.5" stroke={color} strokeWidth="2.2" />
        <rect x="17" y="27" width="14" height="14" rx="2.5" stroke={color} strokeWidth="2.2" />
        <path d="M21 14H27M24 21V27" stroke={color} strokeWidth="2.2" />
      </svg>
    );
  }

  return (
    <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M8 38V10" stroke={color} strokeWidth="2.2" />
      <path d="M8 38H40" stroke={color} strokeWidth="2.2" />
      <rect x="14" y="24" width="5" height="14" fill={color} />
      <rect x="23" y="18" width="5" height="20" fill={color} opacity="0.85" />
      <rect x="32" y="12" width="5" height="26" fill={color} opacity="0.7" />
    </svg>
  );
};

// Memoized MethodCard to prevent unnecessary re-renders
const MethodCard = memo(function MethodCard({ 
  method, 
  index 
}: { 
  method: Method; 
  index: number;
}) {
  const { setCursorState } = useCursor();

  // Memoized handlers to prevent function recreation on each render
  const handleMouseEnter = useCallback(() => {
    setCursorState('hover');
  }, [setCursorState]);

  const handleMouseLeave = useCallback(() => {
    setCursorState('default');
  }, [setCursorState]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.15 }}
      className="flex flex-col items-center text-center group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Icon Container with Glow Effect - Unique color per method */}
      <div className="relative mb-5 md:mb-6">
        <div 
          className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-[#2a2a3a] flex items-center justify-center group-hover:scale-105 transition-all duration-500"
          style={{
            ['--hover-color' as string]: method.color,
            ['--hover-glow' as string]: method.glow,
          }}
        >
          <MethodVisual visual={method.visual} color={method.color} />
        </div>
        {/* Decorative corner brackets */}
        <div 
          className="absolute -top-2 -left-2 w-3 h-3 border-l border-t border-[#2a2a3a] opacity-50 group-hover:opacity-100 transition-all duration-500"
          style={{ borderColor: 'var(--hover-color)' }}
        />
        <div 
          className="absolute -top-2 -right-2 w-3 h-3 border-r border-t border-[#2a2a3a] opacity-50 group-hover:opacity-100 transition-all duration-500"
          style={{ borderColor: 'var(--hover-color)' }}
        />
      </div>

      {/* Label */}
      <span className="font-mono text-[10px] md:text-[11px] tracking-[0.32em] md:tracking-[0.4em] text-tertiary uppercase mb-4">
        {method.title}
      </span>

      {/* Items */}
      <ul className="flex flex-col gap-2.5 md:gap-2">
        {method.items.map((item, itemIndex) => (
          <li 
            key={itemIndex} 
            className="font-display text-[0.9rem] md:text-base text-secondary uppercase tracking-wide group-hover:text-primary transition-colors duration-300 leading-tight"
          >
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
});

export const HowIWork = () => {
  const { setCursorState } = useCursor();
  const router = useRouter();

  // Memoized CTA handlers
  const handleCtaEnter = useCallback(() => {
    setCursorState('hover');
  }, [setCursorState]);

  const handleCtaLeave = useCallback(() => {
    setCursorState('default');
  }, [setCursorState]);

  const handleCtaClick = useCallback(() => {
    router.push('/about#capabilities');
  }, [router]);

  return (
    <section className="py-20 md:py-24 lg:py-28 px-6 md:px-12 lg:px-20 bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-14 md:mb-20 lg:mb-24">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[#F2F2F0] text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight mb-6"
        >
          HOW I WORK
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="font-mono text-xs md:text-sm tracking-[0.2em] text-[#8A8A85] uppercase max-w-2xl mb-8"
        >
          I BUILD THE BRIDGE BETWEEN THE IMPOSSIBLE IDEA AND THE FLAWLESS EXECUTION.
        </motion.p>

        {/* Cohesive CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="group flex items-center gap-3 text-primary hover:text-secondary transition-all duration-300"
          onMouseEnter={handleCtaEnter}
          onMouseLeave={handleCtaLeave}
          onClick={handleCtaClick}
        >
          <span className="font-mono text-xs tracking-[0.2em] uppercase">Explore More</span>
          <div className="w-8 h-8 rounded-full border border-tertiary flex items-center justify-center group-hover:border-primary transition-colors">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </motion.button>
      </div>

      {/* Three Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-7 lg:gap-10 max-w-6xl mx-auto">
        {methods.map((method, index) => (
          <div key={method.title} className={index === 2 ? 'md:col-span-2 xl:col-span-1' : ''}>
            <MethodCard method={method} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
};
