'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';

export const TypographicCTA = () => {
  const { setCursorState } = useCursor();
  const [isHovered, setIsHovered] = useState(false);
  const [tapPulse, setTapPulse] = useState(0);

  const remarkableLetters = 'REMARKABLE'.split('');

  const letterVariants = {
    initial: { opacity: 1, y: 0 },
    hover: (i: number) => ({
      opacity: 1,
      y: [0, -8, 0],
      transition: {
        duration: 0.5,
        delay: i * 0.03,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
  };

  const triggerRemarkableTouch = () => {
    setTapPulse((prev) => prev + 1);
    setIsHovered(true);
    window.setTimeout(() => setIsHovered(false), 520);
  };

  return (
    <section className="py-16 md:py-20 w-full max-w-full flex items-center justify-center px-4 sm:px-6">
      <div className="flex flex-col items-center text-center gap-10 w-full max-w-full min-w-0">
        <span className="font-mono text-[10px] tracking-[0.28em] sm:tracking-[0.4em] text-tertiary uppercase">
          PROJECT INQUIRIES
        </span>

        <h2
          className="flex flex-col items-center gap-4 sm:gap-3 w-full max-w-full min-w-0 text-center text-balance text-[clamp(1.65rem,10.5vw,4.9rem)] sm:text-section-header text-primary uppercase leading-[0.98] sm:leading-[0.92] px-3 sm:px-4"
          onMouseEnter={() => setCursorState('hover')}
          onMouseLeave={() => setCursorState('default')}
        >
          <span className="relative w-full max-w-full min-w-0 text-[#F2F2F0]">
            Let&apos;s Create
          </span>
          <span className="relative flex w-full max-w-full min-w-0 flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-[0.45em] sm:gap-y-1">
            <span className="inline-block shrink-0 text-[#F2F2F0]">SOMETHING</span>
            <motion.span
              className="inline-flex max-w-full min-w-0 cursor-pointer flex-wrap justify-center gap-x-[0.02em] text-[#6366f1]"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onTouchStart={triggerRemarkableTouch}
              onPointerDown={(e) => {
                if (e.pointerType === 'touch' || e.pointerType === 'pen') {
                  triggerRemarkableTouch();
                }
              }}
            >
              {remarkableLetters.map((letter, i) => (
                <motion.span
                  key={`${i}-${tapPulse}`}
                  custom={i}
                  initial="initial"
                  animate={isHovered ? 'hover' : 'initial'}
                  variants={letterVariants}
                  className="inline-block shrink-0"
                  style={{ display: 'inline-block' }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.span>
          </span>
        </h2>

        <div className="flex flex-col items-center">
          <motion.a
            href="/contact"
            className="group relative max-w-[calc(100vw-2rem)] px-8 sm:px-14 py-4 sm:py-5 border border-primary/30 rounded-full overflow-hidden bg-transparent"
            onMouseEnter={() => setCursorState('magnetic')}
            onMouseLeave={() => setCursorState('default')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm bg-gradient-to-r from-emerald-500 via-amber-500 to-cyan-500" />

            <div className="absolute inset-[1px] rounded-full bg-[#0a0a0a]" />

            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-amber-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />

            <span className="relative z-10 font-mono text-[11px] sm:text-sm tracking-[0.2em] sm:tracking-[0.28em] text-primary uppercase group-hover:text-white transition-colors duration-300 inline-flex flex-nowrap items-center gap-3 sm:gap-4 whitespace-nowrap">
              <span>Connect with me</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="group-hover:translate-x-1 transition-transform duration-300"
              >
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </span>
          </motion.a>

          <span className="mt-4 font-mono text-[9px] sm:text-[10px] tracking-[0.16em] sm:tracking-[0.2em] text-tertiary uppercase text-center px-2">
            Available for select projects
          </span>
        </div>
      </div>
    </section>
  );
};
