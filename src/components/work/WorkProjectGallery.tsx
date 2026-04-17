'use client';

import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { useCursor } from '@/context/CursorContext';

// ============================================
// PHOTO FRAME COMPONENT - Steve Jobs Level Design
// ============================================
interface PhotoFrameProps {
  src: string;
  alt: string;
  caption?: string;
  index: number;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'wide';
}

function PhotoFrame({ src, alt, caption, index, aspectRatio = 'wide' }: PhotoFrameProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { setCursorState } = useCursor();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const springY = useSpring(y, { stiffness: 100, damping: 30 });
  const springScale = useSpring(scale, { stiffness: 100, damping: 30 });

  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[21/9]',
  };

  return (
    <motion.div
      ref={ref}
      style={{ y: springY, scale: springScale, opacity }}
      className="relative group"
      onMouseEnter={() => {
        setIsHovered(true);
        setCursorState('hover');
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setCursorState('default');
      }}
    >
      {/* Outer Frame with subtle border */}
      <div className="relative p-3 bg-[#0D0D0D] border border-[#1a1a1a] rounded-sm">
        {/* Inner Frame - The "Bezel" */}
        <div className={`relative ${aspectClasses[aspectRatio]} overflow-hidden bg-[#0a0a0a] rounded-sm`}>
          {/* Loading Skeleton */}
          <AnimatePresence>
            {!isLoaded && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#0D0D0D] to-[#1a1a1a]"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image with parallax */}
          <motion.img
            src={src}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            className="w-full h-full object-cover"
            animate={{
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Glass Reflection Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.3 : 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* Hover Overlay with Index */}
          <motion.div
            className="absolute inset-0 flex items-end justify-between p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="font-display text-7xl text-white/10">
              0{index + 1}
            </span>
          </motion.div>

          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-[1px] bg-white/20" />
          <div className="absolute top-0 left-0 w-[1px] h-8 bg-white/20" />
          <div className="absolute top-0 right-0 w-8 h-[1px] bg-white/20" />
          <div className="absolute top-0 right-0 w-[1px] h-8 bg-white/20" />
          <div className="absolute bottom-0 left-0 w-8 h-[1px] bg-white/20" />
          <div className="absolute bottom-0 left-0 w-[1px] h-8 bg-white/20" />
          <div className="absolute bottom-0 right-0 w-8 h-[1px] bg-white/20" />
          <div className="absolute bottom-0 right-0 w-[1px] h-8 bg-white/20" />
        </div>

        {/* Caption with reveal animation */}
        {caption && (
          <motion.div
            className="mt-4 flex items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 10 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="font-sans text-xs text-[#525252] tracking-wide max-w-[80%]">
              {caption}
            </p>
            <span className="font-mono text-[10px] text-tertiary tracking-widest uppercase">
              Fig. 0{index + 1}
            </span>
          </motion.div>
        )}
      </div>

      {/* Ambient Glow on Hover */}
      <motion.div
        className="absolute -inset-4 bg-gradient-to-r from-white/5 via-transparent to-white/5 rounded-lg blur-2xl -z-10"
        animate={{ opacity: isHovered ? 0.5 : 0 }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
}

// ============================================
// VIDEO FRAME COMPONENT - Cinematic Experience
// ============================================
interface VideoFrameProps {
  src: string;
  poster?: string;
  caption?: string;
}

function VideoFrame({ src, poster, caption }: VideoFrameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setCursorState } = useCursor();

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  return (
    <motion.div
      className="relative group"
      onMouseEnter={() => {
        setIsHovered(true);
        setCursorState('hover');
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setCursorState('default');
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Premium Frame Container */}
      <div className="relative p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg">
        {/* Top Bar - Device Style */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-[#0D0D0D] border-b border-[#1a1a1a] rounded-t-lg flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
            <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
            <div className="w-2 h-2 rounded-full bg-[#28c840]" />
          </div>
          <span className="font-mono text-[9px] tracking-widest text-tertiary uppercase">
            Cinematic
          </span>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video mt-8 overflow-hidden rounded-sm bg-black">
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            muted={isMuted}
            loop
            playsInline
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-cover"
          />

          {/* Custom Play Overlay */}
          <AnimatePresence>
            {!isPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                onClick={togglePlay}
              >
                <motion.button
                  className="relative w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                  <motion.div
                    className="absolute inset-0 rounded-full border border-white/30"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls Bar */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Progress Bar */}
            <div className="relative h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-white rounded-full"
                style={{ width: `${progress}%` }}
                layoutId="progress"
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  )}
                </motion.button>

                <motion.button
                  onClick={toggleMute}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
                </motion.button>
              </div>

              <motion.button
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </motion.div>

          {/* Corner Accents */}
          <div className="absolute top-4 left-4 w-12 h-[2px] bg-white/30" />
          <div className="absolute top-4 left-4 w-[2px] h-12 bg-white/30" />
          <div className="absolute top-4 right-4 w-12 h-[2px] bg-white/30" />
          <div className="absolute top-4 right-4 w-[2px] h-12 bg-white/30" />
          <div className="absolute bottom-4 left-4 w-12 h-[2px] bg-white/30" />
          <div className="absolute bottom-4 left-4 w-[2px] h-12 bg-white/30" />
          <div className="absolute bottom-4 right-4 w-12 h-[2px] bg-white/30" />
          <div className="absolute bottom-4 right-4 w-[2px] h-12 bg-white/30" />
        </div>

        {/* Caption */}
        {caption && (
          <motion.div
            className="mt-4 flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="font-sans text-sm text-[#A3A3A3] tracking-wide">
              {caption}
            </p>
            <span className="font-mono text-[10px] text-tertiary tracking-widest uppercase px-2 py-1 border border-[#262626] rounded">
              Video
            </span>
          </motion.div>
        )}
      </div>

      {/* Ambient Glow */}
      <motion.div
        className="absolute -inset-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl blur-3xl -z-10"
        animate={{ opacity: isHovered ? 0.6 : 0 }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
}

// ============================================
// MAIN GALLERY COMPONENT
// ============================================
interface WorkProjectGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
    aspectRatio?: 'video' | 'square' | 'portrait' | 'wide';
  }>;
  video?: {
    src: string;
    poster?: string;
    caption?: string;
  };
}

export function WorkProjectGallery({ images, video }: WorkProjectGalleryProps) {
  return (
    <section className="py-16 space-y-24">
      {/* Video Section - Featured */}
      {video && (
        <div className="max-w-5xl mx-auto">
          <VideoFrame
            src={video.src}
            poster={video.poster}
            caption={video.caption}
          />
        </div>
      )}

      {/* Photo Grid - Asymmetric Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-6xl mx-auto">
        {/* First Photo - Large */}
        {images[0] && (
          <div className="md:col-span-8 md:col-start-1">
            <PhotoFrame
              src={images[0].src}
              alt={images[0].alt}
              caption={images[0].caption}
              index={0}
              aspectRatio={images[0].aspectRatio || 'wide'}
            />
          </div>
        )}

        {/* Second Photo - Offset */}
        {images[1] && (
          <div className="md:col-span-6 md:col-start-6 md:-mt-32">
            <PhotoFrame
              src={images[1].src}
              alt={images[1].alt}
              caption={images[1].caption}
              index={1}
              aspectRatio={images[1].aspectRatio || 'portrait'}
            />
          </div>
        )}

        {/* Third Photo - Full Width */}
        {images[2] && (
          <div className="md:col-span-10 md:col-start-2 mt-16">
            <PhotoFrame
              src={images[2].src}
              alt={images[2].alt}
              caption={images[2].caption}
              index={2}
              aspectRatio={images[2].aspectRatio || 'video'}
            />
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================
// THREE APPROACHES SECTION
// ============================================
interface ApproachSection {
  number: string;
  title: string;
  subtitle: string;
  content: string;
  highlight?: string;
}

interface ThreeApproachesProps {
  approaches: ApproachSection[];
}

function ApproachCard({ approach, index }: { approach: ApproachSection; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const { setCursorState } = useCursor();

  const colors = ['#22C55E', '#3B82F6', '#EC4899'];
  const accentColor = colors[index % colors.length];

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => {
        setIsHovered(true);
        setCursorState('hover');
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setCursorState('default');
      }}
    >
      {/* Card Container */}
      <div className="relative p-8 md:p-10 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden">
        {/* Background Gradient on Hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: `radial-gradient(600px circle at ${isHovered ? '50% 0%' : '50% 100%'}, ${accentColor}10, transparent 40%)`,
          }}
        />

        {/* Number Badge */}
        <div className="relative mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 font-display text-2xl"
            style={{ borderColor: accentColor, color: accentColor }}
            animate={{
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? 5 : 0,
            }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {approach.number}
          </motion.div>

          {/* Connecting Line */}
          <motion.div
            className="absolute top-1/2 left-20 w-0 h-[2px]"
            style={{ backgroundColor: accentColor }}
            animate={{ width: isHovered ? 60 : 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Content */}
        <div className="relative space-y-4">
          <motion.span
            className="font-mono text-[10px] tracking-[0.3em] uppercase block"
            style={{ color: accentColor }}
            animate={{ x: isHovered ? 10 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {approach.subtitle}
          </motion.span>

          <h3 className="font-display text-3xl md:text-4xl text-[#F2F2F0] uppercase tracking-tight leading-none">
            {approach.title}
          </h3>

          <p className="font-sans text-[15px] text-[#A3A3A3] leading-[1.8] pt-4">
            {approach.content}
          </p>

          {/* Highlight Box */}
          {approach.highlight && (
            <motion.div
              className="mt-6 p-4 border-l-2 rounded-r-lg"
              style={{ borderLeftColor: accentColor, backgroundColor: `${accentColor}08` }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <p className="font-mono text-xs tracking-wide" style={{ color: accentColor }}>
                {approach.highlight}
              </p>
            </motion.div>
          )}
        </div>

        {/* Bottom Accent Line */}
        <motion.div
          className="absolute bottom-0 left-0 h-[3px]"
          style={{ backgroundColor: accentColor }}
          initial={{ width: '0%' }}
          whileInView={{ width: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Ambient Glow */}
      <motion.div
        className="absolute -inset-4 rounded-xl blur-2xl -z-10"
        style={{ backgroundColor: accentColor }}
        animate={{ opacity: isHovered ? 0.15 : 0 }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
}

export function ThreeApproaches({ approaches }: ThreeApproachesProps) {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-20">
      {/* Section Header */}
      <motion.div
        className="max-w-6xl mx-auto mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-[1px] bg-[#333]" />
          <span className="font-mono text-[10px] tracking-[0.4em] text-tertiary uppercase">
            Methodology
          </span>
        </div>
        <h2 className="font-display text-5xl md:text-6xl text-[#F2F2F0] uppercase tracking-tight leading-none">
          Three Perspectives
        </h2>
      </motion.div>

      {/* Approach Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {approaches.map((approach, index) => (
          <ApproachCard key={index} approach={approach} index={index} />
        ))}
      </div>
    </section>
  );
}

export { PhotoFrame, VideoFrame };
