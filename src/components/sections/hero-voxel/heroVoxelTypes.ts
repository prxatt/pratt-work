/**
 * Hero voxel quality tier (grid resolution, DPR cap). Renderer picks WebGPU or WebGL automatically.
 */
export type HeroVoxelTier = 'full' | 'medium';

export function getHeroVoxelGridDimensions(
  tier: HeroVoxelTier
): { gx: number; gz: number } {
  if (tier === 'medium') return { gx: 64, gz: 48 };
  return { gx: 96, gz: 72 };
}

export function getHeroVoxelTier(opts: {
  prefersReducedMotion: boolean;
  isLowEnd: boolean;
  width: number;
}): HeroVoxelTier {
  if (opts.prefersReducedMotion) return 'medium';
  const w = opts.width > 0 ? opts.width : 1200;
  if (opts.isLowEnd || w < 520) return 'medium';
  return 'full';
}
