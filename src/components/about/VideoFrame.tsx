'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface VideoFrameProps {
  src: string;
  orientation: 'vertical' | 'landscape';
  position: 'top-right' | 'bottom-left';
  parallaxOffset?: number;
  delay?: number;
}

export const VideoFrame = ({ 
  src, 
  orientation, 
  position, 
  parallaxOffset = 30,
  delay = 0 
}: VideoFrameProps) => {
  const frameRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "end start"]
  });

  // Parallax moves opposite to scroll for depth
  const y = useTransform(
    scrollYProgress, 
    [0, 1], 
    position === 'top-right' ? [parallaxOffset, -parallaxOffset] : [-parallaxOffset, parallaxOffset]
  );

  const isVertical = orientation === 'vertical';
  const isTopRight = position === 'top-right';

  // Positioning classes
  const positionClasses = isTopRight
    ? 'absolute top-[8vh] right-[5vw] md:right-[8vw]'
    : 'absolute bottom-[15vh] left-[3vw] md:left-[6vw]';

  // Size configurations
  const sizeClasses = isVertical
    ? 'w-[200px] h-[280px] md:w-[260px] md:h-[360px] lg:w-[300px] lg:h-[420px]'
    : 'w-[320px] h-[180px] md:w-[420px] md:h-[236px] lg:w-[480px] lg:h-[270px]';

  return (
    <motion.div
      ref={frameRef}
      className={`${positionClasses} ${sizeClasses} z-10`}
      style={{ 
        y,
        willChange: 'transform',
        transform: 'translateZ(0)',
        contain: 'layout style paint',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 1.2, 
        delay: delay,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      <div 
        className="relative w-full h-full overflow-hidden rounded-sm"
        style={{
          background: 'rgba(13, 13, 13, 0.6)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.1)',
        }}
      >
        {/* Corner accents - subtle branding */}
        <div className="absolute top-0 left-0 w-6 h-[1px] bg-[#6366f1]/40" />
        <div className="absolute top-0 left-0 w-[1px] h-6 bg-[#6366f1]/40" />
        <div className="absolute top-0 right-0 w-6 h-[1px] bg-[#6366f1]/40" />
        <div className="absolute top-0 right-0 w-[1px] h-6 bg-[#6366f1]/40" />
        <div className="absolute bottom-0 left-0 w-6 h-[1px] bg-[#6366f1]/40" />
        <div className="absolute bottom-0 left-0 w-[1px] h-6 bg-[#6366f1]/40" />
        <div className="absolute bottom-0 right-0 w-6 h-[1px] bg-[#6366f1]/40" />
        <div className="absolute bottom-0 right-0 w-[1px] h-6 bg-[#6366f1]/40" />

        {/* Video element - optimized with hardware acceleration */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover opacity-75"
          style={{ 
            filter: 'contrast(1.1) saturate(0.9)',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        >
          <source src={src} type="video/mp4" />
          <source src={src.replace('.mp4', '.webm')} type="video/webm" />
        </video>

        {/* Subtle overlay for depth */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, transparent 50%, rgba(139, 92, 246, 0.05) 100%)',
          }}
        />

        {/* Vignette */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.4)',
          }}
        />
      </div>

    </motion.div>
  );
};

export default VideoFrame;
