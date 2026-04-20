'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion, Variants } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic import for GridScan to avoid SSR issues with Three.js
const GridScan = dynamic(() => import('@/components/GridScan').then(mod => mod.GridScan), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0D0D0D]" />
});

// Optimized animation variants with strict typing
const useContactAnimationVariants = (prefersReducedMotion: boolean | null, isMobile: boolean): {
  container: Variants;
  item: Variants;
  blurIn: Variants;
  letterHover: Variants;
  inputFocus: Variants;
  stagger: Variants;
} => {
  return useMemo(() => {
    const duration = prefersReducedMotion ? 0 : undefined;
    const mobileFactor = isMobile ? 0.7 : 1;

    return {
      container: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: duration ?? 0.5,
            staggerChildren: prefersReducedMotion ? 0 : 0.1 * mobileFactor,
            delayChildren: 0.2
          }
        }
      },
      item: {
        hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: duration ?? 0.6 * mobileFactor,
            ease: [0.16, 1, 0.3, 1]
          }
        }
      },
      blurIn: {
        hidden: { 
          opacity: 0, 
          y: prefersReducedMotion ? 0 : 50,
          scale: prefersReducedMotion ? 1 : 0.95
        },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: duration ?? 1,
            ease: [0.16, 1, 0.3, 1]
          }
        }
      },
      letterHover: {
        rest: { 
          y: 0, 
          scale: 1,
          transition: { duration: 0.2, ease: 'easeOut' }
        },
        hover: { 
          y: isMobile ? -8 : -16, 
          scale: isMobile ? 1.05 : 1.15,
          transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }
        }
      },
      inputFocus: {
        rest: { scaleX: 0 },
        focus: {
          scaleX: 1,
          transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
        }
      },
      stagger: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: prefersReducedMotion ? 0 : 0.08 * mobileFactor
          }
        }
      }
    };
  }, [prefersReducedMotion, isMobile]);
};

// Hook to detect mobile devices
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isTouchDevice || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export default function ContactPage() {
  const { setCursorState } = useCursor();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [mobileScanColor, setMobileScanColor] = useState('#6366f1');

  // Get memoized animation variants
  const variants = useContactAnimationVariants(prefersReducedMotion, isMobile);

  useEffect(() => {
    if (!isMobile || prefersReducedMotion) return;
    const palette = ['#6366f1', '#8b5cf6', '#06b6d4'];
    let idx = 0;
    const timer = window.setInterval(() => {
      idx = (idx + 1) % palette.length;
      setMobileScanColor(palette[idx]);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [isMobile, prefersReducedMotion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setIsSubmitting(true);
    const subject = encodeURIComponent(`Message from ${formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    
    // Open email client
    window.location.href = `mailto:theprattern@gmail.com?subject=${subject}&body=${body}`;
    
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 4000);
  };

  const remarkableLetters = useMemo(() => 'REMARKABLE'.split(''), []);

  return (
    <div className="min-h-[100dvh] w-full bg-[#0D0D0D] relative overflow-hidden flex flex-col pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {/* Interactive GridScan Background - Optimized for mobile */}
        <div className="absolute inset-0 z-0">
          <GridScan
            sensitivity={isMobile ? 0.3 : 0.45}
            lineThickness={isMobile ? 0.5 : 0.8}
            linesColor="#1a1a2e"
            gridScale={isMobile ? 0.1 : 0.08}
            scanColor={isMobile ? mobileScanColor : "#6366f1"}
            scanOpacity={isMobile ? 0.34 : 0.25}
            scanGlow={isMobile ? 0.52 : 0.6}
            scanSoftness={2.5}
            scanDuration={isMobile ? 4 : 3}
            scanDelay={2}
            noiseIntensity={isMobile ? 0.006 : 0.008}
            enablePost
            bloomIntensity={isMobile ? 0.17 : 0.15}
            chromaticAberration={isMobile ? 0.00085 : 0.001}
            className="opacity-50 md:opacity-40"
          />
          {/* Gradient overlay for depth */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isMobile
                ? 'radial-gradient(ellipse 86% 84% at 50% 50%, transparent 14%, rgba(13, 13, 13, 0.5) 100%)'
                : 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 20%, rgba(13, 13, 13, 0.7) 100%)'
            }}
          />
        </div>

        {/* Main Content - Centered */}
        <div className="flex-1 flex flex-col justify-center items-center relative z-10 px-4 sm:px-6 md:px-12">
          <motion.div
            variants={variants.container}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center w-full max-w-5xl"
          >
            {/* Eyebrow */}
            <motion.span
              variants={variants.item}
              className="font-mono text-[10px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] text-[#8A8A85] uppercase mb-4 sm:mb-6 md:mb-8"
            >
              Project Inquiries
            </motion.span>

            {/* Main Typography - LET'S CREATE SOMETHING REMARKABLE */}
            <motion.h2 
              variants={variants.stagger}
              className="text-[#F2F2F0] uppercase mb-6 sm:mb-8 md:mb-10"
            >
              <span className="relative inline-block overflow-hidden">
                <motion.span
                  variants={variants.blurIn}
                  className="inline-block text-[clamp(1.5rem,6vw,5rem)] leading-[0.9] font-display"
                >
                  Let&apos;s Create
                </motion.span>
              </span>
              <br />
              <span className="relative inline-block overflow-hidden">
                <motion.span
                  variants={variants.blurIn}
                  className="inline-block text-[clamp(1.75rem,7vw,6rem)] leading-[0.9] font-display mr-1 sm:mr-2 md:mr-3"
                >
                  Something{' '}
                </motion.span>
                <motion.span
                  variants={variants.blurIn}
                  className="inline-block text-[clamp(1.75rem,7vw,6rem)] leading-[0.9] font-display text-[#E8A35C]"
                >
                  {remarkableLetters.map((letter, i) => (
                    <motion.span
                      key={i}
                      initial="rest"
                      whileHover={!prefersReducedMotion && !isMobile ? "hover" : undefined}
                      variants={variants.letterHover}
                      className="inline-block cursor-pointer will-change-transform"
                      style={{ display: 'inline-block' }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </motion.span>
              </span>
            </motion.h2>

            {/* Minimal Form - Single Screen */}
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center py-6 sm:py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-[#6366f1]/50 flex items-center justify-center mb-4 will-change-transform"
                  >
                    <Check className="w-5 h-5 sm:w-6 sm:h-6 text-[#6366f1] shrink-0" />
                  </motion.div>
                  <span className="font-mono text-xs sm:text-sm text-[#8A8A85] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-center">
                    Opening Email Client...
                  </span>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="w-full max-w-2xl px-2 sm:px-4 md:px-0"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6"
                  >
                    {/* Name Input with animated focus line */}
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-transparent border-b border-[#3a3a3a] pb-2.5 sm:pb-3 pt-2 font-mono text-sm text-[#F2F2F0] placeholder:text-[#666] focus:outline-none focus:border-[#6366f1]/50 transition-colors duration-300 min-h-[44px]"
                        required
                        autoComplete="name"
                      />
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] origin-left pointer-events-none"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: formData.name ? 1 : 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    {/* Email Input with animated focus line */}
                    <div className="flex-1 relative">
                      <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-transparent border-b border-[#3a3a3a] pb-2.5 sm:pb-3 pt-2 font-mono text-sm text-[#F2F2F0] placeholder:text-[#666] focus:outline-none focus:border-[#6366f1]/50 transition-colors duration-300 min-h-[44px]"
                        required
                        autoComplete="email"
                      />
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] origin-left pointer-events-none"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: formData.email ? 1 : 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-6 sm:mb-8"
                  >
                    {/* Message Input with animated focus line */}
                    <div className="relative">
                      <textarea
                        placeholder="Share your vision"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-transparent border-b border-[#3a3a3a] pb-2.5 sm:pb-3 pt-2 font-mono text-sm text-[#F2F2F0] placeholder:text-[#666] focus:outline-none focus:border-[#6366f1]/50 transition-colors duration-300 resize-none min-h-[44px] md:min-h-[60px]"
                        required
                        rows={isMobile ? 2 : 3}
                      />
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] origin-left pointer-events-none"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: formData.message ? 1 : 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="flex justify-center"
                  >
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative px-5 sm:px-8 md:px-12 py-3 sm:py-4 border border-[#2a2a2a] rounded-full overflow-hidden disabled:opacity-50 min-h-[48px] touch-manipulation max-w-[min(100%,calc(100vw-2rem))]"
                      onMouseEnter={() => setCursorState('magnetic')}
                      onMouseLeave={() => setCursorState('default')}
                      whileHover={!prefersReducedMotion && !isMobile ? { scale: 1.03 } : undefined}
                      whileTap={{ scale: 0.97 }}
                    >
                      {/* Animated gradient glow */}
                      {!isMobile && (
                        <motion.div 
                          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 blur-sm pointer-events-none"
                          animate={!prefersReducedMotion ? {
                            background: [
                              'linear-gradient(90deg, #10b981, #f59e0b, #06b6d4)',
                              'linear-gradient(180deg, #f59e0b, #06b6d4, #10b981)',
                              'linear-gradient(270deg, #06b6d4, #10b981, #f59e0b)',
                              'linear-gradient(360deg, #10b981, #f59e0b, #06b6d4)',
                            ]
                          } : {}}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        />
                      )}
                      <div className="absolute inset-[1px] rounded-full bg-[#0D0D0D]" />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-amber-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full pointer-events-none"
                      />
                      <span className="relative z-10 font-mono text-[11px] sm:text-xs md:text-sm tracking-[0.12em] sm:tracking-[0.18em] text-[#F2F2F0] uppercase inline-flex flex-nowrap items-center justify-center gap-2 sm:gap-3 whitespace-nowrap">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <span>Connect With Me</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 shrink-0" />
                          </>
                        )}
                      </span>
                    </motion.button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Subtle hint - mobile optimized */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mt-4 sm:mt-6 font-mono text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] text-[#555] uppercase text-center"
            >
              Available for select projects
            </motion.span>
          </motion.div>
        </div>

        {/* Footer - Optimized for all devices */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 px-4 sm:px-6 lg:px-12 py-4 sm:py-6 border-t border-[#1a1a1a]"
        >
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-6">
            <span className="font-mono text-[9px] sm:text-[10px] text-[#555] uppercase tracking-[0.15em] sm:tracking-[0.2em] order-3 sm:order-1">
              © 2026 Pratt Majmudar
            </span>
            
            {/* Social Links with hover animation */}
            <div className="flex items-center gap-4 sm:gap-6 order-1 sm:order-2">
              {[
                { name: 'LinkedIn', url: 'https://linkedin.com/in/prxatt' },
                { name: 'Instagram', url: 'https://instagram.com/pratt.work' },
                { name: 'Email', url: 'mailto:theprattern@gmail.com' },
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative font-mono text-[9px] sm:text-[10px] text-[#8A8A85] uppercase tracking-[0.12em] sm:tracking-[0.15em] hover:text-[#F2F2F0] transition-colors duration-300"
                  onMouseEnter={() => setCursorState('hover')}
                  onMouseLeave={() => setCursorState('default')}
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#8A8A85] group-hover:w-full transition-all duration-300 ease-out" />
                </a>
              ))}
            </div>
            
            {/* Navigation Links */}
            <div className="flex items-center gap-4 sm:gap-6 order-2 sm:order-3">
              {['Work', 'About', 'Ventures'].map((item) => (
                <Link 
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="group relative font-mono text-[9px] sm:text-[10px] text-[#8A8A85] uppercase tracking-[0.12em] sm:tracking-[0.15em] hover:text-[#F2F2F0] transition-colors duration-300"
                  onMouseEnter={() => setCursorState('hover')}
                  onMouseLeave={() => setCursorState('default')}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#8A8A85] group-hover:w-full transition-all duration-300 ease-out" />
                </Link>
              ))}
            </div>
          </div>
        </motion.footer>
      </div>
  );
}
