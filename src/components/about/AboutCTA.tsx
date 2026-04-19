'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { getVideoUrl } from '@/lib/media';

// Portrait Video Frame Component
const PortraitVideoFrame = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canPlay, setCanPlay] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  // Fast video startup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.load();

    const handleCanPlay = () => {
      setCanPlay(true);
      video.play().catch(() => {
        // Autoplay blocked
      });
    };

    video.addEventListener('canplaythrough', handleCanPlay);
    const fallbackTimer = setTimeout(() => setCanPlay(true), 300);

    return () => {
      video.removeEventListener('canplaythrough', handleCanPlay);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex justify-center"
    >
      <div
        className="relative w-full max-w-[280px] h-[320px] bg-[#141414] overflow-hidden"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)',
        }}
      >
        {/* Video - same frame size */}
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
          <source src={getVideoUrl('/videos/pr8-ff-portrait.webm')} type="video/webm" />
          <source src={getVideoUrl('/videos/pr8-ff-portrait.mp4')} type="video/mp4" />
        </video>

        {/* Loading placeholder */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-[#141414]"
          style={{ opacity: canPlay ? 0 : 1 }}
        >
          <span className="font-mono text-[11px] text-[#8A8A85] uppercase tracking-[0.2em]">[ Portrait ]</span>
        </div>
      </div>
    </motion.div>
  );
};

// Letter animation component
const AnimatedHeading = ({ text }: { text: string }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const letters = text.split('');

  return (
    <h2
      ref={ref}
      className="font-display text-[#F2F2F0] uppercase text-center"
      style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', lineHeight: 0.9, whiteSpace: 'nowrap' }}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: -40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.5,
            delay: index * 0.04,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block"
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </h2>
  );
};

export const AboutCTA = () => {
  return (
    <section className="bg-[#0D0D0D] py-32">
      <div className="px-6 md:px-12 lg:px-20">
        {/* Animated heading */}
        <AnimatedHeading text="LET'S CONNECT" />

        {/* Three column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16 items-center">
          {/* Left: Statement */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono text-[12px] text-[#8A8A85] uppercase tracking-[0.08em] leading-[1.8] text-center"
          >
            READY TO ARCHITECT EXPERIENCES THAT INSPIRE THE WORLD TO EXPERIENCE BETTER.
          </motion.p>

          {/* Center: Portrait video frame */}
          <PortraitVideoFrame />

          {/* Right: Social links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <span className="font-mono text-[11px] text-[#8A8A85] uppercase tracking-[0.15em]">
              CONNECT
            </span>
            <div className="flex flex-col gap-3 text-center">
              <a
                href="https://linkedin.com/in/prxatt"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[12px] text-[#8A8A85] uppercase tracking-[0.1em] hover:text-[#F2F2F0] transition-colors duration-300"
              >
                LINKEDIN ↗
              </a>
              <a
                href="https://twitter.com/prxatt"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[12px] text-[#8A8A85] uppercase tracking-[0.1em] hover:text-[#F2F2F0] transition-colors duration-300"
              >
                TWITTER ↗
              </a>
              <a
                href="mailto:pratt@example.com"
                className="font-mono text-[12px] text-[#8A8A85] uppercase tracking-[0.1em] hover:text-[#F2F2F0] transition-colors duration-300"
              >
                EMAIL ↗
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
