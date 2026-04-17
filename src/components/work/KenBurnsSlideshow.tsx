'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

interface Slide {
  src: string;
  fallbackSrc: string;
  alt: string;
}

interface KenBurnsSlideshowProps {
  slides: Slide[];
  interval?: number;
}

export function KenBurnsSlideshow({ slides, interval = 3000 }: KenBurnsSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationKeys, setAnimationKeys] = useState<number[]>(() => 
    slides.map(() => Date.now())
  );
  const transitionDuration = 800; // ms

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = (prev + 1) % slides.length;
      // Reset animation key for the incoming slide to restart Ken Burns from scale 1
      setAnimationKeys((keys) => {
        const newKeys = [...keys];
        newKeys[next] = Date.now();
        return newKeys;
      });
      return next;
    });
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [nextSlide, interval]);

  // Pre-calculate indices for smooth transitions
  const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
  
  return (
    <div className="relative w-full aspect-[21/9] overflow-hidden bg-[#0a0a0f] border border-[#1A1A2E]">
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-12 h-[2px] z-20 bg-[#00D4AA]" />
      <div className="absolute top-0 left-0 w-[2px] h-12 z-20 bg-[#00D4AA]" />
      <div className="absolute top-0 right-0 w-12 h-[2px] z-20 bg-[#00D4AA]" />
      <div className="absolute top-0 right-0 w-[2px] h-12 z-20 bg-[#00D4AA]" />
      <div className="absolute bottom-0 left-0 w-12 h-[2px] z-20 bg-[#00D4AA]" />
      <div className="absolute bottom-0 left-0 w-[2px] h-12 z-20 bg-[#00D4AA]" />
      <div className="absolute bottom-0 right-0 w-12 h-[2px] z-20 bg-[#00D4AA]" />
      <div className="absolute bottom-0 right-0 w-[2px] h-12 z-20 bg-[#00D4AA]" />

      {/* Slides - Overlapping with smooth crossfade */}
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        const isPrev = index === prevIndex;
        const shouldRender = isActive || isPrev;
        
        if (!shouldRender) return null;
        
        return (
          <div
            key={`${slide.src}-${animationKeys[index]}`}
            className={`absolute inset-0 transition-opacity duration-[${transitionDuration}ms] ease-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <picture>
              <source srcSet={slide.src} type="image/webp" />
              <Image
                src={slide.fallbackSrc}
                alt={slide.alt}
                fill
                className="object-cover animate-ken-burns"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                priority={index === 0}
              />
            </picture>
          </div>
        );
      })}

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.2em] text-[#00D4AA] uppercase">
            {String(currentIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-[2px] transition-all duration-500 ease-out ${
                index === currentIndex ? 'w-8 bg-[#00D4AA]' : 'w-4 bg-[#1A1A2E]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
