'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Play, Pause, Minimize, Volume2, VolumeX } from 'lucide-react';

interface FilmVideoPlayerProps {
  webmSrc: string;
  mp4Src: string;
  posterSrc?: string;
  className?: string;
}

export function FilmVideoPlayer({ webmSrc, mp4Src, posterSrc, className = '' }: FilmVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const filmContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const amber = '#C9A86C';
  const filmOrange = '#E07B39';
  const deepSepia = '#5D3A1A';

  // Memoized format time
  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Memoized progress calculation
  const progressStyle = useMemo(() => ({
    transform: `scaleX(${duration ? currentTime / duration : 0})`,
    transformOrigin: 'left'
  }), [currentTime, duration]);

  // Auto-hide controls in fullscreen
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    if (isFullscreen && isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isFullscreen, isPlaying]);

  // Toggle minimize/expand
  const toggleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    const filmContainer = filmContainerRef.current;
    if (!filmContainer) return;

    if (!isFullscreen) {
      // Entering fullscreen - auto unmute and continue playing
      try {
        await filmContainer.requestFullscreen();
        setIsFullscreen(true);
        
        // Auto unmute
        if (videoRef.current) {
          videoRef.current.muted = false;
          setIsMuted(false);
          // Ensure video continues playing
          if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
          }
        }
      } catch (err) {
        console.error('Fullscreen error:', err);
      }
    } else {
      // Exit fullscreen
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
        // Mute when exiting fullscreen for autoplay policy
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
        }
      } catch (err) {
        console.error('Exit fullscreen error:', err);
      }
    }
  }, [isFullscreen]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      
      // If exiting fullscreen, ensure muted state
      if (!isNowFullscreen && videoRef.current) {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Toggle play/pause (fullscreen only)
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
    resetControlsTimeout();
  }, [isPlaying, resetControlsTimeout]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!isMuted);
    resetControlsTimeout();
  }, [isMuted, resetControlsTimeout]);

  // Handle volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
  }, []);

  // Handle loaded metadata
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  }, []);

  // Handle video ended - loop it
  const handleEnded = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => !isFullscreen && setShowControls(false)}
    >
      {/* Film Strip Container */}
      <div
        ref={filmContainerRef}
        data-film-container="true"
        className="film-container relative overflow-hidden w-full h-full"
        style={{
          boxShadow: `0 0 60px ${filmOrange}20, 0 20px 40px rgba(0,0,0,0.6)`,
          willChange: isFullscreen ? 'transform' : 'auto',
        }}
      >
        {/* CSS-based Film sprocket holes - no Array.map, GPU accelerated */}
        <div className="sprocket-holes-top" aria-hidden="true" />
        <div className="sprocket-holes-bottom" aria-hidden="true" />
        <div className="sprocket-holes-left" aria-hidden="true" />
        <div className="sprocket-holes-right" aria-hidden="true" />

        {/* Video Element - Hardware accelerated */}
        <video
          ref={videoRef}
          className="video-element w-full h-full object-cover cursor-pointer"
          autoPlay
          muted={!isFullscreen}
          loop
          playsInline
          poster={posterSrc}
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onClick={isFullscreen ? togglePlay : undefined}
        >
          <source src={webmSrc} type="video/webm" />
          <source src={mp4Src} type="video/mp4" />
        </video>

        {/* Minimal Film Effects Overlay */}
        <div className="film-overlay absolute inset-0 pointer-events-none z-10" aria-hidden="true" />

        {/* Corner accents - film style */}
        <div className="absolute top-6 left-6 w-8 h-[2px] z-20" style={{ backgroundColor: filmOrange }} />
        <div className="absolute top-6 left-6 w-[2px] h-8 z-20" style={{ backgroundColor: filmOrange }} />
        <div className="absolute top-6 right-6 w-8 h-[2px] z-20" style={{ backgroundColor: filmOrange }} />
        <div className="absolute top-6 right-6 w-[2px] h-8 z-20" style={{ backgroundColor: filmOrange }} />
        <div className="absolute bottom-6 left-6 w-8 h-[2px] z-20" style={{ backgroundColor: filmOrange }} />
        <div className="absolute bottom-6 left-6 w-[2px] h-8 z-20" style={{ backgroundColor: filmOrange }} />
        <div className="absolute bottom-6 right-6 w-8 h-[2px] z-20" style={{ backgroundColor: filmOrange }} />
        <div className="absolute bottom-6 right-6 w-[2px] h-8 z-20" style={{ backgroundColor: filmOrange }} />

        {/* Fullscreen Controls */}
        {isFullscreen && (
          <div 
            className={`absolute bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
              showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {/* Control bar background */}
            <div className="bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-20 pb-8 px-8">
              {/* Timeline - GPU accelerated with transform */}
              <div className="mb-4">
                <div className="relative h-1 bg-[#2a2520] cursor-pointer group overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#E07B39] will-change-transform"
                    style={progressStyle}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="font-mono text-[10px] text-[#aaa]">{formatTime(currentTime)}</span>
                  <span className="font-mono text-[10px] text-[#aaa]">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control buttons */}
              <div className="flex items-center justify-center gap-6">
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 flex items-center justify-center bg-[#E07B39] hover:bg-[#d06a30] transition-all duration-200 shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-1" />
                  )}
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-3 group">
                  <button
                    onClick={toggleMute}
                    className="w-10 h-10 flex items-center justify-center text-[#888] hover:text-[#E07B39] transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <div className="w-0 overflow-hidden group-hover:w-24 transition-all duration-300">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-24 h-1 appearance-none bg-[#2a2520] cursor-pointer"
                      style={{
                        backgroundImage: `linear-gradient(to right, #E07B39 0%, #E07B39 ${(isMuted ? 0 : volume) * 100}%, transparent ${(isMuted ? 0 : volume) * 100}%, transparent 100%)`
                      }}
                    />
                  </div>
                </div>

                {/* Exit Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="w-10 h-10 flex items-center justify-center bg-[#1a1510] border border-[#3a3530] hover:border-[#E07B39] text-[#888] hover:text-[#E07B39] transition-all duration-200"
                >
                  <Minimize className="w-4 h-4" />
                </button>
              </div>

              {/* Cinema label */}
              <div className="text-center mt-4">
                <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-[#bbb]">
                  Vintage Cinema Mode
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Frame info */}
        <div className="absolute bottom-8 left-8 z-20 pointer-events-none">
          <span className="font-mono text-[8px] tracking-wider text-[#555]">
            24fps | KODAK 35mm | {isFullscreen ? 'CINEMA' : 'PREVIEW'}
          </span>
        </div>
      </div>
    </div>
  );
}
