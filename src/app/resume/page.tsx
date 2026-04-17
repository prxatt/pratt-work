'use client';

import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Types
interface Job {
  title: string;
  companies: string;
  dates: string;
  bullets: string[];
}

interface Tool {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  icon: React.ReactNode;
}

// Data
const jobs: Job[] = [
  {
    title: 'CREATIVE PRODUCER',
    companies: 'SALESFORCE, WEIGHTS & BIASES, AWS, AI ENGINEER, C-FIRE',
    dates: '2017 - PRESENT',
    bullets: [
      'PRODUCED CREATIVE ASSETS AND COORDINATED PRODUCTION FOR 14+ MAJOR BRAND EVENTS, PRODUCT LAUNCHES, AND EXPERIENTIAL ACTIVATIONS',
      'LED CROSS-FUNCTIONAL TEAMS OF 5-15 MEMBERS INCLUDING DESIGNERS, ENGINEERS, CREATIVE DIRECTORS, AND FABRICATION PARTNERS',
      'MANAGED VENDOR RELATIONSHIPS AND COORDINATED WITH FABRICATORS, AV PROVIDERS, AND EVENT PRODUCTION TEAMS',
      'COLLABORATED WITH PRODUCT, ENGINEERING, AND DESIGN TEAMS TO EXECUTE INTEGRATED MARKETING CAMPAIGNS AND BRAND ACTIVATIONS',
      'UTILIZED AI TOOLS (GPT-5, CLAUDE, MIDJOURNEY) TO ACCELERATE CONTENT CREATION, CONCEPT DEVELOPMENT, AND PRESENTATION MATERIALS',
    ],
  },
  {
    title: 'CONTENT PRODUCER | VR/AR & LIVE-ACTION',
    companies: 'PWC, CHIME, STABILITY.AI, EXIT REALITY, HBO MAX',
    dates: '2019 - PRESENT',
    bullets: [
      'PRODUCED IMMERSIVE VR/AR CONTENT AND 360-DEGREE VIDEO FOR ENTERPRISE TRAINING, BRAND EXPERIENCES, AND CONSUMER APPLICATIONS',
      'MANAGED COMPLETE PRODUCTION CYCLES FROM CREATIVE CONCEPTS TO POST-PRODUCTION AND FINAL DELIVERY',
      'COORDINATED WITH TECHNICAL AND CREATIVE TEAMS TO OPTIMIZE CONTENT FOR APPLE VISION PRO, META QUEST, AND MOBILE AR PLATFORMS',
      'DELIVERED 8+ VR/AR/3D & LIVE ACTION PROJECTS ACHIEVING 100% CLIENT SATISFACTION AND REPEAT BUSINESS',
    ],
  },
  {
    title: 'AI CONTENT EVALUATOR',
    companies: 'OPEN AI',
    dates: '2020 - 2021',
    bullets: [
      'EVALUATED AI-GENERATED CONTENT AND TRAINING DATASETS TO IMPROVE NATURAL LANGUAGE PROCESSING MODEL QUALITY',
    ],
  },
  {
    title: 'PRODUCTION MANAGER',
    companies: 'HBO MAX, LYFT, YOUTUBE, OBSCURA DIGITAL',
    dates: '2015 - 2019',
    bullets: [
      'MANAGED VIDEO AND DIGITAL CONTENT PRODUCTION FOR ENTERTAINMENT AND TECHNOLOGY BRANDS ACROSS MULTIPLE PLATFORMS',
      'COORDINATED PRODUCTION SCHEDULES, RESOURCES, AND DELIVERABLES ACROSS 3-5 SIMULTANEOUS PROJECTS',
      'SUPERVISED PRODUCTION TEAMS OF 5-15 FREELANCERS AND STAFF, ENSURING CONSISTENT QUALITY AND ON-TIME DELIVERY',
      'REDUCED REVISION CYCLES BY 30% THROUGH IMPROVED QUALITY CONTROL PROCESSES',
    ],
  },
];

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
const ProficiencyBar = ({ percentage, index, isHovered }: { percentage: number; index: number; isHovered: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className="w-full h-[1px] bg-[rgba(255,255,255,0.08)] mt-4 relative">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: isInView ? `${percentage}%` : 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
        className="h-full bg-[#F2F2F0] absolute left-0 top-0"
        style={{ boxShadow: isHovered ? '0 0 8px rgba(255,255,255,0.2)' : 'none', transition: 'box-shadow 0.3s ease' }}
      />
    </div>
  );
};

// Tool Card Component
const ToolCard = ({ tool, index, hoveredIndex, setHoveredIndex }: { tool: Tool; index: number; hoveredIndex: number | null; setHoveredIndex: (i: number | null) => void }) => {
  const isHovered = hoveredIndex === index;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      className="rounded-[4px] p-6 transition-all duration-300"
      style={{ background: '#080d18', border: `1px solid ${isHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}` }}
    >
      <div className="flex justify-between items-center">
        <div className="text-[#F2F2F0]">{tool.icon}</div>
        <span className="font-mono text-[11px] text-[#4A4A47]">{tool.id}</span>
      </div>
      <h3 className="font-display text-[#F2F2F0] mt-4" style={{ fontSize: 'clamp(1.2rem, 2vw, 1.6rem)' }}>
        {tool.name}
      </h3>
      <div className="flex justify-between items-center mt-4">
        <span className="font-mono text-[11px] text-[#4A4A47] uppercase">{tool.category}</span>
        <span className="font-mono text-[13px] text-[#F2F2F0]">{tool.proficiency}%</span>
      </div>
      <ProficiencyBar percentage={tool.proficiency} index={index} isHovered={isHovered} />
    </motion.div>
  );
};

export default function ResumePage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Sticky CTA Bar */}
      <div className="sticky top-0 z-50 bg-[#141414] border-b border-[rgba(255,255,255,0.08)]">
        <div className="px-6 md:px-12 lg:px-20 py-4 flex justify-between items-center">
          <span className="font-sans text-[12px] text-[#8A8A85]">
            PRATT MAJMUDAR — CREATIVE TECHNOLOGIST + EXECUTIVE PRODUCER
          </span>
          <a
            href="/resume.pdf"
            download
            className="font-display text-[16px] text-[#F2F2F0] border border-[#F2F2F0] px-6 py-2 hover:bg-[#F2F2F0] hover:text-[#0D0D0D] transition-all duration-200"
          >
            DOWNLOAD PDF ↓
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 md:px-12 lg:px-20 py-20">
        {/* Hero */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[#F2F2F0] uppercase"
          style={{ fontSize: 'clamp(4rem, 12vw, 10rem)', lineHeight: 0.9 }}
        >
          RESUME
        </motion.h1>

        {/* Experience Section */}
        <div className="mt-20">
          <h2 className="font-mono text-[11px] text-[#4A4A47] uppercase tracking-[0.2em] mb-12">EXPERIENCE</h2>
          
          <div className="flex flex-col gap-12">
            {jobs.map((job, index) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="border-b border-[rgba(255,255,255,0.06)] pb-12"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                  <div>
                    <h3 className="font-display text-2xl md:text-3xl text-[#F2F2F0] uppercase">{job.title}</h3>
                    <p className="font-mono text-[11px] text-[#8A8A85] uppercase tracking-[0.1em] mt-2">{job.companies}</p>
                  </div>
                  <span className="font-mono text-[12px] text-[#4A4A47] uppercase">{job.dates}</span>
                </div>
                <ul className="flex flex-col gap-3">
                  {job.bullets.map((bullet, i) => (
                    <li key={i} className="font-mono text-[11px] text-[#8A8A85] uppercase tracking-[0.06em] leading-[1.8] max-w-4xl">
                      • {bullet}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="mt-20">
          <h2 className="font-mono text-[11px] text-[#4A4A47] uppercase tracking-[0.2em] mb-12">TECH STACK</h2>
          
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
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
  );
}
