'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface Tool {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  description?: string;
  isUnreleased?: boolean;
  link?: string;
}

const tools: Tool[] = [
  { id: '01', name: 'Claude + Gemini', category: 'Automation, R&D', proficiency: 60, description: 'AI acceleration' },
  { id: '02', name: 'Github + Cursor', category: 'AI-Driven Dev', proficiency: 65, description: 'Code craftsmanship' },
  { id: '03', name: 'Seedance + Kling', category: 'AI Generation', proficiency: 80, description: 'Generative creation' },
  { id: '04', name: 'SOEN', category: 'Productivity OS', proficiency: 100, description: 'Personal command center', isUnreleased: true, link: 'https://soen.ml' },
  { id: '05', name: 'Slack + Jira', category: 'Project Management', proficiency: 80, description: 'Orchestrating teams' },
  { id: '06', name: 'Adobe Creative Suite', category: 'Premiere, Lightroom, AE', proficiency: 85, description: 'Visual storytelling' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const GridItem = ({ tool, index }: { tool: Tool; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <motion.div
      ref={ref}
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden h-full"
    >
      <div
        className={`relative h-full border border-[#262626] bg-[#0D0D0D] transition-all duration-500 ${
          isHovered ? 'border-[#404040] bg-[#111]' : ''
        } ${tool.isUnreleased ? 'cursor-pointer' : ''}`}
      >
        {/* Subtle gradient overlay on hover */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-700 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.05) 0%, transparent 60%)',
            opacity: isHovered ? 1 : 0,
          }}
        />

        <div className="relative z-10 h-full flex flex-col p-8 md:p-10">
          {/* Number and category row - higher contrast */}
          <div className="flex items-center justify-between mb-auto">
            <span className="font-mono text-[11px] text-[#8A8A85] tracking-wider">
              {tool.id}
            </span>
            <span className="font-mono text-[10px] text-[#8A8A85] uppercase tracking-[0.2em]">
              {tool.category}
            </span>
          </div>

          {/* Tool name - larger, higher contrast */}
          <div className="mt-8 md:mt-12">
            <motion.h3
              className="font-display uppercase leading-[0.95] text-[#F2F2F0] text-2xl md:text-3xl lg:text-4xl"
              animate={{ y: isHovered ? -4 : 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
            >
              {tool.name}
              {tool.isUnreleased && (
                <motion.span
                  className="text-[#6366f1] text-xl ml-2 inline-block"
                  animate={{ rotate: isHovered ? 180 : 0, scale: isHovered ? 1.2 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  *
                </motion.span>
              )}
            </motion.h3>

            {/* Description - higher contrast, appears on hover */}
            <motion.p
              className="font-mono text-[11px] text-[#8A8A85] uppercase tracking-[0.15em] mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
            >
              {tool.description}
            </motion.p>
          </div>

        </div>
      </div>
    </motion.div>
  );

  if (tool.link) {
    return (
      <a href={tool.link} target="_blank" rel="noopener noreferrer" className="block h-full">
        {content}
      </a>
    );
  }

  return content;
};

export const TechStackAbout = () => {
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <section ref={containerRef} className="bg-[#0D0D0D] py-24 md:py-32 lg:py-40">
      <div className="px-6 md:px-12 lg:px-20">
        {/* Header - Steve Jobs level minimal */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
          animate={isHeaderInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
          className="mb-16 md:mb-24 lg:mb-32"
        >
          <div className="max-w-4xl">
            <span className="font-mono text-[10px] text-[#8A8A85] uppercase tracking-[0.4em] block mb-6">
              The Toolkit
            </span>
            <h2 className="font-display text-[#F2F2F0] uppercase text-4xl md:text-6xl lg:text-7xl leading-[0.9] tracking-tight">
              Tech Stack
            </h2>
          </div>
        </motion.div>

        {/* 2x2 Grid Layout - original style */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto"
        >
          {/* Six items in 2x2 grid layout (3 rows) */}
          <GridItem tool={tools[0]} index={0} />
          <GridItem tool={tools[1]} index={1} />
          <GridItem tool={tools[2]} index={2} />
          <GridItem tool={tools[3]} index={3} />
          <GridItem tool={tools[4]} index={4} />
          <GridItem tool={tools[5]} index={5} />
        </motion.div>
      </div>
    </section>
  );
};
