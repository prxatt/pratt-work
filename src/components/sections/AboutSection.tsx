'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';
import Link from 'next/link';

// Word animation component for staggered micro animations
const AnimatedWord = ({ word, delay }: { word: string; delay: number }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={{ 
        color: '#f59e0b',
        transition: { duration: 0.2 }
      }}
      className="inline-block mr-[0.24em] cursor-default"
    >
      {word}
    </motion.span>
  );
};

const AnimatedHeading = () => {
  const lines = [
    'I ARCHITECT EXPERIENCES',
    'WHERE TECHNOLOGY',
    'BECOMES INVISIBLE AND',
    'IMPACT BECOMES',
    'UNDENIABLE.'
  ];
  
  let wordIndex = 0;
  
  return (
    <h2
      className="font-display text-[#F2F2F0] uppercase leading-[0.93] tracking-[-0.02em] max-w-[18ch]"
      style={{ fontSize: 'clamp(2.05rem, 5.9vw, 5.6rem)' }}
    >
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="block">
          {line.split(' ').map((word) => {
            const currentIndex = wordIndex++;
            return (
              <AnimatedWord 
                key={currentIndex} 
                word={word} 
                delay={0.1 + currentIndex * 0.08}
              />
            );
          })}
        </span>
      ))}
    </h2>
  );
};

export const AboutSection = () => {
  const { setCursorState } = useCursor();

  return (
    <section id="about" className="py-20 md:py-28 px-6 md:px-12 lg:px-20 w-full bg-[#0a0a0a] min-h-screen flex flex-col justify-center">
      {/* Large Display Text - with micro animations */}
      <div className="mb-12 md:mb-16 max-w-[1600px] w-full mx-auto">
        <AnimatedHeading />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 xl:gap-24 items-start max-w-[1600px] w-full mx-auto">
        {/* Left: CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="lg:col-span-4"
        >
          <Link
            href="/about"
            className="group inline-flex items-center gap-3 bg-[#F2F2F0] text-[#0a0a0a] px-6 py-3 font-mono text-xs tracking-[0.15em] uppercase hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300"
            onMouseEnter={() => setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            <span>VIEW ABOUT PRATT*</span>
          </Link>
        </motion.div>

        {/* Right: About Content - increased text size */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="flex flex-col gap-5 lg:col-span-8 lg:max-w-[58ch]"
        >
          <h3 className="font-mono text-[11px] md:text-xs tracking-[0.24em] text-[#F2F2F0] uppercase">
            ABOUT PRATT
          </h3>
          <p className="font-sans text-[15px] md:text-base lg:text-lg leading-relaxed text-[#8A8A85]">
            I SEE THE INVISIBLE FRICTIONS IN CREATIVE PIPELINES AND DESIGN SYSTEMS TO SOLVE THEM.
          </p>
          <p className="font-sans text-[15px] md:text-base lg:text-lg leading-relaxed text-[#8A8A85]">
            AS A CREATIVE TECHNOLOGIST AND PRODUCER, I BRIDGE THE GAP BETWEEN AMBITIOUS VISION AND FLAWLESS EXECUTION—DIRECTING TECHNICAL TALENT AND CREATIVE TEAMS TO BRING ABSTRACT CONCEPTS INTO PHYSICAL REALITY, ON TIME AND ON BUDGET.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
