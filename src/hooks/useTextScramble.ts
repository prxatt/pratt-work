'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

interface UseTextScrambleOptions {
  text: string;
  enabled?: boolean;
  speed?: number;
  delay?: number;
}

// Check for reduced motion preference
const getPrefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export function useTextScramble({
  text,
  enabled = true,
  speed = 50,
  delay = 0,
}: UseTextScrambleOptions) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useRef(getPrefersReducedMotion());
  
  // Memoize processed text to avoid re-calculation
  const textArray = useMemo(() => text.split(''), [text]);
  const length = textArray.length;

  const scramble = useCallback(() => {
    if (!enabled || length === 0) {
      setDisplayText(text);
      return;
    }

    // Skip animation for reduced motion preference
    if (prefersReducedMotion.current) {
      setDisplayText(text);
      return;
    }

    setIsScrambling(true);
    const maxIterations = Math.min(length * 3, 60); // Cap iterations for performance
    const startTime = performance.now();
    const duration = maxIterations * speed;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const revealedCount = Math.floor(progress * length);
      
      // Only update state if changed
      const newText = textArray
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (index < revealedCount) return textArray[index];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join('');

      setDisplayText(prev => (prev !== newText ? newText : prev));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
        setIsScrambling(false);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [text, enabled, speed, textArray, length]);

  useEffect(() => {
    if (!enabled) {
      setDisplayText(text);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      scramble();
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scramble, delay, enabled, text]);

  return { displayText, isScrambling };
}
