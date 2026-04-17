'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams } from 'next/navigation';

// =============================================================================
// AGENTIC WORKFLOWS - "Orchestrated Intelligence"
// Concept: Flowing, interconnected systems with diagonal compositions
// =============================================================================
const agenticWorkflowsData = {
  title: 'THE ARCHITECTURE OF AGENTIC WORKFLOWS',
  subtitle: 'Orchestrating multi-modal LLMs for complex creative production pipelines.',
  category: 'TECHNICAL',
  date: 'MAR 2024',
  slug: 'agentic-workflows',
  imageColor: '#1a1a2e',
  keyword: 'AGENTIC',
  sections: [
    {
      heading: 'THE PRECIPICE',
      content: 'In the evolving landscape of artificial intelligence, we stand at a precipice where the tools of creation are no longer passive instruments but active collaborators. The architecture of agentic workflows represents a fundamental shift in how we conceptualize creative production.',
    },
    {
      quote: 'The creative director of tomorrow will be an orchestrator of intelligences.',
      content: 'These systems do not merely execute commands; they anticipate needs, suggest alternatives, and iterate upon ideas with a degree of autonomy that challenges our traditional understanding of authorship.',
    },
    {
      content: 'The workflow becomes a dialogue between human intention and machine capability, each pushing the other toward outcomes neither could achieve alone.',
      stat: '47%',
      statLabel: 'FASTER ITERATION',
    },
  ]
};

// =============================================================================
// PHYSICALITY MATTERS - "Embodied Experience"
// Concept: Weight, texture, grounded presence with heavy compositions
// =============================================================================
const physicalityData = {
  title: 'WHY PHYSICALITY STILL MATTERS',
  subtitle: 'Reflections on producing large-scale experiential activations.',
  category: 'PHILOSOPHY',
  date: 'FEB 2024',
  slug: 'physicality-matters',
  imageColor: '#2a2a3a',
  keyword: 'PHYSICAL',
  sections: [
    {
      heading: 'THE ALCHEMY',
      content: 'In an era dominated by screens, the power of physical presence has become paradoxically more potent. When we gather in shared space, something alchemical occurs that no virtual environment can replicate.',
    },
    {
      quote: 'We need to feel the vibration of sound in our chests.',
      content: 'The scale of experiential activations has taught me that human beings crave embodiment. We need to smell the materials of construction, and share glances with strangers who become momentary companions in collective experience.',
      highlight: 'EMBODIED COGNITION',
    },
    {
      content: 'Digital tools have democratized creative expression, but they have not replaced the hunger for physical communion. The most powerful experiences weave the digital and physical into seamless tapestries of meaning.',
    },
  ]
};

// =============================================================================
// HUMAN-AI COLLABORATION - "The Partnership"
// Concept: Duality, convergence, shared space with overlapping compositions
// =============================================================================
const collaborationData = {
  title: 'THE FUTURE OF HUMAN-AI COLLABORATION',
  subtitle: 'Exploring the shifting paradigm of creative tools.',
  category: 'CULTURE',
  date: 'JAN 2024',
  slug: 'human-ai-collaboration',
  imageColor: '#1f1f2e',
  keyword: 'COLLABORATION',
  sections: [
    {
      heading: 'THE QUESTION',
      content: 'The question is no longer whether AI will transform creative industries, but how we navigate that transformation while preserving the essence of human expression.',
    },
    {
      quote: 'Every technological revolution has been met with resistance followed by integration.',
      content: 'From the camera to digital editing, creative history shows us that tools evolve and artists adapt. AI represents perhaps the most profound shift yet.',
      humanContent: 'We bring intention, taste, and lived experience.',
      aiContent: 'It brings iteration, variation, and pattern recognition.',
    },
    {
      content: 'The most compelling creative work will emerge from practitioners who master the art of collaboration with artificial minds. This is the new creative literacy.',
    },
  ]
};

// =============================================================================
// STORYTELLING AGE - "Attention Fragments"
// Concept: Scattered focus, broken grids, shards of narrative
// =============================================================================
const storytellingData = {
  title: 'STORYTELLING IN THE AGE OF INFINITE CONTENT',
  subtitle: 'How narrative survives when attention is the scarcest resource.',
  category: 'STORYTELLING',
  date: 'DEC 2023',
  slug: 'storytelling-age',
  imageColor: '#252530',
  keyword: 'STORY',
  sections: [
    {
      heading: 'THE SCARCITY',
      content: 'Attention has become the scarcest resource in human history. Every waking moment presents infinite options for engagement, each competing for limited cognitive bandwidth.',
    },
    {
      fragments: [
        { text: 'The traditional arc assumes', emphasis: false },
        { text: 'continuity', emphasis: true },
        { text: 'that no longer exists.', emphasis: false },
        { text: 'We must learn to tell stories', emphasis: false },
        { text: 'that survive interruption.', emphasis: true },
      ],
      content: 'In this environment, storytelling faces an existential challenge. We must design narratives that reward partial attention, that create meaning in fragments.',
    },
    {
      content: 'Yet the fundamental human need for narrative persists. We are storytelling animals, and this will not change. The successful narratives of this era will adapt to new attention patterns without sacrificing emotional depth.',
    },
  ]
};

// =============================================================================
// QUANTUM CREATIVE - "Superposition States"
// Concept: Multiple states, probability clouds, ethereal compositions
// =============================================================================
const quantumData = {
  title: 'QUANTUM CREATIVE THINKING',
  subtitle: 'Parallel processing ideas across multiple dimensions of thought.',
  category: 'THINKING',
  date: 'NOV 2023',
  slug: 'quantum-creative',
  imageColor: '#1e1e28',
  keyword: 'QUANTUM',
  sections: [
    {
      heading: 'SUPERPOSITION',
      content: 'Quantum mechanics tells us that particles can exist in multiple states simultaneously until observed. This superposition offers a powerful metaphor for creative thinking.',
    },
    {
      quote: 'Hold multiple possibilities in suspension before collapsing into solution.',
      content: 'The creative mind, like the quantum particle, should maintain superposition of ideas. Premature observation destroys the wave function of creative potential.',
      states: ['IDEATION', 'EXPLORATION', 'CONVERGENCE'],
    },
    {
      content: 'The quantum creative does not think in straight lines but in probability clouds, exploring the space of possibility before the wave function collapses.',
    },
  ]
};

// =============================================================================
// ECONOMICS OF ATTENTION - "Value Exchange"
// Concept: Transaction, balance, measurement, precise grid systems
// =============================================================================
const attentionData = {
  title: 'THE ECONOMICS OF ATTENTION',
  subtitle: 'Understanding value exchange in an ecosystem where time is currency.',
  category: 'CULTURE',
  date: 'OCT 2023',
  slug: 'economics-attention',
  imageColor: '#22222c',
  keyword: 'ATTENTION',
  sections: [
    {
      heading: 'THE ECONOMY',
      content: 'We have entered an attention economy where the scarcest resource is human focus. Every creative work competes for limited bandwidth.',
    },
    {
      metrics: [
        { label: 'Genuine Engagement', value: '1 min', equivalent: '60 min passive' },
        { label: 'Depth Over Breadth', value: 'Quality', equivalent: 'Quantity' },
        { label: 'Sustainable Advantage', value: 'Trust', equivalent: 'Manipulation' },
      ],
      content: 'The value proposition has shifted from content quantity to attention quality. A minute of genuine engagement is worth more than an hour of passive consumption.',
    },
    {
      content: 'The ethical imperative is clear: respect the attention of your audience as you would respect their time. Create work that justifies the cognitive investment it demands.',
    },
  ]
};

// =============================================================================
// AGENTIC WORKFLOWS LAYOUT - Diagonal, flowing, interconnected
// =============================================================================
const AgenticWorkflowsLayout = ({ currentSection, currentSectionIndex }: any) => {
  if (currentSectionIndex === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-140px)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative h-[50vh] lg:h-auto overflow-hidden"
          style={{ backgroundColor: agenticWorkflowsData.imageColor }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-amber-500/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          <div className="absolute inset-0 opacity-40">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="agenticGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="1" fill="#3a3a5a" />
                  <path d="M0 30 L60 30 M30 0 L30 60" stroke="#2a2a4a" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#agenticGrid)" />
            </svg>
          </div>
          <div className="absolute top-6 left-6">
            <span className="font-mono text-[10px] tracking-[0.3em] text-cyan-500 uppercase bg-[#0a0a0a]/80 px-3 py-1.5 border border-[#2a2a2a]">
              {agenticWorkflowsData.category}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12 lg:pb-32"
        >
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-primary uppercase leading-[1.1] mb-4">
            {agenticWorkflowsData.title}
          </h1>
          <p className="font-mono text-xs text-cyan-500 uppercase tracking-[0.2em] mb-8">{currentSection.heading}</p>
          <p className="font-sans text-base md:text-lg text-secondary/80 leading-[1.8]">{currentSection.content}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] px-6 md:px-12 lg:px-20 py-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-12 border-l-2 border-cyan-500 pl-4"
        >
          <span className="font-mono text-[10px] tracking-[0.3em] text-tertiary uppercase">
            PART {currentSectionIndex + 1}
          </span>
          <div className="h-px w-16 bg-[#2a2a2a]" />
          <span className="font-mono text-[10px] tracking-[0.2em] text-cyan-500 uppercase">
            {agenticWorkflowsData.category}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-8">
            {currentSection.quote && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-transparent" />
                <Quote className="w-6 h-6 text-cyan-500/30 mb-3" />
                <p className="font-display text-xl md:text-2xl text-primary uppercase leading-[1.2]">
                  {currentSection.quote}
                </p>
              </motion.div>
            )}
            
            {currentSection.stat && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="border border-[#2a2a2a] p-6 bg-[#0f0f0f]"
              >
                <span className="font-display text-5xl text-cyan-500">{currentSection.stat}</span>
                <p className="font-mono text-[10px] tracking-[0.2em] text-tertiary uppercase mt-2">
                  {currentSection.statLabel}
                </p>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-7 lg:pl-8"
          >
            <p className="font-sans text-lg md:text-xl text-secondary/80 leading-[1.9]">
              {currentSection.content}
            </p>
          </motion.div>
        </div>

        <div className="relative mt-16 h-32 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute left-0 top-0 w-24 h-16 border border-[#2a2a2a] bg-[#1a1a2e]/50 flex items-center justify-center"
          >
            <span className="font-mono text-[8px] text-cyan-500/60 uppercase">LLM</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute left-32 top-4 w-20 h-20 border border-[#2a2a2a] bg-[#1a1a2e]/50 flex items-center justify-center"
          >
            <span className="font-mono text-[8px] text-amber-500/60 uppercase">AGENT</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// PHYSICALITY MATTERS LAYOUT - Weighty, grounded, heavy compositions
// =============================================================================
const PhysicalityLayout = ({ currentSection, currentSectionIndex }: any) => {
  if (currentSectionIndex === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-140px)]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative h-[50vh] lg:h-auto overflow-hidden"
          style={{ backgroundColor: physicalityData.imageColor }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="physicalGrid" width="80" height="80" patternUnits="userSpaceOnUse">
                  <rect width="80" height="80" fill="none" stroke="#3a3a4a" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#physicalGrid)" />
            </svg>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col justify-end px-8 md:px-12 lg:px-16 py-12 lg:pb-32"
        >
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-primary uppercase leading-[0.95] mb-6">
            {physicalityData.title}
          </h1>
          <p className="font-mono text-xs text-amber-500/80 uppercase tracking-[0.15em] mb-8">
            {currentSection.heading}
          </p>
          <p className="font-sans text-lg text-secondary/70 leading-[1.9] max-w-lg">
            {currentSection.content}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] px-6 md:px-12 lg:px-20 py-12">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b-2 border-[#3a3a3a] pb-6 mb-12"
        >
          <div className="flex justify-between items-end">
            <span className="font-display text-6xl md:text-8xl text-[#2a2a2a]">0{currentSectionIndex + 1}</span>
            <span className="font-mono text-[10px] tracking-[0.3em] text-tertiary uppercase">
              {physicalityData.category}
            </span>
          </div>
        </motion.div>

        <div className="space-y-12">
          {currentSection.quote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-[#151515] border-l-4 border-amber-500 p-8 md:p-12"
            >
              <Quote className="w-8 h-8 text-amber-500/20 mb-4" />
              <p className="font-display text-2xl md:text-3xl text-primary uppercase leading-[1.15]">
                {currentSection.quote}
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="md:col-span-2">
              <p className="font-sans text-lg text-secondary/80 leading-[1.9]">
                {currentSection.content}
              </p>
            </div>
            
            {currentSection.highlight && (
              <div className="border-t-2 border-amber-500/30 pt-4">
                <span className="font-mono text-[10px] tracking-[0.2em] text-amber-500 uppercase block mb-2">
                  {currentSection.highlight}
                </span>
                <div className="h-24 bg-[#1a1a1a] border border-[#2a2a2a]" />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// COLLABORATION LAYOUT - Duality, overlapping, convergence
// =============================================================================
const CollaborationLayout = ({ currentSection, currentSectionIndex }: any) => {
  if (currentSectionIndex === 0) {
    return (
      <div className="min-h-[calc(100vh-140px)] grid grid-cols-1 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12 border-r border-[#2a2a2a]"
        >
          <span className="font-mono text-[10px] tracking-[0.3em] text-tertiary uppercase mb-6">Human</span>
          <h1 className="font-display text-3xl md:text-4xl text-primary uppercase leading-[1.1]">
            {collaborationData.title}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12 relative"
        >
          <div className="absolute top-1/2 left-0 w-4 h-4 bg-amber-500 -translate-x-1/2 -translate-y-1/2" />
          <span className="font-mono text-[10px] tracking-[0.3em] text-amber-500 uppercase mb-6">Machine</span>
          <p className="font-sans text-lg text-secondary/80 leading-[1.8]">{currentSection.content}</p>
        </motion.div>
      </div>
    );
  }

  if (currentSectionIndex === 1 && currentSection.humanContent) {
    return (
      <div className="min-h-[calc(100vh-140px)] px-6 md:px-12 lg:px-20 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#151515] p-8 lg:p-12 flex flex-col justify-center"
            >
              <span className="font-mono text-[10px] text-tertiary uppercase tracking-[0.2em] mb-4">Human brings</span>
              <p className="font-sans text-xl text-secondary/90">{currentSection.humanContent}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#1a1a1a] p-8 lg:p-12 flex flex-col justify-center border-l border-[#2a2a2a]"
            >
              <span className="font-mono text-[10px] text-amber-500 uppercase tracking-[0.2em] mb-4">AI brings</span>
              <p className="font-sans text-xl text-secondary/90">{currentSection.aiContent}</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative -mt-8 mx-8 lg:mx-20 bg-[#0f0f0f] border border-[#2a2a2a] p-6 lg:p-8 z-10"
          >
            <Quote className="w-6 h-6 text-amber-500/30 mb-3" />
            <p className="font-display text-xl text-primary uppercase">{currentSection.quote}</p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center font-sans text-lg text-secondary/70 max-w-2xl mx-auto"
          >
            {currentSection.content}
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-6 md:px-12 lg:px-20 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl text-center"
      >
        <div className="w-24 h-24 border border-[#2a2a2a] rounded-full mx-auto mb-8 flex items-center justify-center">
          <div className="w-16 h-16 border border-amber-500/30 rounded-full" />
        </div>
        <p className="font-sans text-xl md:text-2xl text-secondary/80 leading-[1.8]">
          {currentSection.content}
        </p>
      </motion.div>
    </div>
  );
};

// =============================================================================
// STORYTELLING LAYOUT - Scattered, broken, fragments
// =============================================================================
const StorytellingLayout = ({ currentSection, currentSectionIndex }: any) => {
  if (currentSectionIndex === 0) {
    return (
      <div className="min-h-[calc(100vh-140px)] px-6 md:px-12 lg:px-20 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-7 lg:col-start-1"
            >
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-primary uppercase leading-[0.95]">
                {storytellingData.title}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-5 lg:col-start-8 lg:mt-24"
            >
              <p className="font-mono text-[10px] tracking-[0.3em] text-amber-500 uppercase mb-4">
                {currentSection.heading}
              </p>
              <p className="font-sans text-lg text-secondary/80 leading-[1.8]">
                {currentSection.content}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (currentSection.fragments) {
    return (
      <div className="min-h-[calc(100vh-140px)] px-6 md:px-12 lg:px-20 py-12 flex items-center">
        <div className="max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              {currentSection.fragments.map((fragment: any, idx: number) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`block ${
                    fragment.emphasis 
                      ? 'font-display text-3xl md:text-4xl text-primary uppercase' 
                      : 'font-sans text-lg text-secondary/60'
                  }`}
                >
                  {fragment.text}
                </motion.span>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center"
            >
              <div className="border-l-2 border-[#2a2a2a] pl-6">
                <p className="font-sans text-lg text-secondary/80 leading-[1.9]">
                  {currentSection.content}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-6 md:px-12 lg:px-20 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <span className="font-mono text-xs text-amber-500">§</span>
          </div>
          <p className="font-sans text-xl md:text-2xl text-secondary/90 leading-[1.7]">
            {currentSection.content}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// =============================================================================
// QUANTUM LAYOUT - Ethereal, multiple states, orbital
// =============================================================================
const QuantumLayout = ({ currentSection, currentSectionIndex }: any) => {
  if (currentSectionIndex === 0) {
    return (
      <div className="min-h-[calc(100vh-140px)] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.03 }}
            transition={{ delay: 0.5 }}
            className="font-display text-[20vw] text-primary uppercase whitespace-nowrap"
          >
            SUPERPOSITION
          </motion.div>
        </div>

        <div className="relative z-10 px-6 md:px-12 lg:px-20 py-12 h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="font-mono text-[10px] tracking-[0.4em] text-cyan-500/60 uppercase mb-6 block">
              {currentSection.heading}
            </span>
            <h1 className="font-display text-4xl md:text-5xl text-primary uppercase leading-[1.05] mb-8">
              {quantumData.title}
            </h1>
            <p className="font-sans text-lg text-secondary/70 leading-[1.9] font-light">
              {currentSection.content}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (currentSection.states) {
    return (
      <div className="min-h-[calc(100vh-140px)] px-6 md:px-12 lg:px-20 py-12 flex items-center">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="relative h-[300px]">
              {currentSection.states.map((state: string, idx: number) => (
                <motion.div
                  key={state}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.2 }}
                  className="absolute border border-[#2a2a2a] bg-[#0f0f0f]/80 backdrop-blur px-6 py-3"
                  style={{
                    left: idx === 0 ? '20%' : idx === 1 ? '50%' : '30%',
                    top: idx === 0 ? '10%' : idx === 1 ? '40%' : '70%',
                  }}
                >
                  <span className="font-mono text-xs text-cyan-500/80 uppercase tracking-[0.2em]">{state}</span>
                </motion.div>
              ))}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
                <line x1="30%" y1="20%" x2="60%" y2="50%" stroke="#2a2a2a" strokeWidth="1" strokeDasharray="4" />
                <line x1="60%" y1="50%" x2="40%" y2="80%" stroke="#2a2a2a" strokeWidth="1" strokeDasharray="4" />
              </svg>
            </div>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Quote className="w-6 h-6 text-cyan-500/20 mb-3" />
                <p className="font-display text-2xl text-primary/90 uppercase leading-[1.2]">
                  {currentSection.quote}
                </p>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="font-sans text-lg text-secondary/70 leading-[1.9] font-light"
              >
                {currentSection.content}
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-6 md:px-12 lg:px-20 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl text-center"
      >
        <p className="font-sans text-xl md:text-2xl text-secondary/80 leading-[1.8] font-light">
          {currentSection.content}
        </p>
      </motion.div>
    </div>
  );
};

// =============================================================================
// ATTENTION ECONOMICS LAYOUT - Precise, measured, grid-based
// =============================================================================
const AttentionLayout = ({ currentSection, currentSectionIndex }: any) => {
  if (currentSectionIndex === 0) {
    return (
      <div className="min-h-[calc(100vh-140px)] grid grid-cols-1 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:col-span-5 bg-[#151515] p-8 md:p-12 flex flex-col justify-center"
        >
          <span className="font-mono text-[10px] tracking-[0.3em] text-amber-500 uppercase mb-4">
            {currentSection.heading}
          </span>
          <p className="font-sans text-lg text-secondary/80 leading-[1.8]">
            {currentSection.content}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-7 p-8 md:p-12 flex items-center"
        >
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-primary uppercase leading-[0.95]">
            {attentionData.title}
          </h1>
        </motion.div>
      </div>
    );
  }

  if (currentSection.metrics) {
    return (
      <div className="min-h-[calc(100vh-140px)] px-6 md:px-12 lg:px-20 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="border border-[#2a2a2a] mb-12">
            {currentSection.metrics.map((metric: any, idx: number) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="grid grid-cols-3 border-b border-[#2a2a2a] last:border-b-0"
              >
                <div className="p-4 border-r border-[#2a2a2a]">
                  <span className="font-mono text-[10px] tracking-[0.15em] text-tertiary uppercase">{metric.label}</span>
                </div>
                <div className="p-4 border-r border-[#2a2a2a]">
                  <span className="font-display text-xl text-amber-500">{metric.value}</span>
                </div>
                <div className="p-4">
                  <span className="font-sans text-sm text-secondary/50">= {metric.equivalent}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-sans text-lg text-secondary/80 leading-[1.9] max-w-3xl"
          >
            {currentSection.content}
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-6 md:px-12 lg:px-20 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl text-center border border-[#2a2a2a] p-8 md:p-12"
      >
        <div className="w-16 h-16 border-2 border-amber-500/30 mx-auto mb-6 flex items-center justify-center">
          <span className="font-display text-2xl text-amber-500">✓</span>
        </div>
        <p className="font-sans text-xl text-secondary/90 leading-[1.8]">
          {currentSection.content}
        </p>
      </motion.div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const postDataMap: Record<string, any> = {
  'agentic-workflows': agenticWorkflowsData,
  'physicality-matters': physicalityData,
  'human-ai-collaboration': collaborationData,
  'storytelling-age': storytellingData,
  'quantum-creative': quantumData,
  'economics-attention': attentionData,
};

export default function BlogPostPage() {
  const { setCursorState } = useCursor();
  const params = useParams();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slug = params?.slug as string;
  const currentPost = postDataMap[slug];

  useEffect(() => {
    setCurrentSectionIndex(0);
  }, [slug]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!currentPost) return;
    const totalSections = currentPost.sections.length;
    
    if (e.key === 'ArrowRight') {
      if (currentSectionIndex < totalSections - 1) {
        setDirection(1);
        setCurrentSectionIndex(prev => prev + 1);
      }
    } else if (e.key === 'ArrowLeft') {
      if (currentSectionIndex > 0) {
        setDirection(-1);
        setCurrentSectionIndex(prev => prev - 1);
      }
    }
  }, [currentPost, currentSectionIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const goToNextSection = () => {
    if (currentPost && currentSectionIndex < currentPost.sections.length - 1) {
      setDirection(1);
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const goToPrevSection = () => {
    if (currentSectionIndex > 0) {
      setDirection(-1);
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  if (!currentPost) {
    return <div>Post not found</div>;
  }

  const currentSection = currentPost.sections[currentSectionIndex];
  const hasNextSection = currentSectionIndex < currentPost.sections.length - 1;
  const hasPrevSection = currentSectionIndex > 0;
  const isFirstSection = currentSectionIndex === 0;

  const renderLayout = () => {
    const layoutProps = {
      currentSection,
      currentSectionIndex,
      totalSections: currentPost.sections.length,
      setDirection,
      setCurrentSectionIndex,
      hasNextSection,
      hasPrevSection,
      goToNextSection,
      goToPrevSection,
      setCursorState,
    };

    switch (slug) {
      case 'agentic-workflows':
        return <AgenticWorkflowsLayout {...layoutProps} />;
      case 'physicality-matters':
        return <PhysicalityLayout {...layoutProps} />;
      case 'human-ai-collaboration':
        return <CollaborationLayout {...layoutProps} />;
      case 'storytelling-age':
        return <StorytellingLayout {...layoutProps} />;
      case 'quantum-creative':
        return <QuantumLayout {...layoutProps} />;
      case 'economics-attention':
        return <AttentionLayout {...layoutProps} />;
      default:
        return <AgenticWorkflowsLayout {...layoutProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden pt-20">
      {/* Blog Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full px-6 md:px-12 lg:px-20 py-4 flex justify-between items-center bg-[#0a0a0a]"
      >
        <Link
          href="/blog"
          prefetch={false}
          className="group flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-tertiary uppercase hover:text-amber-500 transition-colors duration-300"
          onMouseEnter={() => setCursorState('hover')}
          onMouseLeave={() => setCursorState('default')}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          ALL POSTS
        </Link>
        
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevSection}
            disabled={!hasPrevSection}
            className={`p-2 border border-[#2a2a2a] transition-colors ${
              hasPrevSection ? 'hover:border-amber-500 text-primary' : 'text-tertiary/30'
            }`}
            onMouseEnter={() => hasPrevSection && setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="font-mono text-[11px] tracking-[0.15em] text-secondary px-3 py-1.5 border border-[#2a2a2a] min-w-[60px] text-center">
            {currentSectionIndex + 1} / {currentPost.sections.length}
          </span>
          
          <button
            onClick={goToNextSection}
            disabled={!hasNextSection}
            className={`p-2 border border-[#2a2a2a] transition-colors ${
              hasNextSection ? 'hover:border-amber-500 text-primary' : 'text-tertiary/30'
            }`}
            onMouseEnter={() => hasNextSection && setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.main
          key={`${slug}-${currentSectionIndex}`}
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -50 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {renderLayout()}

          {/* Large Keyword - Only on first section */}
          {isFirstSection && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
              className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent h-full" />
              
              <div className="relative px-0 py-8">
                <button
                  onClick={goToNextSection}
                  disabled={!hasNextSection}
                  className={`group block pointer-events-auto w-full text-left ${
                    hasNextSection ? 'cursor-pointer' : 'cursor-default opacity-50'
                  }`}
                  onMouseEnter={() => hasNextSection && setCursorState('hover')}
                  onMouseLeave={() => setCursorState('default')}
                >
                  <div className="flex items-end justify-between px-6 md:px-12 lg:px-20">
                    <h2 className={`font-display text-[clamp(4rem,18vw,16rem)] leading-[0.75] tracking-tighter uppercase transition-colors duration-500 ${
                      hasNextSection ? 'text-primary group-hover:text-amber-500' : 'text-tertiary'
                    }`}>
                      {currentPost.keyword}
                    </h2>
                    {hasNextSection && (
                      <ArrowUpRight className="w-8 h-8 md:w-12 md:h-12 text-amber-500 mb-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300" />
                    )}
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
