'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { AnimatedCounter } from '@/components/micro-animations/AnimatedCounter';
import { ArrowUpRight, Play, Pause, ChevronRight, Layers, Crosshair, Scan } from 'lucide-react';
import CryptVolumetric3D from '@/components/work/crypt-volumetric/CryptVolumetric3D';
import { HeroAmbientScreen } from '@/components/sections/HeroAmbientScreen';
import { useDeviceCapabilities } from '@/hooks/useReducedMotion';
import { getImageUrl, getVideoUrl } from '@/lib/media';

// Sensor visualization component - 4 depth sensors
const SensorArray = ({ reduceMotion = false }: { reduceMotion?: boolean }) => {
  const sensors = [
    { angle: 45, label: 'S1' },
    { angle: 135, label: 'S2' },
    { angle: 225, label: 'S3' },
    { angle: 315, label: 'S4' },
  ];
  
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80">
      {/* Outer ring */}
      <motion.div 
        className="absolute inset-0 rounded-full border-2 border-white/10"
        animate={reduceMotion ? { rotate: 0 } : { rotate: 360 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 60, repeat: Infinity, ease: 'linear' }
        }
      />
      
      {/* Inner rings */}
      <div className="absolute inset-4 rounded-full border border-white/5" />
      <div className="absolute inset-8 rounded-full border border-white/5" />
      
      {/* Center capture zone */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(200,180,255,0.15) 0%, transparent 70%)',
        }}
        animate={reduceMotion ? { scale: 1, opacity: 0.65 } : { scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: reduceMotion ? 0 : Infinity }}
      />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <span className="font-mono text-xs text-white/60 tracking-widest">CAPTURE</span>
        <span className="block font-mono text-[10px] text-white/40 mt-1">ZONE</span>
      </div>
      
      {/* 4 Sensors positioned around */}
      {sensors.map((sensor, i) => {
        const rad = (sensor.angle * Math.PI) / 180;
        const r = 45;
        const x = 50 + r * Math.cos(rad);
        const y = 50 + r * Math.sin(rad);
        
        return (
          <motion.div
            key={sensor.label}
            className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.2, duration: 0.5 }}
          >
            <motion.div
              className="w-full h-full rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
              animate={
                reduceMotion
                  ? { boxShadow: '0 0 0 0 rgba(255,255,255,0)' }
                  : {
                      boxShadow: [
                        '0 0 0 0 rgba(255,255,255,0)',
                        '0 0 20px 2px rgba(255,255,255,0.3)',
                        '0 0 0 0 rgba(255,255,255,0)',
                      ],
                    }
              }
              transition={{ duration: 2, repeat: reduceMotion ? 0 : Infinity, delay: i * 0.5 }}
            >
              <span className="font-mono text-[9px] text-white/60">{sensor.label}</span>
            </motion.div>
            
            {/* Sensor beam visualization */}
            <svg 
              className="absolute top-1/2 left-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ transform: `translate(-50%, -50%) rotate(${sensor.angle + 180}deg)` }}
            >
              <defs>
                <linearGradient id={`beam-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              </defs>
              <path
                d="M 32 32 L 80 20 L 80 44 Z"
                fill={`url(#beam-${i})`}
                opacity={0.3}
              />
            </svg>
          </motion.div>
        );
      })}
      
      {/* Scan line */}
      <motion.div
        className="absolute top-0 left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-white/40 to-transparent"
        animate={reduceMotion ? { left: '50%' } : { left: ['0%', '100%', '0%'] }}
        transition={{ duration: 4, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
};

// Timeline progress indicator with continuous subtle animation
const Timeline = ({ progress, isActive = true }: { progress: number; isActive?: boolean }) => (
  <div className="relative h-1 bg-white/10 rounded-full overflow-hidden">
    {/* Animated shimmer background */}
    <motion.div
      className="absolute inset-0 opacity-30"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
      }}
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
    />
    <motion.div 
      className="absolute top-0 left-0 h-full bg-gradient-to-r from-white/80 via-white to-white/80 rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Pulse glow effect on the progress bar */}
      <motion.div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-4 -mr-1"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
        }}
        animate={{ opacity: isActive ? [0.4, 1, 0.4] : 0.4 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
    <motion.div
      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg shadow-white/50"
      style={{ left: `${progress}%` }}
      animate={{ 
        scale: isActive ? [1, 1.3, 1] : 1,
        boxShadow: isActive ? [
          '0 0 10px rgba(255,255,255,0.3)',
          '0 0 20px rgba(255,255,255,0.6)',
          '0 0 10px rgba(255,255,255,0.3)'
        ] : '0 0 10px rgba(255,255,255,0.3)'
      }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  </div>
);

// Video Modal Component - Distinctive Purple/Glassmorphism Design
const VideoModal = ({ onClose }: { onClose: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force reload video when modal opens
    video.load();

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleLoaded = () => {
      setIsLoaded(true);
      video.play().catch(() => {
        // Autoplay blocked
        setIsPlaying(false);
      });
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('canplaythrough', handleLoaded);

    // Fallback: if video doesn't load in 1s, show anyway
    const fallbackTimer = setTimeout(() => setIsLoaded(true), 1000);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('canplaythrough', handleLoaded);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    video.currentTime = (newProgress / 100) * video.duration;
    setProgress(newProgress);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      {/* Deep purple backdrop with blur */}
      <div className="absolute inset-0 bg-[#0a0a14]/95 backdrop-blur-xl" />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      
      {/* Modal content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Outer glowing ring - animated gradient border */}
        <motion.div
          className="absolute -inset-[2px] rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4, #8b5cf6)',
            backgroundSize: '200% 200%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        
        <div className="relative bg-[#0f0f1a] rounded-2xl overflow-hidden border border-white/10">
          {/* Video container */}
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
              style={{
                opacity: isLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
              onClick={togglePlay}
            >
              <source src={getVideoUrl('/work/the-crypt-modal.webm')} type="video/webm" />
              <source src={getVideoUrl('/work/the-crypt-modal.mp4')} type="video/mp4" />
            </video>
            
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a]/60 via-transparent to-transparent" />
            
            {/* Center play/pause overlay when paused */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                  onClick={togglePlay}
                >
                  <motion.div
                    className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play size={32} className="text-white ml-1" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Glassmorphism control bar */}
          <div className="relative px-6 py-4 bg-white/5 backdrop-blur-md border-t border-white/10">
            <div className="flex items-center gap-4">
              {/* Play/Pause button */}
              <motion.button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? (
                  <Pause size={18} className="text-white" />
                ) : (
                  <Play size={18} className="text-white ml-0.5" />
                )}
              </motion.button>
              
              {/* Filmstrip-style timeline */}
              <div className="flex-1">
                <div 
                  className="relative h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer"
                  onClick={handleSeek}
                >
                  {/* Film strip pattern */}
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px)',
                    }}
                  />
                  {/* Progress */}
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                    style={{ width: `${progress}%` }}
                    layoutId="modalProgress"
                  />
                  {/* Glow at progress end */}
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
                    style={{ left: `calc(${progress}% - 6px)` }}
                    animate={{ boxShadow: ['0 0 10px rgba(139,92,246,0.5)', '0 0 20px rgba(6,182,212,0.8)', '0 0 10px rgba(139,92,246,0.5)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-mono text-[10px] text-white/40"> 2026</span>
                  <span className="font-mono text-[10px] text-white/40">{isPlaying ? 'PLAYING' : 'PAUSED'}</span>
                  <span className="font-mono text-[10px] text-white/40">{Math.round(progress)}%</span>
                </div>
              </div>
              
              {/* Volume indicator */}
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-violet-500 rounded-full"
                      style={{ height: `${i * 4}px` }}
                      animate={isPlaying ? {
                        opacity: [0.3, 1, 0.3],
                        height: [`${i * 4}px`, `${i * 6}px`, `${i * 4}px`]
                      } : { opacity: 0.3 }}
                      transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Close button - minimal with hover glow */}
        <motion.button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#1a1a2e] border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/20 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-sm">×</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// Main page component
export default function TheCryptPage() {
  const pioneerRef = useRef<HTMLElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const { enableParallax, prefersReducedMotion } = useDeviceCapabilities();

  const springConfig = { damping: 30, stiffness: 200 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  useEffect(() => {
    if (!enableParallax) return;
    const sec = pioneerRef.current;
    if (!sec) return;
    const onMove = (e: MouseEvent) => {
      const r = sec.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      mouseX.set((e.clientX - cx) * 0.022);
      mouseY.set((e.clientY - cy) * 0.022);
    };
    sec.addEventListener('mousemove', onMove);
    return () => sec.removeEventListener('mousemove', onMove);
  }, [enableParallax, mouseX, mouseY]);

  // Accurate technical specs - 4 depth sensors only (numeric for AnimatedCounter)
  const technicalSpecs = useMemo(() => [
    { label: 'Depth Sensors', value: 4, displayValue: '4', unit: 'units', prefix: '', suffix: '' },
    { label: 'Frame Rate', value: 60, displayValue: '60', unit: 'FPS', prefix: '', suffix: '' },
    { label: 'Latency', value: 100, displayValue: '<100', unit: 'ms', prefix: '<', suffix: '' },
    { label: 'Technology', value: 0, displayValue: 'Proprietary', unit: 'Algorithm', prefix: '', suffix: '', isText: true },
  ], []);

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden selection:bg-white/20">
      <HeroAmbientScreen variant="global" baseBgClass="bg-[#030303]" />

      <div className="relative z-[1]">
      {/* HERO SECTION — document flow on small screens so stats never overlap copy */}
      <section className="relative flex min-h-0 flex-col px-6 pb-10 pt-24 sm:pb-12 md:min-h-[100dvh] md:pb-28 md:pt-28">
        {!prefersReducedMotion && (
          <motion.div
            className="pointer-events-none absolute top-1/3 left-1/2 h-[min(1000px,140vw)] w-[min(1000px,140vw)] -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform md:top-1/2"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)',
            }}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <div className="relative z-10 mx-auto w-full max-w-7xl flex-1 xl:pb-32 2xl:pb-36">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-8 flex items-center gap-3 sm:mb-10 sm:gap-4 md:mb-14"
          >
            <motion.div 
              className="h-px w-12 shrink-0 bg-white/40 sm:w-16"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            <span className="min-w-0 font-mono text-[9px] uppercase tracking-[0.28em] text-white/50 sm:text-[10px] sm:tracking-[0.35em] md:tracking-[0.4em]">
              Private Research / 2026
            </span>
          </motion.div>

          <div className="mb-5 overflow-visible sm:mb-6 md:mb-8">
            <motion.h1 
              className="font-display text-[clamp(2.75rem,12vw,12rem)] uppercase leading-[0.92] tracking-tighter"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              THE CRYPT
            </motion.h1>
          </div>
          
          <div className="mb-8 sm:mb-10 md:mb-12">
            <motion.p 
              className="font-mono max-w-2xl text-[clamp(0.7rem,3.2vw,1rem)] uppercase leading-snug tracking-[0.18em] text-white/40 sm:tracking-[0.26em] md:tracking-[0.3em]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.58, ease: [0.16, 1, 0.3, 1] }}
            >
              Volumetric Video in Spatial Computing
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.72 }}
            className="mb-8 sm:mb-10"
          >
            <motion.button
              type="button"
              onClick={() => setShowVideoModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-sm transition-all will-change-transform hover:bg-white/15"
              style={{ transform: 'translateZ(0)' }}
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Play className="h-4 w-4 fill-white text-white" />
              </motion.div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-white">Watch</span>
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.88 }}
            className="max-w-4xl pb-2"
          >
            <p className="font-sans text-base leading-[1.65] text-white/60 sm:text-lg sm:leading-relaxed md:text-xl md:leading-[1.7] lg:text-2xl">
              We captured a single moment from multiple angles using only depth sensors and a proprietary algorithm. 
              No green screen. No manual intervention. Just pure real-time volumetric presence.
            </p>
          </motion.div>
        </div>

        {/* Capture zone / stats — in flow below manifesto; md+ also anchored to bottom for cinematic layout */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 1.05 }}
          className="relative z-20 mx-auto mt-8 w-full max-w-7xl sm:mt-10 md:mt-auto md:pt-10 lg:pt-12 xl:absolute xl:bottom-10 xl:left-1/2 xl:mt-0 xl:w-[min(100%,calc(100%-5rem))] xl:max-w-7xl xl:-translate-x-1/2 xl:px-6"
        >
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)] sm:grid-cols-2 md:grid-cols-4">
            {technicalSpecs.map((spec, i) => (
              <motion.div 
                key={spec.label}
                className="group relative min-w-0 bg-[#030303] p-3 sm:p-5 md:p-8"
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 1.12 + i * 0.06 }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                <motion.div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%)',
                  }}
                  animate={!prefersReducedMotion ? {
                    scale: [1, 1.15, 1],
                    opacity: [0, 0.25, 0],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
                />
                <span className="mb-2 block font-mono text-[8px] uppercase tracking-[0.18em] text-white/30 sm:mb-3 sm:text-[9px] sm:tracking-[0.2em] md:text-[10px] md:tracking-[0.25em]">
                  {spec.label}
                </span>
                <div
                  className={`flex min-w-0 items-baseline gap-x-1.5 gap-y-0.5 sm:gap-x-2 ${spec.isText ? 'flex-col items-stretch gap-1 sm:flex-row sm:items-end sm:gap-x-2' : 'flex-row flex-wrap'}`}
                >
                  <motion.span 
                    className={`min-w-0 uppercase leading-tight text-white ${
                      spec.isText
                        ? 'font-display max-w-full text-sm tracking-[0.08em] sm:text-base md:text-lg lg:text-xl'
                        : 'font-display text-lg whitespace-nowrap sm:text-2xl md:text-3xl lg:text-4xl'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: prefersReducedMotion ? 0 : 1.2 + i * 0.06 }}
                  >
                    {spec.isText ? (
                      <span className="block hyphens-none [overflow-wrap:anywhere]">
                        {spec.displayValue}
                      </span>
                    ) : (
                      <AnimatedCounter
                        value={spec.value}
                        prefix={spec.prefix}
                        suffix={spec.suffix}
                        decimals={0}
                        duration={2000}
                        enabled={true}
                      />
                    )}
                  </motion.span>
                  <span className="shrink-0 font-mono text-[8px] uppercase leading-normal text-white/30 sm:text-[9px] md:text-[10px]">
                    {spec.unit}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SYSTEM VISUALIZATION SECTION */}
      <section className="relative min-h-screen flex items-center px-6 md:px-12 lg:px-20 py-32">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left: 4 Sensor Array Visualization */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <SensorArray reduceMotion={prefersReducedMotion} />
            </motion.div>

            {/* Right: Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <span className="font-mono text-[10px] tracking-[0.4em] text-white/40 uppercase block mb-6">
                  The System
                </span>
                <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[0.9] tracking-tight uppercase mb-6">
                  Four Sensors.<br />
                  One Moment.
                </h2>
                <p className="font-sans text-lg text-white/50 leading-[1.7]">
                  Using just four depth sensors positioned strategically around the capture zone, 
                  we achieved what previously required 80-100 camera arrays. 
                  Our proprietary algorithm reconstructs volumetric data in real-time.
                </p>
              </motion.div>

              {/* Feature list with micro-animations */}
              <div className="space-y-6">
                {[
                  { icon: Scan, title: 'Real-Time Processing', desc: 'No post-production. No waiting.' },
                  { icon: Crosshair, title: 'Precision Capture', desc: 'Sub-centimeter accuracy at 60 FPS.' },
                  { icon: Layers, title: 'Depth Reconstruction', desc: 'Proprietary volumetric algorithms.' },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.15 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4 group"
                  >
                    <motion.div 
                      className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-all duration-500"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <feature.icon size={20} className="text-white/60" />
                    </motion.div>
                    <div>
                      <h3 className="font-mono text-sm tracking-wider text-white/80 uppercase mb-1">
                        {feature.title}
                      </h3>
                      <p className="font-sans text-sm text-white/40">
                        {feature.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PIONEERING SECTION */}
      <section ref={pioneerRef} className="relative min-h-screen flex items-center px-6 md:px-12 lg:px-20 py-32 overflow-hidden">
        {/* Large background text with parallax */}
        <motion.div 
          className="absolute top-1/2 left-0 -translate-y-1/2 font-display text-[clamp(10rem,30vw,25rem)] text-white/[0.02] uppercase tracking-tighter whitespace-nowrap pointer-events-none select-none"
          style={{ x: mouseX, y: mouseY }}
        >
          PIONEER
        </motion.div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl"
          >
            <span className="font-mono text-[10px] tracking-[0.4em] text-white/40 uppercase block mb-8">
              The Achievement
            </span>
            
            <h2 className="font-display text-[clamp(2rem,6vw,5rem)] leading-[0.9] tracking-tight uppercase mb-12">
              First Of Its Kind.
            </h2>

            <div className="space-y-8">
              <motion.p 
                className="font-sans text-xl md:text-2xl leading-[1.7] text-white/70"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                This was not iterative improvement. This was invention. We built something 
                that had never existed at this level of fidelity, with this level of interaction.
              </motion.p>
              
              <motion.p 
                className="font-sans text-lg leading-[1.8] text-white/50"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
              >
                The challenge was clear: achieve production-quality volumetric capture on 
                consumer hardware with real-time playback, free-perspective shifts, and 
                temporal displacement. No green screens. No massive camera arrays. 
                Just four depth sensors and breakthrough thinking.
              </motion.p>
            </div>

            {/* Quote with reveal animation */}
            <motion.blockquote
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
              className="mt-16 pl-8 border-l-2 border-white/20"
            >
              <motion.p 
                className="font-mono text-lg md:text-xl leading-[1.8] text-white/60 italic"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                viewport={{ once: true }}
              >
                &ldquo;Progress seems to be the inevitable ecstasy of human society, attempting to contribute to this ever-advancing standard of living. Machines that can now learn, understand, process, and develop have been quintessential to the growth of this formulation of an advanced society. Yet the closer we get in our journey, the more efficient life becomes, the farther we seem from the goal.&rdquo;
              </motion.p>
            </motion.blockquote>
          </motion.div>
        </div>
      </section>

      {/* CAPTURE EXPERIENCE SECTION */}
      <section className="relative py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <span className="font-mono text-[10px] tracking-[0.4em] text-white/40 uppercase block mb-6">
              The Experience
            </span>
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] tracking-tight uppercase">
              Navigate The Moment.
            </h2>
          </motion.div>

          {/* Main visualization container */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glowing frame border */}
            <motion.div 
              className="absolute -inset-1 rounded-sm opacity-30"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
                filter: 'blur(10px)',
              }}
            />
            
            <div className="relative bg-white/5 border border-white/10 rounded-sm overflow-hidden">
              {/* Corner accents with animation */}
              <motion.div 
                className="absolute top-0 left-0 w-20 h-[2px] bg-white z-20"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              />
              <motion.div 
                className="absolute top-0 left-0 w-[2px] h-20 bg-white z-20"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              />
              <motion.div 
                className="absolute top-0 right-0 w-20 h-[2px] bg-white z-20"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              />
              <motion.div 
                className="absolute top-0 right-0 w-[2px] h-20 bg-white z-20"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 w-20 h-[2px] bg-white z-20"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 w-[2px] h-20 bg-white z-20"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                viewport={{ once: true }}
              />
              <motion.div 
                className="absolute bottom-0 right-0 w-20 h-[2px] bg-white z-20"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                viewport={{ once: true }}
              />
              <motion.div 
                className="absolute bottom-0 right-0 w-[2px] h-20 bg-white z-20"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                viewport={{ once: true }}
              />

              {/* Content area — min height on small screens; cinematic 21:9 from md up */}
              <div className="relative flex h-[min(72vh,100vw)] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#050505] via-[#080808] to-[#050505] md:aspect-[21/9] md:h-auto md:min-h-[min(24rem,52vh)] lg:min-h-[min(28rem,56vh)]">
                {/* Interactive 3D volumetric capture - drag to orbit; fullscreen control top-right */}
                <CryptVolumetric3D
                  webmSrc={getVideoUrl('/work/crypt-demo.webm')}
                  mp4Src={getVideoUrl('/work/crypt-demo.mp4')}
                  posterSrc={getImageUrl('/work/the-crypt.jpg', 1920)}
                  depthIntensity={0.54}
                  depthV2Strength={1}
                  height="100%"
                />
                
                {/* Subtle overlay to ensure UI readability */}
                <div className="absolute inset-0 bg-[#030303]/30 z-[1] pointer-events-none" />
                
                {/* Grid overlay */}
                <div 
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`,
                    backgroundSize: '80px 80px',
                  }}
                />
                
                {/* Animated scanlines — static offset when reduced motion */}
                <motion.div 
                  className="pointer-events-none absolute inset-0 z-[2]"
                  style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
                  }}
                  animate={
                    prefersReducedMotion
                      ? { backgroundPosition: '0px 0px' }
                      : { backgroundPosition: ['0px 0px', '0px 100px'] }
                  }
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 10, repeat: Infinity, ease: 'linear' }
                  }
                />

                {/* Warping distortion — omitted when reduced motion (GPU-heavy SVG filter) */}
                {!prefersReducedMotion && (
                  <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-[0.08]" style={{ mixBlendMode: 'overlay' }}>
                    <defs>
                      <filter id="crypt-warp" x="0" y="0" width="100%" height="100%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.008" numOctaves="2" result="noise">
                          <animate attributeName="baseFrequency" dur="20s" values="0.004 0.008;0.008 0.004;0.004 0.008" repeatCount="indefinite" />
                        </feTurbulence>
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
                      </filter>
                    </defs>
                    <rect width="100%" height="100%" filter="url(#crypt-warp)" fill="rgba(255,255,255,0.1)" />
                  </svg>
                )}

                {!prefersReducedMotion && (
                  <motion.div
                    className="pointer-events-none absolute inset-0 z-[1] opacity-[0.03]"
                    style={{
                      background: 'linear-gradient(45deg, rgba(255,0,0,0.1), transparent, rgba(0,255,255,0.1))',
                      mixBlendMode: 'screen',
                    }}
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                    }}
                    transition={{
                      duration: 15,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                )}

                {/* HUD Elements - moved to corners away from button */}
                <div className="pointer-events-none absolute left-2 top-2 max-w-[45%] font-mono text-[9px] uppercase tracking-wider text-white/30 md:left-4 md:top-4 md:max-w-none md:text-[10px] [overflow-wrap:anywhere]">
                  <div className="flex flex-wrap items-center gap-2">
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-white"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span>REC ● LIVE</span>
                  </div>
                  <div className="mt-1 text-white/20">DEPTH: 4.2M</div>
                </div>
                
                <div className="pointer-events-none absolute right-2 top-2 max-w-[45%] text-right font-mono text-[9px] uppercase tracking-wider text-white/30 md:right-4 md:top-4 md:max-w-none md:text-[10px] [overflow-wrap:anywhere]">
                  <div>60 FPS</div>
                  <div className="text-white/20">&lt;100ms LATENCY</div>
                </div>

                {/* Bottom timeline */}
                <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] text-white/30 tracking-wider uppercase">
                      Timeline
                    </span>
                    <span className="font-mono text-[10px] text-white/30 tracking-wider uppercase">
                      00:00:00
                    </span>
                  </div>
                  <Timeline progress={isPlaying ? 65 : 0} isActive={true} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature description cards */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10">
            {[
              {
                title: 'Free-Perspective',
                desc: 'Move through captured moments from any angle. The scene becomes a navigable space.',
              },
              {
                title: 'Temporal Control',
                desc: 'Pause, rewind, or advance through time. Control the moment with precision.',
              },
              {
                title: 'Volumetric Presence',
                desc: 'Not a flat image, but a true three-dimensional reconstruction of the subject.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="bg-[#030303] p-8 md:p-12 group hover:bg-white/[0.02] transition-colors duration-500"
              >
                <h3 className="font-mono text-sm tracking-wider text-white/70 uppercase mb-4">
                  {item.title}
                </h3>
                <p className="font-sans text-sm leading-[1.8] text-white/40">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EXECUTION SECTION */}
      <section className="relative py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            {/* Left: Title */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:col-span-4"
            >
              <span className="font-mono text-[10px] tracking-[0.4em] text-white/40 uppercase block mb-6">
                Execution
              </span>
              <h2 className="font-display text-4xl md:text-5xl leading-[0.9] tracking-tight uppercase">
                Led The<br />
                Vision.
              </h2>
            </motion.div>

            {/* Right: Content blocks with animation */}
            <div className="lg:col-span-8 space-y-16">
              {[
                {
                  role: 'Creative Producer & Director',
                  content: 'Led technical strategy and creative direction. Managed 9-month and ongoing capture pipeline development. Made key creative decisions on depth reconstruction algorithms and rendering optimization.',
                },
                {
                  role: 'The Breakthrough',
                  content: 'Achieved production-quality volumetric rendering on gaming-level hardware. Enabled free-view camera control, temporal displacement, and pre-recorded visual integration. System delivered sub-100ms playback latency at 60 FPS using only 4 depth sensors.',
                },
              ].map((block, i) => (
                <motion.div
                  key={block.role}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="relative pl-8 border-l border-white/20"
                >
                  <motion.div 
                    className="absolute left-0 top-0 w-2 h-2 -translate-x-[5px] rounded-full bg-white"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.2 }}
                    viewport={{ once: true }}
                  />
                  <h3 className="font-mono text-sm tracking-[0.2em] text-white/50 uppercase mb-6">
                    {block.role}
                  </h3>
                  <p className="font-sans text-lg leading-[1.9] text-white/60">
                    {block.content}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative py-40 px-6 md:px-12 lg:px-20 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          {/* Ambient glow */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)',
            }}
          />
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="mb-8 font-mono text-[10px] uppercase tracking-[0.4em] text-white/30 [overflow-wrap:anywhere]"
          >
            Private Research Initiative
          </motion.p>
          
          <h2 className="font-display mb-8 text-[clamp(3rem,10vw,8rem)] uppercase leading-[0.9] tracking-tighter [overflow-wrap:anywhere]">
            THE CRYPT
          </h2>
          
          <p className="mx-auto mb-16 max-w-3xl font-sans text-xl leading-[1.8] text-white/40 text-pretty [overflow-wrap:anywhere] md:text-2xl">
            A resurrection of the moment. Not a recording, but a navigable reality where 
            one can relive the exact moment captured, from any perspective, at any time.
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <Link 
              href="/work"
              className="group inline-flex items-center gap-4 px-10 py-5 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-500 rounded-full"
            >
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase">View All Work</span>
              <motion.div
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowUpRight size={16} className="text-black" />
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Video Modal - Distinctive Purple/Glassmorphism Design */}
      <AnimatePresence>
        {showVideoModal && (
          <VideoModal onClose={() => setShowVideoModal(false)} />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative py-12 px-6 md:px-12 lg:px-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <span className="font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">
              2026
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase">
              Private Research
            </span>
          </div>
          
          <div className="flex flex-nowrap items-center gap-2.5 whitespace-nowrap">
            <span className="font-mono text-[9px] leading-none tracking-[0.15em] text-white/20 uppercase">Next</span>
            <ChevronRight size={14} className="shrink-0 text-white/20" />
            <Link 
              href="/work/stability-ai"
              className="font-mono text-[10px] leading-none tracking-[0.2em] text-white/40 hover:text-white uppercase transition-colors"
            >
              Stability AI
            </Link>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
