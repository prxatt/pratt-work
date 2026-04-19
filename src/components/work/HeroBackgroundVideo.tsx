'use client';

import { useEffect, useRef } from 'react';

type HeroBackgroundVideoProps = {
  webmSrc: string;
  mp4Src: string;
  className?: string;
  poster?: string;
};

/**
 * Muted autoplay background video with iOS-friendly play() retry.
 * Server pages can embed this instead of a raw <video> for reliable mobile playback.
 */
export function HeroBackgroundVideo({ webmSrc, mp4Src, className, poster }: HeroBackgroundVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const kick = () => {
      el.muted = true;
      el.defaultMuted = true;
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

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      className={className}
      poster={poster}
    >
      <source src={webmSrc} type="video/webm" />
      <source src={mp4Src} type="video/mp4" />
    </video>
  );
}
