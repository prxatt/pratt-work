export type HeroVoxelTier = 'full' | 'medium';

export function tierForViewport(opts: {
  prefersReducedMotion: boolean;
  isLowEnd: boolean;
  width: number;
}): HeroVoxelTier {
  if (opts.prefersReducedMotion) return 'medium';
  const w = opts.width > 0 ? opts.width : 1200;
  if (opts.isLowEnd || w < 520) return 'medium';
  return 'full';
}

export function gridDimensionsForTier(tier: HeroVoxelTier): { gx: number; gz: number } {
  if (tier === 'medium') return { gx: 96, gz: 72 };
  return { gx: 144, gz: 108 };
}
