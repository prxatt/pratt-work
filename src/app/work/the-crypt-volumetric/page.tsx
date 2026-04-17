'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { AnimatedCounter } from '@/components/micro-animations/AnimatedCounter';
import { ArrowUpRight, Play, Pause, ChevronRight, Zap, Eye, Layers, Crosshair, Scan, Box } from 'lucide-react';
import CryptVolumetric3D from '@/components/work/crypt-volumetric/CryptVolumetric3D';

// Advanced particle system with depth layers
const DepthField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    interface Particle {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
      pulse: number;
      pulseSpeed: number;
    }
    
    const particles: Particle[] = [];
    const particleCount = 200;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 2000,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 3 + 0.5,
        pulse: 0,
        pulseSpeed: Math.random() * 0.02 + 0.01,
      });
    }
    
    let animationId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.sort((a, b) => b.z - a.z);
      
      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;
        particle.pulse += particle.pulseSpeed;
        
        if (particle.z < 0) {
          particle.z = 2000;
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
        }
        if (particle.z > 2000) particle.z = 0;
        if (particle.x < -100) particle.x = canvas.width + 100;
        if (particle.x > canvas.width + 100) particle.x = -100;
        if (particle.y < -100) particle.y = canvas.height + 100;
        if (particle.y > canvas.height + 100) particle.y = -100;
        
        const scale = 2000 / (2000 + particle.z);
        const alpha = (1 - particle.z / 2000) * 0.6;
        const pulseAlpha = alpha * (0.7 + 0.3 * Math.sin(particle.pulse));
        
        const x = particle.x;
        const y = particle.y;
        const r = particle.size * scale;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
        gradient.addColorStop(0, `rgba(200, 180, 255, ${pulseAlpha})`);
        gradient.addColorStop(0.5, `rgba(150, 120, 200, ${pulseAlpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(150, 120, 200, 0)');
        
        ctx.beginPath();
        ctx.arc(x, y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha * 0.8})`;
        ctx.fill();
        
        if (index % 3 === 0) {
          particles.slice(index + 1, index + 8).forEach((other) => {
            if (Math.abs(particle.z - other.z) < 300) {
              const dx = particle.x - other.x;
              const dy = particle.y - other.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              if (dist < 150 * scale) {
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(other.x, other.y);
                ctx.strokeStyle = `rgba(180, 160, 220, ${0.15 * scale})`;
                ctx.lineWidth = 0.5 * scale;
                ctx.stroke();
              }
            }
          });
        }
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
};

// Cinematic grain overlay
const CinematicGrain = () => (
  <div 
    className="fixed inset-0 pointer-events-none z-[1] opacity-[0.04]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
);

// Sensor visualization component - 4 depth sensors
const SensorArray = () => {
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
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
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
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
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
              animate={{ 
                boxShadow: ['0 0 0 0 rgba(255,255,255,0)', '0 0 20px 2px rgba(255,255,255,0.3)', '0 0 0 0 rgba(255,255,255,0)']
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
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
        animate={{ left: ['0%', '100%', '0%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
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
              <source src="/work/the-crypt-modal.webm" type="video/webm" />
              <source src="/work/the-crypt-modal.mp4" type="video/mp4" />
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
  const { scrollYProgress } = useScroll();
  const heroRef = useRef<HTMLElement>(null);
  const systemRef = useRef<HTMLElement>(null);
  const pioneerRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [heroInView, setHeroInView] = useState(false);
  
  const prefersReducedMotion = useReducedMotion();
  
  const springConfig = { damping: 30, stiffness: 200 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);
  
  // Memoized animation variants for performance
  const fadeInUp = useMemo(() => ({
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  }), [prefersReducedMotion]);
  
  // Volumetric pulse animation for depth sensors
  const sensorPulseVariants = useMemo(() => ({
    pulse: {
      boxShadow: [
        '0 0 0 0 rgba(255,255,255,0)',
        '0 0 20px 2px rgba(255,255,255,0.3)',
        '0 0 0 0 rgba(255,255,255,0)'
      ],
      transition: { duration: 2, repeat: Infinity }
    }
  }), []);
  

  // Accurate technical specs - 4 depth sensors only (numeric for AnimatedCounter)
  const technicalSpecs = useMemo(() => [
    { label: 'Depth Sensors', value: 4, displayValue: '4', unit: 'units', prefix: '', suffix: '' },
    { label: 'Frame Rate', value: 60, displayValue: '60', unit: 'FPS', prefix: '', suffix: '' },
    { label: 'Latency', value: 100, displayValue: '<100', unit: 'ms', prefix: '<', suffix: '' },
    { label: 'Technology', value: 0, displayValue: 'Proprietary', unit: 'Algorithm', prefix: '', suffix: '', isText: true },
  ], []);

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden selection:bg-white/20">
      <DepthField />
      <CinematicGrain />
      
      {/* HERO SECTION */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-24 md:pt-32 pb-20 px-6 overflow-hidden">
        {/* Ambient glow */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)',
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Top Label */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center gap-4 mb-16"
          >
            <motion.div 
              className="w-16 h-[1px] bg-white/40"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            <span className="font-mono text-[10px] tracking-[0.4em] text-white/50 uppercase">
              Private Research / 2026
            </span>
          </motion.div>

          {/* Main Title with staggered animation */}
          <div className="overflow-hidden mb-8">
            <motion.h1 
              className="font-display text-[clamp(4rem,14vw,12rem)] leading-[0.8] tracking-tighter uppercase"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              THE CRYPT
            </motion.h1>
          </div>
          
          <div className="overflow-hidden mb-16">
            <motion.p 
              className="font-mono text-[clamp(0.8rem,1.5vw,1rem)] tracking-[0.3em] text-white/40 uppercase max-w-2xl"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              Volumetric Video in Spatial Computing
            </motion.p>
          </div>

          {/* CTA Button - positioned above manifesto to avoid metric overlap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mb-12"
          >
            {/* Watch Experience Button - GPU optimized, responsive sizing */}
            <motion.button
              onClick={() => setShowVideoModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm px-5 py-3 rounded-full border border-white/20 transition-all will-change-transform"
              style={{ transform: 'translateZ(0)' }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Play className="w-4 h-4 text-white fill-white" />
              </motion.div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-white">Watch</span>
            </motion.button>
          </motion.div>

          {/* Manifesto text */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="max-w-4xl mb-20"
          >
            <p className="font-sans text-lg md:text-xl lg:text-2xl leading-[1.7] text-white/60">
              We captured a single moment from multiple angles using only depth sensors and a proprietary algorithm. 
              No green screen. No manual intervention. Just pure real-time volumetric presence.
            </p>
          </motion.div>
        </div>

        {/* Hero Stats Grid - Volumetric depth animations with AnimatedCounter */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="absolute bottom-12 left-6 md:left-12 lg:left-20 right-6 md:right-12 lg:right-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10">
            {technicalSpecs.map((spec, i) => (
              <motion.div 
                key={spec.label}
                className="bg-[#030303] p-6 md:p-8 group min-w-0"
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 1.4 + i * 0.1 }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                {/* Depth sensor pulse effect on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%)',
                  }}
                  animate={!prefersReducedMotion ? {
                    scale: [1, 1.2, 1],
                    opacity: [0, 0.3, 0],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />
                <span className="font-mono text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.25em] text-white/30 uppercase block mb-3">
                  {spec.label}
                </span>
                <div className="flex items-baseline gap-2 min-w-0">
                  <motion.span 
                    className="font-display text-2xl md:text-3xl lg:text-4xl text-white uppercase block truncate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: prefersReducedMotion ? 0 : 1.6 + i * 0.1 }}
                  >
                    {spec.isText ? (
                      spec.displayValue
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
                  <span className="font-mono text-[9px] md:text-[10px] text-white/30 uppercase">
                    {spec.unit}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SYSTEM VISUALIZATION SECTION */}
      <section ref={systemRef} className="relative min-h-screen flex items-center px-6 md:px-12 lg:px-20 py-32">
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
              <SensorArray />
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
      <section ref={experienceRef} className="relative py-32 px-6 md:px-12 lg:px-20">
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

              {/* Content area */}
              <div className="relative aspect-[21/9] bg-gradient-to-b from-[#050505] via-[#080808] to-[#050505] flex items-center justify-center overflow-hidden">
                {/* Interactive 3D volumetric capture - drag to orbit */}
                <CryptVolumetric3D
                  webmSrc="/work/crypt-demo.webm"
                  mp4Src="/work/crypt-demo.mp4"
                  posterSrc="/work/the-crypt.jpg"
                  depthIntensity={0.38}
                  height="70vh"
                />
                
                {/* Subtle overlay to ensure UI readability */}
                <div className="absolute inset-0 bg-[#030303]/30 z-[1]" />
                
                {/* Grid overlay */}
                <div 
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`,
                    backgroundSize: '80px 80px',
                  }}
                />
                
                {/* Animated scanlines */}
                <motion.div 
                  className="absolute inset-0 z-[2]"
                  style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
                  }}
                  animate={{ backgroundPosition: ['0px 0px', '0px 100px'] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                />

                {/* Warping distortion effect - subtle glitch/heat wave */}
                <svg className="absolute inset-0 w-full h-full z-[1] pointer-events-none opacity-[0.08]" style={{ mixBlendMode: 'overlay' }}>
                  <defs>
                    <filter id="warp" x="0" y="0" width="100%" height="100%">
                      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.008" numOctaves="2" result="noise">
                        <animate attributeName="baseFrequency" dur="20s" values="0.004 0.008;0.008 0.004;0.004 0.008" repeatCount="indefinite" />
                      </feTurbulence>
                      <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                  </defs>
                  <rect width="100%" height="100%" filter="url(#warp)" fill="rgba(255,255,255,0.1)" />
                </svg>

                {/* Additional chromatic aberration warp layer */}
                <motion.div
                  className="absolute inset-0 z-[1] pointer-events-none opacity-[0.03]"
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

                {/* HUD Elements - moved to corners away from button */}
                <div className="absolute top-2 left-2 md:top-4 md:left-4 font-mono text-[9px] md:text-[10px] tracking-wider text-white/30 uppercase">
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-white"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span>REC ● LIVE</span>
                  </div>
                  <div className="mt-1 text-white/20">DEPTH: 4.2M</div>
                </div>
                
                <div className="absolute top-2 right-2 md:top-4 md:right-4 font-mono text-[9px] md:text-[10px] tracking-wider text-white/30 uppercase text-right">
                  <div>60 FPS</div>
                  <div className="text-white/20">&lt;100ms LATENCY</div>
                </div>

                {/* Bottom timeline */}
                <div className="absolute bottom-6 left-6 right-6">
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
            className="font-mono text-[10px] tracking-[0.4em] text-white/30 uppercase mb-8"
          >
            Private Research Initiative
          </motion.p>
          
          <h2 className="font-display text-[clamp(3rem,10vw,8rem)] leading-[0.85] tracking-tighter uppercase mb-8">
            THE CRYPT
          </h2>
          
          <p className="font-sans text-xl md:text-2xl leading-[1.8] text-white/40 max-w-3xl mx-auto mb-16">
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
          
          <div className="flex items-center gap-4">
            <span className="font-mono text-[9px] tracking-[0.15em] text-white/20 uppercase">Next</span>
            <ChevronRight size={14} className="text-white/20" />
            <Link 
              href="/work/stability-ai"
              className="font-mono text-[10px] tracking-[0.2em] text-white/40 hover:text-white uppercase transition-colors"
            >
              Stability AI
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
