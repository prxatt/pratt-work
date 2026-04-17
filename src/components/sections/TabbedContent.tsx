'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';

const tabs = ['VENTURES', 'CASE STUDIES', 'R&D', 'PUBLICATIONS', 'PRESS'];

const content = {
  VENTURES: [
    { name: 'Surface Tension LLC', description: 'Experiential Production & Creative Technology Studio.', status: 'Active', url: 'https://surfacetension.studio' },
    { name: 'SOEN', description: 'AI Productivity OS for high-performance creative workflows.', status: 'In Beta', url: 'https://soen.ml' },
    { name: 'CulturePulse AI', description: 'Neural mapping of cultural trends for global brands.', status: 'Stealth', url: null },
  ],
  'CASE STUDIES': [
    { name: 'Meta Connect', description: 'Keynote production and developer experience design.', status: '2023', url: '/work/meta-connect-2023' },
    { name: 'OpenAI DevDay', description: 'Inaugural developer conference production.', status: '2023', url: '/work/openai-devday' },
    { name: 'Jack Morton', description: 'Technical direction for large-scale physical activations.', status: 'Ongoing', url: '/work/jack-morton' },
  ],
  'R&D': [
    { name: 'Neural Puppetry', description: 'Real-time motion capture driven by LLM agents.', status: 'Research', url: null },
    { name: 'Spatial Canvas', description: 'Infinite zoomable interface for multi-modal AI models.', status: 'Prototype', url: null },
    { name: 'Ambient Compute', description: 'Zero-UI interaction patterns for smart environments.', status: 'Concept', url: null },
  ],
  PUBLICATIONS: [
    { name: 'The Future of Experiential', description: 'How AI is reshaping live production and audience engagement.', status: '2024', url: 'https://medium.com/@prattmajmudar/future-of-experiential' },
    { name: 'Building for Scale', description: 'Technical architecture for 10K+ concurrent immersive experiences.', status: '2023', url: 'https://medium.com/@prattmajmudar/building-for-scale' },
    { name: 'Creative Technology Stack', description: 'Essential tools for modern experiential producers.', status: '2023', url: 'https://medium.com/@prattmajmudar/creative-tech-stack' },
    { name: 'Volumetric Video Primer', description: 'Technical guide to real-time 3D capture and broadcast.', status: '2022', url: 'https://medium.com/@prattmajmudar/volumetric-primer' },
  ],
  PRESS: [
    { name: 'TechCrunch', description: 'Coverage of Meta Connect experiential activations.', status: '2023', url: 'https://techcrunch.com' },
    { name: 'The Verge', description: 'Feature on AI-driven creative production workflows.', status: '2023', url: 'https://theverge.com' },
    { name: 'VentureBeat', description: 'Interview on the future of immersive brand experiences.', status: '2022', url: 'https://venturebeat.com' },
    { name: 'Event Marketer', description: 'Case study: Salesforce Dreamforce activation.', status: '2022', url: 'https://eventmarketer.com' },
  ],
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
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
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export const TabbedContent = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const { setCursorState } = useCursor();
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section ref={containerRef} className="py-24 md:py-32 lg:py-40 px-6 md:px-12 lg:px-20 bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
          className="mb-16 md:mb-24"
        >
          <span className="font-mono text-[10px] text-[#444] uppercase tracking-[0.4em] block mb-6">
            Selected Work
          </span>
          <h2 className="font-display text-[#F2F2F0] uppercase text-4xl md:text-6xl lg:text-7xl leading-[0.9] tracking-tight">
            Projects
          </h2>
        </motion.div>

        {/* Tab buttons */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
          className="flex flex-wrap gap-6 md:gap-12 mb-16"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              onMouseEnter={() => setCursorState('hover')}
              onMouseLeave={() => setCursorState('default')}
              className={`font-display uppercase text-xl md:text-2xl lg:text-3xl transition-all duration-500 ${
                activeTab === tab 
                  ? 'text-[#F2F2F0]' 
                  : 'text-[#333] hover:text-[#555]'
              }`}
            >
              <span className="relative">
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[#6366f1]"
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Content grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
        >
          <AnimatePresence mode="wait">
            {content[activeTab as keyof typeof content].map((item, index) => {
              const CardContent = (
                <motion.div
                  key={`${activeTab}-${item.name}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4 }}
                  className={`group border border-[#1a1a1a] bg-[#0D0D0D] p-6 md:p-8 transition-all duration-500 hover:border-[#333] hover:bg-[#111] ${item.url ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-display text-[#F2F2F0] uppercase text-lg md:text-xl tracking-tight">
                      {item.name}
                    </h3>
                    <span className="font-mono text-[9px] tracking-widest text-[#6366f1] uppercase px-2 py-1 border border-[#1a1a1a]">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[#666] text-sm leading-relaxed">
                    {item.description}
                  </p>
                  <div className="mt-6 h-[1px] bg-[#1a1a1a] overflow-hidden">
                    <div className="h-full w-0 bg-[#6366f1] group-hover:w-full transition-all duration-700" />
                  </div>
                </motion.div>
              );

              return item.url ? (
                <a 
                  key={`${activeTab}-${item.name}`}
                  href={item.url}
                  target={item.url.startsWith('http') ? '_blank' : undefined}
                  rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="block"
                  onMouseEnter={() => setCursorState('hover')}
                  onMouseLeave={() => setCursorState('default')}
                >
                  {CardContent}
                </a>
              ) : (
                <div key={`${activeTab}-${item.name}`}>
                  {CardContent}
                </div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
