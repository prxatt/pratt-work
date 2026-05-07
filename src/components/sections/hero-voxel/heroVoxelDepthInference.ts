/**
 * Depth maps from webcam — Depth Anything V2 (ONNX) via `@huggingface/transformers`
 * when available; luminance fallback is immediate so the grid never waits on model load.
 *
 * Model: `onnx-community/depth-anything-v2-small` (WASM, fp32).
 *
 * IMPORTANT — X mirror is shared; ONNX polarity (`invertPolarity`) applies only
 * to tensor samples. Luminance uses brightness-as-near directly. The renderer
 * consumes the buffer with no further mirroring or inversion.
 *
 * After this stage: depth is normalized to [0, 1] where HIGHER = NEARER.
 */

import { liveDepthOrientation } from './heroVoxelConfig';

export type DepthInferenceApi = {
  infer: () => Promise<void>;
  getBuffer: () => Float32Array;
  dispose: () => void;
};

/** Slightly smaller than 256×192 for faster WASM inference with negligible visual loss. */
const DEPTH_W = 240;
const DEPTH_H = 176;

const DEPTH_MODEL_ID = 'onnx-community/depth-anything-v2-small' as const;

async function disposeDepthPipeline(pipe: unknown): Promise<void> {
  if (!pipe || typeof pipe !== 'object') return;
  const p = pipe as { dispose?: () => void | Promise<void> };
  if (typeof p.dispose !== 'function') return;
  try {
    await Promise.resolve(p.dispose());
  } catch {
    /* best-effort WASM / ONNX teardown */
  }
}

export function createDepthInference(opts: {
  video: HTMLVideoElement;
  gridX: number;
  gridZ: number;
}): DepthInferenceApi {
  const { gridX: GRID_X, gridZ: GRID_Z } = opts;
  const cellCount = GRID_X * GRID_Z;
  const lastDepthMap = new Float32Array(cellCount);

  const inferenceCanvas = document.createElement('canvas');
  inferenceCanvas.width = DEPTH_W;
  inferenceCanvas.height = DEPTH_H;
  const inferenceCtx = inferenceCanvas.getContext('2d', {
    willReadFrequently: true,
  });

  const lumCanvas = document.createElement('canvas');
  lumCanvas.width = GRID_X;
  lumCanvas.height = GRID_Z;
  const lumCtx = lumCanvas.getContext('2d', { willReadFrequently: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let depthPipeline: any = null;
  let depthReady = false;
  let depthWorking = false;
  let cancelled = false;

  void (async () => {
    try {
      const { pipeline, env } = await import('@huggingface/transformers');
      if (cancelled) return;
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      const pipe = await pipeline('depth-estimation', DEPTH_MODEL_ID, {
        device: 'wasm',
        dtype: 'fp32',
      });
      if (cancelled) {
        await disposeDepthPipeline(pipe);
        return;
      }
      depthPipeline = pipe;
      depthReady = true;
    } catch {
      if (!cancelled) depthReady = false;
    }
  })();

  /**
   * Writes a normalized [0,1] value (already "high = near" for this path)
   * into the grid cell, applying X mirror only. ONNX-only polarity is handled
   * in `sampleTensorToGrid` so luminance fallback is never double-flipped.
   */
  function writeCell(ix: number, iz: number, value01: number) {
    const targetIx = liveDepthOrientation.mirrorX ? GRID_X - 1 - ix : ix;
    lastDepthMap[iz * GRID_X + targetIx] = value01;
  }

  function runLuminanceFallback() {
    if (!lumCtx || !opts.video.videoWidth) return;
    lumCtx.drawImage(opts.video, 0, 0, GRID_X, GRID_Z);
    const pixels = lumCtx.getImageData(0, 0, GRID_X, GRID_Z).data;
    const invDepth = new Float32Array(cellCount);

    for (let i = 0; i < cellCount; i++) {
      const pi = i * 4;
      const lum =
        (0.299 * pixels[pi] +
          0.587 * pixels[pi + 1] +
          0.114 * pixels[pi + 2]) /
        255;
      // Heuristic without ML: bright walls/windows are usually farther.
      invDepth[i] = 1 - lum;
    }

    const sorted = Float32Array.from(invDepth);
    sorted.sort();
    const lo = sorted[Math.max(0, Math.floor(cellCount * 0.05))];
    const hi = sorted[Math.min(cellCount - 1, Math.floor(cellCount * 0.95))];
    const span = Math.max(hi - lo, 1e-4);

    for (let iz = 0; iz < GRID_Z; iz++) {
      for (let ix = 0; ix < GRID_X; ix++) {
        const idx = iz * GRID_X + ix;
        const stretched = Math.min(1, Math.max(0, (invDepth[idx] - lo) / span));
        const nx = ix / Math.max(GRID_X - 1, 1);
        const nz = iz / Math.max(GRID_Z - 1, 1);
        const dx = nx - 0.5;
        const dz = nz - 0.5;
        const radial = Math.sqrt(dx * dx * 1.2 + dz * dz);
        const centerWeight = 1 - Math.min(1, Math.max(0, (radial - 0.4) / 0.55));
        const centered = Math.min(1, Math.max(0, stretched * (0.82 + centerWeight * 0.36)));
        writeCell(ix, iz, Math.pow(centered, 0.72));
      }
    }
  }

  function sampleTensorToGrid(rawData: Float32Array, dW: number, dH: number) {
    const n = rawData.length;
    if (n === 0) return;
    // Inner-percentile stretch: outliers no longer crush the visible depth range.
    const sorted = Float32Array.from(rawData);
    sorted.sort();
    const loIdx = Math.max(0, Math.floor(n * 0.04));
    const hiIdx = Math.min(n - 1, Math.floor(n * 0.96));
    const dMin = sorted[loIdx];
    const dMax = sorted[hiIdx];
    const dRange = dMax - dMin || 1;
    for (let iz = 0; iz < GRID_Z; iz++) {
      for (let ix = 0; ix < GRID_X; ix++) {
        const srcX = Math.min(
          Math.floor((ix / Math.max(GRID_X - 1, 1)) * (dW - 1)),
          dW - 1
        );
        const srcY = Math.min(
          Math.floor((iz / Math.max(GRID_Z - 1, 1)) * (dH - 1)),
          dH - 1
        );
        let norm = (rawData[srcY * dW + srcX] - dMin) / dRange;
        if (norm < 0) norm = 0;
        else if (norm > 1) norm = 1;
        if (liveDepthOrientation.invertPolarity) norm = 1 - norm;
        writeCell(ix, iz, norm);
      }
    }
  }

  async function infer() {
    if (cancelled || !opts.video.videoWidth || depthWorking) return;

    if (!depthReady || !depthPipeline || !inferenceCtx) {
      runLuminanceFallback();
      return;
    }

    depthWorking = true;
    try {
      inferenceCtx.drawImage(opts.video, 0, 0, DEPTH_W, DEPTH_H);
      const result = await depthPipeline(inferenceCanvas);

      const tensor = result.predicted_depth ?? result.depth;
      const rawData: Float32Array | number[] | undefined = tensor?.data;
      if (!rawData || !tensor?.dims) {
        runLuminanceFallback();
        return;
      }
      const dims = tensor.dims as number[];
      const dH = dims[dims.length - 2];
      const dW = dims[dims.length - 1];
      const buf =
        rawData instanceof Float32Array ? rawData : Float32Array.from(rawData);
      sampleTensorToGrid(buf, dW, dH);
    } catch {
      runLuminanceFallback();
    } finally {
      depthWorking = false;
    }
  }

  return {
    infer,
    getBuffer: () => lastDepthMap,
    dispose: () => {
      cancelled = true;
      const pipe = depthPipeline;
      depthPipeline = null;
      depthReady = false;
      void disposeDepthPipeline(pipe);
    },
  };
}
