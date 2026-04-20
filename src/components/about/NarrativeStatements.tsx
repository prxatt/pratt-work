'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { getVideoUrl } from '@/lib/media';

// Large Video Frame Component for Building Connection section - 50% viewport
interface LargeVideoFrameProps {
  mp4Src: string;
  webmSrc: string;
}

const LargeVideoFrame = ({ mp4Src, webmSrc }: LargeVideoFrameProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !mp4Src) return;

    video.load();

    const handleCanPlay = () => {
      setCanPlay(true);
      video.play().catch(() => {
        // Autoplay blocked
      });
    };

    video.addEventListener('canplaythrough', handleCanPlay);
    const fallbackTimer = setTimeout(() => setCanPlay(true), 500);

    return () => {
      video.removeEventListener('canplaythrough', handleCanPlay);
      clearTimeout(fallbackTimer);
    };
  }, [mp4Src]);
  
  return (
    <motion.div 
      ref={ref}
      className="relative w-full lg:w-[50vw] h-[400px] lg:h-[500px] bg-[#141414] overflow-hidden cursor-pointer group"
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, x: 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {mp4Src && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: canPlay ? 1 : 0,
            transition: 'opacity 0.3s ease',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        >
          {webmSrc && <source src={webmSrc} type="video/webm" />}
          <source src={mp4Src} type="video/mp4" />
        </video>
      )}

      {/* Label overlay - shows when loading */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: mp4Src && canPlay ? 0 : 1 }}
      >
        <motion.span 
          className="font-mono text-[12px] text-[#4A4A47] uppercase tracking-[0.2em]"
          animate={{ color: isHovered ? '#6366f1' : '#4A4A47' }}
        >
          [ Connection ]
        </motion.span>
      </div>
      
      {/* Corner accents */}
      <motion.div 
        className="absolute top-4 right-4 w-3 h-3 rounded-full z-10"
        animate={{ backgroundColor: isHovered ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.2)' }}
      />
      <div className="absolute top-4 right-10 w-3 h-3 bg-[#333] rounded-full z-10" />
      
      {/* Hover gradient overlay */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 60%)',
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />

      {/* Bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#6366f1] z-10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: 'left' }}
      />
    </motion.div>
  );
};

// Video Frame for the three frames section - cinematic proportions matching reference image
interface VideoFrameProps {
  label: string;
  index: number;
  mp4Src: string;
  webmSrc: string;
}

const VideoFrame = ({ label, index, mp4Src, webmSrc }: VideoFrameProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isHovered, setIsHovered] = useState(false);
  const [canPlay, setCanPlay] = useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !mp4Src) return;

    video.load();

    const handleCanPlay = () => {
      setCanPlay(true);
      video.play().catch(() => {
        // Autoplay blocked - at least video is loaded and ready
      });
    };

    video.addEventListener('canplaythrough', handleCanPlay);
    const fallbackTimer = setTimeout(() => setCanPlay(true), 500);

    return () => {
      video.removeEventListener('canplaythrough', handleCanPlay);
      clearTimeout(fallbackTimer);
    };
  }, [mp4Src]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] as const }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden cursor-pointer group flex-1"
    >
      <div 
        className={`relative w-full bg-[#141414] flex items-center justify-center overflow-hidden transition-all duration-500 ${
          isHovered ? 'bg-[#1a1a1a]' : ''
        }`}
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)',
          aspectRatio: '16/10',
          minHeight: '280px',
        }}
      >
        {mp4Src && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: canPlay ? 1 : 0,
              transition: 'opacity 0.3s ease',
              willChange: 'transform',
              transform: 'translateZ(0)',
            }}
          >
            {webmSrc && <source src={webmSrc} type="video/webm" />}
            <source src={mp4Src} type="video/mp4" />
          </video>
        )}

        {/* Label overlay - shows when loading */}
        <motion.span 
          className="font-mono text-[10px] text-[#4A4A47] uppercase tracking-[0.2em] transition-colors duration-300 relative z-10"
          animate={{ color: isHovered ? '#6366f1' : '#4A4A47' }}
          style={{ opacity: mp4Src && canPlay ? 0 : 1 }}
        >
          [ {label} ]
        </motion.span>
        
        {/* Corner accents */}
        <motion.div 
          className="absolute top-3 right-3 w-2 h-2 rounded-full z-10"
          animate={{ backgroundColor: isHovered ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.2)' }}
        />
        <div className="absolute top-3 right-7 w-2 h-2 bg-[#333] rounded-full z-10" />
        
        {/* Hover gradient overlay */}
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6366f1]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'left' }}
        />
      </div>
    </motion.div>
  );
};

// Letter Animation Component - optimized with GPU acceleration
const LetterAnimation = ({ 
  text, 
  className, 
  delay = 0,
  isInView,
  isHovered = false,
  hoverColor = '#F2F2F0',
  baseColor = '#F2F2F0'
}: { 
  text: string; 
  className?: string; 
  delay?: number;
  isInView: boolean;
  isHovered?: boolean;
  hoverColor?: string;
  baseColor?: string;
}) => {
  const letters = text.split('');
  const batchSize = Math.ceil(letters.length / 3);
  
  return (
    <span className={className}>
      {letters.map((letter, index) => {
        const batchIndex = Math.floor(index / batchSize);
        const batchDelay = batchIndex * 0.1;
        const letterDelay = index * 0.02;
        
        return (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={isInView ? { 
              opacity: 1, 
              y: 0, 
              scale: 1,
              color: isHovered ? hoverColor : baseColor
            } : { 
              opacity: 0, 
              y: 20, 
              scale: 0.9 
            }}
            transition={{
              duration: 0.4,
              delay: delay + batchDelay + letterDelay,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block will-change-transform gpu-accelerated"
            style={{ 
              whiteSpace: letter === ' ' ? 'pre' : 'normal',
              textShadow: isHovered ? '0 0 30px rgba(99,102,241,0.4)' : 'none'
            }}
            whileHover={{
              y: -4,
              scale: 1.05,
              transition: { duration: 0.15 }
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        );
      })}
    </span>
  );
};

// Hook to detect mobile for performance optimization
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const check = () => {
      setIsMobile(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
    };
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);
  
  return isMobile;
};

export const NarrativeStatements = () => {
  const containerRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Reduced motion for mobile - direct transforms (no useSpring for performance)
  const moveDistance = isMobile ? 50 : 100;
  
  // Direct scroll transforms - eliminate spring overhead
  const firstLineX = useTransform(scrollYProgress, [0, 0.3], [moveDistance, 0]);
  const secondLineX = useTransform(scrollYProgress, [0.1, 0.4], [-moveDistance, 0]);
  const thirdLineX = useTransform(scrollYProgress, [0.2, 0.5], [moveDistance, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  const refB = useRef<HTMLDivElement>(null);
  const isInViewB = useInView(refB, { once: true, margin: '-50px' });
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  return (
    <section ref={containerRef} className="bg-[#0D0D0D] relative">
      {/* First Statement - massive typography with video frames */}
      <div className="min-h-screen flex flex-col justify-center overflow-hidden py-32">
        <motion.div style={{ opacity }} className="w-full px-6 md:px-12 lg:px-20">
          <motion.div 
            style={{ 
              x: firstLineX,
              willChange: 'transform',
              transform: 'translateZ(0)',
            }} 
            className="overflow-hidden"
          >
            <LetterAnimation 
              text="Creating Moments" 
              className="font-display text-[#F2F2F0] uppercase text-[8vw] md:text-[6vw] leading-[0.9] block whitespace-nowrap"
              isInView={true}
            />
          </motion.div>
          
          <motion.div 
            style={{ 
              x: secondLineX,
              willChange: 'transform',
              transform: 'translateZ(0)',
            }} 
            className="overflow-hidden ml-[10vw]"
          >
            <LetterAnimation 
              text="That Shift" 
              className="font-display text-[#F2F2F0]/30 uppercase text-[8vw] md:text-[6vw] leading-[0.9] block whitespace-nowrap"
              delay={0.15}
              isInView={true}
            />
          </motion.div>
          
          <motion.div 
            style={{ 
              x: thirdLineX,
              willChange: 'transform',
              transform: 'translateZ(0)',
            }} 
            className="overflow-hidden ml-[5vw]"
          >
            <LetterAnimation 
              text="Perspectives" 
              className="font-display text-[#F2F2F0] uppercase text-[12vw] md:text-[9vw] leading-[0.9] block"
              delay={0.3}
              isInView={true}
            />
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-12 ml-[5vw]"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-[1px] bg-[#262626]" />
              <span className="font-mono text-[11px] text-[#8A8A85] uppercase tracking-[0.3em]">
                I build what others imagine
              </span>
            </div>
          </motion.div>

          {/* Three Video Frames - side by side, centered with equal spacing */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 flex flex-col sm:flex-row gap-4 sm:gap-5 w-full justify-center px-2 sm:px-[5vw]"
          >
            <VideoFrame label="Experiential" index={0} mp4Src={getVideoUrl('/videos/the-crypt-space.mp4')} webmSrc={getVideoUrl('/videos/the-crypt-space.webm')} />
            <VideoFrame label="Production" index={1} mp4Src={getVideoUrl('/videos/st-dd-prod.mp4')} webmSrc={getVideoUrl('/videos/st-dd-prod.webm')} />
            <VideoFrame label="Strategy" index={2} mp4Src={getVideoUrl('/videos/the-crypt-run.mp4')} webmSrc={getVideoUrl('/videos/the-crypt-run.webm')} />
          </motion.div>
        </motion.div>
      </div>

      {/* Second Statement - Building Connection to Shared Experiences */}
      <div 
        ref={refB} 
        className="min-h-screen flex items-center py-32"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-full px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            {/* Left column - large text with optimized micro-animations */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: isMobile ? 30 : 40 }}
                animate={isInViewB ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="gpu-accelerated"
              >
                <h2
                  className="font-display uppercase leading-[0.9] w-full select-none"
                  style={{ 
                    fontSize: 'clamp(2rem, 6vw, 4.5rem)',
                    wordBreak: 'keep-all',
                    overflowWrap: 'break-word',
                  }}
                >
                  {/* Building - staggered letter animation with individual hover */}
                  <motion.span 
                    className="block whitespace-nowrap cursor-pointer gpu-accelerated"
                    onMouseEnter={() => setHoveredWord('building')}
                    onMouseLeave={() => setHoveredWord(null)}
                  >
                    <LetterAnimation 
                      text="Building" 
                      isInView={isInViewB} 
                      delay={0}
                      isHovered={hoveredWord === 'building'}
                      baseColor="#F2F2F0"
                      hoverColor="#818cf8"
                    />
                  </motion.span>
                  
                  {/* Connections - premium indigo with glow effect */}
                  <motion.span 
                    className="inline-block relative whitespace-nowrap cursor-pointer gpu-accelerated"
                    initial={{ opacity: 0, y: isMobile ? 20 : 30 }}
                    animate={isInViewB ? { 
                      opacity: 1, 
                      y: 0,
                    } : {}}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.15, 
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    onMouseEnter={() => setHoveredWord('connections')}
                    onMouseLeave={() => setHoveredWord(null)}
                    style={{ 
                      color: hoveredWord === 'connections' ? '#818cf8' : '#6366f1',
                      textShadow: hoveredWord === 'connections' || isHovered
                        ? '0 0 40px rgba(99, 102, 241, 0.6), 0 0 80px rgba(99, 102, 241, 0.4)' 
                        : '0 0 20px rgba(99, 102, 241, 0.2)',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                      transform: hoveredWord === 'connections' ? 'translateY(-4px)' : 'translateY(0)',
                    }}
                  >
                    Connections
                  </motion.span>
                  
                  {/* Through - individual hover animation */}
                  <motion.span 
                    className="block whitespace-nowrap cursor-pointer gpu-accelerated"
                    initial={{ opacity: 0, y: isMobile ? 20 : 30 }}
                    animate={isInViewB ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    onMouseEnter={() => setHoveredWord('through')}
                    onMouseLeave={() => setHoveredWord(null)}
                  >
                    <LetterAnimation 
                      text="Through" 
                      isInView={isInViewB} 
                      delay={0.3}
                      isHovered={hoveredWord === 'through'}
                      baseColor="#F2F2F0"
                      hoverColor="#818cf8"
                    />
                  </motion.span>
                  
                  {/* Shared - individual hover animation */}
                  <motion.span 
                    className="block whitespace-nowrap cursor-pointer gpu-accelerated"
                    initial={{ opacity: 0, y: isMobile ? 20 : 30 }}
                    animate={isInViewB ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    onMouseEnter={() => setHoveredWord('shared')}
                    onMouseLeave={() => setHoveredWord(null)}
                  >
                    <LetterAnimation 
                      text="Shared" 
                      isInView={isInViewB} 
                      delay={0.4}
                      isHovered={hoveredWord === 'shared'}
                      baseColor="#F2F2F0"
                      hoverColor="#818cf8"
                    />
                  </motion.span>
                  
                  {/* Experiences - slide effect with individual hover */}
                  <motion.span
                    className="inline-block whitespace-nowrap cursor-pointer gpu-accelerated"
                    initial={{ opacity: 0, x: isMobile ? -15 : -30 }}
                    animate={isInViewB ? { 
                      opacity: 1, 
                      x: hoveredWord === 'experiences' ? (isMobile ? 6 : 10) : 0,
                    } : {}}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.5,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    onMouseEnter={() => setHoveredWord('experiences')}
                    onMouseLeave={() => setHoveredWord(null)}
                    style={{
                      color: hoveredWord === 'experiences' ? '#818cf8' : '#F2F2F0',
                      textShadow: hoveredWord === 'experiences' ? '0 0 30px rgba(99,102,241,0.5)' : 'none',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                    }}
                  >
                    Experiences
                  </motion.span>
                </h2>
              </motion.div>
            </div>

            {/* Right column - body text + large video frame */}
            <div className="lg:col-span-5 flex flex-col justify-end items-end">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={isInViewB ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
                className="lg:pb-8 w-full"
              >
                <motion.div 
                  className="w-8 h-[1px] bg-[#6366f1]/50 mb-6"
                  animate={{ width: isHovered ? 48 : 32 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.p 
                  className="font-sans text-[15px] text-[#8A8A85] leading-[1.8] max-w-sm"
                  animate={{ color: isHovered ? '#A3A3A3' : '#8A8A85' }}
                  transition={{ duration: 0.3 }}
                >
                  From Salesforce to Stability AI, I&apos;ve produced engaging and transformative brand 
                  experiences that push boundaries and redefine what&apos;s possible for Fortune 500s 
                  and emerging platforms.
                </motion.p>
              </motion.div>

              {/* Large Video Frame - 50% viewport on the right under body text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInViewB ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8 lg:mt-16 w-full flex justify-end"
              >
                <LargeVideoFrame mp4Src={getVideoUrl('/videos/pr8-lv.mp4')} webmSrc={getVideoUrl('/videos/pr8-lv.webm')} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
