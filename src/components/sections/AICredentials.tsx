'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const credentials = [
  {
    name: 'FOUNDATIONS OF AI — IBM',
    status: 'certified',
    statusColor: 'blue',
    progress: 100,
    isExpandable: true,
    subCourses: [
      { name: 'AI FOR EVERYONE — DeepLearning.AI', status: 'certified', statusColor: 'blue', progress: 100 },
      { name: 'GENERATIVE AI', status: 'certified', statusColor: 'blue', progress: 100 },
      { name: 'INTRO TO PROMPT ENGINEERING', status: 'certified', statusColor: 'blue', progress: 100 },
    ]
  },
  {
    name: 'GENERATIVE AI FOR EVERYONE — IBM',
    status: 'in-progress',
    statusColor: 'amber',
    progress: 15,
    isExpandable: true,
    subCourses: [
      { name: 'INTRO TO GENERATIVE AI', status: 'certified', statusColor: 'blue', progress: 100 },
      { name: 'INTRO TO PROMPT ENGINEERING', status: 'certified', statusColor: 'blue', progress: 100 },
      { name: 'MODELS AND PLATFORMS FOR GENERATIVE AI', status: 'in-progress', statusColor: 'amber', progress: 5 },
    ]
  },
];

const getStatusColor = (statusColor: string) => {
  switch (statusColor) {
    case 'green':
      return { text: 'text-emerald-500', bg: 'bg-emerald-500', bar: 'bg-emerald-500' };
    case 'amber':
      return { text: 'text-amber-500', bg: 'bg-amber-500', bar: 'bg-amber-500' };
    case 'blue':
      return { text: 'text-blue-500', bg: 'bg-blue-500', bar: 'bg-blue-500' };
    default:
      return { text: 'text-primary', bg: 'bg-primary', bar: 'bg-primary' };
  }
};

export const AICredentials = () => {
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);

  return (
    <section className="relative py-24 md:py-40 overflow-hidden">
      {/* Hero-inspired background - Neural constellation effect */}
      <div className="absolute inset-0 bg-[#0D0D0D] z-0">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Radial gradient vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(13,13,13,0.8)_70%,#0D0D0D_100%)]" />
        {/* Subtle animated glow spots */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#6366f1]/5 rounded-full blur-[100px] md:animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#8B5CF6]/5 rounded-full blur-[80px] md:animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 px-6 md:px-12 lg:px-20 flex flex-col gap-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="flex flex-col gap-6">
            <span className="font-mono text-[11px] tracking-[0.4em] text-tertiary uppercase">
              CURRENT DEVELOPMENT STACK
            </span>
            <h2 className="text-section-header text-primary uppercase">
              BUILDING WITH <br /> INTELLIGENCE
            </h2>
          </div>
          
          <p className="max-w-md text-secondary text-lg leading-relaxed">
            Tools that think. Systems that breathe. Building the space where intention meets intelligence.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-x-12 xl:gap-x-24 gap-y-12">
          {credentials.map((cred, index) => {
            const colors = getStatusColor(cred.statusColor);
            const isHovered = hoveredCourse === cred.name;
            
            return (
              <motion.div 
                key={cred.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15, margin: '0px 0px 100px 0px' }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className="flex flex-col gap-6 group"
                onMouseEnter={() => cred.isExpandable && setHoveredCourse(cred.name)}
                onMouseLeave={() => setHoveredCourse(null)}
              >
                <div className="flex justify-between items-end">
                  <h3 className="font-display text-xl tracking-wider text-primary uppercase group-hover:text-secondary transition-colors flex items-center gap-2">
                    {cred.name}
                    {cred.isExpandable && (
                      <motion.div
                        animate={{ rotate: isHovered ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-4 h-4 text-tertiary" />
                      </motion.div>
                    )}
                  </h3>
                  <span className={`font-mono text-[10px] uppercase tracking-widest ml-4 ${colors.text}`}>
                    {cred.status}
                  </span>
                </div>
                <div className="h-[2px] w-full bg-border overflow-hidden">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    whileInView={{ x: `${cred.progress - 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 + index * 0.1 }}
                    className={`h-full ${colors.bar}`}
                  />
                </div>
                
                {/* Sub-courses - auto expand on hover */}
                <AnimatePresence>
                  {isHovered && cred.subCourses && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col gap-4 overflow-hidden"
                    >
                      {cred.subCourses.map((sub, subIndex) => {
                        const subColors = getStatusColor(sub.statusColor);
                        return (
                          <motion.div
                            key={sub.name}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: subIndex * 0.1 }}
                            className="flex flex-col gap-2 pl-4 border-l border-border"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-xs text-secondary uppercase">
                                {sub.name}
                              </span>
                              <span className={`font-mono text-[9px] uppercase tracking-widest ${subColors.text}`}>
                                {sub.status}
                              </span>
                            </div>
                            <div className="h-[1px] w-full bg-border/50 overflow-hidden">
                              <motion.div 
                                initial={{ x: '-100%' }}
                                whileInView={{ x: `${sub.progress - 100}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 + subIndex * 0.1 }}
                                className={`h-full ${subColors.bar}`}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Visual separator - gradient fade with subtle line */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-20 pointer-events-none">
        {/* Gradient fade to black */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0D0D0D]/50 to-[#0a0a0a]" />
        {/* Subtle accent line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-[#6366f1]/30 to-transparent" />
        </div>
      </div>
    </section>
  );
};
