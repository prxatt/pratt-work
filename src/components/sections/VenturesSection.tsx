'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';
import { X, Lock } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/media';

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

// Teaser Image Hover Component
const TeaserImageHover = ({ 
  isVisible, 
  imageSrc, 
  fallbackSrc,
  alt,
  position = 'right',
  vertical = 'center',
  offset = 0
}: { 
  isVisible: boolean; 
  imageSrc: string; 
  fallbackSrc?: string;
  alt: string;
  position?: 'left' | 'right';
  vertical?: 'top' | 'center' | 'bottom';
  offset?: number;
}) => {
  const [src, setSrc] = useState(imageSrc);
  useEffect(() => {
    setSrc(imageSrc);
  }, [imageSrc]);

  const getVerticalClass = () => {
    switch (vertical) {
      case 'top': return 'top-0';
      case 'bottom': return 'bottom-0';
      default: return 'top-1/2 -translate-y-1/2';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: position === 'right' ? -20 : 20, y: offset }}
          animate={{ opacity: 1, scale: 1, x: 0, y: offset }}
          exit={{ opacity: 0, scale: 0.9, x: position === 'right' ? -20 : 20, y: offset }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute ${position === 'right' ? 'left-full ml-8' : 'right-full mr-8'} ${getVerticalClass()} z-50 pointer-events-none`}
        >
          <div className="relative w-[320px] h-auto rounded-lg overflow-hidden shadow-2xl border border-white/10">
            <Image
              src={src}
              alt={alt}
              width={320}
              height={200}
              className="object-contain w-full h-auto"
              sizes="320px"
              onError={() => {
                if (fallbackSrc && src !== fallbackSrc) setSrc(fallbackSrc);
              }}
            />
            {/* Gradient overlay for elegance */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            {/* Corner accent */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-white/40" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-white/40" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Teaser Image Modal for Mobile/Tap
const TeaserImageModal = ({
  isOpen,
  onClose,
  imageSrc,
  fallbackSrc,
  alt,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  fallbackSrc?: string;
  alt: string;
}) => {
  const [displaySrc, setDisplaySrc] = useState(imageSrc);

  useEffect(() => {
    if (isOpen) setDisplaySrc(imageSrc);
  }, [isOpen, imageSrc]);

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] bg-[#0a0a0a] overflow-hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full h-full flex items-center justify-center p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="fixed top-6 right-6 z-20 w-12 h-12 border border-[#2a2a3a] flex items-center justify-center hover:border-white/30 hover:bg-white/5 transition-all duration-300 group"
        >
          <X className="w-5 h-5 text-[#6b7280] group-hover:text-white transition-colors" />
        </button>

        {/* Image with fallback support */}
        <div className="relative max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center">
          <Image
            src={displaySrc}
            alt={alt}
            fill
            className="object-contain"
            sizes="(max-width: 1200px) 90vw, 1000px"
            priority
            onError={() => {
              if (fallbackSrc && displaySrc !== fallbackSrc) setDisplaySrc(fallbackSrc);
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Ventures Section (Step 2 Optimized)
export const VenturesSection = () => {
  const { setCursorState, setPreviewData } = useCursor();
  const [showModal, setShowModal] = useState(false);
  const [soenHovered, setSoenHovered] = useState(false);
  const [culturePulseHovered, setCulturePulseHovered] = useState(false);
  const [soenModalOpen, setSoenModalOpen] = useState(false);
  const [culturePulseModalOpen, setCulturePulseModalOpen] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  // SOEN hover handlers - simplified for performance
  const handleSOENHover = useCallback(() => {
    setSoenHovered(true);
  }, []);

  const handleSOENLeave = useCallback(() => {
    setSoenHovered(false);
  }, []);

  // CulturePulse hover handlers - simplified for performance
  const handleCulturePulseHover = useCallback(() => {
    setCulturePulseHovered(true);
  }, []);

  const handleCulturePulseLeave = useCallback(() => {
    setCulturePulseHovered(false);
  }, []);

  return (
    <>
      <section id="ventures" className="relative py-16 md:py-20 bg-[#0a0a0a] min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="px-6 md:px-12 lg:px-20 w-full">
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
            <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 lg:gap-0 items-center min-h-[60vh]">
              
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
              <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <svg width="180" height="320" viewBox="0 0 180 320" fill="none" className="overflow-visible">
                  {/* Glow filter for lines */}
                  <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    
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
                    filter="url(#glow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                  
                  {/* Line 2: Surface Tension → CulturePulse (Independent L-Shape) */}
                  <motion.path
                    d="M0 160 H60 V220 H140"
                    stroke="url(#gradientCulture)"
                    strokeWidth="2"
                    filter="url(#glow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
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
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.3, delay: 1.3, type: 'spring', stiffness: 200 }}
                  />
                  
                  {/* SOEN endpoint dot - cyan with pulse */}
                  <motion.circle
                    cx="140"
                    cy="100"
                    r="4"
                    fill="#06b6d4"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.3, delay: 1.3, type: 'spring', stiffness: 300 }}
                  >
                    <animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
                  </motion.circle>
                  
                  {/* CulturePulse endpoint glow */}
                  <motion.circle
                    cx="140"
                    cy="220"
                    r="6"
                    fill="#6366f1"
                    opacity="0.2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.3, delay: 1.5, type: 'spring', stiffness: 200 }}
                  />
                  
                  {/* CulturePulse endpoint dot - violet with pulse */}
                  <motion.circle
                    cx="140"
                    cy="220"
                    r="4"
                    fill="#6366f1"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.3, delay: 1.5, type: 'spring', stiffness: 300 }}
                  >
                    <animate attributeName="r" values="4;5;4" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
                    <animate attributeName="opacity" values="1;0.7;1" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
                  </motion.circle>
                </svg>
              </div>

              {/* Connecting Node - Bridge between Surface Tension and Products */}
              <div className="hidden lg:flex absolute left-[55%] top-1/2 -translate-y-1/2 -translate-x-1/2 items-center z-10 pointer-events-none">
              </div>

              {/* Right: Products Stack */}
              <div className="flex flex-col gap-24 pl-0 lg:pl-12">
                {/* SOEN - Enhanced entrance with glow */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  onMouseEnter={!isTouch ? handleSOENHover : undefined}
                  onMouseLeave={!isTouch ? handleSOENLeave : undefined}
                  onClick={() => setSoenModalOpen(true)}
                  className="group relative cursor-pointer"
                >
                  {/* Teaser Image on Hover - Desktop only */}
                  <TeaserImageHover 
                    isVisible={soenHovered} 
                    imageSrc={getImageUrl('/ventures/soen-teaser.webp', 600)} 
                    fallbackSrc={getImageUrl('/ventures/soen-teaser.jpg', 600)}
                    alt="SOEN - AI for Humans"
                    position="left"
                    vertical="top"
                    offset={-150}
                  />
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#06b6d4]/0 via-[#06b6d4]/5 to-[#06b6d4]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                  
                  {/* Left border accent - cyan with glow */}
                  <motion.div 
                    className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#06b6d4] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 1.5 }}
                  />
                  
                  <div className="pl-6">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-display text-3xl md:text-4xl text-[#F2F2F0] uppercase tracking-tight group-hover:translate-x-1 transition-transform duration-300">
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

                {/* CulturePulse AI - Enhanced entrance with glow */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  onMouseEnter={!isTouch ? handleCulturePulseHover : undefined}
                  onMouseLeave={!isTouch ? handleCulturePulseLeave : undefined}
                  onClick={() => setCulturePulseModalOpen(true)}
                  className="group relative cursor-pointer"
                >
                  {/* Teaser Image on Hover - Desktop only */}
                  <TeaserImageHover 
                    isVisible={culturePulseHovered} 
                    imageSrc={getImageUrl('/ventures/culturepulse-teaser.webp', 600)} 
                    fallbackSrc={getImageUrl('/ventures/culturepulse-teaser.jpg', 600)}
                    alt="CulturePulse - Enterprise Intelligence Platform"
                    position="left"
                    vertical="bottom"
                    offset={150}
                  />
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/0 via-[#6366f1]/5 to-[#6366f1]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                  
                  {/* Left border accent - violet with glow */}
                  <motion.div 
                    className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#6366f1] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 1.8 }}
                  />
                  
                  <div className="pl-6">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-display text-3xl md:text-4xl text-[#F2F2F0] uppercase tracking-tight group-hover:translate-x-1 transition-transform duration-300">
                        CULTUREPULSE
                      </h4>
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#6366f1]" />
                        <StatusBadge status="ENTERPRISE" />
                      </div>
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


      {/* SOEN Image Modal */}
      <AnimatePresence>
        {soenModalOpen && (
          <TeaserImageModal
            isOpen={soenModalOpen}
            onClose={() => setSoenModalOpen(false)}
            imageSrc={getImageUrl('/ventures/soen-teaser.webp', 800)}
            fallbackSrc={getImageUrl('/ventures/soen-teaser.jpg', 800)}
            alt="SOEN - AI for Humans"
          />
        )}
      </AnimatePresence>

      {/* CulturePulse Image Modal */}
      <AnimatePresence>
        {culturePulseModalOpen && (
          <TeaserImageModal
            isOpen={culturePulseModalOpen}
            onClose={() => setCulturePulseModalOpen(false)}
            imageSrc={getImageUrl('/ventures/culturepulse-teaser.webp', 800)}
            fallbackSrc={getImageUrl('/ventures/culturepulse-teaser.jpg', 800)}
            alt="CulturePulse - Enterprise Intelligence Platform"
          />
        )}
      </AnimatePresence>
    </>
  );
};
