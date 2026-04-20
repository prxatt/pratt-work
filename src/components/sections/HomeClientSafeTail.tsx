'use client';

import React from 'react';
import { RecognitionSection } from '@/components/sections/RecognitionSection';
import { TypographicCTA } from '@/components/sections/TypographicCTA';

export function HomeClientSafeTail() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <>
        <div className="h-[50vh] bg-[#0a0a0a]" />
        <div className="h-[40vh] bg-[#0a0a0a]" />
      </>
    );
  }

  return (
    <>
      <RecognitionSection />
      <TypographicCTA />
    </>
  );
}
