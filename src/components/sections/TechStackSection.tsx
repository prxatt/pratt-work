'use client';

import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Tool {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  icon: React.ReactNode;
}

const tools: Tool[] = [
  {
    id: '[1]',
    name: 'SLACK + JIRA',
    category: 'PROJECT MANAGEMENT',
    proficiency: 89,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: '[2]',
    name: 'ADOBE CREATIVE SUITE',
    category: 'PREMIERE, LIGHTROOM, AE',
    proficiency: 80,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
  },
  {
    id: '[3]',
    name: 'CHATGPT | CLAUDE',
    category: 'TOOLS FOR AUTOMATION, R&D',
    proficiency: 95,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    id: '[4]',
    name: 'SOEN.ML',
    category: 'PRODUCTIVITY OS',
    proficiency: 100,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <circle cx="5" cy="5" r="2" />
        <circle cx="19" cy="5" r="2" />
        <circle cx="5" cy="19" r="2" />
        <circle cx="19" cy="19" r="2" />
        <path d="M12 9V6M9 12H6M12 15V18M15 12H18" />
      </svg>
    ),
  },
  {
    id: '[5]',
    name: 'GITHUB + WINDSURF',
    category: 'AI-DRIVEN DEVELOPMENT',
    proficiency: 75,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    id: '[6]',
    name: 'MIDJOURNEY | RUNWAY | VEO',
    category: 'AI IMAGE GENERATION, EDITING',
    proficiency: 80,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.077-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.62a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
];

// Proficiency Bar Component
const ProficiencyBar = ({ 
  percentage, 
  index, 
  isHovered 
}: { 
  percentage: number; 
  index: number;
  isHovered: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className="w-full h-[1px] bg-[rgba(255,255,255,0.08)] mt-4 relative">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: isInView ? `${percentage}%` : 0 }}
        transition={{ 
          duration: 1.2, 
          ease: [0.16, 1, 0.3, 1],
          delay: index * 0.1 
        }}
        className="h-full bg-[#F2F2F0] absolute left-0 top-0"
        style={{
          boxShadow: isHovered ? '0 0 8px rgba(255,255,255,0.2)' : 'none',
          transition: 'box-shadow 0.3s ease'
        }}
      />
    </div>
  );
};

// Tool Card Component
const ToolCard = ({ 
  tool, 
  index,
  hoveredIndex,
  setHoveredIndex 
}: { 
  tool: Tool; 
  index: number;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
}) => {
  const isHovered = hoveredIndex === index;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      className="relative"
    >
      {/* Diamond marker on the timeline */}
      <div 
        className="absolute left-[-28px] top-1/2 -translate-y-1/2 hidden lg:block"
        style={{
          opacity: isHovered ? 1 : 0.4,
          transition: 'opacity 0.2s ease'
        }}
      >
        <div 
          className="w-[6px] h-[6px] bg-[#F2F2F0]"
          style={{ transform: 'rotate(45deg)' }}
        />
      </div>

      {/* Card */}
      <div
        className="rounded-[4px] p-[28px_32px] transition-all duration-300"
        style={{
          background: '#080d18',
          border: `1px solid ${isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
        }}
      >
        {/* Top row: Icon left + Number right */}
        <div className="flex justify-between items-center">
          <div className="text-[#F2F2F0]">{tool.icon}</div>
          <span 
            className="font-mono text-[12px]"
            style={{ color: '#4A4A47' }}
          >
            {tool.id}
          </span>
        </div>

        {/* Middle: Tool name */}
        <h3 
          className="font-display mt-4 transition-all duration-300"
          style={{
            fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
            color: '#F2F2F0',
            letterSpacing: isHovered ? '-0.01em' : '0',
          }}
        >
          {tool.name}
        </h3>

        {/* Bottom row: Category left + Percentage right */}
        <div className="flex justify-between items-center mt-4">
          <span 
            className="font-mono text-[11px] uppercase tracking-[0.15em]"
            style={{ color: '#4A4A47' }}
          >
            {tool.category}
          </span>
          <span 
            className="font-mono text-[13px]"
            style={{ color: '#F2F2F0' }}
          >
            {tool.proficiency}%
          </span>
        </div>

        {/* Proficiency bar */}
        <ProficiencyBar 
          percentage={tool.proficiency} 
          index={index}
          isHovered={isHovered}
        />
      </div>
    </motion.div>
  );
};

export const TechStackSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="min-h-screen bg-[#0a0a0a] py-24 md:py-32">
      <div className="px-6 md:px-12 lg:px-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8">
          {/* Left column - sticky (30% width) */}
          <div 
            className="lg:w-[30%] lg:sticky lg:top-[120px] lg:self-start"
          >
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[#F2F2F0] uppercase leading-[0.95] mb-4"
              style={{
                fontSize: 'clamp(3rem, 6vw, 5rem)',
              }}
            >
              TECH<br />STACK
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="font-mono text-[11px] uppercase tracking-[0.2em]"
              style={{ color: '#4A4A47' }}
            >
              TOOLS I BUILD WITH
            </motion.p>
          </div>

          {/* Right column - scrolls (70% width) */}
          <div className="lg:w-[70%] relative">
            {/* Vertical connecting line */}
            <div 
              className="absolute left-[-24px] top-0 bottom-0 w-[1px] hidden lg:block"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            />

            {/* Tool cards */}
            <div className="flex flex-col gap-6">
              {tools.map((tool, index) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  index={index}
                  hoveredIndex={hoveredIndex}
                  setHoveredIndex={setHoveredIndex}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
