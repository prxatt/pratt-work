'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const PhotoFrame = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax effects
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

  return (
    <section ref={containerRef} className="relative bg-[#0D0D0D] overflow-hidden">
      <motion.div
        style={{ y, opacity, scale }}
        className="w-full"
      >
          {/* Steve Jobs level frame container */}
          <div className="relative">
            {/* Corner accents - top */}
            <div className="absolute -top-3 left-0 w-6 h-[1px] bg-[#333]" />
            <div className="absolute -top-3 right-0 w-6 h-[1px] bg-[#333]" />
            <div className="absolute top-0 -left-3 w-[1px] h-6 bg-[#333]" />
            <div className="absolute top-0 -right-3 w-[1px] h-6 bg-[#333]" />

            {/* Corner accents - bottom */}
            <div className="absolute -bottom-3 left-0 w-6 h-[1px] bg-[#333]" />
            <div className="absolute -bottom-3 right-0 w-6 h-[1px] bg-[#333]" />
            <div className="absolute bottom-0 -left-3 w-[1px] h-6 bg-[#333]" />
            <div className="absolute bottom-0 -right-3 w-[1px] h-6 bg-[#333]" />

            {/* Main frame with clip-path */}
            <div
              className="relative bg-[#141414] overflow-hidden group cursor-pointer"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)',
              }}
            >
              {/* Noise texture overlay */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none z-10 mix-blend-overlay"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />

              {/* Subtle gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#6366f1]/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />

              {/* Image placeholder area */}
              <div className="relative aspect-[16/10] flex items-center justify-center">
                {/* Grid pattern background */}
                <div
                  className="absolute inset-0 opacity-[0.02]"
                  style={{
                    backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px),
                                      linear-gradient(to bottom, #333 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                  }}
                />

                {/* Center content */}
                <div className="relative z-30 flex flex-col items-center gap-4">
                  <motion.div
                    className="w-16 h-16 rounded-full border border-[#333] flex items-center justify-center group-hover:border-[#6366f1]/30 transition-colors duration-500"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="font-mono text-[10px] text-[#4A4A47] group-hover:text-[#6366f1]/50 transition-colors duration-300">
                      [IMG]
                    </span>
                  </motion.div>
                  <span className="font-mono text-[9px] text-[#333] uppercase tracking-[0.3em] group-hover:text-[#444] transition-colors duration-300">
                    Visual Identity
                  </span>
                </div>

                {/* Corner dots */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]/20 group-hover:bg-[#6366f1]/40 transition-colors duration-300" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
                </div>

                {/* Bottom indicator */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="font-mono text-[8px] text-[#333] tracking-wider">
                    001
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-[1px] bg-[#262626] group-hover:bg-[#6366f1]/30 transition-colors duration-500" />
                    <span className="font-mono text-[8px] text-[#333]">SF</span>
                  </div>
                </div>
              </div>

              {/* Bottom accent line */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6366f1]"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'left' }}
              />
            </div>

            {/* Side label - positioned outside frame */}
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 hidden lg:block">
              <span
                className="font-mono text-[9px] text-[#333] uppercase tracking-[0.3em]"
                style={{ writingMode: 'vertical-rl' }}
              >
                Archive
              </span>
            </div>
          </div>
        </motion.div>
    </section>
  );
};
