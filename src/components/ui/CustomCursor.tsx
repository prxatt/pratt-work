'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

export const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const checkTouch = window.matchMedia('(pointer: coarse)').matches;
    setIsTouchDevice(checkTouch);
    if (checkTouch) return;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const animate = () => {
      // Smooth lerp for dot (fast follow)
      currentPos.current.x = lerp(currentPos.current.x, mousePos.current.x, 0.15);
      currentPos.current.y = lerp(currentPos.current.y, mousePos.current.y, 0.15);
      
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px) translate(-50%, -50%)`;
      }
      
      // Slower lerp for ring (trailing effect)
      if (ringRef.current) {
        const ringX = lerp(parseFloat(ringRef.current.dataset.x || '0'), mousePos.current.x, 0.08);
        const ringY = lerp(parseFloat(ringRef.current.dataset.y || '0'), mousePos.current.y, 0.08);
        ringRef.current.dataset.x = String(ringX);
        ringRef.current.dataset.y = String(ringY);
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      }
      
      rafRef.current = requestAnimationFrame(animate);
    };

    const moveCursor = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cursorType = target.dataset.cursor;
      
      // Skip hover effects for elements marked with data-cursor="none"
      if (cursorType === 'none') {
        setIsHovering(false);
        return;
      }
      
      const isInteractive = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' ||
        target.closest('a') !== null ||
        target.closest('button') !== null ||
        (cursorType !== undefined && cursorType !== 'none');
      
      setIsHovering(isInteractive);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveCursor, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isVisible]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Main cursor dot - native RAF for zero lag */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference will-change-transform"
        style={{ 
          transform: 'translate(-100px, -100px) translate(-50%, -50%)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.2s ease'
        }}
      >
        <motion.div
          className="w-2 h-2 bg-white rounded-full"
          animate={{ scale: isHovering ? 2.5 : 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            boxShadow: isHovering 
              ? '0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(255,255,255,0.5)'
              : '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)'
          }}
        />
      </div>

      {/* Outer ring - trailing effect */}
      <div
        ref={ringRef}
        data-x="-100"
        data-y="-100"
        className="fixed top-0 left-0 pointer-events-none z-[9998] will-change-transform"
        style={{ 
          transform: 'translate(-100px, -100px) translate(-50%, -50%)',
          opacity: isVisible ? (isHovering ? 0.8 : 0.4) : 0,
          transition: 'opacity 0.3s ease'
        }}
      >
        <motion.div
          className="w-8 h-8 border border-white/40 rounded-full"
          animate={{ scale: isHovering ? 1.5 : 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            boxShadow: isHovering 
              ? '0 0 40px rgba(255,255,255,0.2)'
              : '0 0 30px rgba(255,255,255,0.1)'
          }}
        />
      </div>
    </>
  );
};

export default CustomCursor;
