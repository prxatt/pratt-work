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
  if (tier === 'medium') return { gx: 88, gz: 64 };
  return { gx: 132, gz: 96 };
}

/**
 * Canonical depth orientation convention.
 *
 * After the inference stage, the live depth buffer satisfies:
 *   "higher value = nearer to the viewer"
 *
 *   - `mirrorX`         : flips X so a hand on the user's RIGHT pushes voxels
 *                         on screen RIGHT (standard selfie-mirror convention).
 *   - `invertPolarity`  : In production webcam captures, raw model/fallback
 *                         polarity can appear reversed against perceived relief
 *                         on some devices. This is enabled so final buffer
 *                         values consistently map to "high = near" in the scene.
 *
 * Centralizing the convention here is the single source of truth and prevents
 * the historical bug where the ONNX path and the luminance path used opposite
 * conventions, causing the live view to appear inverted.
 */
export const liveDepthOrientation = {
  mirrorX: true,
  invertPolarity: true,
} as const;
