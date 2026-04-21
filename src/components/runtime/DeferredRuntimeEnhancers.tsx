'use client';

import { useEffect, useState } from 'react';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { WebMcpProvider } from '@/components/agent/WebMcpProvider';

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function DeferredRuntimeEnhancers() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const idleWindow = window as IdleWindow;
    if (idleWindow.requestIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(() => setEnabled(true), { timeout: 1200 });
      return () => {
        if (idleWindow.cancelIdleCallback) idleWindow.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(() => setEnabled(true), 800);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <WebMcpProvider />
      <ScrollProgress />
    </>
  );
}
