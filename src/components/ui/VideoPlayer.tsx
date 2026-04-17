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
}

export function VideoPlayer({ webmSrc, mp4Src, poster, accentColor, title, subtitle }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const volumeSliderRef = useRef<HTMLDivElement>(null);

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
      setIsLoaded(true);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
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

  const handleVolumeChange = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
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
  }, [isMuted]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    const newTime = (newProgress / 100) * video.duration;
    
    video.currentTime = newTime;
    setProgress(newProgress);
    setCurrentTime(newTime);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        }
      } catch (err) {
        console.error('Fullscreen error:', err);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      } catch (err) {
        console.error('Exit fullscreen error:', err);
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
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
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, togglePlay, toggleFullscreen, toggleMute]);

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

  return (
    <div
      ref={containerRef}
      className={`relative bg-[#141414] overflow-hidden group ${isFullscreen ? 'fixed inset-0 z-[100]' : ''}`}
      style={{ 
        clipPath: isFullscreen ? 'none' : 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)'
      }}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
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
        className="w-full aspect-[21/9] object-cover"
        poster={poster}
        muted={isMuted}
        playsInline
        onClick={togglePlay}
      >
        <source src={webmSrc} type="video/webm" />
        <source src={mp4Src} type="video/mp4" />
      </video>

      {/* Initial play overlay */}
      <AnimatePresence>
        {!isPlaying && !isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer"
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
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4">
              {/* Progress bar */}
              <div 
                className="relative h-1 bg-white/20 rounded-full overflow-hidden mb-4 cursor-pointer pointer-events-auto"
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
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
                        width: showVolumeSlider ? 80 : 0, 
                        opacity: showVolumeSlider ? 1 : 0 
                      }}
                      transition={{ duration: 0.2 }}
                      className="relative h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer pointer-events-auto"
                      style={{ width: showVolumeSlider ? 80 : 0 }}
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
                  <span className="font-mono text-[10px] text-white/60 tracking-wider">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Fullscreen toggle */}
                <motion.button
                  onClick={toggleFullscreen}
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors pointer-events-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isFullscreen ? (
                    <Minimize size={18} className="text-white" />
                  ) : (
                    <Maximize size={18} className="text-white" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Top info bar */}
            <div className="absolute top-0 left-0 right-0 px-6 py-4 flex items-center justify-between">
              <span className="font-mono text-[9px] text-white/60 tracking-wider">
                FULLY_CONNECTED_2023
              </span>
              {title && (
                <span className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: accentColor }}>
                  {title}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
