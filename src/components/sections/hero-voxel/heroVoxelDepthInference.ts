/**
 * Depth maps from webcam — Depth Anything V2 (ONNX) via `@huggingface/transformers`
 * when available; luminance fallback is immediate so the grid never waits on model load.
 *
 * Model: `onnx-community/depth-anything-v2-small` (WASM, fp32).
 *
 * IMPORTANT — orientation convention is applied here EXACTLY ONCE for both the
 * ONNX path and the luminance fallback via `liveDepthOrientation` in
 * `heroVoxelConfig.ts`. The renderer consumes the buffer with no further
 * mirroring or polarity inversion. This avoids the historical regression where
 * the two paths disagreed and the live view appeared inverted.
 *
 * After this stage: depth is normalized to [0, 1] where HIGHER = NEARER.
 */

import { liveDepthOrientation } from './heroVoxelConfig';

export type DepthInferenceApi = {
  infer: () => Promise<void>;
  getBuffer: () => Float32Array;
  dispose: () => void;
};

const DEPTH_W = 256;
const DEPTH_H = 192;

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
   * Single, canonical write path. Maps a normalized [0,1] sample into the
   * destination cell, applying mirror/polarity exactly once according to
   * `liveDepthOrientation`.
   */
  function writeCell(ix: number, iz: number, value01: number) {
    const targetIx = liveDepthOrientation.mirrorX ? GRID_X - 1 - ix : ix;
    const v = liveDepthOrientation.invertPolarity ? 1 - value01 : value01;
    lastDepthMap[iz * GRID_X + targetIx] = v;
  }

  function runLuminanceFallback() {
    if (!lumCtx || !opts.video.videoWidth) return;
    lumCtx.drawImage(opts.video, 0, 0, GRID_X, GRID_Z);
    const pixels = lumCtx.getImageData(0, 0, GRID_X, GRID_Z).data;
    for (let iz = 0; iz < GRID_Z; iz++) {
      for (let ix = 0; ix < GRID_X; ix++) {
        const pi = (iz * GRID_X + ix) * 4;
        const lum =
          (0.299 * pixels[pi] +
            0.587 * pixels[pi + 1] +
            0.114 * pixels[pi + 2]) /
          255;
        // Luminance is a heuristic depth proxy: well-lit pixels tend to be
        // near. Stored directly under the canonical "high = near" convention.
        writeCell(ix, iz, Math.pow(lum, 0.65));
      }
    }
  }

  function sampleTensorToGrid(rawData: Float32Array, dW: number, dH: number) {
    let dMin = Infinity;
    let dMax = -Infinity;
    for (let i = 0; i < rawData.length; i++) {
      const v = rawData[i];
      if (v < dMin) dMin = v;
      if (v > dMax) dMax = v;
    }
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
        // Depth Anything V2 ONNX raw output is disparity-like (high = near).
        // Stored under the canonical "high = near" convention — no per-path
        // inversion here; orientation/polarity is governed by `writeCell`.
        const norm = (rawData[srcY * dW + srcX] - dMin) / dRange;
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
