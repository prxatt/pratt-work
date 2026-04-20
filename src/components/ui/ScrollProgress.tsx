'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

type SegmentState = 'passed' | 'active' | 'upcoming';

interface Segment {
  index: number;
  state: SegmentState;
  progress: number; // 0-1 for active segments (how much of segment is visible)
}

export const ScrollProgress = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastScrollY = useRef(0);
  const lastUpdateTime = useRef(0);
  const lastSegmentSig = useRef('');
  const lastProgressPct = useRef(-1);
  const lastDocHeight = useRef(0);
  const segmentCount = 28;

  // Calculate segment states based on viewport position
  const calculateSegments = useCallback((scrollY: number, viewportHeight: number, docHeight: number): Segment[] => {
    const viewportTop = scrollY;
    const viewportBottom = scrollY + viewportHeight;
    const segmentHeight = docHeight / segmentCount;
    
    const newSegments: Segment[] = [];
    
    for (let i = 0; i < segmentCount; i++) {
      const segmentTop = i * segmentHeight;
      const segmentBottom = (i + 1) * segmentHeight;
      
      let state: SegmentState;
      let progress = 0;
      
      if (segmentBottom < viewportTop) {
        // Segment is above viewport (passed)
        state = 'passed';
        progress = 1;
      } else if (segmentTop > viewportBottom) {
        // Segment is below viewport (upcoming)
        state = 'upcoming';
        progress = 0;
      } else {
        // Segment is in viewport (active)
        state = 'active';
        // Calculate how much of segment is visible
        const visibleTop = Math.max(segmentTop, viewportTop);
        const visibleBottom = Math.min(segmentBottom, viewportBottom);
        progress = (visibleBottom - visibleTop) / segmentHeight;
      }
      
      newSegments.push({ index: i, state, progress });
    }
    
    return newSegments;
  }, [segmentCount]);

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastUpdateTime.current < 48) return;
      lastUpdateTime.current = now;

      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const docChanged = docHeight !== lastDocHeight.current;
        lastDocHeight.current = docHeight;

        if (
          Math.abs(scrollY - lastScrollY.current) <= 4 &&
          lastSegmentSig.current !== '' &&
          !docChanged
        ) {
          rafRef.current = null;
          return;
        }
        lastScrollY.current = scrollY;

        const newSegments = calculateSegments(scrollY, viewportHeight, docHeight);
        const sig = newSegments.map((s) => `${s.state}:${Math.round(s.progress * 20)}`).join('|');
        if (sig !== lastSegmentSig.current) {
          lastSegmentSig.current = sig;
          setSegments(newSegments);
        }

        const maxScroll = docHeight - viewportHeight;
        const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
        const pct = Math.round(progress * 100);
        if (pct !== lastProgressPct.current) {
          lastProgressPct.current = pct;
          setScrollProgress(progress);
        }

        setIsVisible(scrollY > 100);

        rafRef.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [calculateSegments]);

  // Mobile detection
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  const getSegmentStyle = (segment: Segment, isHovered: boolean) => {
    const baseStyle: React.CSSProperties = {
      width: '1px',
      height: isHovered ? '3px' : '2px',
      borderRadius: '9999px',
      transition: 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)',
      willChange: 'opacity, transform, box-shadow',
    };

    switch (segment.state) {
      case 'passed':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(245, 245, 243, 0.25)',
          opacity: 0.4,
          transform: 'scaleX(1)',
        };
      
      case 'active':
        const brightness = 0.7 + (segment.progress * 0.3);
        return {
          ...baseStyle,
          backgroundColor: '#F5F5F3',
          opacity: brightness,
          transform: 'scaleX(1.8)',
          boxShadow: `0 0 ${4 + segment.progress * 4}px rgba(245, 245, 243, ${0.4 + segment.progress * 0.4})`,
        };
      
      case 'upcoming':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(245, 245, 243, 0.08)',
          opacity: 0.2,
          transform: 'scaleX(1)',
        };
      
      default:
        return baseStyle;
    }
  };

  return (
    <>
      <div
        className="fixed right-0 top-0 bottom-0 w-6 z-[100] flex flex-col items-center py-4 transition-all duration-500 pointer-events-auto"
        style={{ 
          opacity: isVisible ? 1 : 0,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main track - segmented design */}
        <div className="relative flex flex-col gap-[3px] items-center">
          {segments.map((segment) => (
            <div
              key={segment.index}
              className="rounded-full"
              style={getSegmentStyle(segment, isHovered)}
            />
          ))}
        </div>
        
        {/* Percentage indicator on hover */}
        <div
          className="absolute right-6 top-1/2 -translate-y-1/2 font-mono text-[9px] tracking-wider text-[#F5F5F3]/60 transition-all duration-300 pointer-events-none whitespace-nowrap"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: `translateY(-50%) translateX(${isHovered ? '0' : '10px'})`,
          }}
        >
          {Math.round(scrollProgress * 100)}%
        </div>
      </div>
    </>
  );
};
