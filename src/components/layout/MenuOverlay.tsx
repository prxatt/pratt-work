'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';
import { ArrowUpRight, Mail, Quote, RefreshCw, Pin, PinOff } from 'lucide-react';
import { useSocialFeed } from '@/hooks/useSocialFeed';
import { Update, formatRelativeTime } from '@/config/updates';

// Daily quotes for the footer ticker
const dailyQuotes = [
  "Creativity is intelligence having fun.",
  "Design is not just what it looks like. Design is how it works.",
  "Innovation distinguishes between a leader and a follower.",
  "Stay hungry, stay foolish.",
  "The people who are crazy enough to think they can change the world are the ones who do.",
];

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { name: 'Home', href: '/', number: '01', hoverColor: '#6366f1' },      // Indigo
  { name: 'Work', href: '/work', number: '02', hoverColor: '#22c55e' },   // Green
  { name: 'Ventures', href: '/ventures', number: '03', hoverColor: '#f59e0b' }, // Amber
  { name: 'About', href: '/about', number: '04', hoverColor: '#ec4899' }, // Pink
  { name: 'Blog', href: '/blog', number: '05', hoverColor: '#06b6d4' },  // Cyan
  { name: 'Playground', href: '/playground', number: '06', hoverColor: '#a855f7' }, // Purple
];

const READ_KEY = 'menu_update_center_read_ids_v1';
const PINNED_KEY = 'menu_update_center_pinned_ids_v1';

// Animation variants - defined outside component to prevent recreation
const panelVariants = {
  closed: { 
    x: '100%',
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    }
  },
  open: {
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const
    },
  },
  exit: {
    x: '100%',
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    },
  },
};

const linkContainerVariants = {
  closed: { opacity: 0 },
  open: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

const linkVariants = {
  closed: { opacity: 0, x: 40 },
  open: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
    },
  },
};

export const MenuOverlay: React.FC<MenuOverlayProps> = ({ isOpen, onClose }) => {
  const { setCursorState } = useCursor();
  const prefersReducedMotion = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  
  // Touch gesture state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Real-time updates feed
  const { updates, isLoading, isRealtime, refresh } = useSocialFeed();

  // Check if there are recent updates
  const hasRecentUpdates = updates.length > 0;
  const websiteUpdates = useMemo(() => updates.filter((u) => u.type === 'website'), [updates]);

  const visibleUpdates = useMemo(() => {
    return websiteUpdates.filter((u) => !readIds.includes(u.id) || pinnedIds.includes(u.id));
  }, [websiteUpdates, readIds, pinnedIds]);

  // Get priority update for featured banner
  const featuredUpdate = useMemo(() => {
    return visibleUpdates.find(u => u.priority === 'high') || visibleUpdates[0];
  }, [visibleUpdates]);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const closeNotifications = useCallback(() => {
    setShowNotifications(false);
  }, []);

  const markUpdateRead = useCallback((id: string) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }, []);

  const clearRead = useCallback(() => {
    setReadIds([]);
  }, []);

  const handleLinkClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleUpdateClick = useCallback(
    (update: Update) => {
      markUpdateRead(update.id);
      if (!update.external) handleLinkClick();
    },
    [handleLinkClick, markUpdateRead]
  );

  // Memoized handlers for updates button
  const handleUpdatesEnter = useCallback(() => {
    setCursorState('hover');
  }, [setCursorState]);

  const handleUpdatesLeave = useCallback(() => {
    setCursorState('default');
  }, [setCursorState]);

  // Memoized handlers for nav items - factory pattern to avoid inline arrow functions
  const createNavEnterHandler = useCallback((index: number) => () => {
    setCursorState('hover');
    setHoveredIndex(index);
  }, [setCursorState]);

  const createNavLeaveHandler = useCallback(() => () => {
    setCursorState('default');
    setHoveredIndex(null);
  }, [setCursorState]);

  // Memoized style getters for nav items
  const getNavBgStyle = useCallback((isHovered: boolean, hoverColor: string) => ({
    transformOrigin: 'left' as const,
    transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
    background: isHovered 
      ? `linear-gradient(to right, ${hoverColor}15, transparent)`
      : 'transparent'
  }), []);

  const getNavNumberStyle = useCallback((isHovered: boolean, hoverColor: string) => ({
    color: isHovered ? hoverColor : '#333'
  }), []);

  const getNavCircleStyle = useCallback((isHovered: boolean, hoverColor: string) => ({
    borderColor: isHovered ? `${hoverColor}40` : 'transparent',
    transform: isHovered ? 'scale(1)' : 'scale(0.8)',
    opacity: isHovered ? 1 : 0
  }), []);

  const getNavTitleStyle = useCallback((isHovered: boolean) => ({
    color: isHovered ? '#F2F2F0' : '#3a3a3a',
    letterSpacing: isHovered ? '0' : '-0.02em',
    transform: isHovered ? 'translateX(8px)' : 'translateX(0)'
  }), []);

  const getNavArrowContainerStyle = useCallback((isHovered: boolean) => ({
    opacity: isHovered ? 1 : 0,
    transform: isHovered 
      ? 'translateX(0) scale(1) rotate(0deg)' 
      : 'translateX(-10px) scale(0.8) rotate(-45deg)'
  }), []);

  const getNavArrowCircleStyle = useCallback((isHovered: boolean, hoverColor: string) => ({
    borderColor: isHovered ? `${hoverColor}60` : 'rgba(99, 102, 241, 0.4)',
    backgroundColor: isHovered ? `${hoverColor}15` : 'transparent'
  }), []);

  const getNavArrowIconStyle = useCallback((isHovered: boolean, hoverColor: string) => ({
    color: isHovered ? hoverColor : '#6366f1'
  }), []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setShowNotifications(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedRead = window.localStorage.getItem(READ_KEY);
      const storedPinned = window.localStorage.getItem(PINNED_KEY);
      if (storedRead) setReadIds(JSON.parse(storedRead));
      if (storedPinned) setPinnedIds(JSON.parse(storedPinned));
    } catch {
      setReadIds([]);
      setPinnedIds([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(READ_KEY, JSON.stringify(readIds));
  }, [readIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(PINNED_KEY, JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  useEffect(() => {
    if (isOpen && showNotifications) {
      void refresh();
    }
  }, [isOpen, showNotifications, refresh]);

  // Handle click outside to close notifications or menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if click is on the overlay (outside menu panel)
      const isOverlayClick = target.closest('[data-menu-overlay]') !== null;
      
      // Check if click is inside notifications popup
      const isNotificationsClick = target.closest('[data-notifications-popup]') !== null;
      
      // Check if click is on the updates button
      const isUpdatesButtonClick = target.closest('[data-updates-button]') !== null;
      
      if (showNotifications && !isNotificationsClick && !isUpdatesButtonClick) {
        // Clicked outside notifications popup but potentially inside menu
        setShowNotifications(false);
      }
      
      // If clicking on overlay (outside menu panel), close menu (which also closes notifications)
      if (isOverlayClick) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
      return () => document.removeEventListener('pointerdown', handleClickOutside);
    }
  }, [isOpen, showNotifications, onClose]);

  // Touch gesture handlers for swipe-to-close
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 80;
    
    // Swipe left to close (when swiping from right edge inward)
    if (diff > minSwipeDistance && touchStartX.current > window.innerWidth - 100) {
      onClose();
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  }, [onClose]);

  // Panel animation variants with reduced motion support
  const adjustedPanelVariants = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        closed: { opacity: 0, x: 0 },
        open: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 0 },
      };
    }
    return panelVariants;
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
            {/* Full-screen dark overlay - pre-blurred gradient for performance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
            data-menu-overlay
            className="fixed inset-0 z-[120]"
            style={{
              background: 'linear-gradient(135deg, rgba(13,13,13,0.98) 0%, rgba(20,20,25,0.95) 100%)',
            }}
          />

          {/* Right panel */}
          <motion.div
            ref={panelRef}
            variants={adjustedPanelVariants}
            initial="closed"
            animate="open"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            exit="exit"
            className="fixed top-0 right-0 h-screen z-[130] w-[min(520px,90vw)] bg-[#0D0D0D] border-l border-[#1a1a1a] flex flex-col"
            style={{ willChange: 'transform' }}
          >
            {/* Ambient glow - simplified */}
            <div
              className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-[0.03]"
              style={{
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, transparent 70%)',
              }}
            />

            {/* Top bar - Notification button */}
            <div className="px-8 py-4 flex justify-end items-center border-b border-[#1a1a1a]/50 flex-shrink-0">
              <button
                data-updates-button
                onClick={toggleNotifications}
                className="group flex items-center gap-3 rounded-full border border-[#272727] bg-[#121212] px-4 py-2 hover:border-[#6366f1]/50 transition-colors duration-200"
                onMouseEnter={handleUpdatesEnter}
                onMouseLeave={handleUpdatesLeave}
              >
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-[#6366f1] animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#6366f1]/20 rounded-full animate-ping" />
                </div>
                <span className="font-mono text-[10px] tracking-[0.2em] text-[#F2F2F0] uppercase">
                  Updates
                </span>
                <span className="font-mono text-[9px] text-[#6366f1] bg-[#6366f1]/10 px-1.5 py-0.5 rounded">
                  {visibleUpdates.length}
                </span>
              </button>
            </div>

            {/* Notifications Popup - Redesigned */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  data-notifications-popup
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-20 right-6 md:right-8 w-[min(380px,85vw)] bg-[#111111]/95 backdrop-blur-md border border-[#1a1a1a] rounded-xl z-[140] overflow-hidden shadow-2xl"
                  style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
                >
                  {/* Header with title and actions */}
                  <div className="px-5 py-4 border-b border-[#1f1f1f] flex items-center justify-between bg-[#0D0D0D]/70">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-[#6366f1] animate-pulse" />
                        {isRealtime && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#6366f1]/20 rounded-full animate-ping" />
                        )}
                      </div>
                      <span className="font-mono text-[11px] tracking-[0.2em] text-[#B4B4AE] uppercase">Update Center</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {readIds.length > 0 && (
                        <button
                          onClick={clearRead}
                          className="text-[#666] hover:text-[#F2F2F0] transition-colors px-2 py-1 rounded text-[9px] uppercase tracking-[0.12em]"
                          title="Clear read history"
                        >
                          Clear read
                        </button>
                      )}
                      <button
                        onClick={refresh}
                        disabled={isLoading}
                        className="text-[#555] hover:text-[#6366f1] transition-colors p-1.5 rounded-full hover:bg-[#1a1a1a] disabled:opacity-50"
                        title="Refresh"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={closeNotifications}
                        className="text-[#555] hover:text-[#F2F2F0] transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#1a1a1a]"
                      >
                        <span className="text-lg leading-none">×</span>
                      </button>
                    </div>
                  </div>

                  {/* Featured Banner - Priority Update */}
                  {featuredUpdate && (
                    <div className="px-5 py-4 border-b border-[#1a1a1a] bg-gradient-to-r from-[#6366f1]/10 via-transparent to-[#6366f1]/5">
                      <Link
                        href={featuredUpdate.url || '/'}
                        onClick={() => handleUpdateClick(featuredUpdate)}
                        target={featuredUpdate.external ? '_blank' : undefined}
                        rel={featuredUpdate.external ? 'noopener noreferrer' : undefined}
                        className="group block"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#6366f1] mt-1.5 shrink-0 animate-pulse" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-[9px] tracking-[0.15em] text-[#6366f1] uppercase bg-[#6366f1]/10 px-1.5 py-0.5 rounded">
                                Featured
                              </span>
                              {featuredUpdate.badge && (
                                <span className="font-mono text-[9px] tracking-[0.15em] text-[#E8A35C] uppercase">
                                  {featuredUpdate.badge}
                                </span>
                              )}
                            </div>
                            <p className="font-sans text-[15px] text-[#F2F2F0] group-hover:text-[#6366f1] transition-colors leading-snug font-medium">
                              {featuredUpdate.title}
                            </p>
                            {featuredUpdate.description && (
                              <p className="font-sans text-[13px] text-[#8A8A85] mt-1 leading-snug">
                                {featuredUpdate.description}
                              </p>
                            )}
                            <span className="font-mono text-[10px] text-[#555] uppercase tracking-[0.1em] mt-2 block">
                              {formatRelativeTime(featuredUpdate.date)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )}

                  <div className="px-5 py-3 border-b border-[#1f1f1f] bg-[#0D0D0D]/60 flex items-center justify-between gap-3">
                    <span className="font-mono text-[9px] tracking-[0.18em] text-[#666] uppercase">
                      Real-time updates
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.14em] text-[#6366f1] uppercase">
                      {pinnedIds.length} pinned
                    </span>
                  </div>

                  {/* Updates List */}
                  <div className="max-h-[280px] overflow-y-auto">
                    {isLoading && visibleUpdates.length === 0 ? (
                      // Skeleton loaders
                      <div className="p-5 space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#1a1a1a] mt-2 shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-[#1a1a1a] rounded w-3/4 animate-pulse" />
                              <div className="h-3 bg-[#1a1a1a] rounded w-1/2 animate-pulse" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : visibleUpdates.length === 0 ? (
                      <div className="px-5 py-8 text-center">
                        <span className="font-mono text-[11px] text-[#555] uppercase tracking-[0.15em]">All caught up</span>
                      </div>
                    ) : (
                      visibleUpdates.slice(0, 8).map((update, i) => (
                        <motion.div
                          key={update.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.3 }}
                        >
                          <Link
                            href={update.url || '/'}
                            onClick={() => handleUpdateClick(update)}
                            target={update.external ? '_blank' : undefined}
                            rel={update.external ? 'noopener noreferrer' : undefined}
                            className="block px-5 py-3 border-b border-[#1a1a1a] last:border-b-0 hover:bg-[#1a1a1a]/30 transition-colors group"
                            onMouseEnter={() => setCursorState('hover')}
                            onMouseLeave={() => setCursorState('default')}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 transition-transform group-hover:scale-125 ${
                                update.type === 'social' ? 'bg-[#06b6d4]' :
                                update.type === 'website' ? 'bg-[#22c55e]' :
                                update.type === 'venture' ? 'bg-[#a855f7]' :
                                'bg-[#6366f1]'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-sans text-[13px] text-[#F2F2F0] group-hover:text-[#6366f1] transition-colors leading-snug">
                                    {update.title}
                                  </p>
                                  {update.badge && (
                                    <span className="font-mono text-[8px] tracking-[0.15em] text-[#6366f1] bg-[#6366f1]/10 px-1.5 py-0.5 rounded uppercase">
                                      {update.badge}
                                    </span>
                                  )}
                                </div>
                                {update.description && (
                                  <p className="font-sans text-[12px] text-[#666] mt-0.5 leading-snug line-clamp-2">
                                    {update.description}
                                  </p>
                                )}
                                <span className="font-mono text-[9px] text-[#444] uppercase tracking-[0.1em] mt-1.5 block">
                                  {formatRelativeTime(update.date)}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  togglePin(update.id);
                                }}
                                className="shrink-0 p-1.5 rounded-full text-[#555] hover:text-[#F2F2F0] hover:bg-[#1a1a1a] transition-colors"
                                aria-label={pinnedIds.includes(update.id) ? 'Remove pinned update' : 'Pin update'}
                                title={pinnedIds.includes(update.id) ? 'Unpin' : 'Pin'}
                              >
                                {pinnedIds.includes(update.id) ? (
                                  <PinOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Pin className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </Link>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 border-t border-[#1a1a1a] bg-[#0D0D0D]/50 flex items-center justify-between">
                    <span className="font-mono text-[9px] text-[#444] uppercase tracking-[0.15em]">
                      {isRealtime ? 'Real-time feed active' : 'Updates refresh every minute'}
                    </span>
                    {isLoading && (
                      <span className="font-mono text-[9px] text-[#6366f1] uppercase tracking-[0.15em]">Syncing...</span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content Area - Navigation fills space and centers */}
            <div className="flex-1 flex flex-col justify-center px-8 overflow-hidden min-h-0">
                {/* Navigation Links - Steve Jobs Style */}
                <motion.nav
                  variants={linkContainerVariants}
                  initial="closed"
                  animate="open"
                  exit="exit"
                  className="flex flex-col"
                >
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.name}
                      variants={linkVariants}
                      className="relative"
                      onMouseEnter={createNavEnterHandler(index)}
                      onMouseLeave={createNavLeaveHandler()}
                    >
                      <Link
                        href={link.href}
                        onClick={handleLinkClick}
                        className="group flex items-center justify-between py-6 border-b border-[#1a1a1a] last:border-b-0 relative overflow-hidden"
                      >
                        {/* Animated background fill from left */}
                        <div
                          className="absolute inset-0 transition-transform duration-300 ease-out"
                          style={getNavBgStyle(hoveredIndex === index, link.hoverColor)}
                        />

                        {/* Left Content */}
                        <div className="flex items-center gap-6 relative z-10">
                          {/* Number with circle on hover */}
                          <div className="relative flex items-center justify-center w-10">
                            <span 
                              className="font-mono text-[11px] tracking-[0.15em] transition-colors duration-200"
                              style={getNavNumberStyle(hoveredIndex === index, link.hoverColor)}
                            >
                              {link.number}
                            </span>
                            <div
                              className="absolute inset-0 rounded-full border transition-all duration-200 flex items-center justify-center pointer-events-none"
                              style={getNavCircleStyle(hoveredIndex === index, link.hoverColor)}
                            />
                          </div>

                          {/* Title */}
                          <div className="flex flex-col">
                            <span 
                              className="font-display text-[clamp(2.25rem,4.5vw,3.25rem)] uppercase leading-[0.9] tracking-tight transition-all duration-200"
                              style={getNavTitleStyle(hoveredIndex === index)}
                            >
                              {link.name}
                            </span>
                          </div>
                        </div>

                        {/* Right - Arrow with rotation */}
                        <div
                          className="relative z-10 transition-all duration-200"
                          style={getNavArrowContainerStyle(hoveredIndex === index)}
                        >
                          <div 
                            className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors duration-200"
                            style={getNavArrowCircleStyle(hoveredIndex === index, link.hoverColor)}
                          >
                            <ArrowUpRight 
                              className="w-5 h-5 transition-colors duration-200" 
                              style={getNavArrowIconStyle(hoveredIndex === index, link.hoverColor)}
                            />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.nav>
            </div>

            {/* Contact Card - At bottom above footer - CSS-only hover for performance */}
            <Link
              href="/contact"
              onClick={handleLinkClick}
              className="group block border-t border-[#1a1a1a] relative overflow-hidden flex-shrink-0"
            >
              {/* Background gradient on hover - CSS only */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/10 via-transparent to-[#6366f1]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10 px-8 py-5 flex items-center justify-between">
                {/* Left - Contact Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-[#333] group-hover:border-[#6366f1]/60 flex items-center justify-center transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                    <Mail className="w-5 h-5 text-[#6366f1]" strokeWidth={1.5} />
                  </div>
                  
                  <div>
                    <span className="font-display text-xl text-[#F2F2F0] uppercase tracking-tight block transition-transform duration-200 group-hover:translate-x-1">
                      Get in Touch
                    </span>
                    <span className="font-mono text-[10px] text-[#666] tracking-[0.2em] uppercase">
                      Open for projects
                    </span>
                  </div>
                </div>

                {/* Right - Arrow */}
                <div className="transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 opacity-50">
                  <ArrowUpRight className="w-6 h-6 text-[#6366f1]" />
                </div>
              </div>
            </Link>

            {/* Footer - At very bottom */}
            <div className="border-t border-[#1a1a1a] overflow-hidden flex-shrink-0" style={{ willChange: 'transform' }}>
              {hasRecentUpdates ? (
                // Show real-time updates ticker - optimized marquee
                <div 
                  className="relative overflow-hidden py-3 group"
                  onMouseEnter={(e) => {
                    const marquee = e.currentTarget.querySelector('.marquee-content') as HTMLElement;
                    if (marquee) marquee.style.animationPlayState = 'paused';
                  }}
                  onMouseLeave={(e) => {
                    const marquee = e.currentTarget.querySelector('.marquee-content') as HTMLElement;
                    if (marquee) marquee.style.animationPlayState = 'running';
                  }}
                >
                  <div 
                    className="marquee-content flex animate-marquee-left"
                    style={{ 
                      willChange: 'transform',
                      animationDuration: '40s',
                    }}
                  >
                    {/* Duplicate content 3x for seamless loop */}
                    {[...Array(3)].map((_, setIndex) => (
                      <div key={setIndex} className="flex items-center shrink-0">
                        {updates.slice(0, 5).map((update) => (
                          <Link
                            key={`${setIndex}-${update.id}`}
                            href={update.url || '/'}
                            onClick={update.external ? undefined : handleLinkClick}
                            target={update.external ? '_blank' : undefined}
                            rel={update.external ? 'noopener noreferrer' : undefined}
                            className="flex items-center gap-3 mx-8 group/item cursor-pointer"
                          >
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-transform group-hover/item:scale-125 ${
                              update.type === 'social' ? 'bg-[#06b6d4]' :
                              update.type === 'website' ? 'bg-[#22c55e]' :
                              update.type === 'venture' ? 'bg-[#a855f7]' :
                              'bg-[#6366f1]'
                            }`} />
                            <span className="font-mono text-[10px] tracking-[0.15em] text-[#666] uppercase group-hover/item:text-[#8A8A85] transition-colors">
                              {update.title}
                            </span>
                            <span className="font-mono text-[9px] text-[#444]">
                              {formatRelativeTime(update.date)}
                            </span>
                            {update.badge && (
                              <span className="font-mono text-[7px] tracking-[0.1em] text-[#6366f1] uppercase">
                                {update.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Show email + daily quote ticker
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuote}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-center gap-4 px-8 py-3"
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <Mail className="w-3.5 h-3.5 text-[#6366f1]" />
                        <span className="font-mono text-[11px] tracking-[0.1em] text-[#F2F2F0]">
                          pratt@pratt.work
                        </span>
                      </div>
                      <div className="w-[1px] h-4 bg-[#1a1a1a]" />
                      <div className="flex items-center gap-2">
                        <Quote className="w-3 h-3 text-[#444]" />
                        <span className="font-sans text-[13px] text-[#666] italic">
                          &ldquo;{dailyQuotes[currentQuote]}&rdquo;
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Quote indicators */}
                  <div className="flex justify-center gap-1 pb-2">
                    {dailyQuotes.map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full transition-all duration-200"
                        style={{
                          backgroundColor: i === currentQuote ? '#6366f1' : '#1a1a1a',
                          transform: i === currentQuote ? 'scale(1.2)' : 'scale(1)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
