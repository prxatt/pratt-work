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

/**
 * Grid resolution per tier. 'full' targets the Omma-style ~12K voxel sculpture
 * (132 × 96 = 12,672 instances). Medium tier scales down for low-end devices and
 * narrow viewports. Both inference and the renderer consume these dimensions
 * via this shared module — never duplicate elsewhere.
 */
export function gridDimensionsForTier(tier: HeroVoxelTier): { gx: number; gz: number } {
  if (tier === 'medium') return { gx: 96, gz: 72 };
  return { gx: 148, gz: 110 };
}

/**
 * Canonical depth orientation convention.
 *
 * After the inference stage, the live depth buffer satisfies:
 *   "higher value = nearer to the viewer"
 *
 *   - `mirrorX`         : flips X so a hand on the user's RIGHT pushes voxels
 *                         on screen RIGHT (standard selfie-mirror convention).
 *   - `invertPolarity`  : ONNX-only; HF `predicted_depth` is already aligned so
 *                         normalized **high = nearer** here. Keep false unless
 *                         a future model export inverts disparity.
 *
 * Centralizing the convention here is the single source of truth and prevents
 * mixed polarity between paths.
 */
export const liveDepthOrientation = {
  mirrorX: true,
  invertPolarity: false,
} as const;
