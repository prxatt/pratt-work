'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { getVideoUrl } from '@/lib/media';

interface Capability {
  id: string;
  number: string;
  title: string;
  description: string;
  secondaryText: string;
  mp4Src: string;
  webmSrc: string;
}

const capabilities: Capability[] = [
  {
    id: 'exp',
    number: '01',
    title: 'Experiential Strategy',
    description: 'Translating brand objectives into immersive experiences that create cultural connections.',
    secondaryText: 'Strategic concepting, vendor orchestration, and production leadership for multi-dimensional activations.',
    mp4Src: getVideoUrl('/videos/stability-exp.mp4'),
    webmSrc: getVideoUrl('/videos/stability-exp.webm'),
  },
  {
    id: 'live',
    number: '02',
    title: 'Live Production',
    description: 'Large-scale activations for 500+ attendees with streaming infrastructure reaching 10K+ concurrent viewers.',
    secondaryText: 'Managing cross-functional teams and $1M budgets from concept through execution.',
    mp4Src: getVideoUrl('/videos/wb-prod.mp4'),
    webmSrc: getVideoUrl('/videos/wb-prod.webm'),
  },
  {
    id: 'immersive',
    number: '03',
    title: 'Immersive Content',
    description: 'VR/AR experiences and 360° video for enterprise training and brand storytelling.',
    secondaryText: 'Complete production oversight from creative concepts to platform optimization.',
    mp4Src: getVideoUrl('/videos/tcy-immersive.mp4'),
    webmSrc: getVideoUrl('/videos/tcy-immersive.webm'),
  },
  {
    id: 'ai',
    number: '04',
    title: 'AI Workflow Design',
    description: 'Building tools and systems that remove friction from creative processes.',
    secondaryText: 'Productivity platforms to automation frameworks that accelerate ideation.',
    mp4Src: getVideoUrl('/videos/st-ai.mp4'),
    webmSrc: getVideoUrl('/videos/st-ai.webm'),
  },
];

// Optimized Video Frame Component with mp4+webm support
interface VideoFrameProps {
  mp4Src: string;
  webmSrc: string;
  label: string;
  cropTopBottom?: boolean;
}

const VideoFrame = React.memo(
  ({ mp4Src, webmSrc, label, cropTopBottom }: VideoFrameProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.load();

    const startPlayback = () => {
      video.play().catch(() => {
        // Autoplay blocked - video will show first frame
      });
    };

    const onReady = () => {
      setCanPlay(true);
      startPlayback();
    };

    video.addEventListener('canplaythrough', onReady);

    const fallbackTimer = setTimeout(() => setCanPlay(true), 500);

    return () => {
      clearTimeout(fallbackTimer);
      video.removeEventListener('canplaythrough', onReady);
    };
  }, [mp4Src, webmSrc]);

  return (
    <div 
      className="relative w-full max-w-3xl aspect-video max-h-[min(28rem,70vw)] bg-[#141414] overflow-hidden"
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)',
        willChange: 'transform',
        transform: 'translateZ(0)',
        contain: 'layout style paint',
      }}
    >
      {/* Loading placeholder - disappears when video ready */}
      <div 
        className="absolute inset-0 flex items-center justify-center bg-[#141414] transition-opacity duration-300"
        style={{ opacity: canPlay ? 0 : 1, pointerEvents: 'none' }}
      >
        <span className="font-mono text-[10px] text-[#4A4A47] uppercase tracking-[0.2em]">[ {label} ]</span>
      </div>
      
      {/* Video - visible immediately, plays when ready */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className={`absolute inset-0 w-full h-full object-cover ${cropTopBottom ? 'object-[center_28%]' : ''}`}
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      >
        <source src={webmSrc} type="video/webm" />
        <source src={mp4Src} type="video/mp4" />
      </video>
      
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/5 via-transparent to-[#8B5CF6]/5 pointer-events-none" />
      
      {/* Corner accents */}
      <div className="absolute top-3 right-3 w-2 h-2 bg-[#6366f1]/30 rounded-full" />
      <div className="absolute top-3 right-7 w-2 h-2 bg-[#333] rounded-full" />
    </div>
  );
  }
);

const itemVariants = {
  hidden: { opacity: 0, y: 60, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const CapabilityItem = ({ cap, index }: { cap: Capability; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="py-16 lg:py-24 border-t border-[#1a1a1a]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        
        {/* Text Column */}
        <div className={`${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
          {/* Number */}
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] as const }}
            className="font-display text-[60px] lg:text-[80px] text-[#F2F2F0]/[0.03] leading-none block mb-4"
          >
            {cap.number}
          </motion.span>
          
          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.15 + 0.1, ease: [0.16, 1, 0.3, 1] as const }}
            className="font-display text-[#F2F2F0] uppercase text-3xl md:text-4xl lg:text-5xl leading-[0.95] mb-6"
          >
            {cap.title}
          </motion.h3>
          
          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.15 + 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="font-mono text-[11px] text-[#8A8A85] uppercase tracking-[0.1em] leading-[1.8] mb-6"
          >
            {cap.description}
          </motion.p>
          
          {/* Secondary text with line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: index * 0.15 + 0.3 }}
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 + 0.35, ease: [0.16, 1, 0.3, 1] as const }}
              className="w-12 h-[1px] bg-[#333] mb-4 origin-left"
            />
            <p className="font-sans text-[14px] text-[#8A8A85] leading-[1.8]">
              {cap.secondaryText}
            </p>
          </motion.div>
        </div>

        {/* Video Column - One video frame per capability */}
        <div className={`${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.15 + 0.25, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <VideoFrame 
              mp4Src={cap.mp4Src} 
              webmSrc={cap.webmSrc} 
              label={cap.title.split(' ')[0]}
              cropTopBottom={cap.id === 'immersive'}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export const CapabilitiesSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <section id="capabilities" ref={containerRef} className="bg-[#0D0D0D] py-24 md:py-32 relative">
      <div className="px-6 md:px-12 lg:px-20">
        {/* Section header - asymmetric layout */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 lg:mb-24">
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-mono text-[11px] text-[#8A8A85] uppercase tracking-[0.4em] block mb-4">
              What I Do
            </span>
            <h2 className="font-display text-[#F2F2F0] uppercase text-5xl md:text-6xl lg:text-7xl leading-[0.9]">
              Capabilities
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:text-right mt-8 lg:mt-0 lg:max-w-xs"
          >
            <p className="font-mono text-[11px] text-[#8A8A85] uppercase tracking-[0.15em] leading-[1.8]">
              Blending creative direction with technical execution
            </p>
          </motion.div>
        </div>

        {/* Capability items - each with their own video frame */}
        <div>
          {capabilities.map((cap, index) => (
            <CapabilityItem key={cap.id} cap={cap} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
