'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';

interface GalleryImage {
  webp: string;
  jpg: string;
  alt: string;
}

interface HorizontalGalleryProps {
  phosphor: string;
  images: GalleryImage[];
}

export const HorizontalGallery: React.FC<HorizontalGalleryProps> = ({ 
  phosphor, 
  images 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  
  const imageCount = images.length;

  // Memoize dot count
  const dotCount = useMemo(() => 
    Math.max(1, imageCount - Math.floor(visibleCount) + 1), 
    [imageCount, visibleCount]
  );

  // Simple viewport calculation
  const calculateVisibleCount = useCallback(() => {
    if (typeof window === 'undefined') return 1;
    const vw = window.innerWidth;
    if (vw >= 1024) return 2;
    if (vw >= 768) return 1.5;
    return 1;
  }, []);

  // Lightweight scroll handler - no state updates during scroll
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
      }
      
      rafRef.current = null;
    });
  }, [imageCount, calculateVisibleCount, activeIndex]);

  // Init and cleanup
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

  // Simple touch handlers
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
          className="flex overflow-x-auto snap-x snap-mandatory items-center"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {images.map((image, i) => (
            <div 
              key={i}
              className={`flex-shrink-0 w-[90vw] md:w-[70vw] lg:w-[60vw] snap-center px-2 ${
                i === 0 ? 'first:pl-4' : ''
              } ${i === imageCount - 1 ? 'last:pr-4' : ''}`}
            >
              <div 
                className="relative overflow-hidden rounded-sm cursor-pointer group"
                onClick={() => openModal(i)}
              >
                <picture>
                  <source srcSet={image.webp} type="image/webp" />
                  <source srcSet={image.jpg} type="image/jpeg" />
                  <img 
                    src={image.jpg}
                    alt={image.alt}
                    loading={i <= 2 ? "eager" : "lazy"}
                    decoding="async"
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    style={{ display: 'block' }}
                  />
                </picture>
                {/* Expand icon */}
                <div className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
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
              className="h-2 rounded-full transition-all duration-300 focus:outline-none"
              style={{ 
                width: i === activeIndex ? '1.5rem' : '0.5rem',
                backgroundColor: i === activeIndex ? phosphor : `${phosphor}40`,
                opacity: i === activeIndex ? 1 : 0.5
              }}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeModal}
        >
          {/* Close button */}
          <button 
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            onClick={closeModal}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Prev button */}
          <button 
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Next button */}
          <button 
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
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

          {/* Main image */}
          <div 
            className="relative w-[90vw] h-[80vh] max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <picture>
              <source srcSet={images[modalIndex].webp} type="image/webp" />
              <source srcSet={images[modalIndex].jpg} type="image/jpeg" />
              <Image 
                src={images[modalIndex].jpg}
                alt={images[modalIndex].alt}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            </picture>
          </div>
        </div>
      )}
    </section>
  );
};
