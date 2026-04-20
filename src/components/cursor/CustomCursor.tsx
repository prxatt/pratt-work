'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';

export const CustomCursor = () => {
  const { cursorState, previewData } = useCursor();

  // ALL HOOKS must be declared BEFORE any return statement (React Rules of Hooks)
  const [mounted, setMounted] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1.35);

  // Refs to eliminate React re-renders on mousemove (Step 1 optimization)
  const isVisibleRef = useRef(false);
  const rafRef = useRef<number | undefined>(undefined);

  // Direct values for dot (no spring - instant follow)
  const dotX = useMotionValue(0);
  const dotY = useMotionValue(0);

  // Spring config with numeric initial values
  const ringX = useSpring(dotX, { stiffness: 300, damping: 30 });
  const ringY = useSpring(dotY, { stiffness: 300, damping: 30 });
  
  // Mount effect — sets mounted true after first client render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Touch detection effect — runs only on client, after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
      setIsTouch(isTouchDevice);
    }
  }, []);

  // Mouse tracking effect with RAF throttling (Step 1 optimization)
  // Reduces React re-renders from 60-120/second to exactly 1 (on first move)
  useEffect(() => {
    if (typeof window === 'undefined' || isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Skip if frame already queued (caps at 60fps even on 120Hz screens)
      if (rafRef.current !== undefined) return;

      rafRef.current = requestAnimationFrame(() => {
        dotX.set(e.clientX);
        dotY.set(e.clientY);

        // Only trigger React state update once — when cursor first becomes visible
        if (!isVisibleRef.current) {
          isVisibleRef.current = true;
          setIsVisible(true);
        }

        rafRef.current = undefined;
      });
    };

    const handleMouseEnter = () => {
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
      // Cancel any pending RAF on cleanup
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [dotX, dotY, isTouch]);

  const hasPreviewImage = Boolean(previewData?.src);

  // Scroll-to-zoom lens behavior while hovering recognition cards.
  useEffect(() => {
    if (typeof window === 'undefined' || !hasPreviewImage) {
      setPreviewZoom(1.35);
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      if (cursorState !== 'recognition' && cursorState !== 'recognition-card') return;
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.12 : 0.12;
      setPreviewZoom((prev) => Math.min(3, Math.max(1, Number((prev + delta).toFixed(2)))));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [cursorState, hasPreviewImage]);
  
  // ─────────────────────────────────────────────────────
  // CONDITIONAL RETURNS — only after ALL hooks above
  // ─────────────────────────────────────────────────────
  
  if (!mounted) return null;
  if (isTouch) return null;

  const isHovering = cursorState === 'hover' || cursorState === 'magnetic';
  const isRecognitionCard = cursorState === 'recognition-card';

  return (
    <>
      {/* Dot - 8px white, direct position, mix-blend-mode difference */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          width: 8,
          height: 8,
          backgroundColor: '#F2F2F0',
          borderRadius: '50%',
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
        animate={{
          opacity: isVisible && !isHovering && !hasPreviewImage ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Ring - 40px (64px on hover, 120px when showing preview image), spring physics */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full flex items-center justify-center overflow-hidden"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          willChange: 'transform',
        }}
        animate={{
          width: hasPreviewImage ? 120 : isHovering ? 64 : 40,
          height: hasPreviewImage ? 120 : isHovering ? 64 : 40,
          border: hasPreviewImage
            ? '2px solid rgba(245, 158, 11, 0.8)'
            : isHovering 
              ? '1px solid rgba(255, 255, 255, 0.9)' 
              : '1px solid rgba(255, 255, 255, 0.6)',
          backgroundColor: isHovering && !hasPreviewImage ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0)',
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          opacity: { duration: 0.15 },
        }}
      >
        {hasPreviewImage && (
          <img
            src={previewData.src}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover rounded-full"
            style={{
              transform: `scale(${previewZoom})`,
              transformOrigin: `${previewData.focusX ?? 50}% ${previewData.focusY ?? 50}%`,
            }}
          />
        )}
      </motion.div>
    </>
  );
};
