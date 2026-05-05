/**
 * Depth maps from webcam — **Depth Anything V2** (ONNX) via `@huggingface/transformers`
 * when available; luminance fallback is immediate so the grid never waits on model load.
 *
 * Model: `onnx-community/depth-anything-v2-small` (WASM, fp32).
 */

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
  const voxelCount = GRID_X * GRID_Z;
  const lastDepthMap = new Float32Array(voxelCount);

  const inferenceCanvas = document.createElement('canvas');
  inferenceCanvas.width = DEPTH_W;
  inferenceCanvas.height = DEPTH_H;
  const inferenceCtx = inferenceCanvas.getContext('2d', {
    willReadFrequently: true,
  });

  const depthCanvas = document.createElement('canvas');
  depthCanvas.width = GRID_X;
  depthCanvas.height = GRID_Z;
  const depthCtx = depthCanvas.getContext('2d', { willReadFrequently: true });

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

  function runLuminanceFallback() {
    if (!depthCtx || !opts.video.videoWidth) return;
    depthCtx.drawImage(opts.video, 0, 0, GRID_X, GRID_Z);
    const pixels = depthCtx.getImageData(0, 0, GRID_X, GRID_Z).data;
    for (let iz = 0; iz < GRID_Z; iz++) {
      for (let ix = 0; ix < GRID_X; ix++) {
        const pi = (iz * GRID_X + ix) * 4;
        const lum =
          (0.299 * pixels[pi] + 0.587 * pixels[pi + 1] + 0.114 * pixels[pi + 2]) / 255;
        lastDepthMap[iz * GRID_X + ix] = Math.pow(lum, 0.65);
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
        const srcX = Math.min(Math.floor((ix / Math.max(GRID_X - 1, 1)) * (dW - 1)), dW - 1);
        const srcY = Math.min(Math.floor((iz / Math.max(GRID_Z - 1, 1)) * (dH - 1)), dH - 1);
        lastDepthMap[iz * GRID_X + ix] = (rawData[srcY * dW + srcX] - dMin) / dRange;
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
      const buf = rawData instanceof Float32Array ? rawData : Float32Array.from(rawData);
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
