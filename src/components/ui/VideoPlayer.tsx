'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Maximize, Minimize, Volume2, Volume1, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
  webmSrc: string;
  mp4Src: string;
  poster?: string;
  accentColor: string;
  title?: string;
  subtitle?: string;
  /** Optional small label in the top-left of the controls overlay (e.g. event / deck id). */
  deckLabel?: string;
}

export function VideoPlayer({ webmSrc, mp4Src, poster, accentColor, title, subtitle, deckLabel }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  /** Once true, the large poster/play overlay stays dismissed (paused mid-video shows the frame + controls). */
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const volumeSliderRef = useRef<HTMLDivElement>(null);
  const isSeekingRef = useRef(false);
  const isAdjustingVolumeRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const detectTouch = () => {
      setIsTouchDevice(('ontouchstart' in window) || navigator.maxTouchPoints > 0);
    };
    detectTouch();
    window.addEventListener('resize', detectTouch);
    return () => window.removeEventListener('resize', detectTouch);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => {
      setHasStartedPlayback(true);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      video.volume = volume;
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const updateVolumeFromClientX = useCallback((clientX: number, sliderEl: HTMLDivElement) => {
    const video = videoRef.current;
    if (!video) return 0;
    const rect = sliderEl.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, clickX / rect.width));
    
    setVolume(newVolume);
    video.volume = newVolume;
    
    if (newVolume === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
    return newVolume;
  }, [isMuted]);

  const updateSeekFromClientX = useCallback((clientX: number, seekEl: HTMLDivElement) => {
    const video = videoRef.current;
    if (!video || !video.duration) return 0;
    const rect = seekEl.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    const newTime = (newProgress / 100) * video.duration;
    
    video.currentTime = newTime;
    setProgress(newProgress);
    setCurrentTime(newTime);
    return newProgress;
  }, []);

  const handleVolumeChange = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    updateVolumeFromClientX(e.clientX, e.currentTarget);
  }, [updateVolumeFromClientX]);

  const handleSeek = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    updateSeekFromClientX(e.clientX, e.currentTarget);
  }, [updateSeekFromClientX]);

  const beginSeek = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    isSeekingRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    updateSeekFromClientX(e.clientX, e.currentTarget);
  }, [updateSeekFromClientX]);

  const dragSeek = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeekingRef.current) return;
    updateSeekFromClientX(e.clientX, e.currentTarget);
  }, [updateSeekFromClientX]);

  const endSeek = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    isSeekingRef.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }, []);

  const beginVolume = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    isAdjustingVolumeRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    updateVolumeFromClientX(e.clientX, e.currentTarget);
  }, [updateVolumeFromClientX]);

  const dragVolume = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isAdjustingVolumeRef.current) return;
    updateVolumeFromClientX(e.clientX, e.currentTarget);
  }, [updateVolumeFromClientX]);

  const endVolume = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    isAdjustingVolumeRef.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    if (!(isFullscreen || pseudoFullscreen)) {
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        } else if ((container as any).msRequestFullscreen) {
          await (container as any).msRequestFullscreen();
        } else if ((video as any).webkitEnterFullscreen) {
          (video as any).webkitEnterFullscreen();
          setIsFullscreen(true);
        } else {
          setPseudoFullscreen(true);
          document.body.style.overflow = 'hidden';
        }
      } catch (err) {
        setPseudoFullscreen(true);
        document.body.style.overflow = 'hidden';
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        } else if (pseudoFullscreen) {
          setPseudoFullscreen(false);
          document.body.style.overflow = '';
        }
      } catch (err) {
        if (pseudoFullscreen) {
          setPseudoFullscreen(false);
          document.body.style.overflow = '';
        }
      }
    }
  }, [isFullscreen, pseudoFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const nativeFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(nativeFs);
      if (!nativeFs && !pseudoFullscreen) {
        document.body.style.overflow = '';
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange as EventListener);
    document.addEventListener('keydown', handleKeyDown);

    const video = videoRef.current as any;
    const onWebkitEnd = () => setIsFullscreen(false);
    video?.addEventListener?.('webkitendfullscreen', onWebkitEnd);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange as EventListener);
      document.removeEventListener('keydown', handleKeyDown);
      video?.removeEventListener?.('webkitendfullscreen', onWebkitEnd);
    };
  }, [isFullscreen, pseudoFullscreen, togglePlay, toggleFullscreen, toggleMute]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative bg-[#141414] overflow-hidden group ${(isFullscreen || pseudoFullscreen) ? 'fixed inset-0 z-[100]' : ''}`}
      style={{ 
        clipPath: (isFullscreen || pseudoFullscreen) ? 'none' : 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)'
      }}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={showControlsTemporarily}
    >
      {/* Corner brackets - technical */}
      <div className="absolute top-0 left-0 w-16 h-[2px] z-20" style={{ backgroundColor: accentColor }} />
      <div className="absolute top-0 left-0 w-[2px] h-16 z-20" style={{ backgroundColor: accentColor }} />
      <div className="absolute top-0 right-0 w-16 h-[2px] z-20" style={{ backgroundColor: accentColor }} />
      <div className="absolute top-0 right-0 w-[2px] h-16 z-20" style={{ backgroundColor: accentColor }} />
      <div className="absolute bottom-0 left-0 w-16 h-[2px] z-20" style={{ backgroundColor: accentColor }} />
      <div className="absolute bottom-0 left-0 w-[2px] h-16 z-20" style={{ backgroundColor: accentColor }} />

      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full aspect-video sm:aspect-[21/9] object-cover"
        poster={poster}
        preload="metadata"
        muted={isMuted}
        playsInline
        onClick={togglePlay}
      >
        <source src={webmSrc} type="video/webm" />
        <source src={mp4Src} type="video/mp4" />
      </video>

      {/* Initial play overlay */}
      <AnimatePresence>
        {!isPlaying && !hasStartedPlayback && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-cover bg-center"
            style={
              poster
                ? {
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${poster})`,
                  }
                : { backgroundColor: 'rgba(0,0,0,0.5)' }
            }
            onClick={togglePlay}
          >
            <div className="text-center">
              <motion.div
                className="w-24 h-24 mx-auto mb-4 flex items-center justify-center border-2 rounded-full"
                style={{ borderColor: `${accentColor}40` }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play size={32} style={{ color: accentColor }} />
              </motion.div>
              {title && (
                <span className="font-mono text-xs tracking-[0.3em] uppercase block" style={{ color: accentColor }}>
                  {title}
                </span>
              )}
              {subtitle && (
                <div className="mt-2 font-mono text-[10px] text-[#666] tracking-wider">
                  {subtitle}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording indicator */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
        <motion.div 
          className="w-2 h-2 rounded-full bg-red-500"
          animate={{ opacity: isPlaying ? [1, 0.3, 1] : 0.3 }}
          transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
        />
        <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">
          {isPlaying ? 'REC' : 'PAUSED'}
        </span>
      </div>

      {/* Custom controls overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"
          >
            {/* Bottom control bar */}
            <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-6 pt-2 pb-3 sm:pb-4 pointer-events-auto">
              {/* Progress bar */}
              <div 
                className="relative h-1 bg-white/20 rounded-full overflow-hidden mb-3 sm:mb-4 cursor-pointer"
                onPointerDown={beginSeek}
                onPointerMove={dragSeek}
                onPointerUp={endSeek}
                onPointerCancel={endSeek}
                onClick={handleSeek}
              >
                <motion.div
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{ backgroundColor: accentColor, width: `${progress}%` }}
                  layoutId="wb-progress"
                />
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
                  style={{ left: `calc(${progress}% - 6px)` }}
                  animate={{ 
                    boxShadow: isPlaying ? [
                      `0 0 10px ${accentColor}50`,
                      `0 0 20px ${accentColor}80`,
                      `0 0 10px ${accentColor}50`
                    ] : `0 0 10px ${accentColor}50`
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              {/* Controls row */}
              <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-2">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                  {/* Play/Pause */}
                  <motion.button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors pointer-events-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isPlaying ? (
                      <Pause size={18} className="text-white" />
                    ) : (
                      <Play size={18} className="text-white ml-0.5" />
                    )}
                  </motion.button>

                  {/* Volume control with slider */}
                  <div 
                    className="relative flex items-center gap-2"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <motion.button
                      onClick={toggleMute}
                      onTouchStart={() => setShowVolumeSlider(true)}
                      className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors pointer-events-auto"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX size={18} className="text-white/60" />
                      ) : volume < 0.5 ? (
                        <Volume1 size={18} className="text-white" />
                      ) : (
                        <Volume2 size={18} className="text-white" />
                      )}
                    </motion.button>
                    
                    {/* Volume slider */}
                    <motion.div
                      ref={volumeSliderRef}
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ 
                        width: (showVolumeSlider || isTouchDevice) ? 80 : 0, 
                        opacity: (showVolumeSlider || isTouchDevice) ? 1 : 0 
                      }}
                      transition={{ duration: 0.2 }}
                      className="relative h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer pointer-events-auto"
                      style={{ width: (showVolumeSlider || isTouchDevice) ? 80 : 0 }}
                      onPointerDown={beginVolume}
                      onPointerMove={dragVolume}
                      onPointerUp={endVolume}
                      onPointerCancel={endVolume}
                      onClick={handleVolumeChange}
                    >
                      <motion.div
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{ 
                          backgroundColor: accentColor, 
                          width: `${(isMuted ? 0 : volume) * 100}%` 
                        }}
                      />
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"
                        style={{ 
                          left: `calc(${(isMuted ? 0 : volume) * 100}% - 4px)`,
                          boxShadow: `0 0 8px ${accentColor}` 
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Time display */}
                  <span className="font-mono text-[9px] sm:text-[10px] text-white/60 tracking-wider tabular-nums shrink-0">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Fullscreen toggle */}
                <motion.button
                  onClick={toggleFullscreen}
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {(isFullscreen || pseudoFullscreen) ? (
                    <Minimize size={18} className="text-white" />
                  ) : (
                    <Maximize size={18} className="text-white" />
                  )}
                </motion.button>
              </div>

              {/* Title + subtitle — single place, readable contrast (avoids duplicate top label) */}
              {(title || subtitle) && (
                <div className="mt-2 space-y-0.5 border-t border-white/10 pt-2">
                  {title && (
                    <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase truncate" style={{ color: accentColor }}>
                      {title}
                    </p>
                  )}
                  {subtitle && (
                    <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-white/50">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Top info bar — optional deck / event id (section header can carry clip index) */}
            {deckLabel ? (
              <div className="absolute top-0 left-0 right-0 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-start pointer-events-none">
                <span className="font-mono text-[8px] sm:text-[9px] text-white/50 tracking-wider truncate">
                  {deckLabel}
                </span>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
