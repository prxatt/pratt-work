'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';

interface Page {
  id: number;
  content: string;
  image?: string;
}

const pages: Page[] = [
  { id: 1, content: 'NEURAL MAPPING', image: '/playground/zine-1.jpg' },
  { id: 2, content: 'GENERATIVE FLOW', image: '/playground/zine-2.jpg' },
  { id: 3, content: 'LATENT SPACES', image: '/playground/zine-3.jpg' },
  { id: 4, content: 'HUMAN INTENT', image: '/playground/zine-4.jpg' },
];

export const ZineViewer = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const { setCursorState } = useCursor();

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % pages.length);
  }, []);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + pages.length) % pages.length);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage]);

  return (
    <div className="relative w-full h-full bg-card rounded-sm border border-border flex items-center justify-center overflow-hidden group">
      <div className="absolute top-8 left-8 flex flex-col gap-2 z-10">
        <span className="font-mono text-[10px] tracking-widest text-tertiary uppercase">VOL. 01 — AI ARTIFACTS</span>
        <span className="font-mono text-[10px] tracking-widest text-secondary">PAGE {currentPage + 1} / {pages.length}</span>
      </div>

      <div className="absolute bottom-8 right-8 flex gap-4 z-10">
        <button 
          onClick={prevPage}
          onMouseEnter={() => setCursorState('hover')}
          onMouseLeave={() => setCursorState('default')}
          className="font-display text-xl text-tertiary hover:text-primary transition-colors"
        >
          PREV
        </button>
        <button 
          onClick={nextPage}
          onMouseEnter={() => setCursorState('hover')}
          onMouseLeave={() => setCursorState('default')}
          className="font-display text-xl text-tertiary hover:text-primary transition-colors"
        >
          NEXT
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, rotateY: 90, perspective: 1000 }}
          animate={{ opacity: 1, rotateY: 0, perspective: 1000 }}
          exit={{ opacity: 0, rotateY: -90, perspective: 1000 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-3/4 h-3/4 bg-neutral-900 border border-border shadow-2xl flex flex-col items-center justify-center p-12 text-center"
        >
          <h3 className="font-display text-6xl md:text-8xl text-primary tracking-tighter mb-8 leading-none">
            {pages[currentPage].content}
          </h3>
          <div className="w-full h-[1px] bg-border my-8" />
          <p className="font-mono text-[10px] tracking-[0.3em] text-tertiary uppercase max-w-xs">
            A STUDY IN LATENT REPRESENTATION AND AUTONOMOUS CREATIVE SYSTEMS
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none border-[20px] border-background opacity-50" />
    </div>
  );
};
