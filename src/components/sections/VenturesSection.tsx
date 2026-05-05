'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Status color configurations - distinct for each entity
const statusColors: Record<string, { bg: string; text: string }> = {
  'ACTIVE': { bg: '#22c55e', text: '#0a0a0a' },  // Green - living brand
  'COMING SOON': { bg: '#3a3a3a', text: '#F2F2F0' },
  'ENTERPRISE': { bg: '#2a2a2a', text: '#8A8A85' },
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const colors = statusColors[status] || { bg: '#2a2a2a', text: '#8A8A85' };
  
  return (
    <span
      className="font-mono text-[9px] tracking-[0.2em] uppercase px-3 py-1.5 font-bold border border-[#3a3a3a]"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {status}
    </span>
  );
};

// Main Ventures Section (Step 2 Optimized)
export const VenturesSection = () => {
  return (
    <section id="ventures" className="relative py-14 md:py-20 lg:py-24 bg-[#0a0a0a] min-h-[85vh] flex flex-col justify-center overflow-x-hidden">
      <div className="px-6 md:px-12 lg:px-20 w-full max-w-[1600px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <span className="font-mono text-xs tracking-[0.3em] text-[#6b7280] uppercase block mb-4">
            BUILT BY PRATT
          </span>
          <h2 className="text-section-header text-[#F2F2F0] uppercase tracking-tight">
            VENTURES
          </h2>
        </motion.div>

        {/* Horizontal Branch Layout */}
        <div className="relative">
          {/* Grid Layout: 55% / 45% split */}
          <div className="grid grid-cols-1 lg:grid-cols-[56%_44%] gap-10 md:gap-12 lg:gap-0 items-center min-h-[52vh] md:min-h-[58vh]">
            
            {/* Left: Surface Tension - Card Visual */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="group relative cursor-pointer"
            >
              {/* Amber glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              {/* Left border accent */}
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 top-6 bottom-6 w-[3px] bg-[#f59e0b] origin-top rounded-full"
              />
              
              <div
                className="relative z-10 pl-4"
                style={{ cursor: 'default' }}
              >
                {/* ACTIVE Badge */}
                <div className="flex items-center gap-3 mb-3">
                  <StatusBadge status="ACTIVE" />
                </div>
                
                {/* Main Title */}
                <div className="flex flex-col mb-6">
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="font-display text-5xl md:text-6xl lg:text-7xl text-[#F2F2F0] uppercase tracking-tight group-hover:translate-x-2 transition-transform duration-500"
                  >
                    SURFACE
                  </motion.h3>
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="font-display text-5xl md:text-6xl lg:text-7xl text-[#F2F2F0] uppercase tracking-tight group-hover:translate-x-2 transition-transform duration-500"
                  >
                    TENSION
                  </motion.h3>
                </div>

                {/* Status row */}
                <div className="flex items-center gap-4">
                  <p className="font-mono text-sm text-[#6b7280] uppercase tracking-wider">
                    A multi-dimensional experiential company
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Connector Lines SVG - Centered between columns */}
            <div className="hidden lg:block absolute left-[56%] -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <svg width="180" height="320" viewBox="0 0 180 320" fill="none" className="overflow-visible">
                {/* Glow filter for lines */}
                <defs>
                  <linearGradient id="gradientSOEN" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                  <linearGradient id="gradientCulture" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                
                {/* Line 1: Surface Tension → SOEN (Independent L-Shape) */}
                <motion.path
                  d="M0 160 H60 V100 H140"
                  stroke="url(#gradientSOEN)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0, margin: '0px 0px 120px 0px' }}
                  transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
                
                {/* Line 2: Surface Tension → CulturePulse (Independent L-Shape) */}
                <motion.path
                  d="M0 160 H60 V220 H140"
                  stroke="url(#gradientCulture)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0, margin: '0px 0px 120px 0px' }}
                  transition={{ duration: 0.6, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
                />
                
                {/* SOEN endpoint glow */}
                <motion.circle
                  cx="140"
                  cy="100"
                  r="6"
                  fill="#06b6d4"
                  opacity="0.2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0, margin: '0px 0px 120px 0px' }}
                  transition={{ duration: 0.3, delay: 1.3, type: 'spring', stiffness: 200 }}
                />
                
                {/* SOEN endpoint dot - cyan (no SMIL pulse — avoids compositor work during scroll) */}
                <motion.circle
                  cx="140"
                  cy="100"
                  r="4"
                  fill="#06b6d4"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0, margin: '0px 0px 120px 0px' }}
                  transition={{ duration: 0.3, delay: 1.3, type: 'spring', stiffness: 300 }}
                />
                
                {/* CulturePulse endpoint glow */}
                <motion.circle
                  cx="140"
                  cy="220"
                  r="6"
                  fill="#6366f1"
                  opacity="0.2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0, margin: '0px 0px 120px 0px' }}
                  transition={{ duration: 0.3, delay: 1.5, type: 'spring', stiffness: 200 }}
                />
                
                {/* CulturePulse endpoint dot - violet */}
                <motion.circle
                  cx="140"
                  cy="220"
                  r="4"
                  fill="#6366f1"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0, margin: '0px 0px 120px 0px' }}
                  transition={{ duration: 0.3, delay: 1.5, type: 'spring', stiffness: 300 }}
                />
              </svg>
            </div>

            {/* Connecting Node - Bridge between Surface Tension and Products */}
            <div className="hidden lg:flex absolute left-[56%] top-1/2 -translate-y-1/2 -translate-x-1/2 items-center z-10 pointer-events-none">
            </div>

            {/* Right: Products Stack */}
            <div className="flex flex-col gap-12 md:gap-16 lg:gap-20 pl-0 lg:pl-8 xl:pl-12">
              {/* SOEN — static card, no media or interaction */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative cursor-default"
              >
                <motion.div 
                  className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#06b6d4] opacity-60"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 1.5 }}
                />
                
                <div className="pl-6">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-display text-3xl md:text-4xl text-[#F2F2F0] uppercase tracking-tight">
                      SOEN
                    </h4>
                    <StatusBadge status="COMING SOON" />
                  </div>
                  
                  <p className="font-mono text-lg text-[#06b6d4] tracking-wide mb-2">
                    AI for Humans
                  </p>
                  
                  <p className="font-mono text-sm text-[#6b7280] tracking-wider">
                    Coming 2026
                  </p>
                </div>
              </motion.div>

              {/* CulturePulse — static card, no media or interaction */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative cursor-default"
              >
                <motion.div 
                  className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#6366f1] opacity-60"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 1.8 }}
                />
                
                <div className="pl-6">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-display text-3xl md:text-4xl text-[#F2F2F0] uppercase tracking-tight">
                      CULTUREPULSE
                    </h4>
                    <StatusBadge status="ENTERPRISE" />
                  </div>
                  
                  <p className="font-mono text-base text-[#6366f1] tracking-wide mb-2">
                    Enterprise Intelligence Platform
                  </p>
                  
                  <p className="font-mono text-sm text-[#6b7280] tracking-wider">
                    Creative Solutions for Business
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
