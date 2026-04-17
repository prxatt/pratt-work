'use client';

import React, { useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';
import { ArrowRight, Eye, Layers, BarChart3, LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Method {
  title: string;
  icon: LucideIcon;
  items: string[];
  color: string;
  glow: string;
}

const methods: Method[] = [
  {
    title: 'vision',
    icon: Eye,
    items: ['STRATEGIC PLANNING', 'CONCEPT DEVELOPMENT', 'TEAM ASSEMBLY'],
    color: '#f59e0b', // Amber - visionary, warm
    glow: 'rgba(245,158,11,0.3)',
  },
  {
    title: 'orchestration',
    icon: Layers,
    items: ['CREATIVE DIRECTION', 'PROJECT MANAGEMENT', 'PRODUCTION OVERSIGHT'],
    color: '#6366f1', // Violet - professional, organized
    glow: 'rgba(99,102,241,0.3)',
  },
  {
    title: 'MEASURABLE IMPACT',
    icon: BarChart3,
    items: ['AI INTEGRATION', 'STAKEHOLDER REPORTING', 'PERFORMANCE ANALYSIS'],
    color: '#06b6d4', // Cyan - data-driven, analytical
    glow: 'rgba(6,182,212,0.3)',
  },
];

// Memoized MethodCard to prevent unnecessary re-renders
const MethodCard = memo(function MethodCard({ 
  method, 
  index 
}: { 
  method: Method; 
  index: number;
}) {
  const { setCursorState } = useCursor();
  const Icon = method.icon;

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
      <div className="relative mb-6">
        <div 
          className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-[#2a2a3a] flex items-center justify-center group-hover:scale-110 transition-all duration-500"
          style={{
            ['--hover-color' as string]: method.color,
            ['--hover-glow' as string]: method.glow,
          }}
        >
          <Icon 
            className="w-6 h-6 text-[#6b7280] transition-colors duration-500"
            style={{ color: 'var(--hover-color)' }}
          />
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
      <span className="font-mono text-[11px] tracking-[0.4em] text-tertiary uppercase mb-4">
        {method.title}
      </span>

      {/* Items */}
      <ul className="flex flex-col gap-2">
        {method.items.map((item, itemIndex) => (
          <li 
            key={itemIndex} 
            className="font-display text-sm md:text-base text-secondary uppercase tracking-wide group-hover:text-primary transition-colors duration-300"
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
    <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-20 md:mb-28">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-12 max-w-6xl mx-auto">
        {methods.map((method, index) => (
          <MethodCard key={method.title} method={method} index={index} />
        ))}
      </div>
    </section>
  );
};
