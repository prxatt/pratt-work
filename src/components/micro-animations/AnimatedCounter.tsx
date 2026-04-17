'use client';

import { useCountUp } from '@/hooks/useCountUp';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  enabled?: boolean;
  className?: string;
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2000,
  enabled = true,
  className = '',
}: AnimatedCounterProps) {
  const count = useCountUp({
    end: value,
    decimals,
    duration,
    enabled,
  });

  return (
    <span className={className}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}
