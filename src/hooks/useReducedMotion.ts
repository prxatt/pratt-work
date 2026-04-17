'use client';

import { useState, useEffect } from 'react';

/**
 * useReducedMotion Hook
 * 
 * Steve Jobs Level: Detect user's motion preference for maximum accessibility
 * Returns true if user prefers reduced motion (low power mode, accessibility settings)
 * 
 * Usage:
 * const prefersReducedMotion = useReducedMotion();
 * 
 * // In animations
 * animate={{ 
 *   opacity: 1, 
 *   y: prefersReducedMotion ? 0 : 20 
 * }}
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if media query API is available
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Legacy fallback
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * useIsTouchDevice Hook
 * 
 * Detects touch-capable devices for conditional feature enabling
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Multiple detection methods for reliability
    const detectTouch = () => {
      const hasTouchEvents = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      setIsTouch(hasTouchEvents || hasCoarsePointer);
    };

    detectTouch();
    
    // Re-check on resize (some devices can switch modes)
    window.addEventListener('resize', detectTouch);
    return () => window.removeEventListener('resize', detectTouch);
  }, []);

  return isTouch;
}

/**
 * useIsLowEndDevice Hook
 * 
 * Detects low-end devices based on hardware concurrency and memory
 * Useful for disabling complex animations on budget phones
 */
export function useIsLowEndDevice(): boolean {
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    // Check hardware capabilities
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
    
    // Low-end: 2 cores or less, or 4GB RAM or less
    const lowEnd = hardwareConcurrency <= 2 || deviceMemory <= 4;
    
    setIsLowEnd(lowEnd);
  }, []);

  return isLowEnd;
}

/**
 * useDeviceCapabilities Hook
 * 
 * Comprehensive device capability detection
 * Returns object with all capability flags
 */
export function useDeviceCapabilities() {
  const prefersReducedMotion = useReducedMotion();
  const isTouch = useIsTouchDevice();
  const isLowEnd = useIsLowEndDevice();

  return {
    // Animation preferences
    prefersReducedMotion,
    enableComplexAnimations: !prefersReducedMotion && !isLowEnd,
    
    // Input type
    isTouch,
    isMouse: !isTouch,
    
    // Performance tier
    isLowEnd,
    isHighEnd: !isLowEnd,
    
    // Combined recommendations
    enableParallax: !prefersReducedMotion && !isTouch && !isLowEnd,
    enableBackdropBlur: !isLowEnd,
    enableCustomCursor: !isTouch,
  };
}
