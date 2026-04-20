'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type CursorState = 'default' | 'hover' | 'magnetic' | 'recognition' | 'recognition-card' | 'playground' | 'video' | 'hidden';

interface CursorContextType {
  cursorState: CursorState;
  setCursorState: (state: CursorState) => void;
  previewData: {
    src?: string;
    stats?: string[];
    text?: string;
    focusX?: number;
    focusY?: number;
  };
  setPreviewData: (data: { src?: string; stats?: string[]; text?: string; focusX?: number; focusY?: number }) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const CursorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [previewData, setPreviewData] = useState<{ src?: string; stats?: string[]; text?: string; focusX?: number; focusY?: number }>({});

  // Reset state on mouse leave window - only runs client-side
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleMouseLeave = () => {
      setCursorState('default');
    };
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => window.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  return (
    <CursorContext.Provider value={{ cursorState, setCursorState, previewData, setPreviewData }}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (context === undefined) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};
