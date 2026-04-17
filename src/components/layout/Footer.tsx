'use client';

import React from 'react';
import Link from 'next/link';
import { useCursor } from '@/context/CursorContext';

export const Footer = () => {
  const { setCursorState } = useCursor();

  return (
    <footer className="w-full px-6 md:px-12 lg:px-20 py-12 mt-auto">
      <div className="flex flex-col gap-8">
        {/* Main wordmark section */}
        <div className="flex flex-col items-center gap-4">
          <Link 
            href="/" 
            className="font-display text-[clamp(4rem,15vw,10rem)] leading-[0.85] tracking-[0.1em] text-primary uppercase hover:text-secondary transition-colors duration-500 whitespace-nowrap"
            onMouseEnter={() => setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            P R X A T T
          </Link>
          
          <a 
            href="https://surfacetension.co"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[11px] tracking-[0.1em] text-[#4A4A47] uppercase hover:text-secondary transition-colors"
            onMouseEnter={() => setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            PRODUCER, ARCHITECT, THINKER
          </a>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          <a
            href="https://instagram.com/pratt.work"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs tracking-[0.15em] text-secondary hover:text-primary transition-colors"
            onMouseEnter={() => setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            Instagram
          </a>
          <a
            href="https://linkedin.com/in/prxatt"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs tracking-[0.15em] text-secondary hover:text-primary transition-colors"
            onMouseEnter={() => setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            LINKEDIN
          </a>
          <a
            href="https://twitter.com/prxatt"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs tracking-[0.15em] text-secondary hover:text-primary transition-colors"
            onMouseEnter={() => setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            Twitter
          </a>
        </div>

        {/* Bottom Section - Copyright and Back to Top */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pt-6 border-t border-border">
          <p className="font-mono text-[10px] tracking-[0.2em] text-tertiary">
            ©2026 PRATT.WORK
          </p>
          
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-mono text-xs tracking-[0.15em] text-secondary hover:text-primary transition-colors flex items-center gap-1"
            onMouseEnter={() => setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            Go Back To Top ↑
          </button>
        </div>
      </div>
    </footer>
  );
};
