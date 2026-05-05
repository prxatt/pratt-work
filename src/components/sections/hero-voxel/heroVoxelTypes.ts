/**
 * WebGPU availability + hero tier (grid resolution, DPR cap).
 */
export type HeroVoxelTier = 'full' | 'medium' | 'off';

export function getHeroVoxelGridDimensions(
  tier: HeroVoxelTier
): { gx: number; gz: number } {
  if (tier === 'off') return { gx: 64, gz: 48 };
  if (tier === 'medium') return { gx: 64, gz: 48 };
  return { gx: 96, gz: 72 };
}

export function getHeroVoxelTier(opts: {
  webgpuSupported: boolean;
  prefersReducedMotion: boolean;
  isLowEnd: boolean;
  width: number;
}): HeroVoxelTier {
  if (!opts.webgpuSupported) return 'off';
  /** Reduced motion: calmer field but still visible (no camera auto-prompt focus) */
  if (opts.prefersReducedMotion) return 'medium';
  if (opts.isLowEnd || opts.width < 520) return 'medium';
  return 'full';
}
