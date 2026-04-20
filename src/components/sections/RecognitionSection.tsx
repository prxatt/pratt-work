'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCursor } from '@/context/CursorContext';
import Image from 'next/image';
import { getImageUrl, getVideoUrl } from '@/lib/media';

type IconComponent = React.ComponentType<{ className?: string }>;

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const X: IconComponent = ({ className }) => (
  <svg className={className} {...iconProps}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
const Play: IconComponent = ({ className }) => (
  <svg className={className} {...iconProps}><path d="m8 5 11 7-11 7z" /></svg>
);
const Pause: IconComponent = ({ className }) => (
  <svg className={className} {...iconProps}><path d="M10 4v16M14 4v16" /></svg>
);
const Volume2: IconComponent = ({ className }) => (
  <svg className={className} {...iconProps}><path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 6a9 9 0 0 1 0 12" /></svg>
);
const VolumeX: IconComponent = ({ className }) => (
  <svg className={className} {...iconProps}><path d="M11 5 6 9H3v6h3l5 4zM22 9l-6 6M16 9l6 6" /></svg>
);
const Trophy: IconComponent = ({ className }) => (
  <svg className={className} {...iconProps}><path d="M8 4h8v3a4 4 0 0 1-8 0zM6 7H4a2 2 0 0 0 2 2M18 7h2a2 2 0 0 1-2 2M12 11v4M9 19h6" /></svg>
);
const Film: IconComponent = ({ className }) => (
  <svg className={className} {...iconProps}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 3v18M17 3v18M3 7h18M3 17h18" /></svg>
);
const Award: IconComponent = ({ className }) => (
  <svg className={className} {...iconProps}><circle cx="12" cy="8" r="4" /><path d="m8 14 1.5 6L12 18l2.5 2 1.5-6" /></svg>
);
const BarChart3: IconComponent = ({ className }) => (
  <svg className={className} {...iconProps}><path d="M3 3v18h18" /><path d="M8 14v4M12 10v8M16 6v12" /></svg>
);

interface Award {
  id: string;
  year: string;
  organization: string;
  project: string;
  role: string;
  details: string;
  fullDescription: string;
  impact: string[];
  icon: IconComponent;
  image: string;
}

const awards: Award[] = [
  {
    id: '[1]',
    year: '2017-2026',
    organization: 'CLIENT RESULTS',
    project: 'IMPACT METRICS',
    role: '75% RETENTION | $1M+ BUDGETS | 15K+ ATTENDEES',
    details: 'Proven track record delivering high-stakes productions with consistent results.',
    fullDescription: 'Over nearly a decade of creative technology and production leadership, maintaining a 75% client retention rate across 50+ projects. Successfully managed budgets exceeding $1M and events reaching 15,000+ attendees, with zero major incidents or budget overruns.',
    impact: ['75% client retention rate', '$1M+ budgets managed', '15K+ attendees reached', '50+ projects delivered', 'Zero major incidents'],
    icon: BarChart3,
    image: '',
  },
  {
    id: '[2]',
    year: '2024',
    organization: 'SHORTS.TV',
    project: 'ALONE',
    role: '3 YEAR TV LICENSING DEAL',
    details: 'Negotiated and secured a multi-year global distribution agreement.',
    fullDescription: 'Negotiated a landmark 3-year exclusive licensing agreement with Shorts.TV, the world\'s largest short film broadcaster reaching 40M+ homes globally. Structured deal to include backend participation and international rights retention.',
    impact: ['40M+ households reached', '3-year exclusive term', 'International rights retained', 'Backend revenue participation'],
    icon: Film,
    image: getImageUrl('/recognition/alone-poster.jpg', 400),
  },
  {
    id: '[3]',
    year: '2021',
    organization: 'SXSW',
    project: 'WOMEN IS LOSERS',
    role: 'OFFICIAL SELECTION | UNIT PRODUCTION SUPERVISOR',
    details: 'Managed complex production logistics for a high-profile independent film premiere.',
    fullDescription: 'Led production supervision and transportation coordination for the SXSW Official Selection "Women Is Losers," coordinating a 40+ person crew across 19 shooting days. Managed $1.2M budget, secured 8 location permits, and sourced vintage and historic vehicles for period accuracy to deliver on schedule.',
    impact: ['40+ person crew coordinated', '$1.2M budget managed', '19-day production schedule', '8 location permits + vintage vehicles', 'Zero production delays'],
    icon: Trophy,
    image: getImageUrl('/recognition/women-is-losers-poster.jpg', 400),
  },
  {
    id: '[4]',
    year: '2021',
    organization: 'NEXT UP FESTIVAL',
    project: 'SYNCHRONICITY',
    role: 'NOMINEE FOR BEST SHORT',
    details: 'Recognized for technical excellence in a competitive international field.',
    fullDescription: 'Earned nomination in the Best Short Documentary category at Next Up Festival for "Synchronicity," a documentary exploring the musical journey of artist Christopher Willits. Competed against 200+ international entries with recognition specifically cited for innovative storytelling and seamless integration of visual and audio elements.',
    impact: ['Top 5 of 200+ entries', 'Best Short Documentary nomination', 'Musical journey storytelling', 'Visual-audio integration praised'],
    icon: Award,
    image: getImageUrl('/recognition/synchronicity-poster.jpg', 400),
  },
];

const CinemaModeOverlay = ({
  isOpen,
  onClose,
  title,
  poster,
  video,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  poster: string;
  video: { mp4: string; webm: string };
}) => {
  const [volume, setVolume] = useState(0.4);
  const [muted, setMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const isScrubbingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    node.volume = muted ? 0 : volume;
    node.muted = muted;
  }, [muted, volume]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentTime(0);
      setDuration(0);
      setMuted(false);
      setVolume(0.4);
      setIsPlaying(true);
      return;
    }
    const node = videoRef.current;
    if (!node) return;
    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(node.duration) ? node.duration : 0);
    };
    const handleTimeUpdate = () => {
      if (isScrubbingRef.current) return;
      setCurrentTime(node.currentTime);
    };
    node.addEventListener('loadedmetadata', handleLoadedMetadata);
    node.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      node.removeEventListener('loadedmetadata', handleLoadedMetadata);
      node.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const node = containerRef.current;
    void node.requestFullscreen?.();
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 0.4;
    void video.play().catch(() => {});
    return () => {
      if (document.fullscreenElement) {
        void document.exitFullscreen?.();
      }
    };
  }, [isOpen]);

  const togglePlayback = () => {
    const node = videoRef.current;
    if (!node) return;
    if (node.paused) {
      void node.play();
      setIsPlaying(true);
    } else {
      node.pause();
      setIsPlaying(false);
    }
  };

  const handleTimelineChange = (nextTime: number) => {
    const node = videoRef.current;
    if (!node) return;
    node.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
      className="fixed inset-0 z-[400] bg-black/95"
      onClick={onClose}
    >
      <div className="absolute inset-0 pointer-events-auto" onClick={onClose} />
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full max-w-[min(94vw,1200px)] h-[min(72vh,760px)]">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={muted}
          preload="metadata"
          playsInline
          poster={poster}
          className="absolute inset-0 w-full h-full object-contain pointer-events-auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlayback}
        >
          <source src={video.mp4} type="video/mp4" />
          <source src={video.webm} type="video/webm" />
        </video>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/45 via-black/10 to-black/30 rounded-lg" />

        <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between gap-3 z-10 pointer-events-auto">
          <span className="font-mono text-[10px] sm:text-xs tracking-[0.2em] uppercase text-[#c7c7c2]">
            Cinema Mode — {title}
          </span>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-white/25 bg-black/35 flex items-center justify-center hover:border-white/45 transition-colors"
            aria-label="Close cinema mode"
          >
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-10 rounded-xl border border-white/15 bg-black/55 p-3 pointer-events-auto">
          <div className="mb-2 flex items-center gap-3">
            <span className="font-mono text-[10px] text-white/60 tabular-nums min-w-[2.25rem]">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || 0)}
              onPointerDown={() => {
                isScrubbingRef.current = true;
              }}
              onPointerUp={(e) => {
                const next = Number((e.target as HTMLInputElement).value);
                handleTimelineChange(next);
                isScrubbingRef.current = false;
              }}
              onChange={(e) => {
                const next = Number(e.target.value);
                handleTimelineChange(next);
              }}
              className="flex-1 accent-[#f59e0b]"
              aria-label="Timeline"
            />
            <span className="font-mono text-[10px] text-white/60 tabular-nums min-w-[2.25rem] text-right">
              {formatTime(duration)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
          <button
            onClick={togglePlayback}
            className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-[#f59e0b]/70 transition-colors"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-white/80" /> : <Play className="w-4 h-4 text-white/80" />}
          </button>
          <button
            onClick={() => setMuted((prev) => !prev)}
            className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-[#f59e0b]/70 transition-colors"
            aria-label={muted ? 'Unmute video' : 'Mute video'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-white/80" /> : <Volume2 className="w-4 h-4 text-white/80" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => {
              const next = Number(e.target.value);
              setVolume(next);
              if (next > 0 && muted) setMuted(false);
            }}
            className="w-20 sm:w-28 accent-[#f59e0b]"
            aria-label="Volume"
          />
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
};

// Cinematic Modal for ALONE Film
const AloneModal = ({ onClose }: { onClose: () => void }) => {
  const [cinemaOpen, setCinemaOpen] = React.useState(false);
  const trailerRef = useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (cinemaOpen) {
        setCinemaOpen(false);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [cinemaOpen, onClose]);

  React.useEffect(() => {
    const node = trailerRef.current;
    if (!node) return;
    if (cinemaOpen) node.pause();
    else void node.play().catch(() => {});
  }, [cinemaOpen]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] bg-black overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="min-h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="fixed top-8 right-8 z-50 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:border-[#f59e0b] hover:bg-white/5 transition-all duration-300 group backdrop-blur-sm"
        >
          <X className="w-6 h-6 text-white/60 group-hover:text-[#f59e0b] transition-colors" />
        </button>

        {/* Cinematic Header - 70vh with video trailer as background */}
        <div className="relative h-[70vh] overflow-hidden">
          {/* Video trailer background - autoplaying, looping, muted */}
          <div className="absolute inset-0 z-0">
            <video
              ref={trailerRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
              poster={getImageUrl('/recognition/alone-poster.jpg', 1920)}
            >
              <source src={getVideoUrl('/recognition/alone-trailer.mp4')} type="video/mp4" />
              <source src={getVideoUrl('/recognition/alone-trailer.webm')} type="video/webm" />
            </video>
          </div>
          
          {/* Cinematic overlay layer on top of video */}
          <div className="absolute inset-0 z-[1] bg-[#0a0a0a]/40">
            {/* Cinematic gradient overlay simulating film noir atmosphere */}
            <div 
              className="absolute inset-0 opacity-60"
              style={{
                background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.9) 0%, rgba(10, 10, 15, 0.95) 50%, rgba(5, 5, 8, 1) 100%)'
              }}
            />
            {/* Film grain texture */}
            <div className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />
            {/* Gradient overlays for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
          </div>

          {/* Content layer - z-10 to appear above video */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16 z-10">
            <div className="flex items-end gap-6 md:gap-10 max-w-7xl mx-auto">
              {/* Portrait Poster Frame with actual image - above video */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="w-32 h-48 md:w-44 md:h-64 lg:w-52 lg:h-80 bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] border border-[#2a2a3a] rounded-lg overflow-hidden flex-shrink-0 shadow-2xl relative z-20"
              >
                <Image
                  src={getImageUrl('/recognition/alone-poster.jpg', 800)}
                  alt="ALONE - Film Poster"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 128px, (max-width: 1024px) 176px, 208px"
                  loading="lazy"
                  priority={false}
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="absolute inset-0 flex flex-col items-center justify-center p-4">
                          <span class="font-display text-2xl md:text-3xl lg:text-4xl text-white/90 tracking-[0.15em] uppercase">ALONE</span>
                          <div class="mt-4 w-12 h-px bg-white/30"></div>
                          <span class="font-mono text-[8px] md:text-[9px] text-white/40 uppercase tracking-widest mt-3 text-center">A FILM BY<br/>PRATT MAJMUDAR</span>
                        </div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
                      `;
                    }
                  }}
                />
              </motion.div>

              {/* Title and Info */}
              <div className="flex-grow pb-2 md:pb-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex items-center gap-3 mb-3"
                >
                  <span className="font-mono text-sm text-[#f59e0b]">/2024</span>
                  <span className="font-mono text-xs text-[#8A8A85] uppercase tracking-wider">Short Film</span>
                  <span className="font-mono text-xs text-[#6b7280]">•</span>
                  <span className="font-mono text-xs text-[#8A8A85] uppercase tracking-wider">Drama, Mystery</span>
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="font-display text-5xl md:text-6xl lg:text-8xl text-white uppercase leading-[0.9] tracking-tight"
                >
                  ALONE
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="font-mono text-sm text-[#8A8A85] mt-4 uppercase tracking-wider"
                >
                  Written & Directed by Pratt Majmudar
                </motion.p>
                <button
                  onClick={() => setCinemaOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#f59e0b]/45 bg-black/35 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2f2f0] hover:border-[#f59e0b] hover:bg-black/55 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  Enter Cinema Mode
                </button>
              </div>

              {/* Distribution Badges */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-col gap-3 flex-shrink-0"
              >
                {/* Amazon Prime Video Badge */}
                <div className="bg-[#00A8E1] text-black font-bold px-4 py-2.5 rounded text-xs uppercase tracking-wider shadow-lg flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  prime video
                </div>
                {/* Shorts.TV Badge */}
                <div className="bg-[#f59e0b] text-black font-bold px-4 py-2.5 rounded text-xs uppercase tracking-wider shadow-lg">
                  shorts.tv
                </div>
                {/* Global reach indicator */}
                <div className="text-right">
                  <span className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider block">Global Reach</span>
                  <span className="font-mono text-sm text-[#f59e0b] font-bold">40M+ Homes</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="px-8 md:px-12 lg:px-16 py-12 md:py-16 max-w-6xl mx-auto">
          {/* Synopsis Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-12"
          >
            <h3 className="font-mono text-xs text-[#6b7280] uppercase tracking-[0.25em] mb-4">
              Synopsis
            </h3>
            <p className="font-sans text-lg md:text-xl text-[#8A8A85] leading-relaxed max-w-4xl italic border-l-2 border-[#f59e0b]/30 pl-6">
              &ldquo;Holed up in his apartment and clinging to the last remnant of his sanity, 
              Roy, an insomniac writer struggles to keep a grasp on reality.&rdquo;
            </p>
          </motion.div>

          {/* Distribution Story */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mb-12"
          >
            <h3 className="font-mono text-xs text-[#6b7280] uppercase tracking-[0.25em] mb-4">
              Distribution Journey
            </h3>
            <p className="font-sans text-base text-[#8A8A85] leading-relaxed max-w-4xl">
              Secured a landmark <span className="text-[#f59e0b] font-semibold">3-year exclusive licensing agreement</span> with Shorts.TV, 
              the world&apos;s largest short film broadcaster. The deal included backend participation and 
              international rights retention. Now streaming globally on <span className="text-[#00A8E1] font-semibold">Amazon Prime Video</span>, 
              reaching 40 million+ households worldwide.
            </p>
          </motion.div>

          {/* Film Credits Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <h3 className="font-mono text-xs text-[#6b7280] uppercase tracking-[0.25em] mb-6">
              Credits
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="border-l border-[#2a2a3a] pl-4">
                <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider mb-1">Director</p>
                <p className="font-mono text-sm text-[#f59e0b] uppercase">Pratt Majmudar</p>
              </div>
              <div className="border-l border-[#2a2a3a] pl-4">
                <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider mb-1">Writer</p>
                <p className="font-mono text-sm text-[#f59e0b] uppercase">Pratt Majmudar</p>
              </div>
              <div className="border-l border-[#2a2a3a] pl-4">
                <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider mb-1">Starring</p>
                <p className="font-mono text-sm text-[#f59e0b] uppercase">Gonzalo Borras</p>
                <p className="font-mono text-xs text-[#6b7280] mt-0.5">as Roy Clark</p>
              </div>
              <div className="border-l border-[#2a2a3a] pl-4">
                <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider mb-1">Genre</p>
                <p className="font-mono text-sm text-[#f59e0b] uppercase">Drama, Mystery</p>
              </div>
            </div>
          </motion.div>

          {/* Impact Metrics - Film Style */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-12 pt-8 border-t border-[#2a2a3a]"
          >
            <h4 className="font-mono text-xs text-[#6b7280] uppercase tracking-[0.2em] mb-6">
              Distribution Metrics
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Global Reach', value: '40M+ Households' },
                { label: 'Exclusive Term', value: '3 Years' },
                { label: 'Platform', value: 'Shorts.TV + Prime' },
                { label: 'Deal Type', value: 'Backend + Rights' },
              ].map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 + idx * 0.1 }}
                  className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-xl p-5 border border-[#2a2a3a] hover:border-[#f59e0b]/50 transition-colors"
                >
                  <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider mb-2">{metric.label}</p>
                  <p className="font-mono text-sm text-[#f59e0b] uppercase leading-relaxed">{metric.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom close */}
        <div className="px-8 md:px-12 lg:px-16 py-12 border-t border-[#2a2a3a]">
          <button
            onClick={onClose}
            className="font-mono text-xs text-[#6b7280] uppercase tracking-wider hover:text-[#f59e0b] transition-colors flex items-center gap-2 group max-w-6xl mx-auto w-full"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 
            RETURN TO RECOGNITION
          </button>
        </div>

        <AnimatePresence>
          {cinemaOpen && (
            <CinemaModeOverlay
              isOpen={cinemaOpen}
              onClose={() => setCinemaOpen(false)}
              title="ALONE"
              poster={getImageUrl('/recognition/alone-poster.jpg', 1920)}
              video={{
                mp4: getVideoUrl('/recognition/alone-trailer.mp4'),
                webm: getVideoUrl('/recognition/alone-trailer.webm'),
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// Cinematic Modal for WOMEN IS LOSERS — SXSW Festival Premiere
const WomenIsLosersModal = ({ onClose }: { onClose: () => void }) => {
  const [cinemaOpen, setCinemaOpen] = React.useState(false);
  const trailerRef = useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (cinemaOpen) {
        setCinemaOpen(false);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [cinemaOpen, onClose]);

  React.useEffect(() => {
    const node = trailerRef.current;
    if (!node) return;
    if (cinemaOpen) node.pause();
    else void node.play().catch(() => {});
  }, [cinemaOpen]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] bg-[#0a0a0a] overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="min-h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="fixed top-8 right-8 z-50 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:border-[#f59e0b] hover:bg-white/5 transition-all duration-300 group backdrop-blur-sm"
        >
          <X className="w-6 h-6 text-white/60 group-hover:text-[#f59e0b] transition-colors" />
        </button>

        {/* Festival Header — 70vh with video trailer as background */}
        <div className="relative h-[70vh] overflow-hidden">
          {/* Video trailer background - autoplaying, looping, muted */}
          <div className="absolute inset-0 z-0">
            <video
              ref={trailerRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
              poster={getImageUrl('/recognition/women-is-losers-poster.jpg', 1920)}
            >
              <source src={getVideoUrl('/recognition/women-is-losers-trailer.mp4')} type="video/mp4" />
              <source src={getVideoUrl('/recognition/women-is-losers-trailer.webm')} type="video/webm" />
            </video>
          </div>
          
          {/* Warm 1960s San Francisco atmosphere overlay */}
          <div className="absolute inset-0 z-[1] bg-[#1a1510]/40">
            {/* Warm amber gradient suggesting Golden Hour */}
            <div 
              className="absolute inset-0 opacity-70"
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(120, 53, 15, 0.2) 30%, rgba(10, 10, 10, 0.9) 70%, rgba(5, 5, 5, 1) 100%)'
              }}
            />
            {/* Film grain texture */}
            <div className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
          </div>

          {/* Content layer - z-10 to appear above video */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16 z-10">
            <div className="flex items-end gap-6 md:gap-10 max-w-7xl mx-auto">
              {/* Women Is Losers Film Poster - above video */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="w-32 h-48 md:w-44 md:h-64 lg:w-52 lg:h-80 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-2 border-[#f59e0b] rounded-lg overflow-hidden flex-shrink-0 shadow-2xl relative z-20"
              >
                <Image
                  src={getImageUrl('/recognition/women-is-losers-poster.jpg', 800)}
                  alt="Women Is Losers - Film Poster"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 128px, (max-width: 1024px) 176px, 208px"
                  loading="lazy"
                  priority={false}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="absolute inset-0 flex flex-col items-center justify-center p-4">
                          <span class="font-mono text-[10px] text-[#f59e0b] uppercase tracking-[0.3em] mb-2">Official</span>
                          <span class="font-display text-3xl md:text-4xl lg:text-5xl text-white tracking-tight uppercase">SXSW</span>
                          <span class="font-mono text-lg md:text-xl text-[#f59e0b] mt-1">2021</span>
                          <span class="font-mono text-[9px] text-[#8A8A85] uppercase tracking-widest mt-4 text-center leading-relaxed">Film<br/>Festival</span>
                        </div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"></div>
                      `;
                    }
                  }}
                />
              </motion.div>

              {/* Title and Info */}
              <div className="flex-grow pb-2 md:pb-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex items-center gap-3 mb-3"
                >
                  <span className="font-mono text-sm text-[#f59e0b]">/2021</span>
                  <span className="font-mono text-xs text-[#8A8A85] uppercase tracking-wider">Feature Film</span>
                  <span className="font-mono text-xs text-[#6b7280]">•</span>
                  <span className="font-mono text-xs text-[#8A8A85] uppercase tracking-wider">1960s San Francisco</span>
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="font-display text-4xl md:text-5xl lg:text-7xl text-white uppercase leading-[0.95] tracking-tight"
                >
                  WOMEN IS<br/>LOSERS
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="font-mono text-sm text-[#8A8A85] mt-4 uppercase tracking-wider"
                >
                  Unit Production Supervisor: Pratt Majmudar
                </motion.p>
                <button
                  onClick={() => setCinemaOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#f59e0b]/45 bg-black/35 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2f2f0] hover:border-[#f59e0b] hover:bg-black/55 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  Enter Cinema Mode
                </button>
              </div>

              {/* Distribution Badges */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-col gap-3 flex-shrink-0"
              >
                {/* HBO Max Badge */}
                <div className="bg-gradient-to-r from-[#8B5CF6] to-[#6366f1] text-white font-bold px-4 py-2.5 rounded text-xs uppercase tracking-wider shadow-lg flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                  </svg>
                  hbo max
                </div>
                {/* Festival badge */}
                <div className="bg-[#f59e0b] text-black font-bold px-4 py-2.5 rounded text-xs uppercase tracking-wider shadow-lg text-center">
                  Official Selection
                </div>
                {/* Impact indicator */}
                <div className="text-right">
                  <span className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider block">Social Impact</span>
                  <span className="font-mono text-sm text-[#f59e0b] font-bold">Women&apos;s Rights</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="px-8 md:px-12 lg:px-16 py-12 md:py-16 max-w-6xl mx-auto">
          {/* Synopsis Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-12"
          >
            <h3 className="font-mono text-xs text-[#6b7280] uppercase tracking-[0.25em] mb-4">
              The Film
            </h3>
            <p className="font-sans text-lg md:text-xl text-[#8A8A85] leading-relaxed max-w-4xl italic border-l-2 border-[#f59e0b]/30 pl-6">
              &ldquo;A powerful story of resilience set against the backdrop of 1960s San Francisco.&rdquo;
            </p>
            <p className="font-sans text-base text-[#8A8A85] leading-relaxed max-w-4xl mt-4">
              Premiered at SXSW 2021 and became a timely conversation starter on women&apos;s rights 
              and reproductive health. The film earned critical acclaim for its storytelling and production values, 
              securing distribution on HBO Max and reaching audiences nationwide.
            </p>
          </motion.div>

          {/* Production Challenge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mb-12"
          >
            <h3 className="font-mono text-xs text-[#6b7280] uppercase tracking-[0.25em] mb-4">
              Production Challenge
            </h3>
            <p className="font-sans text-base text-[#8A8A85] leading-relaxed max-w-4xl">
              Shooting a period film across <span className="text-[#f59e0b] font-semibold">San Francisco&apos;s historic neighborhoods</span> 
              required navigating complex city permits, historic district restrictions, and sourcing vintage and historic 
              vehicles for period-accurate 1960s production requirements to deliver on schedule.
            </p>
          </motion.div>

          {/* Production Credits */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <h3 className="font-mono text-xs text-[#6b7280] uppercase tracking-[0.25em] mb-6">
              Production Credits
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="border-l border-[#2a2a3a] pl-4">
                <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider mb-1">Role</p>
                <p className="font-mono text-sm text-[#f59e0b] uppercase">Unit Production Supervisor</p>
              </div>
              <div className="border-l border-[#2a2a3a] pl-4">
                <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider mb-1">Crew Size</p>
                <p className="font-mono text-sm text-[#f59e0b] uppercase">40+ Person Team</p>
              </div>
              <div className="border-l border-[#2a2a3a] pl-4">
                <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider mb-1">Budget</p>
                <p className="font-mono text-sm text-[#f59e0b] uppercase">$1.2M Managed</p>
              </div>
              <div className="border-l border-[#2a2a3a] pl-4">
                <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider mb-1">Schedule</p>
                <p className="font-mono text-sm text-[#f59e0b] uppercase">19 Days · Zero Delays</p>
              </div>
            </div>
          </motion.div>

          {/* Impact Metrics — Film Style */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-12 pt-8 border-t border-[#2a2a3a]"
          >
            <h4 className="font-mono text-xs text-[#6b7280] uppercase tracking-[0.2em] mb-6">
              SXSW Impact
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Crew Coordinated', value: '40+ Person Team' },
                { label: 'Budget Managed', value: '$1.2M' },
                { label: 'Production Schedule', value: '19 Days' },
                { label: 'Production Delays', value: 'Zero' },
              ].map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 + idx * 0.1 }}
                  className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-xl p-5 border border-[#2a2a3a] hover:border-[#f59e0b]/50 transition-colors"
                >
                  <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider mb-2">{metric.label}</p>
                  <p className="font-mono text-sm text-[#f59e0b] uppercase leading-relaxed">{metric.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom close */}
        <div className="px-8 md:px-12 lg:px-16 py-12 border-t border-[#2a2a2a]">
          <button
            onClick={onClose}
            className="font-mono text-xs text-[#6b7280] uppercase tracking-wider hover:text-[#f59e0b] transition-colors flex items-center gap-2 group max-w-6xl mx-auto w-full"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 
            RETURN TO RECOGNITION
          </button>
        </div>

        <AnimatePresence>
          {cinemaOpen && (
            <CinemaModeOverlay
              isOpen={cinemaOpen}
              onClose={() => setCinemaOpen(false)}
              title="WOMEN IS LOSERS"
              poster={getImageUrl('/recognition/women-is-losers-poster.jpg', 1920)}
              video={{
                mp4: getVideoUrl('/recognition/women-is-losers-trailer.mp4'),
                webm: getVideoUrl('/recognition/women-is-losers-trailer.webm'),
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// Command Center Modal for Career Impact — Executive Dashboard
const CareerImpactModal = ({ onClose }: { onClose: () => void }) => {
  const [animatedNumbers, setAnimatedNumbers] = React.useState({
    retention: 0,
    projects: 0,
    years: 0,
  });

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);

    // Animate numbers on mount
    const duration = 1500;
    const steps = 30;
    const interval = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setAnimatedNumbers({
        retention: Math.round(75 * progress),
        projects: Math.round(50 * progress),
        years: Math.round(9 * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => {
      window.removeEventListener('keydown', handleEsc);
      clearInterval(timer);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] bg-[#0a0a0a] overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="min-h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="fixed top-8 right-8 z-50 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:border-[#f59e0b] hover:bg-white/5 transition-all duration-300 group backdrop-blur-sm"
        >
          <X className="w-6 h-6 text-white/60 group-hover:text-[#f59e0b] transition-colors" />
        </button>

        {/* Command Center Header — 65vh with dashboard aesthetic */}
        <div className="relative h-[65vh] overflow-hidden">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[#0a0a0a]">
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(245, 158, 11, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.3) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
              }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/50 via-[#0a0a0a]/80 to-[#0a0a0a]" />
            {/* Accent glow */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#f59e0b]/5 blur-[100px] rounded-full" />
          </div>

          {/* Content layer */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
            <div className="max-w-7xl mx-auto">
              {/* Title row with big metric */}
              <div className="flex items-end justify-between gap-8">
                <div className="flex-grow">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex items-center gap-3 mb-4"
                  >
                    <span className="font-mono text-sm text-[#f59e0b]">/2017-2026</span>
                    <span className="font-mono text-xs text-[#8A8A85] uppercase tracking-wider">Performance Overview</span>
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="font-display text-5xl md:text-6xl lg:text-8xl text-white uppercase leading-[0.9] tracking-tight"
                  >
                    CAREER IMPACT
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="font-mono text-sm text-[#8A8A85] mt-4 uppercase tracking-wider"
                  >
                    Nearly a decade of creative leadership · 50+ projects delivered
                  </motion.p>
                </div>

                {/* Big animated metric */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-right flex-shrink-0"
                >
                  <span className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider block mb-1">Client Retention</span>
                  <span className="font-display text-6xl md:text-7xl lg:text-8xl text-[#f59e0b] font-bold">
                    {animatedNumbers.retention}<span className="text-4xl md:text-5xl">%</span>
                  </span>
                </motion.div>
              </div>

              {/* Mini timeline */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-8 flex items-center gap-4"
              >
                <span className="font-mono text-xs text-[#6b7280]">2017</span>
                <div className="flex-grow h-[2px] bg-[#2a2a3a] relative">
                  <div className="absolute left-0 top-0 h-full w-[90%] bg-gradient-to-r from-[#f59e0b] to-[#f59e0b]/50" />
                  {/* Milestone markers */}
                  <div className="absolute left-[25%] -top-[3px] w-2 h-2 rounded-full bg-[#f59e0b]" />
                  <div className="absolute left-[50%] -top-[3px] w-2 h-2 rounded-full bg-[#f59e0b]" />
                  <div className="absolute left-[75%] -top-[3px] w-2 h-2 rounded-full bg-[#f59e0b]" />
                </div>
                <span className="font-mono text-xs text-[#f59e0b] font-bold">2026</span>
                <span className="font-mono text-xs text-[#8A8A85] ml-2">({animatedNumbers.years} years)</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="px-8 md:px-12 lg:px-16 py-12 md:py-16 max-w-6xl mx-auto">
          {/* Executive Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mb-12"
          >
            <h3 className="font-mono text-xs text-[#6b7280] uppercase tracking-[0.25em] mb-4">
              The Record
            </h3>
            <p className="font-sans text-xl md:text-2xl text-[#8A8A85] leading-relaxed max-w-4xl">
              Nine years. 50+ productions. <span className="text-[#f59e0b] font-semibold">75% of clients return.</span> Not because it&apos;s easy. Because it works. $1M+ budgets. Tight deadlines. No compromises. No disasters.
            </p>
          </motion.div>

          {/* Performance Metrics — Redesigned with narrative */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mb-16"
          >
            <h3 className="font-mono text-xs text-[#6b7280] uppercase tracking-[0.25em] mb-8">
              By The Numbers
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column - The Big Stat */}
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-8 border border-[#2a2a3a] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#f59e0b]/5 blur-[60px] rounded-full" />
                <p className="font-mono text-xs text-[#6b7280] uppercase tracking-[0.2em] mb-2">What Matters Most</p>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="font-display text-7xl md:text-8xl text-[#f59e0b] font-bold leading-none">{animatedNumbers.retention}</span>
                  <span className="font-display text-4xl text-[#f59e0b]">%</span>
                </div>
                <p className="font-sans text-lg text-white mt-4 font-medium">Client Retention</p>
                <p className="font-sans text-sm text-[#6b7280] mt-2 leading-relaxed">
                  Three out of four clients hire me again. In an industry where most relationships end with the invoice, that number speaks volumes.
                </p>
                <div className="mt-6 h-1.5 bg-[#2a2a3a] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#f59e0b] to-[#f59e0b]/60 rounded-full transition-all duration-1000" style={{ width: `${animatedNumbers.retention}%` }} />
                </div>
              </div>

              {/* Right column - Three key stats */}
              <div className="space-y-4">
                {/* Projects */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-xl p-6 border border-[#2a2a3a] flex items-center justify-between group hover:border-[#f59e0b]/30 transition-colors">
                  <div>
                    <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider">Shipped</p>
                    <p className="font-sans text-sm text-[#8A8A85] mt-1">Productions delivered since 2017</p>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-4xl text-white font-bold">{animatedNumbers.projects}</span>
                    <span className="font-mono text-lg text-[#8A8A85]">+</span>
                  </div>
                </div>

                {/* Budget */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-xl p-6 border border-[#2a2a3a] flex items-center justify-between group hover:border-[#f59e0b]/30 transition-colors">
                  <div>
                    <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider">Largest Budget Managed</p>
                    <p className="font-sans text-sm text-[#8A8A85] mt-1">Single production authority</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-lg text-[#f59e0b]">$</span>
                    <span className="font-display text-4xl text-white font-bold">1.2</span>
                    <span className="font-mono text-lg text-[#8A8A85]">M</span>
                  </div>
                </div>

                {/* Safety */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-xl p-6 border border-[#2a2a3a] flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 blur-[30px] rounded-full" />
                  <div>
                    <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider">Safety Record</p>
                    <p className="font-sans text-sm text-[#8A8A85] mt-1">Major incidents across all productions</p>
                  </div>
                  <div className="text-right relative z-10">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                      <span className="font-display text-3xl text-emerald-400 font-bold">Zero</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Scale & Reach */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mb-12"
          >
            <h3 className="font-mono text-xs text-[#6b7280] uppercase tracking-[0.25em] mb-6">
              Reach & Recognition
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-l-2 border-[#f59e0b] pl-6 py-3">
                <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider mb-2">Live Audiences</p>
                <p className="font-display text-3xl text-white font-bold">15,000+</p>
                <p className="font-sans text-sm text-[#8A8A85] mt-2">People who&apos;ve experienced my productions firsthand</p>
              </div>
              <div className="border-l-2 border-[#f59e0b] pl-6 py-3">
                <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider mb-2">Global Homes Reached</p>
                <p className="font-display text-3xl text-white font-bold">40M+</p>
                <p className="font-sans text-sm text-[#8A8A85] mt-2">Households via streaming distribution deals</p>
              </div>
              <div className="border-l-2 border-[#f59e0b] pl-6 py-3">
                <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider mb-2">Festival Circuit</p>
                <p className="font-display text-3xl text-white font-bold">SXSW + 3</p>
                <p className="font-sans text-sm text-[#8A8A85] mt-2">Official selections and nominations</p>
              </div>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="pt-8 border-t border-[#2a2a3a]"
          >
            <h4 className="font-mono text-xs text-[#6b7280] uppercase tracking-[0.2em] mb-6">
              Trusted By Industry Leaders
            </h4>
            <div className="flex flex-wrap items-center gap-8">
              <span className="font-mono text-sm text-[#8A8A85] uppercase tracking-wider">Salesforce</span>
              <span className="text-[#2a2a3a]">·</span>
              <span className="font-mono text-sm text-[#8A8A85] uppercase tracking-wider">Stability AI</span>
              <span className="text-[#2a2a3a]">·</span>
              <span className="font-mono text-sm text-[#8A8A85] uppercase tracking-wider">Boubyan Bank</span>
              <span className="text-[#2a2a3a]">·</span>
              <span className="font-mono text-sm text-[#8A8A85] uppercase tracking-wider">HBO Max</span>
              <span className="text-[#2a2a3a]">·</span>
              <span className="font-mono text-sm text-[#8A8A85] uppercase tracking-wider">Levi&apos;s</span>
              <span className="text-[#2a2a3a]">·</span>
              <span className="font-mono text-sm text-[#8A8A85] uppercase tracking-wider">PwC</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom close */}
        <div className="px-8 md:px-12 lg:px-16 py-12 border-t border-[#2a2a3a]">
          <button
            onClick={onClose}
            className="font-mono text-xs text-[#6b7280] uppercase tracking-wider hover:text-[#f59e0b] transition-colors flex items-center gap-2 group max-w-6xl mx-auto w-full"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 
            RETURN TO RECOGNITION
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Full-screen Modal for standard awards
const RecognitionModal = ({ award, onClose }: { award: Award; onClose: () => void }) => {
  const Icon = award.icon;
  
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] bg-[#0a0a0a] overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="min-h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="fixed top-8 right-8 z-20 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:border-[#f59e0b] hover:bg-white/5 transition-all duration-300 group"
        >
          <X className="w-6 h-6 text-white/60 group-hover:text-[#f59e0b] transition-colors" />
        </button>

        {/* Hero Header */}
        <div className="relative h-[60vh] bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] flex items-end">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#f59e0b_0%,_transparent_70%)]" />
          </div>
          
          <div className="relative w-full px-8 md:px-16 lg:px-24 pb-16">
            <div className="flex items-end gap-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-[#2a2a3a] flex items-center justify-center flex-shrink-0">
                <Icon className="w-10 h-10 text-[#f59e0b]" />
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-mono text-sm text-[#f59e0b]">/{award.year}</span>
                  <span className="font-mono text-xs text-[#8A8A85]">{award.id}</span>
                </div>
                <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-[#F2F2F0] uppercase leading-[0.9]">
                  {award.organization}
                </h2>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        </div>

        {/* Content */}
        <div className="px-8 md:px-16 lg:px-24 py-12 max-w-6xl">
          <div className="mb-12">
            <h3 className="font-display text-2xl md:text-3xl text-[#F2F2F0] uppercase mb-3">
              {award.project}
            </h3>
            <p className="font-mono text-sm text-[#8A8A85] uppercase tracking-wider">
              {award.role}
            </p>
          </div>

          <p className="font-sans text-lg text-[#8A8A85] leading-relaxed mb-12 max-w-3xl">
            {award.fullDescription}
          </p>

          <div>
            <h4 className="font-mono text-xs text-[#6b7280] uppercase tracking-[0.2em] mb-6">
              IMPACT METRICS
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {award.impact.map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                  className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-xl p-5 border border-[#2a2a3a] hover:border-[#f59e0b]/50 transition-colors"
                >
                  <p className="font-mono text-xs text-[#f59e0b] uppercase leading-relaxed">{metric}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom close */}
        <div className="px-8 md:px-16 lg:px-24 py-12 border-t border-[#2a2a3a]">
          <button
            onClick={onClose}
            className="font-mono text-xs text-[#6b7280] uppercase tracking-wider hover:text-[#f59e0b] transition-colors flex items-center gap-2"
          >
            <span>←</span> RETURN TO RECOGNITION
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Documentary Modal for SYNCHRONICITY — Musical Journey
const SynchronicityDocumentaryModal = ({ onClose }: { onClose: () => void }) => {
  const [cinemaOpen, setCinemaOpen] = React.useState(false);
  const trailerRef = useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (cinemaOpen) {
        setCinemaOpen(false);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [cinemaOpen, onClose]);

  React.useEffect(() => {
    const node = trailerRef.current;
    if (!node) return;
    if (cinemaOpen) node.pause();
    else void node.play().catch(() => {});
  }, [cinemaOpen]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] bg-[#0a0a0a] overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="min-h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="fixed top-8 right-8 z-50 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:border-[#f59e0b] hover:bg-white/5 transition-all duration-300 group backdrop-blur-sm"
        >
          <X className="w-6 h-6 text-white/60 group-hover:text-[#f59e0b] transition-colors" />
        </button>

        {/* Documentary Header — 70vh with video trailer as background */}
        <div className="relative h-[70vh] overflow-hidden">
          {/* Video trailer background - autoplaying, looping, muted */}
          <div className="absolute inset-0 z-0">
            <video
              ref={trailerRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
              poster={getImageUrl('/recognition/synchronicity-poster.jpg', 1920)}
            >
              <source src={getVideoUrl('/recognition/synchronicity-trailer.mp4')} type="video/mp4" />
              <source src={getVideoUrl('/recognition/synchronicity-trailer.webm')} type="video/webm" />
            </video>
          </div>
          
          {/* Deep purple/indigo musical atmosphere overlay */}
          <div className="absolute inset-0 z-[1] bg-[#0f0a1a]/40">
            {/* Gradient suggesting sound waves / musical frequency */}
            <div 
              className="absolute inset-0 opacity-50"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 25%, rgba(10, 10, 10, 0.9) 60%, rgba(5, 5, 5, 1) 100%)'
              }}
            />
            {/* Subtle wave pattern overlay */}
            <div className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 50 Q25 30 50 50 T100 50' stroke='%236366f1' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`,
              }}
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
          </div>

          {/* Content layer - z-10 to appear above video */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16 z-10">
            <div className="flex items-end gap-6 md:gap-10 max-w-7xl mx-auto">
              {/* Synchronicity Documentary Poster - high quality, above video */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="w-32 h-48 md:w-44 md:h-64 lg:w-52 lg:h-80 bg-gradient-to-br from-[#1a1a2e] to-[#0f0a1a] border border-[#6366f1]/50 rounded-lg overflow-hidden flex-shrink-0 shadow-2xl relative z-20"
              >
                <Image
                  src={getImageUrl('/recognition/synchronicity-poster.jpg', 800)}
                  alt="Synchronicity - Documentary Poster"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 128px, (max-width: 1024px) 176px, 208px"
                  loading="eager"
                  priority={true}
                  quality={100}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="absolute inset-0 flex flex-col items-center justify-center p-4">
                          <div class="flex items-end gap-1 h-16 mb-4">
                            ${[40, 70, 50, 90, 60, 80, 45, 75, 55, 85].map((h) => `<div class="w-1.5 bg-[#6366f1]/60 rounded-full" style="height: ${h}%"></div>`).join('')}
                          </div>
                          <span class="font-display text-xl md:text-2xl text-white/90 tracking-[0.1em] uppercase text-center">SYN<br>CHRON<br>ICITY</span>
                          <div class="mt-3 w-12 h-px bg-[#6366f1]/50"></div>
                          <span class="font-mono text-[8px] text-[#8A8A85] uppercase tracking-widest mt-2 text-center">A Musical<br>Documentary</span>
                        </div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"></div>
                      `;
                    }
                  }}
                />
              </motion.div>

              {/* Title and Info */}
              <div className="flex-grow pb-2 md:pb-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex items-center gap-3 mb-3"
                >
                  <span className="font-mono text-sm text-[#6366f1]">/2021</span>
                  <span className="font-mono text-xs text-[#8A8A85] uppercase tracking-wider">Short Documentary</span>
                  <span className="font-mono text-xs text-[#6b7280]">•</span>
                  <span className="font-mono text-xs text-[#8A8A85] uppercase tracking-wider">Music · Art · Journey</span>
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="font-display text-4xl md:text-5xl lg:text-7xl text-white uppercase leading-[0.95] tracking-tight"
                >
                  SYNCHRONICITY
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="font-mono text-sm text-[#8A8A85] mt-4 uppercase tracking-wider"
                >
                  Next Up Festival Nominee — Best Short Documentary
                </motion.p>
                <button
                  onClick={() => setCinemaOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#6366f1]/45 bg-black/35 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2f2f0] hover:border-[#6366f1] hover:bg-black/55 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  Enter Cinema Mode
                </button>
              </div>

              {/* Festival Badge */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-col gap-3 flex-shrink-0"
              >
                {/* Next Up Badge */}
                <div className="bg-gradient-to-r from-[#6366f1] to-[#8B5CF6] text-white font-bold px-4 py-2.5 rounded text-xs uppercase tracking-wider shadow-lg text-center">
                  Next Up Festival
                </div>
                {/* Nominee badge */}
                <div className="bg-[#f59e0b] text-black font-bold px-4 py-2.5 rounded text-xs uppercase tracking-wider shadow-lg text-center">
                  Best Short Nominee
                </div>
                {/* Competition stat */}
                <div className="text-right">
                  <span className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider block">Competition</span>
                  <span className="font-mono text-sm text-[#6366f1] font-bold">Top 5 of 200+</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="px-8 md:px-12 lg:px-16 py-12 md:py-16 max-w-6xl mx-auto">
          {/* The Subject */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-12"
          >
            <h3 className="font-mono text-xs text-[#6b7280] uppercase tracking-[0.25em] mb-4">
              The Subject
            </h3>
            <p className="font-sans text-lg md:text-xl text-[#8A8A85] leading-relaxed max-w-4xl italic border-l-2 border-[#6366f1]/30 pl-6">
              &ldquo;An intimate portrait of Christopher Willits—musician, artist, and collaborator 
              with Brian Eno—exploring the intersection of sound, space, and human connection.&rdquo;
            </p>
            <p className="font-sans text-base text-[#8A8A85] leading-relaxed max-w-4xl mt-4">
              The documentary premiered at the <span className="text-[#6366f1] font-semibold">historic Castro Theatre</span> to a 
              packed audience while earning its nomination for Best Short Documentary at the Next Up Festival. 
              The film captures Willits&apos; innovative approach to ambient music and generative composition, 
              showcasing his unique ability to blend technology with organic soundscapes. Through intimate 
              interviews and performance footage, Synchronicity reveals the creative process of an artist 
              who has redefined the boundaries of electronic music.
            </p>
          </motion.div>

          {/* Creative Approach */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mb-12"
          >
            <h3 className="font-mono text-xs text-[#6b7280] uppercase tracking-[0.25em] mb-4">
              Creative Approach
            </h3>
            <p className="font-sans text-base text-[#8A8A85] leading-relaxed max-w-4xl">
              The film employed <span className="text-[#6366f1] font-semibold">innovative visual techniques</span> to mirror 
              Willits&apos; musical philosophy—using layered imagery, slow-motion photography, and 
              generative visual patterns to create a documentary experience that feels as immersive 
              as his music. The visual-audio integration became a hallmark of the piece, 
              earning specific recognition at the festival.
            </p>
          </motion.div>

          {/* Credits */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <h3 className="font-mono text-xs text-[#6b7280] uppercase tracking-[0.25em] mb-6">
              Documentary Credits
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="border-l border-[#2a2a3a] pl-4">
                <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider mb-1">Subject</p>
                <p className="font-mono text-sm text-[#6366f1] uppercase">Christopher Willits</p>
              </div>
              <div className="border-l border-[#2a2a3a] pl-4">
                <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider mb-1">Category</p>
                <p className="font-mono text-sm text-[#6366f1] uppercase">Short Documentary</p>
              </div>
              <div className="border-l border-[#2a2a3a] pl-4">
                <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider mb-1">Recognition</p>
                <p className="font-mono text-sm text-[#6366f1] uppercase">Best Short Nominee</p>
              </div>
              <div className="border-l border-[#2a2a3a] pl-4">
                <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider mb-1">Competition</p>
                <p className="font-mono text-sm text-[#6366f1] uppercase">Top 5 of 200+</p>
              </div>
            </div>
          </motion.div>

          {/* Festival Impact */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-12 pt-8 border-t border-[#2a2a3a]"
          >
            <h4 className="font-mono text-xs text-[#6b7280] uppercase tracking-[0.2em] mb-6">
              Next Up Festival Recognition
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Competition Rank', value: 'Top 5 of 200+' },
                { label: 'Category', value: 'Best Short Documentary' },
                { label: 'Recognition', value: 'Visual-Audio Integration' },
                { label: 'Innovation', value: 'Storytelling Technique' },
              ].map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 + idx * 0.1 }}
                  className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-xl p-5 border border-[#2a2a3a] hover:border-[#6366f1]/50 transition-colors"
                >
                  <p className="font-mono text-[10px] text-[#6b7280] uppercase tracking-wider mb-2">{metric.label}</p>
                  <p className="font-mono text-sm text-[#6366f1] uppercase leading-relaxed">{metric.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom close */}
        <div className="px-8 md:px-12 lg:px-16 py-12 border-t border-[#2a2a3a]">
          <button
            onClick={onClose}
            className="font-mono text-xs text-[#6b7280] uppercase tracking-wider hover:text-[#f59e0b] transition-colors flex items-center gap-2 group max-w-6xl mx-auto w-full"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 
            RETURN TO RECOGNITION
          </button>
        </div>

        <AnimatePresence>
          {cinemaOpen && (
            <CinemaModeOverlay
              isOpen={cinemaOpen}
              onClose={() => setCinemaOpen(false)}
              title="SYNCHRONICITY"
              poster={getImageUrl('/recognition/synchronicity-poster.jpg', 1920)}
              video={{
                mp4: getVideoUrl('/recognition/synchronicity-trailer.mp4'),
                webm: getVideoUrl('/recognition/synchronicity-trailer.webm'),
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// Card Component
const RecognitionCard = ({ 
  award, 
  index, 
  position,
  onClick 
}: { 
  award: Award; 
  index: number; 
  position: 'left' | 'right';
  onClick: () => void;
}) => {
  const { setCursorState, setPreviewData } = useCursor();
  const Icon = award.icon;
  const previewRafRef = useRef<number | null>(null);
  const pendingFocusRef = useRef<{ focusX: number; focusY: number } | null>(null);
  const lastFocusRef = useRef<{ focusX: number; focusY: number } | null>(null);

  useEffect(() => {
    return () => {
      if (previewRafRef.current !== null) {
        cancelAnimationFrame(previewRafRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    setCursorState('recognition');
    if (award.image) {
      setPreviewData({ src: award.image });
    }
  };

  const handleMouseLeave = () => {
    setCursorState('default');
    setPreviewData({});
    pendingFocusRef.current = null;
    lastFocusRef.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!award.image) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const focusX = ((e.clientX - rect.left) / rect.width) * 100;
    const focusY = ((e.clientY - rect.top) / rect.height) * 100;
    pendingFocusRef.current = {
      focusX: Math.max(0, Math.min(100, focusX)),
      focusY: Math.max(0, Math.min(100, focusY)),
    };
    if (previewRafRef.current !== null) return;
    previewRafRef.current = requestAnimationFrame(() => {
      if (!pendingFocusRef.current) {
        previewRafRef.current = null;
        return;
      }
      const lastFocus = lastFocusRef.current;
      if (
        lastFocus &&
        Math.abs(lastFocus.focusX - pendingFocusRef.current.focusX) < 1 &&
        Math.abs(lastFocus.focusY - pendingFocusRef.current.focusY) < 1
      ) {
        previewRafRef.current = null;
        return;
      }
      setPreviewData({
        src: award.image,
        focusX: pendingFocusRef.current.focusX,
        focusY: pendingFocusRef.current.focusY,
      });
      lastFocusRef.current = pendingFocusRef.current;
      previewRafRef.current = null;
    });
  };

  const [projectLine, roleLine] = award.role.includes('|')
    ? award.role.split('|').map((part) => part.trim())
    : [award.project, award.role];

  return (
    <motion.div
      initial={{ opacity: 0, x: position === 'left' ? -60 : 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.15 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.005 }}
      className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-xl border border-[#2a2a3a] p-6 cursor-none hover:border-[#f59e0b] hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] transition-all duration-500 h-[280px] flex flex-col"
      style={{ width: '100%' }}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-[#2a2a3a] flex items-center justify-center group-hover:border-[#f59e0b]/50 transition-colors">
          <Icon className="w-5 h-5 text-[#6b7280] group-hover:text-[#f59e0b] transition-colors duration-300" />
        </div>
        <span className="font-mono text-xs text-[#6b7280] group-hover:text-[#f59e0b] transition-colors">{award.id}</span>
      </div>

      <div className="flex-grow">
        <p className="font-mono text-sm text-[#f59e0b] mb-2">/{award.year}</p>
        <h3 className="font-display text-xl text-[#F2F2F0] uppercase tracking-wide mb-2 group-hover:text-white transition-colors">
          {award.organization}
        </h3>
        <p className="font-mono text-[10px] text-[#8A8A85] uppercase tracking-wider leading-relaxed">
          {award.project}
        </p>
        <p className="font-mono text-[10px] text-[#8A8A85] uppercase tracking-wider leading-relaxed">
          {roleLine ?? projectLine}
        </p>
      </div>

      <div className="mt-auto pt-4">
        <div className="h-px w-full bg-[#2a2a3a] group-hover:bg-[#f59e0b]/30 transition-colors" />
      </div>

      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#f59e0b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
};

// Timeline Connector
const TimelineConnector = ({ position, index }: { position: 'left' | 'right'; index: number }) => {
  const gradientClass = position === 'left' 
    ? 'bg-gradient-to-l from-[#f59e0b] to-[#2a2a3a]' 
    : 'bg-gradient-to-r from-[#f59e0b] to-[#2a2a3a]';
  
  const positionClass = position === 'left'
    ? 'right-1/2 mr-10'
    : 'left-1/2 ml-10';

  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 + 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute top-1/2 -translate-y-1/2 h-[2px] ${gradientClass} ${positionClass}`}
      style={{ transformOrigin: position === 'left' ? 'right' : 'left', width: 'calc(50% - 40px)' }}
    />
  );
};

// Main Section
export const RecognitionSection = () => {
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);
  const { setCursorState, setPreviewData } = useCursor();

  useEffect(() => {
    if (!selectedAward) return;
    setCursorState('default');
    setPreviewData({});
  }, [selectedAward, setCursorState, setPreviewData]);

  return (
    <>
      <section id="recognition" className="min-h-screen bg-[#0a0a0a] py-24 md:py-32 overflow-hidden" style={{ contain: 'layout' }}>
        <div className="px-6 md:px-12 lg:px-20">
          {/* Header */}
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 mb-20">
            <div className="lg:w-[35%]">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-4xl md:text-5xl lg:text-6xl text-[#F2F2F0] uppercase leading-[0.95] mb-6"
              >
                RECOGNITION<br />& IMPACT
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="font-mono text-xs text-[#8A8A85] uppercase tracking-wider leading-relaxed max-w-sm"
              >
                THESE HONORS UNDERSCORE MY COMMITMENT TO DELIVERING OUTSTANDING CREATIVE SOLUTIONS.
              </motion.p>
            </div>
          </div>

          {/* Alternating Branch Timeline */}
          <div className="relative">
            {/* Central spine */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 z-[1]">
              <div className="absolute inset-0 bg-[#3a3a46]" />
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 bg-gradient-to-b from-[#f59e0b] via-[#f59e0b] to-[#f59e0b]/30 origin-top"
              />
              <div className="absolute inset-0 bg-[#f59e0b] blur-[2px] opacity-50" />
            </div>

            {/* Cards */}
            <div className="relative z-[2] space-y-8 lg:space-y-0">
              {awards.map((award, index) => {
                const position = index % 2 === 0 ? 'left' : 'right';
                
                return (
                  <div key={award.id} className="relative lg:py-6">
                    {/* Desktop layout */}
                    <div className="hidden lg:flex items-center relative">
                      {/* Timeline dot */}
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.2 + 0.5, type: 'spring', stiffness: 200 }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                      >
                        <div className="absolute inset-0 w-4 h-4 rounded-full bg-[#f59e0b] blur-md opacity-50" />
                        <div className="relative w-4 h-4 rounded-full bg-[#0a0a0a] border-2 border-[#f59e0b] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                        </div>
                      </motion.div>

                      {/* Branch connector */}
                      <TimelineConnector position={position} index={index} />

                      {/* Card positioned */}
                      <div className={`w-full flex ${position === 'left' ? 'justify-start' : 'justify-end'}`}>
                        <div className="max-w-[26rem]" style={{ width: 'calc(50% - 40px)' }}>
                          <RecognitionCard
                            award={award}
                            index={index}
                            position={position}
                            onClick={() => setSelectedAward(award)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mobile layout */}
                    <div className={`lg:hidden flex ${position === 'left' ? 'justify-start' : 'justify-end'}`}>
                      {/* Mobile timeline dot + branch line (desktop-inspired asymmetry + motion) */}
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: index * 0.15 + 0.35, type: 'spring', stiffness: 200 }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 lg:hidden"
                      >
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-[#f59e0b] blur-md opacity-45" />
                        <div className="relative w-3 h-3 rounded-full bg-[#0a0a0a] border border-[#f59e0b]">
                          <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        whileInView={{ scaleX: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: index * 0.15 + 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className={`absolute top-1/2 -translate-y-1/2 h-[1px] w-[18%] bg-gradient-to-r from-[#f59e0b] to-[#2a2a3a] ${position === 'left' ? 'left-[50%]' : 'right-[50%]'}`}
                        style={{ transformOrigin: position === 'left' ? 'left' : 'right' }}
                      />
                      <div className="w-[92%] max-w-[26rem]">
                        <RecognitionCard
                          award={award}
                          index={index}
                          position={position}
                          onClick={() => setSelectedAward(award)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* End cap */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 1.2, type: 'spring' }}
              className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full mt-4"
            >
              <div className="w-3 h-3 rounded-full bg-[#f59e0b] border border-[#f59e0b]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modal - Conditionally render cinematic modals or standard modal */}
      <AnimatePresence>
        {selectedAward && (
          selectedAward.project === 'ALONE' ? (
            <AloneModal onClose={() => setSelectedAward(null)} />
          ) : selectedAward.project === 'WOMEN IS LOSERS' ? (
            <WomenIsLosersModal onClose={() => setSelectedAward(null)} />
          ) : selectedAward.project === 'IMPACT METRICS' ? (
            <CareerImpactModal onClose={() => setSelectedAward(null)} />
          ) : selectedAward.project === 'SYNCHRONICITY' ? (
            <SynchronicityDocumentaryModal onClose={() => setSelectedAward(null)} />
          ) : (
            <RecognitionModal 
              award={selectedAward} 
              onClose={() => setSelectedAward(null)} 
            />
          )
        )}
      </AnimatePresence>
    </>
  );
};

