'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Search, X, ArrowUpRight, FileText, User, Briefcase, Newspaper, Layout, 
  FlaskConical, Mail, Building2, Brain, Activity, Box, Glasses, Film, Zap, 
  Bot, Sparkles, Filter, Tags 
} from 'lucide-react';
import { useCursor } from '@/context/CursorContext';
import { buildSearchIndex, SearchResult, searchIndex } from '@/lib/searchIndex';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// Icon mapping for dynamic lookup
const iconMap: Record<string, React.ReactNode> = {
  Layout: <Layout className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
  FlaskConical: <FlaskConical className="w-4 h-4" />,
  User: <User className="w-4 h-4" />,
  Newspaper: <Newspaper className="w-4 h-4" />,
  Mail: <Mail className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  Building2: <Building2 className="w-4 h-4" />,
  Brain: <Brain className="w-4 h-4" />,
  Activity: <Activity className="w-4 h-4" />,
  Box: <Box className="w-4 h-4" />,
  Glasses: <Glasses className="w-4 h-4" />,
  Film: <Film className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Bot: <Bot className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Filter: <Filter className="w-4 h-4" />,
  Tags: <Tags className="w-4 h-4" />,
};

// Type for worker results
interface WorkerSearchResult extends SearchResult {
  score: number;
}

// ============================================
// OPTIMIZED SEARCH OVERLAY - Steve Jobs Level
// Web Worker filtering, debounced input, mobile-optimized
// ============================================

export const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setCursorState } = useCursor();
  const prefersReducedMotion = useReducedMotion();
  
  // Worker ref for off-thread search
  const workerRef = useRef<Worker | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartY = useRef<number>(0);
  
  // Initialize Web Worker and search index
  useEffect(() => {
    // Build search index on mount
    const fullSearchIndex = buildSearchIndex();
    
    // Initialize Web Worker for heavy filtering
    if (typeof window !== 'undefined' && 'Worker' in window) {
      try {
        workerRef.current = new Worker(
          new URL('@/lib/searchWorker.ts', import.meta.url)
        );
        
        // Initialize worker with search index
        workerRef.current.postMessage({
          type: 'init',
          index: fullSearchIndex
        });
        
        workerRef.current.onmessage = (e: MessageEvent) => {
          if (e.data.type === 'results') {
            setResults(e.data.results || []);
            setIsLoading(false);
          }
        };
      } catch {
        // Fallback to main thread if worker fails
        workerRef.current = null;
      }
    }
    
    return () => {
      workerRef.current?.terminate();
    };
  }, []);
  
  // Debounce query changes for performance
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150); // 150ms debounce for smooth typing
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);
  
  // Perform search using worker or fallback
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    
    if (workerRef.current) {
      // Use Web Worker for off-thread filtering
      workerRef.current.postMessage({
        type: 'search',
        query: debouncedQuery
      });
    } else {
      // Fallback to local search
      const searchResults = searchIndex(debouncedQuery);
      setResults(searchResults);
      setIsLoading(false);
    }
  }, [debouncedQuery]);
  
  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  // Modal open/close handling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus after animation completes for mobile
      requestAnimationFrame(() => {
        inputRef.current?.focus({ preventScroll: true });
      });
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setDebouncedQuery('');
      setSelectedIndex(0);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Keyboard navigation with reduced motion support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      
      if (results.length === 0) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          window.location.href = selected.href;
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, results, selectedIndex]);
  
  // Touch handling for mobile swipe-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    const touchY = e.touches[0].clientY;
    const deltaY = touchY - touchStartY.current;
    
    // Swipe down to close
    if (deltaY > 100) {
      onClose();
    }
  };

  const handleResultClick = useCallback((href: string) => {
    window.location.href = href;
    onClose();
  }, [onClose]);
  
  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  // Get icon for result
  const getIcon = (iconName: string) => iconMap[iconName] || <FileText className="w-4 h-4" />;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - GPU accelerated, touch-friendly */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            onClick={onClose}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className="fixed inset-0 bg-[#0D0D0D]/80 backdrop-blur-sm z-[120] touch-manipulation gpu-accelerated"
            style={{ willChange: 'opacity' }}
          />

          {/* Search Modal - Mobile-optimized positioning */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className="fixed top-[15%] sm:top-[20%] left-1/2 -translate-x-1/2 w-[min(640px,92vw)] sm:w-[min(640px,90vw)] bg-[#111111] border border-[#1a1a1a] rounded-lg z-[130] overflow-hidden shadow-2xl touch-manipulation gpu-accelerated content-visibility-auto"
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Search Input - Mobile optimized with larger touch targets */}
            <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b border-[#1a1a1a]">
              <Search className="w-5 h-5 text-[#666] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="Search pages, work, blog..."
                className="flex-1 bg-transparent font-sans text-[16px] sm:text-[17px] text-[#F2F2F0] placeholder:text-[#444] outline-none min-w-0"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              {isLoading && (
                <motion.div 
                  className="w-4 h-4 border-2 border-[#6366f1] border-t-transparent rounded-full shrink-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              )}
              <button
                onClick={onClose}
                className="text-[#666] hover:text-[#F2F2F0] transition-colors p-1 sm:p-0 min-w-[44px] sm:min-w-0 min-h-[44px] sm:min-h-0 flex items-center justify-center sm:block touch-manipulation"
                onMouseEnter={() => setCursorState('hover')}
                onMouseLeave={() => setCursorState('default')}
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results - Virtualized, touch-optimized */}
            <div 
              className="max-h-[50vh] sm:max-h-[400px] overflow-y-auto overscroll-contain contain-layout"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {results.length > 0 ? (
                <div className="py-2">
                  {results.map((result, index) => (
                    <motion.button
                      key={result.id}
                      onClick={() => handleResultClick(result.href)}
                      onMouseEnter={() => {
                        setCursorState('hover');
                        setSelectedIndex(index);
                      }}
                      onMouseLeave={() => setCursorState('default')}
                      onTouchStart={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-3 text-left transition-colors touch-manipulation min-h-[56px] sm:min-h-0 ${
                        index === selectedIndex ? 'bg-[#1a1a1a]' : 'hover:bg-[#1a1a1a]/50'
                      }`}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: prefersReducedMotion ? 0 : index * 0.03, duration: 0.2 }}
                    >
                      <div className={`p-2 rounded shrink-0 ${index === selectedIndex ? 'bg-[#6366f1]/20' : 'bg-[#1a1a1a]'}`}>
                        <div className={index === selectedIndex ? 'text-[#6366f1]' : 'text-[#666]'}>
                          {getIcon(result.icon)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          <span className={`font-sans text-[14px] sm:text-[15px] truncate ${index === selectedIndex ? 'text-[#F2F2F0]' : 'text-[#999]'}`}>
                            {result.title}
                          </span>
                          <span className="font-mono text-[9px] sm:text-[10px] text-[#666] uppercase tracking-wider px-1.5 py-0.5 bg-[#1a1a1a] rounded shrink-0">
                            {result.type}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] sm:text-[11px] text-[#666] block mt-0.5 line-clamp-1">
                          {result.description}
                        </span>
                      </div>
                      <ArrowUpRight className={`w-4 h-4 shrink-0 transition-colors ${index === selectedIndex ? 'text-[#6366f1]' : 'text-[#333]'}`} />
                    </motion.button>
                  ))}
                </div>
              ) : debouncedQuery.trim() ? (
                <div className="px-4 sm:px-6 py-8 text-center">
                  <span className="font-mono text-[11px] sm:text-[12px] text-[#666] uppercase tracking-wider">
                    No results found for &ldquo;{debouncedQuery}&rdquo;
                  </span>
                </div>
              ) : (
                <div className="px-4 sm:px-6 py-4 sm:py-6">
                  <div className="flex items-center justify-between text-[#666] mb-3 sm:mb-4">
                    <span className="font-mono text-[10px] uppercase tracking-wider">Popular</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Work', 'About', 'Contact', 'Blog', 'Ventures'].map((term, i) => (
                      <motion.button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 font-mono text-[11px] text-[#999] bg-[#1a1a1a] hover:bg-[#252525] hover:text-[#F2F2F0] rounded transition-colors touch-manipulation min-h-[36px]"
                        onMouseEnter={() => setCursorState('hover')}
                        onMouseLeave={() => setCursorState('default')}
                        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: prefersReducedMotion ? 0 : i * 0.05 }}
                        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {term}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Responsive, touch-friendly */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 border-t border-[#1a1a1a] bg-[#0D0D0D]">
              <span className="font-mono text-[9px] sm:text-[10px] text-[#444] uppercase tracking-wider">
                {isLoading ? 'Searching...' : results.length > 0 ? `${results.length} results` : 'Type to search'}
              </span>
              <div className="hidden sm:flex items-center gap-3">
                <span className="font-mono text-[10px] text-[#444]">
                  <span className="text-[#666]">↑↓</span> navigate
                </span>
                <span className="font-mono text-[10px] text-[#444]">
                  <span className="text-[#666]">↵</span> select
                </span>
                <span className="font-mono text-[10px] text-[#444]">
                  <span className="text-[#666]">esc</span> close
                </span>
              </div>
              <span className="sm:hidden font-mono text-[9px] text-[#444]">
                Tap to select
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
