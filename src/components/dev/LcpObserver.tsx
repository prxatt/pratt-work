'use client';

import { useEffect } from 'react';

type LcpEntry = PerformanceEntry & {
  startTime: number;
  size?: number;
  id?: string;
  url?: string;
  element?: Element | null;
};

function describeElement(el?: Element | null): string {
  if (!el) return '(no element)';
  const tag = el.tagName.toLowerCase();
  const id = (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : '';
  const className =
    typeof (el as HTMLElement).className === 'string' && (el as HTMLElement).className.trim()
      ? `.${(el as HTMLElement).className.trim().split(/\s+/).slice(0, 3).join('.')}`
      : '';
  return `${tag}${id}${className}`;
}

export function LcpObserver() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    let latestLcp: LcpEntry | null = null;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as LcpEntry[];
      const last = entries[entries.length - 1];
      if (!last) return;
      latestLcp = last;
    });

    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      return;
    }

    const logLcp = () => {
      if (!latestLcp) return;
      const lcpSeconds = (latestLcp.startTime / 1000).toFixed(2);
      const selector = describeElement(latestLcp.element);
      const size = latestLcp.size ? Math.round(latestLcp.size) : 0;
      const source = latestLcp.url || '(text node)';

      // Dev-only signal for targeting exact LCP candidate.
      console.log('[perf][LCP]', {
        seconds: lcpSeconds,
        selector,
        size,
        source,
        id: latestLcp.id || '',
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        logLcp();
        observer.disconnect();
      }
    };

    window.addEventListener('beforeunload', logLcp);
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Helpful while staying on page during local iteration.
    const timeout = window.setTimeout(logLcp, 5000);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('beforeunload', logLcp);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      observer.disconnect();
    };
  }, []);

  return null;
}
