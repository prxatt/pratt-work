import { RefObject, useEffect, useRef, useCallback } from 'react';

/**
 * useMagnet - ZERO RE-RENDER VERSION
 * Uses CSS custom properties instead of React state/useSpring
 * RAF only runs when hovering, stops when settled
 */
export const useMagnet = (ref: RefObject<HTMLElement>, strength: number = 0.5) => {
  const rafRef = useRef<number | null>(null);
  const isHoveringRef = useRef(false);
  const currentRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  const runLoop = useCallback(() => {
    // Stop RAF when not hovering and settled
    if (!isHoveringRef.current && 
        Math.abs(currentRef.current.x) < 0.1 && 
        Math.abs(currentRef.current.y) < 0.1) {
      currentRef.current = { x: 0, y: 0 };
      targetRef.current = { x: 0, y: 0 };
      if (ref.current) {
        ref.current.style.setProperty('--magnetX', '0px');
        ref.current.style.setProperty('--magnetY', '0px');
      }
      rafRef.current = null;
      return;
    }

    // Lerp towards target
    currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.15;
    currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.15;

    // Direct DOM update - NO REACT STATE
    if (ref.current) {
      ref.current.style.setProperty('--magnetX', `${currentRef.current.x}px`);
      ref.current.style.setProperty('--magnetY', `${currentRef.current.y}px`);
    }

    rafRef.current = requestAnimationFrame(runLoop);
  }, [ref]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = element.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;

      targetRef.current = {
        x: (clientX - centerX) * strength,
        y: (clientY - centerY) * strength
      };
    };

    const handleMouseEnter = () => {
      isHoveringRef.current = true;
      if (!rafRef.current) rafRef.current = requestAnimationFrame(runLoop);
    };

    const handleMouseLeave = () => {
      isHoveringRef.current = false;
      targetRef.current = { x: 0, y: 0 };
      // RAF continues until settled
    };

    element.addEventListener('mousemove', handleMouseMove, { passive: true });
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ref, strength, runLoop]);

  // Return CSS transform string for convenience
  return { transform: 'translate(var(--magnetX, 0px), var(--magnetY, 0px))' };
};

export default useMagnet;

