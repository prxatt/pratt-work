'use client';

import { useTextScramble } from '@/hooks/useTextScramble';

interface ScrambleTextProps {
  text: string;
  enabled?: boolean;
  speed?: number;
  delay?: number;
  className?: string;
}

export function ScrambleText({
  text,
  enabled = true,
  speed = 40,
  delay = 0,
  className = '',
}: ScrambleTextProps) {
  const { displayText } = useTextScramble({
    text,
    enabled,
    speed,
    delay,
  });

  return <span className={className}>{displayText}</span>;
}
