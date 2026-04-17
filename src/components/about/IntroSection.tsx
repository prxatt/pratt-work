'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: '12+', label: 'YEARS EXPERIENCE' },
  { value: '75%', label: 'CLIENT RETENTION' },
  { value: '$1M+', label: 'BUDGETS MANAGED' },
  { value: '50+', label: 'PROJECTS DELIVERED' },
];

export const IntroSection = () => {
  return (
    <section className="min-h-screen bg-[#0a0a0a] py-24 md:py-32">
      <div className="px-6 md:px-12 lg:px-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8">
          {/* Left: Sticky header */}
          <div className="lg:w-[35%] lg:sticky lg:top-[120px] lg:self-start">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-[10px] tracking-[0.4em] text-tertiary uppercase block mb-6"
            >
              INTRODUCTION
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-[#F2F2F0] uppercase leading-[0.95]"
            >
              PRATT<br />MAJMUDAR
            </motion.h2>
          </div>

          {/* Right: Content */}
          <div className="lg:w-[65%] lg:pl-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="max-w-2xl"
            >
              <p className="text-secondary text-xl md:text-2xl leading-relaxed mb-8">
                I craft digital experiences that sit at the intersection of technical precision and emotional resonance.
              </p>
              <p className="text-tertiary text-base leading-relaxed font-sans mb-6">
                My practice spans creative technology, experiential production, and architectural systems thinking—building everything from immersive installations to AI-driven platforms.
              </p>
              <p className="text-tertiary text-base leading-relaxed font-sans mb-6">
                I see the invisible frictions in creative pipelines and design systems to solve them. Whether directing technical talent for Fortune 500 activations or prototyping generative interfaces, I bring the same rigorous methodology: understand constraints deeply, then transcend them elegantly.
              </p>
              <p className="text-tertiary text-base leading-relaxed font-sans">
                The work is always about connection. Between code and culture. Between vision and execution. Between what users expect and what they didn't know was possible.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-[#2a2a2a]"
            >
              {stats.map((stat, index) => (
                <div key={stat.label} className="flex flex-col gap-2">
                  <span className="font-display text-3xl md:text-4xl text-[#F2F2F0]">{stat.value}</span>
                  <span className="font-mono text-[10px] tracking-[0.2em] text-tertiary uppercase">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
