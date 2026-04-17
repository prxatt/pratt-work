'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';
import { ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Status color configurations
const statusColors: Record<string, { from: string; to: string }> = {
  '2023': { from: '#6b7280', to: '#9ca3af' },
  '2024': { from: '#6b7280', to: '#9ca3af' },
  'ONGOING': { from: '#ec4899', to: '#f472b6' },
  'RESEARCH': { from: '#6366f1', to: '#818cf8' },
  'PROTOTYPE': { from: '#f97316', to: '#fb923c' },
  'CONCEPT': { from: '#14b8a6', to: '#2dd4bf' },
};

// Status Badge Component - Improved readability
const StatusBadge = ({ status }: { status: string }) => {
  const colors = statusColors[status] || { from: '#6b7280', to: '#9ca3af' };
  
  return (
    <span
      className="font-mono text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full font-bold whitespace-nowrap"
      style={{
        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
        color: '#0a0a0a',
      }}
    >
      {status}
    </span>
  );
};

// Content data structure with optional fields
interface ProjectItem {
  name: string;
  description: string;
  status: string;
  techStack?: string[];
  image?: string;
  url?: string;
}

// REDACTED: Blog content hidden with white bars per request
const secondaryContent: Record<string, ProjectItem[]> = {
  'BLOG': [
    { 
      name: 'The Future of Creative Tech', 
      description: '███████ ██████ ████ ████████ ████ ███████ ████████████', 
      status: '2026',
      url: '/blog'
    },
    { 
      name: 'Building SOEN', 
      description: '███████████ ███████████ ███ █████ ███████████████ ████████', 
      status: '2026',
      url: '/blog'
    },
    { 
      name: 'Production at Scale', 
      description: '███ ███████████ ████████ ████ ███████████████ █████████', 
      status: '2026',
      url: '/blog'
    },
  ],
};

// R&D section removed per request
const tabs = ['BLOG'] as const;
type Tab = typeof tabs[number];

// Secondary Content Section
export const SecondaryContent = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { setCursorState } = useCursor();
  const router = useRouter();

  // Only Blog section remains - R&D removed per request
  const currentContent = secondaryContent['BLOG'];

  return (
    <section className="relative py-8 md:py-12 bg-[#0a0a0a]">
      <div className="px-6 md:px-12 lg:px-20 w-full">
        {/* Section Header - Title with embedded clickable tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <span className="font-mono text-xs tracking-[0.3em] text-[#6b7280] uppercase block mb-3">
            SELECTED WORKS
          </span>
          {/* R&D tab removed - Blog only */}
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-[#F2F2F0] uppercase tracking-tight">
            <span 
              className="cursor-none inline-block transition-colors duration-300 text-[#F2F2F0]"
              onMouseEnter={() => setCursorState('hover')}
              onMouseLeave={() => setCursorState('default')}
            >
              BLOG
            </span>
          </h2>
        </motion.div>

        {/* Content List */}
        <div className="space-y-0">
          {currentContent.map((item, index) => (
            <motion.div
              key={`blog-${item.name}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onMouseEnter={() => {
                setCursorState('hover');
                setHoveredIndex(index);
              }}
              onMouseLeave={() => {
                setCursorState('default');
                setHoveredIndex(null);
              }}
              onClick={() => item.url && router.push(item.url)}
              className={`group border-b border-[#2a2a3a] py-6 first:pt-0 overflow-hidden ${item.url ? 'cursor-pointer' : 'cursor-none'}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 md:gap-8 flex-1">
                  <StatusBadge status={item.status} />
                  <h3 className="font-display text-xl md:text-2xl text-[#F2F2F0] uppercase tracking-tight group-hover:text-white transition-colors">
                    {item.name}
                  </h3>
                </div>
                
                <div className="flex items-center gap-6">
                  <p className="hidden md:block font-mono text-sm text-[#8A8A85] text-right max-w-md transition-all duration-500 group-hover:text-[#F2F2F0]">
                    {item.description}
                  </p>
                  <ArrowUpRight className="w-5 h-5 text-[#6b7280] group-hover:text-[#f59e0b] transition-colors flex-shrink-0" />
                </div>
              </div>

              {/* Expandable details with conditional content */}
              <motion.div
                initial={false}
                animate={{ 
                  height: hoveredIndex === index ? 'auto' : 0, 
                  opacity: hoveredIndex === index ? 1 : 0,
                  marginTop: hoveredIndex === index ? 16 : 0 
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex gap-6 items-start overflow-hidden"
              >
                {/* Thumbnail Area - Only if image exists */}
                {item.image && (
                  <div className="w-32 h-20 md:w-40 md:h-24 bg-[#1a1a1a] rounded-lg overflow-hidden flex-shrink-0 border border-[#2a2a3a] group-hover:border-[#f59e0b]/30 transition-colors relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-mono text-[10px] text-[#3a3a3a] uppercase tracking-widest">Preview</span>
                    </div>
                  </div>
                )}

                <div className="flex-1">
                  <p className="md:hidden font-mono text-sm text-[#8A8A85] mb-4">
                    {item.description}
                  </p>
                  
                  {/* Tech Stack Tags - Only if they exist */}
                  {item.techStack && item.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-4 items-center">
                      {item.techStack.map((tech) => (
                        <span 
                          key={tech}
                          className="font-mono text-[10px] text-[#6b7280] uppercase tracking-widest border border-[#2a2a3a] px-2 py-1 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
