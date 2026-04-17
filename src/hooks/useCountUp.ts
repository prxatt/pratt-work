'use client';

import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
  enabled?: boolean;
}

// Check for reduced motion preference
const getPrefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export function useCountUp({
  start = 0,
  end,
  duration = 2000,
  decimals = 0,
  enabled = true,
}: UseCountUpOptions) {
  // Check reduced motion preference on mount
  const prefersReducedMotion = useRef(getPrefersReducedMotion());
  
  // If reduced motion is preferred, show final value immediately
  const initialValue = prefersReducedMotion.current ? end : (enabled ? start : start);
  const [count, setCount] = useState(initialValue);
  const countRef = useRef(start);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setCount(start);
      return;
    }

    // Skip animation for reduced motion preference
    if (prefersReducedMotion.current) {
      setCount(end);
      return;
    }

    const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      
      const currentCount = start + (end - start) * easedProgress;
      countRef.current = currentCount;
      setCount(Number(currentCount.toFixed(decimals)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    return () => {
      startTimeRef.current = null;
    };
  }, [start, end, duration, decimals, enabled]);

  return count;
}
