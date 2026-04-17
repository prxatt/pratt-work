'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollToTop - Forces scroll to top on every navigation
 *
 * Problem: Next.js preserves scroll position by default, causing pages
 * to momentarily scroll before navigating (especially on work project pages).
 *
 * Solution: Force scroll to top synchronously when pathname changes,
 * before any framer-motion animations or layout effects run.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  // Disable browser's default scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  // Force scroll to top immediately when pathname changes
  useEffect(() => {
    // Synchronous scroll - happens before any animations
    window.scrollTo(0, 0);
    
    // Also force it on next tick to ensure it takes effect
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}
