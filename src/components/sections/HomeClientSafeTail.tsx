'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const RecognitionSection = dynamic(
  () => import('@/components/sections/RecognitionSection').then((mod) => mod.RecognitionSection),
  {
    loading: () => <div className="h-[50vh] bg-[#0a0a0a]" />,
    ssr: false,
  }
);

const TypographicCTA = dynamic(
  () => import('@/components/sections/TypographicCTA').then((mod) => mod.TypographicCTA),
  {
    loading: () => <div className="h-[40vh] bg-[#0a0a0a]" />,
  }
);

export function HomeClientSafeTail() {
  return (
    <>
      <ErrorBoundary fallback={null}>
        <RecognitionSection />
      </ErrorBoundary>
      <TypographicCTA />
    </>
  );
}
