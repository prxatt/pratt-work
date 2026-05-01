'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site.config';
import { useCursor } from '@/context/CursorContext';
import { MenuOverlay } from './MenuOverlay';
import { SearchOverlay } from './SearchOverlay';

const SFClock = () => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Los_Angeles',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setTime(new Intl.DateTimeFormat('en-US', options).format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-mono text-[11px] tracking-[0.15em] text-tertiary">
      SAN FRANCISCO — {time}
    </span>
  );
};

const AvailabilityBadge = () => {
  const { availability } = siteConfig;
  const statusText = {
    open: 'OPEN FOR PROJECTS — LET\'S TALK',
    selective: 'DEEP IN WORK — INQUIRE ANYWAY',
    committed: 'BUILDING SOMETHING BIG — LET\'S PLAN AHEAD',
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-sm">
      <div 
        className="w-1.5 h-1.5 rounded-full animate-pulse-glow"
        style={{ 
          backgroundColor: '#22C55E',
        }}
      />
      <span className="text-[10px] font-mono tracking-[0.15em] text-primary uppercase">
        {statusText[availability]}
      </span>
    </div>
  );
};

// Premium Glitch Text Component - WORK -> PLAY with Steve Jobs level polish
const GlitchText = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState('WORK');
  const [glitchPhase, setGlitchPhase] = useState(0);
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
  
  useEffect(() => {
    if (!isHovered) {
      // Smooth return to WORK
      let step = 0;
      const returnInterval = setInterval(() => {
        if (step >= 4) {
          setDisplayText('WORK');
          clearInterval(returnInterval);
          return;
        }
        // Scramble back to WORK
        const mixed = 'WORK'.split('').map((char, i) => {
          if (Math.random() < step / 4) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        setDisplayText(mixed);
        setGlitchPhase(step);
        step++;
      }, 40);
      return () => clearInterval(returnInterval);
    }
    
    // Text decode animation: WORK -> PLAY
    const targetText = 'PLAY';
    let step = 0;
    const totalSteps = 12;
    
    const decodeInterval = setInterval(() => {
      if (step >= totalSteps) {
        setDisplayText(targetText);
        setGlitchPhase(0);
        clearInterval(decodeInterval);
        return;
      }
      
      // Progressive decode with more randomness early
      const progress = step / totalSteps;
      const mixed = targetText.split('').map((char, i) => {
        // Higher chance of correct char as we progress
        const threshold = progress + (Math.random() * 0.2);
        if (Math.random() < threshold) return char;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      
      setDisplayText(mixed);
      setGlitchPhase(step);
      step++;
    }, 45);
    
    return () => clearInterval(decodeInterval);
  }, [isHovered]);
  
  // Calculate dynamic offsets based on glitch phase
  const getRGBOffset = (channel: 'r' | 'g' | 'b') => {
    if (!isHovered) return { x: 0, y: 0 };
    const intensity = 1 - (glitchPhase / 12); // Stronger early in animation
    const base = 3 * intensity;
    return {
      r: { x: -base, y: base * 0.3 },
      g: { x: 0, y: -base * 0.2 },
      b: { x: base, y: base * 0.4 },
    }[channel];
  };
  
  return (
    <motion.span
      className="relative inline-flex text-[0.85em] translate-y-[0.18em] cursor-pointer ml-[0.05em]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* RGB Chromatic Aberration - Red Channel */}
      <motion.span
        className="absolute inset-0 text-red-500 font-bold pointer-events-none select-none"
        style={{ 
          mixBlendMode: 'screen',
          textShadow: '0 0 12px rgba(239,68,68,0.9), 0 0 24px rgba(239,68,68,0.5)',
        }}
        animate={{
          x: isHovered ? [0, getRGBOffset('r').x, 0] : 0,
          y: isHovered ? [0, getRGBOffset('r').y, 0] : 0,
          opacity: isHovered ? [0, 0.7, 0.5, 0.8, 0.6] : 0,
        }}
        transition={{ 
          duration: 0.15, 
          repeat: isHovered ? Infinity : 0,
          repeatDelay: 0.1,
        }}
      >
        {displayText}
      </motion.span>
      
      {/* RGB Chromatic Aberration - Green Channel */}
      <motion.span
        className="absolute inset-0 text-green-400 font-bold pointer-events-none select-none"
        style={{ 
          mixBlendMode: 'screen',
          textShadow: '0 0 12px rgba(74,222,128,0.9), 0 0 24px rgba(74,222,128,0.5)',
        }}
        animate={{
          x: isHovered ? [0, getRGBOffset('g').x, 0] : 0,
          y: isHovered ? [0, getRGBOffset('g').y, 0] : 0,
          opacity: isHovered ? [0, 0.6, 0.8, 0.4, 0.7] : 0,
        }}
        transition={{ 
          duration: 0.12, 
          repeat: isHovered ? Infinity : 0,
          repeatDelay: 0.08,
          delay: 0.02,
        }}
      >
        {displayText}
      </motion.span>
      
      {/* RGB Chromatic Aberration - Blue Channel */}
      <motion.span
        className="absolute inset-0 text-blue-500 font-bold pointer-events-none select-none"
        style={{ 
          mixBlendMode: 'screen',
          textShadow: '0 0 12px rgba(59,130,246,0.9), 0 0 24px rgba(59,130,246,0.5)',
        }}
        animate={{
          x: isHovered ? [0, getRGBOffset('b').x, 0] : 0,
          y: isHovered ? [0, getRGBOffset('b').y, 0] : 0,
          opacity: isHovered ? [0, 0.5, 0.7, 0.9, 0.5] : 0,
        }}
        transition={{ 
          duration: 0.18, 
          repeat: isHovered ? Infinity : 0,
          repeatDelay: 0.12,
          delay: 0.04,
        }}
      >
        {displayText}
      </motion.span>
      
      {/* Glitch Slices - Top Half */}
      <motion.span
        className="absolute inset-0 text-white font-bold overflow-hidden pointer-events-none select-none"
        style={{ clipPath: 'inset(0 0 50% 0)' }}
        animate={{
          x: isHovered ? [-2, 2, -1, 3, 0] : 0,
          skewX: isHovered ? [0, 3, -2, 0] : 0,
        }}
        transition={{ 
          duration: 0.1, 
          repeat: isHovered ? Infinity : 0,
          repeatDelay: 0.05,
        }}
      >
        {displayText}
      </motion.span>
      
      {/* Glitch Slices - Bottom Half */}
      <motion.span
        className="absolute inset-0 text-white font-bold overflow-hidden pointer-events-none select-none"
        style={{ clipPath: 'inset(50% 0 0 0)' }}
        animate={{
          x: isHovered ? [1, -3, 2, -1, 0] : 0,
          skewX: isHovered ? [0, -4, 3, 0] : 0,
        }}
        transition={{ 
          duration: 0.12, 
          repeat: isHovered ? Infinity : 0,
          repeatDelay: 0.08,
          delay: 0.03,
        }}
      >
        {displayText}
      </motion.span>
      
      {/* Main Text with Glow */}
      <motion.span
        className="relative font-bold z-10"
        animate={{
          scale: isHovered ? [1, 1.02, 1.01, 1] : 1,
          textShadow: isHovered 
            ? [
                '0 0 0px rgba(255,255,255,0)',
                '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)',
                '0 0 30px rgba(255,255,255,0.9), 0 0 60px rgba(255,255,255,0.5)',
                '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)',
              ]
            : '0 0 0px rgba(255,255,255,0)',
        }}
        transition={{ 
          duration: 0.3,
          ease: 'easeInOut',
        }}
      >
        {displayText}
      </motion.span>
      
      {/* Cyan Underline Glow */}
      <motion.span
        className="absolute -bottom-[2px] left-0 h-[2px] bg-cyan-400 rounded-full"
        initial={{ width: 0, opacity: 0, boxShadow: '0 0 0px rgba(34,211,238,0)' }}
        animate={{ 
          width: isHovered ? '100%' : '0%',
          opacity: isHovered ? 1 : 0,
          boxShadow: isHovered 
            ? '0 0 10px rgba(34,211,238,0.8), 0 0 20px rgba(34,211,238,0.4)'
            : '0 0 0px rgba(34,211,238,0)',
        }}
        transition={{ 
          duration: 0.4, 
          ease: [0.25, 0.1, 0.25, 1],
        }}
      />
    </motion.span>
  );
};

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { setCursorState } = useCursor();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  // Physical scroll coupling refs
  const navRef = useRef<HTMLElement>(null);
  const scrollOffset = useRef(0);
  const lastScrollY = useRef(0);
  const navHeight = useRef(64);
  const hasHomeInitialReveal = useRef(false);
  
  // Physical scroll handler - direct coupling to scroll delta
  useEffect(() => {
    const syncNavHeight = () => {
      if (!navRef.current) return;
      navHeight.current = navRef.current.getBoundingClientRect().height;
    };

    syncNavHeight();
    lastScrollY.current = window.scrollY;

    if (navRef.current) {
      if (isHomePage) {
        hasHomeInitialReveal.current = false;
        scrollOffset.current = navHeight.current;
        navRef.current.style.transform = `translateY(-${navHeight.current}px)`;
      } else {
        hasHomeInitialReveal.current = true;
        scrollOffset.current = 0;
        navRef.current.style.transform = 'translateY(0px)';
      }
    }
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;

      // Homepage: keep header hidden on initial load, reveal after first scroll-down.
      if (isHomePage && !hasHomeInitialReveal.current && currentScrollY < 24) {
        scrollOffset.current = navHeight.current;
        if (navRef.current) {
          navRef.current.style.transform = `translateY(-${navHeight.current}px)`;
        }
        return;
      }

      // Homepage: once user scrolls past threshold, reveal immediately.
      if (isHomePage && !hasHomeInitialReveal.current && currentScrollY >= 24) {
        hasHomeInitialReveal.current = true;
        scrollOffset.current = 0;
        if (navRef.current) {
          navRef.current.style.transform = 'translateY(0px)';
        }
        return;
      }
      
      // At top of page: always fully visible
      if (currentScrollY <= 0) {
        scrollOffset.current = 0;
        if (navRef.current) {
          navRef.current.style.transform = 'translateY(0px)';
        }
        return;
      }
      
      // Physical coupling: scrolling down hides (1:1 ratio)
      // Scrolling up reveals (2.5x faster - eager to show)
      if (delta > 0) {
        // Scrolling DOWN: increase offset toward navHeight
        scrollOffset.current = Math.min(
          scrollOffset.current + delta,
          navHeight.current
        );
      } else {
        // Scrolling UP: decrease offset toward 0, 2.5x speed
        scrollOffset.current = Math.max(
          scrollOffset.current + delta * 2.5,
          0
        );
      }
      
      // Apply directly to DOM - no React state, no re-renders
      if (navRef.current) {
        navRef.current.style.transform = `translateY(-${scrollOffset.current}px)`;
      }
    };

    const handleResize = () => {
      syncNavHeight();

      if (!navRef.current) return;

      if (isHomePage && !hasHomeInitialReveal.current && window.scrollY < 24) {
        scrollOffset.current = navHeight.current;
        navRef.current.style.transform = `translateY(-${navHeight.current}px)`;
        return;
      }

      scrollOffset.current = Math.min(scrollOffset.current, navHeight.current);
      navRef.current.style.transform = `translateY(-${scrollOffset.current}px)`;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isHomePage]);
  
  // Scroll-based backdrop
  useEffect(() => {
    const handleBackdrop = () => {
      if (!navRef.current) return;
      if (window.scrollY > 80) {
        navRef.current.style.backgroundColor = 'rgba(13, 13, 13, 0.92)';
        navRef.current.style.backdropFilter = 'blur(12px)';
        (navRef.current.style as CSSStyleDeclaration & { webkitBackdropFilter: string }).webkitBackdropFilter = 'blur(12px)';
      } else {
        navRef.current.style.backgroundColor = 'transparent';
        navRef.current.style.backdropFilter = 'none';
        (navRef.current.style as CSSStyleDeclaration & { webkitBackdropFilter: string }).webkitBackdropFilter = 'none';
      }
    };
    handleBackdrop();
    window.addEventListener('scroll', handleBackdrop, { passive: true });
    return () => window.removeEventListener('scroll', handleBackdrop);
  }, []);

  return (
    <>
      <nav 
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-[110] ${isHomePage ? '-translate-y-full' : ''}`}
        style={{ 
          willChange: 'transform',
        }}
      >
        <div className="px-4 sm:px-6 md:px-12 lg:px-20 pt-[max(1rem,env(safe-area-inset-top))] pb-4 sm:pb-6 flex items-center justify-between gap-3">
          {/* Left: PRATT/WORK with premium glitch effect */}
          <div className="flex flex-col gap-1">
            <Link 
              href="/" 
              className="font-display text-lg tracking-tight text-primary hover:text-secondary transition-colors"
              onMouseEnter={() => setCursorState('hover')}
              onMouseLeave={() => setCursorState('default')}
            >
              <span className="inline-flex items-baseline">
                <span className="relative">
                  PRATT/
                  <GlitchText />
                </span>
              </span>
            </Link>
          </div>

          {/* Right: Search + MENU Buttons */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="group flex items-center justify-center min-h-[44px] min-w-[44px] -mr-1 sm:min-h-0 sm:min-w-0 sm:mr-0"
              aria-label="Open search"
              onMouseEnter={() => setCursorState('hover')}
              onMouseLeave={() => setCursorState('default')}
            >
              <Search className="w-[18px] h-[18px] sm:w-4 sm:h-4 text-primary" strokeWidth={1.75} />
            </button>

            {/* Menu Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="group flex items-center gap-2.5 sm:gap-3 min-h-[44px] pl-1"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              onMouseEnter={() => setCursorState('hover')}
              onMouseLeave={() => setCursorState('default')}
            >
              <span className="font-mono text-[11px] sm:text-xs tracking-[0.15em] text-primary uppercase leading-none">MENU</span>
              <div className="flex flex-col gap-1.5 items-end justify-center w-6 shrink-0">
                <motion.span 
                  className="h-[1px] bg-primary w-full origin-center"
                  animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 5 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span 
                  className="h-[1px] bg-primary w-4"
                  animate={{ opacity: isMenuOpen ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span 
                  className="h-[1px] bg-primary w-full origin-center"
                  animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -5 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Menu Overlay */}
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
