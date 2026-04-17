'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

interface Stat {
  value: string;
  numericValue: number;
  suffix: string;
  prefix?: string;
  label: string;
}

const stats: Stat[] = [
  { value: '9+', numericValue: 9, suffix: '+', label: 'Years Experience' },
  { value: '50+', numericValue: 50, suffix: '+', label: 'Projects Delivered' },
  { value: '$1.6M', numericValue: 1.6, suffix: 'M', prefix: '$', label: 'Partners Raised' },
  { value: '75%', numericValue: 75, suffix: '%', label: 'Client Retention' },
];

const AnimatedStat = ({ stat, index }: { stat: Stat; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.min(stat.numericValue * eased, stat.numericValue);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(stat.numericValue);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isInView, stat.numericValue]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1] as const
      }}
      className="text-center group"
    >
      <div className="relative">
        <span
          className="font-display text-[#F2F2F0] block leading-none"
          style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}
        >
          {stat.prefix && <span className="text-[#8A8A85]">{stat.prefix}</span>}
          {stat.prefix ? displayValue.toFixed(1) : Math.round(displayValue)}
          <span className="text-[#8A8A85]">{stat.suffix}</span>
        </span>

        {/* Animated underline */}
        <motion.div
          className="h-[2px] bg-gradient-to-r from-transparent via-[#6366f1]/50 to-transparent mt-4"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{
            duration: 0.8,
            delay: 0.3 + index * 0.1,
            ease: [0.16, 1, 0.3, 1] as const
          }}
        />
      </div>

      <span className="font-mono text-[10px] text-[#8A8A85] uppercase tracking-[0.2em] mt-4 block">
        {stat.label}
      </span>
    </motion.div>
  );
};

export const StatsSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <section ref={containerRef} className="bg-[#0D0D0D] py-32 md:py-40 relative overflow-hidden">
      {/* Subtle background element */}
      <motion.div
        className="absolute inset-0 opacity-[0.02]"
        style={{ y: backgroundY }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,_#6366f1_0%,_transparent_70%)]" />
      </motion.div>

      <div className="px-6 md:px-12 lg:px-20 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
          className="text-center mb-20 md:mb-28"
        >
          <span className="font-mono text-[10px] text-[#8A8A85] uppercase tracking-[0.4em] block mb-6">
            By The Numbers
          </span>
          <h2 className="font-display text-[#F2F2F0] uppercase text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-tight">
            Impact Metrics
          </h2>
        </motion.div>

        {/* Stats - horizontal layout */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 lg:gap-24">
          {stats.map((stat, index) => (
            <AnimatedStat key={stat.label} stat={stat} index={index} />
          ))}
        </div>

        {/* Decorative element - asymmetric line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          className="absolute bottom-0 left-0 w-[60%] h-[1px] bg-gradient-to-r from-[#1a1a1a] via-[#262626] to-transparent origin-left"
        />
      </div>
    </section>
  );
};
