'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const logos = [
  { name: 'Salesforce', color: '#00A1E0' },
  { name: 'Amazon', color: '#FF9900' },
  { name: 'Boubyan Bank', color: '#0066B3' },
  { name: 'Stability AI', color: '#6366f1' },
  { name: 'Weights & Biases', color: '#FFCC33' },
  { name: "Levi's", color: '#C41230' },
  { name: 'Microsoft', color: '#00A4EF' },
  { name: 'PwC', color: '#FF6B35' },
  { name: 'HBO', color: '#FF0000' },
];

// Smooth marquee animation using CSS keyframes approach
const LogoItem = ({ 
  logo, 
  index,
  hoveredLogo,
  onHover,
}: { 
  logo: typeof logos[0]; 
  index: number;
  hoveredLogo: string | null;
  onHover: (name: string | null) => void;
}) => {
  const isHovered = hoveredLogo === logo.name;
  const hasAnyHover = hoveredLogo !== null;

  return (
    <div
      className="relative mx-8 md:mx-16 flex shrink-0 items-center justify-center group"
      onMouseEnter={() => onHover(logo.name)}
      onMouseLeave={() => onHover(null)}
      data-cursor="none"
    >
      {/* Glow background on hover */}
      <div 
        className="absolute inset-0 -mx-4 transition-all duration-500 ease-out rounded-full opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse 80% 100% at 50% 50%, ${logo.color}15 0%, transparent 70%)`,
        }}
      />
      
      <span
        className="relative font-display text-3xl md:text-5xl tracking-tighter uppercase select-none transition-all duration-500 ease-out"
        style={{
          color: isHovered ? logo.color : hasAnyHover ? '#6A6A65' : '#8A8A85',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          textShadow: isHovered 
            ? `0 0 30px ${logo.color}40, 0 0 60px ${logo.color}20`
            : 'none',
          willChange: 'transform, color',
        }}
      >
        {logo.name}
      </span>
    </div>
  );
};

export const LogoMarquee = () => {
  const [hoveredLogo, setHoveredLogo] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  /** Desktop fine pointer: gate animation on visibility. Touch / coarse uses CSS in globals. */
  const [desktopFinePointer, setDesktopFinePointer] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px) and (pointer: fine)');
    const sync = () => setDesktopFinePointer(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrefersReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!desktopFinePointer) return;
    const root = sectionRef.current;
    if (!root) return;

    // Observe the section (not the ultra-wide track): a long row often never reaches
    // threshold 0.1 intersection *ratio*, so the marquee never started on mobile.
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: '80px 0px' }
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [desktopFinePointer]);

  // Triple the logos for seamless infinite scroll
  const allLogos = [...logos, ...logos, ...logos];

  return (
    <section
      ref={sectionRef}
      className="trusted-by-marquee py-20 overflow-hidden bg-[#0a0a0a]"
      style={{ contain: 'layout paint' }}
    >
      <div className="flex flex-col gap-8">
        {/* Section header */}
        <motion.span 
          className="px-6 font-mono text-[10px] tracking-[0.3em] text-[#4A4A45] uppercase"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Trusted By Industry Leaders
        </motion.span>
        
        {/* Marquee container */}
        <div className="relative flex overflow-x-hidden">
          {/* Gradient masks on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
          
          {/* Scrolling track - CSS animation for smooth performance */}
          <div 
            ref={trackRef}
            className="trusted-by-marquee-track flex w-max py-8 items-center"
            style={
              desktopFinePointer
                ? {
                    animation: isVisible ? 'marquee 50s linear infinite' : 'none',
                    WebkitAnimation: isVisible ? 'marquee 50s linear infinite' : 'none',
                    willChange: 'transform',
                  }
                : {
                    animation: `marquee ${prefersReducedMotion ? 80 : 42}s linear infinite`,
                    WebkitAnimation: `marquee ${prefersReducedMotion ? 80 : 42}s linear infinite`,
                    willChange: 'transform',
                  }
            }
          >
            {allLogos.map((logo, index) => (
              <LogoItem
                key={`${logo.name}-${index}`}
                logo={logo}
                index={index}
                hoveredLogo={hoveredLogo}
                onHover={setHoveredLogo}
              />
            ))}
          </div>
        </div>

        {/* Minimal divider */}
        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-[#1a1a1a] to-transparent" />
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </section>
  );
};
