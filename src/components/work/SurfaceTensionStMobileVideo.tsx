'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

type SurfaceTensionStMobileVideoProps = {
  webmSrc: string;
  mp4Src: string;
  className?: string;
  accentColor?: string;
};

/**
 * st-mobile only: local mute (no global hero mute events).
 * Mute control top-left; REC stays top-right. Tap/click video toggles mute on all viewports.
 */
export function SurfaceTensionStMobileVideo({
  webmSrc,
  mp4Src,
  className,
  accentColor = '#FFB000',
}: SurfaceTensionStMobileVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const toggleMuted = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const kick = () => {
      el.muted = mutedRef.current;
      el.defaultMuted = mutedRef.current;
      void el.play().catch(() => {});
    };

    el.load();
    kick();
    el.addEventListener('loadeddata', kick);
    const vis = () => {
      if (document.visibilityState === 'visible') kick();
    };
    document.addEventListener('visibilitychange', vis);

    return () => {
      el.removeEventListener('loadeddata', kick);
      document.removeEventListener('visibilitychange', vis);
    };
  }, [webmSrc, mp4Src]);

  useEffect(() => {
    const el = videoRef.current;
    if (el) el.muted = muted;
  }, [muted]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="auto"
        className={`cursor-pointer ${className ?? ''}`}
        onClick={toggleMuted}
      >
        <source src={webmSrc} type="video/webm" />
        <source src={mp4Src} type="video/mp4" />
      </video>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleMuted();
        }}
        className="absolute top-6 left-4 z-[25] flex items-center gap-1 rounded-md border border-white/15 bg-black/55 px-2 py-1 backdrop-blur-sm transition-colors hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        aria-label={muted ? 'Unmute video' : 'Mute video'}
        aria-pressed={muted}
      >
        {muted ? (
          <VolumeX className="h-3.5 w-3.5 text-white/70" strokeWidth={1.5} aria-hidden />
        ) : (
          <Volume2 className="h-3.5 w-3.5" strokeWidth={1.5} style={{ color: accentColor }} aria-hidden />
        )}
        <span className="font-mono text-[8px] uppercase tracking-wider text-[#888]">
          {muted ? 'off' : 'on'}
        </span>
      </button>
    </>
  );
}
