'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

interface VideoMuteToggleProps {
  defaultMuted?: boolean;
  className?: string;
  phosphor?: string;
}

// Steve Jobs Level: Elegant mute/unmute toggle for mobile videos
// Default muted so users can choose to enable audio
export const VideoMuteToggle: React.FC<VideoMuteToggleProps> = ({ 
  defaultMuted = true,
  className = '',
  phosphor = '#39FF14'
}) => {
  const [isMuted, setIsMuted] = useState(defaultMuted);
  const [isHovered, setIsHovered] = useState(false);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    // Dispatch custom event for videos to listen to
    const event = new CustomEvent('videoMuteToggle', { 
      detail: { muted: newMuted } 
    });
    window.dispatchEvent(event);
  }, [isMuted]);

  return (
    <motion.button
      onClick={toggleMute}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        relative flex items-center gap-2 px-3 py-2 
        bg-black/60 backdrop-blur-md rounded-full 
        border border-white/20 
        hover:bg-black/80 hover:border-white/40
        transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-white/20
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isMuted ? 'Unmute video' : 'Mute video'}
      aria-pressed={isMuted}
    >
      {/* Icon with morphing animation */}
      <div className="relative w-5 h-5">
        <AnimatePresence mode="wait">
          {isMuted ? (
            <motion.div
              key="muted"
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <VolumeX 
                className="w-5 h-5 text-white/60" 
                strokeWidth={1.5}
              />
            </motion.div>
          ) : (
            <motion.div
              key="unmuted"
              initial={{ scale: 0.5, opacity: 0, rotate: 20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Volume2 
                className="w-5 h-5" 
                strokeWidth={1.5}
                style={{ color: phosphor }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Sound wave animation when unmuted */}
        {!isMuted && (
          <motion.div
            className="absolute -right-1 top-1/2 -translate-y-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-0.5 h-2 rounded-full"
              style={{ backgroundColor: phosphor }}
              animate={{ 
                scaleY: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ 
                duration: 0.6, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </motion.div>
        )}
      </div>

      {/* Label with slide animation */}
      <div className="relative h-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={isMuted ? 'muted' : 'unmuted'}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="block font-mono text-[10px] uppercase tracking-wider whitespace-nowrap"
            style={{ 
              color: isMuted ? 'rgba(255,255,255,0.5)' : phosphor 
            }}
          >
            {isMuted ? 'Muted' : 'Sound On'}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Tooltip on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-[9px] font-mono uppercase tracking-wider text-white/70 whitespace-nowrap border border-white/10"
          >
            {isMuted ? 'Click to unmute' : 'Click to mute'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// Hook for videos to sync with the mute toggle
export const useVideoMuteSync = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const [isMuted, setIsMuted] = useState(false);

  React.useEffect(() => {
    const handleMuteToggle = (event: CustomEvent<{ muted: boolean }>) => {
      if (videoRef.current) {
        videoRef.current.muted = event.detail.muted;
        setIsMuted(event.detail.muted);
      }
    };

    // Listen for mute toggle events
    window.addEventListener('videoMuteToggle', handleMuteToggle as EventListener);

    // Set initial state (unmuted)
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }

    return () => {
      window.removeEventListener('videoMuteToggle', handleMuteToggle as EventListener);
    };
  }, [videoRef]);

  return { isMuted };
};
