'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryImage {
  webp: string;
  jpg: string;
  alt: string;
}

interface OptimizedHorizontalGalleryProps {
  phosphor: string;
  images: GalleryImage[];
}

// Steve Jobs Level: Ultra-fast image loading with zero perceived latency
export const OptimizedHorizontalGallery: React.FC<OptimizedHorizontalGalleryProps> = ({ 
  phosphor, 
  images 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const preloadedRef = useRef<Set<number>>(new Set()); // Track preloaded without triggering re-renders
  const imagesRef = useRef(images); // Store images in ref to avoid dependency issues
  const imageCountRef = useRef(images.length);
  
  // Keep refs updated
  imagesRef.current = images;
  imageCountRef.current = images.length;
  
  const imageCount = images.length;

  // Calculate visible items based on viewport
  const calculateVisibleCount = useCallback(() => {
    if (typeof window === 'undefined') return 1;
    const vw = window.innerWidth;
    if (vw >= 1024) return 2;
    if (vw >= 768) return 1.5;
    return 1;
  }, []);

  // Memoize dot count
  const dotCount = useMemo(() => 
    Math.max(1, imageCount - Math.floor(visibleCount) + 1), 
    [imageCount, visibleCount]
  );

  // AGGRESSIVE PRELOADING: Preload current, next, and previous images
  // Uses refs to avoid dependency issues - runs inside observer only
  const preloadImages = useCallback((centerIndex: number) => {
    const count = imageCountRef.current;
    const imgs = imagesRef.current;
    
    const indicesToPreload = [
      centerIndex,
      (centerIndex + 1) % count,
      (centerIndex - 1 + count) % count,
      (centerIndex + 2) % count,
    ];

    indicesToPreload.forEach(index => {
      if (!preloadedRef.current.has(index) && imgs[index]) {
        const img = new window.Image();
        img.src = imgs[index].webp;
        img.fetchPriority = index === centerIndex ? 'high' : 'auto';
        preloadedRef.current.add(index);
      }
    });
  }, []); // No dependencies - uses refs only

  const hasMountedRef = useRef(false);
  const thresholdRef = useRef([0, 0.25, 0.5, 0.75, 1]);

  // Intersection Observer - runs ONCE on mount only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            const count = imageCountRef.current;
            const imgs = imagesRef.current;
            
            // Mark as loaded (functional update to avoid closure staleness)
            setLoadedImages(prev => {
              if (prev.has(index)) return prev;
              const next = new Set(prev);
              next.add(index);
              return next;
            });
            
            // Preload adjacent
            const indicesToPreload = [
              index,
              (index + 1) % count,
              (index - 1 + count) % count,
              (index + 2) % count,
            ];
            indicesToPreload.forEach(i => {
              if (!preloadedRef.current.has(i) && imgs[i]) {
                const img = new window.Image();
                img.src = imgs[i].webp;
                img.fetchPriority = i === index ? 'high' : 'auto';
                preloadedRef.current.add(i);
              }
            });
            
            // Update active index (functional update)
            if (entry.intersectionRatio > 0.5) {
              setActiveIndex(prev => prev === index ? prev : index);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '100px 200px 100px 200px',
        threshold: thresholdRef.current,
      }
    );

    // Observe all image containers
    imageRefs.current.forEach((ref, index) => {
      if (ref && observerRef.current) {
        ref.setAttribute('data-index', String(index));
        observerRef.current.observe(ref);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []); // EMPTY DEPS - runs once on mount only

  // Preload initial batch on mount - runs once
  const hasPreloadedInitial = useRef(false);
  useEffect(() => {
    if (hasPreloadedInitial.current) return;
    hasPreloadedInitial.current = true;
    
    const count = imageCountRef.current;
    const imgs = imagesRef.current;
    
    // Preload first 4 images immediately
    [0, 1, 2, 3].forEach(index => {
      if (index < count && !preloadedRef.current.has(index) && imgs[index]) {
        const img = new window.Image();
        img.src = imgs[index].webp;
        img.fetchPriority = index === 0 ? 'high' : 'auto';
        preloadedRef.current.add(index);
      }
    });
    
    // Mark first 3 as "loading" for UI
    setLoadedImages(prev => {
      if (prev.size > 0) return prev;
      return new Set([0, 1, 2]);
    });
  }, []);

  // Lightweight scroll handler with RAF
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || rafRef.current) return;
    
    rafRef.current = requestAnimationFrame(() => {
      if (!scrollRef.current) {
        rafRef.current = null;
        return;
      }
      
      const scrollLeft = scrollRef.current.scrollLeft;
      const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      const scrollProgress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      
      const visible = calculateVisibleCount();
      const totalPages = Math.max(1, imageCount - Math.floor(visible) + 1);
      const currentPage = Math.round(scrollProgress * (totalPages - 1));
      const clampedPage = Math.max(0, Math.min(currentPage, totalPages - 1));
      
      if (clampedPage !== activeIndex) {
        setActiveIndex(clampedPage);
        preloadImages(clampedPage);
      }
      
      rafRef.current = null;
    });
  }, [imageCount, calculateVisibleCount, activeIndex, preloadImages]);

  // Window resize handler
  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(calculateVisibleCount());
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount, { passive: true });
    
    return () => {
      window.removeEventListener('resize', updateVisibleCount);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [calculateVisibleCount]);

  // Touch optimization
  const handleTouchStart = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.style.scrollBehavior = 'auto';
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.style.scrollBehavior = 'smooth';
    }
  }, []);

  // Modal handlers
  const openModal = useCallback((index: number) => {
    setModalIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    document.body.style.overflow = '';
  }, []);

  const goToPrev = useCallback(() => {
    setModalIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1));
  }, [imageCount]);

  const goToNext = useCallback(() => {
    setModalIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1));
  }, [imageCount]);

  // Keyboard navigation
  useEffect(() => {
    if (!isModalOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal, goToPrev, goToNext]);

  return (
    <section className="relative py-8 bg-[#080808]">
      <div className="relative">
        {/* Scrollable track */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex overflow-x-auto snap-x snap-mandatory items-center gpu-accelerated"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            willChange: 'scroll-position',
          }}
        >
          {images.map((image, i) => {
            const isLoaded = loadedImages.has(i);
            const isNearViewport = Math.abs(i - activeIndex) <= 2;
            
            return (
              <div 
                key={i}
                ref={(el) => { imageRefs.current[i] = el; }}
                className={`flex-shrink-0 w-[90vw] md:w-[70vw] lg:w-[60vw] snap-center px-2 ${
                  i === 0 ? 'first:pl-4' : ''
                } ${i === imageCount - 1 ? 'last:pr-4' : ''}`}
              >
                <div 
                  className="relative overflow-hidden rounded-sm cursor-pointer group gpu-accelerated"
                  onClick={() => openModal(i)}
                >
                  {/* BLUR-UP PLACEHOLDER - Ultra smooth loading */}
                  <AnimatePresence>
                    {!isLoaded && (
                      <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="absolute inset-0 z-10 bg-[#1a1a1a] backdrop-blur-xl"
                      >
                        {/* Shimmer loading effect */}
                        <div 
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.5s infinite',
                          }}
                        />
                        {/* Tiny blurred low-res preview */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/30 animate-spin"
                            style={{ animationDuration: '1s' }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* HIGH-QUALITY IMAGE - Next.js optimized */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden gpu-accelerated">
                    {(isLoaded || isNearViewport) && (
                      <Image
                        src={image.webp}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 768px) 90vw, (max-width: 1024px) 70vw, 60vw"
                        priority={i <= 2}
                        loading={i <= 2 ? 'eager' : 'lazy'}
                        fetchPriority={i === activeIndex ? 'high' : i <= activeIndex + 2 ? 'auto' : 'low'}
                        quality={90}
                        className="object-cover transition-all duration-500 group-hover:scale-105 gpu-accelerated"
                        style={{
                          willChange: 'transform',
                          transform: 'translateZ(0)',
                        }}
                        onLoad={() => {
                          setLoadedImages(prev => new Set([...prev, i]));
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Expand icon */}
                  <div className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: dotCount }).map((_, i: number) => (
            <button
              key={i}
              onClick={() => {
                if (scrollRef.current) {
                  const scrollWidth = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
                  const targetScroll = (i / Math.max(1, dotCount - 1)) * scrollWidth;
                  scrollRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
                }
              }}
              className="h-2 rounded-full transition-all duration-300 focus:outline-none gpu-accelerated"
              style={{ 
                width: i === activeIndex ? '1.5rem' : '0.5rem',
                backgroundColor: i === activeIndex ? phosphor : `${phosphor}40`,
                opacity: i === activeIndex ? 1 : 0.5,
                willChange: 'width, opacity',
              }}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Modal - Ultra fast loading */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeModal}
        >
          {/* Close button */}
          <button 
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            onClick={closeModal}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Prev button */}
          <button 
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Next button */}
          <button 
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Image counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-sm text-white/60">
            {modalIndex + 1} / {imageCount}
          </div>

          {/* Main image - PRIORITY LOAD */}
          <div 
            className="relative w-[90vw] h-[80vh] max-w-6xl gpu-accelerated"
            onClick={(e) => e.stopPropagation()}
          >
            <Image 
              src={images[modalIndex].webp}
              alt={images[modalIndex].alt}
              fill
              className="object-contain gpu-accelerated"
              sizes="90vw"
              priority
              fetchPriority="high"
              quality={95}
              style={{
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            />
          </div>
        </div>
      )}

      {/* Shimmer animation keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </section>
  );
};
