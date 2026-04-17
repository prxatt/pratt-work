'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';

interface DeviceCapabilities {
  isTouch: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isLowEnd: boolean;
  isSafari: boolean;
  isIOS: boolean;
  prefersReducedMotion: boolean;
  supportsWebP: boolean;
}

const useDeviceCapabilities = (): DeviceCapabilities => {
  const [caps, setCaps] = useState<DeviceCapabilities>({
    isTouch: false,
    isMobile: false,
    isTablet: false,
    isLowEnd: false,
    isSafari: false,
    isIOS: false,
    prefersReducedMotion: false,
    supportsWebP: true,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /iPad|Android(?!.*Mobile)|Tablet/i.test(ua);
    const lowMemory = (navigator as any).deviceMemory !== undefined && (navigator as any).deviceMemory < 4;
    const isLowEnd = lowMemory || (!isMobile && /Macintosh.*Intel/.test(ua) && !isIOS);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const checkWebP = () => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    setCaps({
      isTouch,
      isMobile,
      isTablet,
      isLowEnd,
      isSafari,
      isIOS,
      prefersReducedMotion,
      supportsWebP: checkWebP(),
    });
  }, []);

  return caps;
};

const FluidCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 });
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number; life: number;
    color: { r: number; g: number; b: number }; size: number;
  }>>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const isInViewRef = useRef(true);
  const isTabVisibleRef = useRef(true);
  const lastSpawnRef = useRef(0);
  const lastFrameRef = useRef(0);
  
  const caps = useDeviceCapabilities();

  const colors = [
    { r: 99, g: 102, b: 241 }, { r: 168, g: 85, b: 247 },
    { r: 236, g: 72, b: 153 }, { r: 245, g: 158, b: 11 },
    { r: 16, g: 185, b: 129 }, { r: 6, g: 182, b: 212 },
  ];

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!e.isPrimary) return;
    
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    const dx = clientX - mouseRef.current.x;
    const dy = clientY - mouseRef.current.y;
    const speed = Math.sqrt(dx * dx + dy * dy);

    mouseRef.current.prevX = mouseRef.current.x;
    mouseRef.current.prevY = mouseRef.current.y;
    mouseRef.current.x = clientX;
    mouseRef.current.y = clientY;

    if (speed > 1) {
      const now = performance.now();
      // Faster throttle for more responsive trails
      const throttleMs = caps.isLowEnd ? 16 : 8;
      if (now - lastSpawnRef.current < throttleMs) return;
      lastSpawnRef.current = now;

      // More particles for denser trails following cursor
      const maxParticles = caps.isMobile ? 5 : caps.isLowEnd ? 6 : 8;
      const numParticles = Math.min(Math.max(2, Math.floor(speed / 3)), maxParticles);
      
      for (let i = 0; i < numParticles; i++) {
        const t = i / numParticles;
        // Interpolate along the movement path for smooth trail
        const px = mouseRef.current.prevX + (clientX - mouseRef.current.prevX) * t;
        const py = mouseRef.current.prevY + (clientY - mouseRef.current.prevY) * t;

        particlesRef.current.push({
          x: px + (Math.random() - 0.5) * 20,
          y: py + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          // Shorter life for meditative dissolve - particles fade faster
          life: 60 + Math.random() * 50,
          color: colors[Math.floor(Math.random() * colors.length)],
          // Larger particles for denser, more visible trails
          size: caps.isMobile ? 25 + Math.random() * 35 : caps.isLowEnd ? 30 + Math.random() * 40 : 35 + Math.random() * 55,
        });
      }
    }
  }, [caps.isMobile, caps.isLowEnd]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    mouseRef.current.x = touch.clientX;
    mouseRef.current.y = touch.clientY;
    mouseRef.current.prevX = touch.clientX;
    mouseRef.current.prevY = touch.clientY;
  }, []);

  useEffect(() => {
    if (caps.prefersReducedMotion) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { 
      alpha: true, 
      desynchronized: !caps.isSafari
    });
    if (!ctx) return;

    const resize = () => {
      const dpr = caps.isMobile ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const particleCount = caps.isMobile ? 12 : caps.isLowEnd ? 20 : 35;
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        life: 100 + Math.random() * 200,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: caps.isMobile ? 20 + Math.random() * 30 : caps.isLowEnd ? 25 + Math.random() * 35 : 40 + Math.random() * 60,
      });
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => { isInViewRef.current = entry.isIntersecting; },
      { threshold: 0.01 }
    );
    observer.observe(canvas);

    const handleVisibility = () => {
      isTabVisibleRef.current = !document.hidden;
      if (document.hidden && animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      } else if (!document.hidden && isInViewRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const animate = () => {
      if (!ctx || !canvas) return;

      const now = performance.now();
      // Smoother frame rate - 60fps for desktop, 30fps for mobile
      const frameInterval = caps.isMobile ? 33 : caps.isLowEnd ? 20 : 16;
      if (now - lastFrameRef.current < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameRef.current = now;

      if (!isInViewRef.current || !isTabVisibleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Fade effect - higher alpha for cleaner trails that dissolve meditatively
      ctx.fillStyle = caps.isMobile ? 'rgba(10, 10, 10, 0.06)' : 'rgba(10, 10, 10, 0.02)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        
        // Gentler drift for fluid feel
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Wrap around screen edges
        if (p.x < -150) p.x = window.innerWidth + 150;
        if (p.x > window.innerWidth + 150) p.x = -150;
        if (p.y < -150) p.y = window.innerHeight + 150;
        if (p.y > window.innerHeight + 150) p.y = -150;

        // Faster fade based on life for meditative dissolve effect
        const alpha = Math.min(1, p.life / 20) * (caps.isMobile ? 0.4 : 0.6);
        
        // Create radial gradient for soft glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        return p.life > 0;
      });

      // Ambient particles - fewer since we want cursor trails to stand out
      const maxParticles = caps.isMobile ? 30 : caps.isLowEnd ? 45 : 60;
      const spawnRate = caps.isMobile ? 0.02 : 0.04;
      if (Math.random() < spawnRate && particlesRef.current.length < maxParticles) {
        particlesRef.current.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          // Shorter life for ambient particles too
          life: 50 + Math.random() * 70,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: caps.isMobile ? 15 + Math.random() * 25 : caps.isLowEnd ? 20 + Math.random() * 30 : 25 + Math.random() * 40,
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('visibilitychange', handleVisibility);
      observer.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [caps, handlePointerMove, handleTouchStart]);

  if (caps.prefersReducedMotion) return null;

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-[1] pointer-events-none"
      style={{ 
        background: 'transparent', 
        mixBlendMode: 'screen',
        touchAction: 'pan-y',
      }} 
    />
  );
};

const HeroContent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });
  const caps = useDeviceCapabilities();

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col items-center justify-center z-10 px-4 sm:px-6 relative"
    >
      <motion.div
        initial={caps.prefersReducedMotion ? {} : { opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="flex items-center gap-3 mb-4 sm:mb-6"
      >
        <motion.div 
          className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#22C55E]"
          animate={!caps.prefersReducedMotion ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-[#8A8A85] uppercase">
          Available for Work
        </span>
      </motion.div>

      <div className="flex flex-col items-center text-center">
        <motion.h1
          initial={caps.prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold uppercase"
          style={{
            fontSize: 'clamp(2.5rem, 12vw, 10rem)',
            lineHeight: '0.95',
            letterSpacing: '-0.03em',
            background: 'linear-gradient(180deg, #F2F2F0 0%, #E8E8E6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          PRATT
        </motion.h1>

        <motion.h1
          initial={caps.prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.6, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold uppercase -mt-1 sm:-mt-2"
          style={{
            fontSize: 'clamp(2.5rem, 12vw, 10rem)',
            lineHeight: '0.95',
            letterSpacing: '-0.03em',
            background: 'linear-gradient(180deg, #F2F2F0 0%, #E8E8E6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          MAJMUDAR
        </motion.h1>
      </div>

      <motion.p
        initial={caps.prefersReducedMotion ? {} : { opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1.5, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4 sm:mt-6 text-center font-mono text-xs sm:text-sm md:text-base tracking-[0.15em] sm:tracking-[0.25em] uppercase text-[#8A8A85]"
      >
        Creative Technologist + Producer
      </motion.p>

      {!caps.isMobile && (
        <motion.div
          initial={caps.prefersReducedMotion ? {} : { opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 2, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-16 sm:w-24 h-[1px] bg-[#333] mt-6 sm:mt-8"
        />
      )}
    </div>
  );
};

export const Hero = () => {
  const caps = useDeviceCapabilities();

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden flex flex-col bg-[#0a0a0a]">
      <div className="absolute inset-0 z-0 bg-[#0a0a0a]" />
      <FluidCanvas />

      {!caps.isLowEnd && (
        <div
          className="absolute inset-0 z-[2] animate-grain pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            opacity: 0.025,
          }}
        />
      )}

      <HeroContent />

      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 py-6 sm:py-8 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 z-10 relative">
        <motion.div
          initial={caps.prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.6 }}
        >
          <span
            className="font-mono text-[9px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] text-[#8A8A85] uppercase transition-all duration-300 hover:text-[#F2F2F0] cursor-default block text-center sm:text-left"
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            onMouseEnter={(e) => {
              if (!caps.isTouch) {
                e.currentTarget.style.textShadow = '0 0 20px rgba(242, 242, 242, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textShadow = 'none';
            }}
          >
            BASED IN SAN FRANCISCO
          </span>
        </motion.div>

        <motion.div
          initial={caps.prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.8 }}
        >
          <Link
            href="/work"
            className="flex items-center gap-2 sm:gap-3 text-[#8A8A85] hover:text-[#F2F2F0] transition-all duration-300 hover:opacity-100 opacity-80 group min-h-[44px] min-w-[44px]"
          >
            <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.1em] sm:tracking-[0.15em] uppercase group-hover:tracking-[0.2em] transition-all duration-300">
              Latest Work
            </span>
            <div className="w-8 h-8 rounded-full border border-[#8A8A85] flex items-center justify-center group-hover:border-[#F2F2F0] transition-colors">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
