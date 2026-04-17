'use client';

import { useState, useCallback } from 'react';

interface Video360PlayerProps {
  youtubeId: string;
  accentColor?: string;
  label?: string;
  className?: string;
}

export default function Video360Player({
  youtubeId,
  accentColor = '#E85D04',
  label = '360°',
  className = '',
}: Video360PlayerProps) {
  const [loaded, setLoaded] = useState(false);

  // YouTube iframe API params — every one here is deliberate
  // controls=1   → YouTube's native controls, fully functional
  // rel=0        → no related videos at end
  // modestbranding=1 → minimal YouTube branding
  // iv_load_policy=3 → no annotations
  // color=white  → white progress bar (less red-on-red clash with PwC orange)
  // playsinline=1 → no auto-fullscreen on iOS
  const src = [
    `https://www.youtube.com/embed/${youtubeId}`,
    '?controls=1',
    '&rel=0',
    '&modestbranding=1',
    '&iv_load_policy=3',
    '&color=white',
    '&playsinline=1',
  ].join('');

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <div className={`relative w-full bg-black ${className}`} style={{ aspectRatio: '16/9' }}>
      {/* Loading shimmer — disappears once iframe fires onLoad */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: `${accentColor} transparent transparent transparent` }}
          />
        </div>
      )}

      {/* The iframe IS the player. Full bleed. No interference. */}
      <iframe
        src={src}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; web-share; fullscreen"
        allowFullScreen
        tabIndex={-1}
        title={label}
        onLoad={handleLoad}
        style={{ border: 'none' }}
      />

      {/* Minimal corner badge — sits in a corner YouTube never uses */}
      {loaded && (
        <div
          className="absolute top-3 left-3 z-20 pointer-events-none select-none"
          aria-hidden
        >
          <span
            className="font-mono text-[9px] tracking-[0.2em] uppercase px-2 py-1"
            style={{
              color: accentColor,
              border: `0.5px solid ${accentColor}55`,
              background: 'rgba(0,0,0,0.6)',
            }}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
