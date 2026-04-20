'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';

export const TypographicCTA = () => {
  const { setCursorState } = useCursor();
  const [isHovered, setIsHovered] = useState(false);

  const remarkableLetters = 'REMARKABLE'.split('');

  // Word reveal variants
  const wordVariants = {
    hidden: { opacity: 0, y: 60, filter: 'blur(20px)' },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 1.2,
        delay: i * 0.15,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
  };

  // Letter reconstruction variants
  const letterVariants = {
    initial: { opacity: 0.3, y: 0 },
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

  return (
    <section className="py-16 md:py-20 w-full flex items-center justify-center px-4 sm:px-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center gap-10"
      >
        <span className="font-mono text-[10px] tracking-[0.28em] sm:tracking-[0.4em] text-tertiary uppercase">
          PROJECT INQUIRIES
        </span>
        
        <h2 
          className="text-[clamp(2.4rem,14vw,4.9rem)] sm:text-section-header text-primary uppercase relative leading-[0.92]"
          onMouseEnter={() => setCursorState('hover')}
          onMouseLeave={() => setCursorState('default')}
        >
          <span className="relative inline-block overflow-hidden">
            <motion.span
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={wordVariants}
              className="inline-block text-[#F2F2F0]"
            >
              Let&apos;s Create
            </motion.span>
          </span>
          <br />
          <span className="relative inline-block overflow-hidden">
            <motion.span
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={wordVariants}
              className="inline-block text-[#F2F2F0] mr-0 sm:mr-4"
            >
              SOMETHING
            </motion.span>
            <motion.span
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={wordVariants}
              className="relative block sm:inline-block cursor-pointer text-[#6366f1] mt-1 sm:mt-0"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {remarkableLetters.map((letter, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  initial="initial"
                  animate={isHovered ? 'hover' : 'initial'}
                  variants={letterVariants}
                  className="inline-block"
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
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm bg-gradient-to-r from-emerald-500 via-amber-500 to-cyan-500" />
            
            {/* Inner background */}
            <div className="absolute inset-[1px] rounded-full bg-[#0a0a0a]" />
            
            {/* Fill effect on hover */}
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
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </motion.a>
          
          {/* Subtle hint text */}
          <span className="mt-4 font-mono text-[9px] sm:text-[10px] tracking-[0.16em] sm:tracking-[0.2em] text-tertiary uppercase text-center px-2">
            Available for select projects
          </span>
        </div>
      </motion.div>
    </section>
  );
};
