'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MagneticArrowProps {
  color: string;
  children: React.ReactNode;
}

export function MagneticArrow({ color, children }: MagneticArrowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const lastEventRef = useRef<{ x: number; y: number } | null>(null);
  const isHoveringRef = useRef(false);

  // Throttled update using RAF for 60fps performance
  const updatePosition = useCallback(() => {
    if (!lastEventRef.current || !ref.current) {
      rafRef.current = null;
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = lastEventRef.current.x - centerX;
    const distanceY = lastEventRef.current.y - centerY;
    
    // Magnetic pull strength (max 8px)
    const strength = 0.3;
    const newX = Math.round(distanceX * strength * 10) / 10;
    const newY = Math.round(distanceY * strength * 10) / 10;
    
    setPosition(prev => {
      if (prev.x === newX && prev.y === newY) return prev;
      return { x: newX, y: newY };
    });

    if (isHoveringRef.current) {
      rafRef.current = requestAnimationFrame(updatePosition);
    } else {
      rafRef.current = null;
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    lastEventRef.current = { x: e.clientX, y: e.clientY };
    isHoveringRef.current = true;
    
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(updatePosition);
    }
  }, [updatePosition]);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    lastEventRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setPosition({ x: 0, y: 0 });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      className="hidden md:flex items-center px-6 border-l border-[#222] cursor-pointer will-change-transform"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x * 0.5 }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      <motion.div
        className="w-8 h-8 border flex items-center justify-center will-change-transform"
        style={{ borderColor: color }}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.1 }}
        whileHover={{ scale: 1.1 }}
      >
        <motion.span 
          className="text-white text-lg will-change-transform"
          animate={{ x: position.x * 0.3 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.1 }}
        >
          {children}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
