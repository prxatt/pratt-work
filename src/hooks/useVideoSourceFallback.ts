'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getVideoFallbackChain } from '@/lib/media';

/** Steps through CDN webm → CDN mp4 → public webm → public mp4 on `error`. */
export function useVideoSourceFallback(stem: string) {
  const chain = useMemo(() => getVideoFallbackChain(stem), [stem]);
  const [srcIndex, setSrcIndex] = useState(0);
  const activeSrc = chain[srcIndex] ?? chain[chain.length - 1]!;

  useEffect(() => {
    setSrcIndex(0);
  }, [stem]);

  const onError = useCallback(() => {
    setSrcIndex((i) => (i + 1 < chain.length ? i + 1 : i));
  }, [chain.length]);

  return { activeSrc, onError };
}
