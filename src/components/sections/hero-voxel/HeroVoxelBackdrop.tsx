'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDeviceCapabilities } from '@/hooks/useReducedMotion';
import { createDepthInference } from './heroVoxelDepthInference';

/** Local only — keep in sync with `heroVoxelScene.ts` exports. */
type HeroVoxelTier = 'full' | 'medium';
type HeroVoxelSceneApi = {
  dispose: () => void;
  setCameraActive: (active: boolean) => void;
  bindDepthBuffer: (buffer: Float32Array | null) => void;
};

/** Mirrors `./heroVoxelTypes` (logic local so this chunk never depends on that module). */
function tierForViewport(opts: {
  prefersReducedMotion: boolean;
  isLowEnd: boolean;
  width: number;
}): HeroVoxelTier {
  if (opts.prefersReducedMotion) return 'medium';
  const w = opts.width > 0 ? opts.width : 1200;
  if (opts.isLowEnd || w < 520) return 'medium';
  return 'full';
}

function gridDimensionsForTier(tier: HeroVoxelTier): { gx: number; gz: number } {
  if (tier === 'medium') return { gx: 64, gz: 48 };
  return { gx: 96, gz: 72 };
}

function useViewportWidth(): number {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const set = () => setW(window.innerWidth);
    set();
    window.addEventListener('resize', set);
    return () => window.removeEventListener('resize', set);
  }, []);
  return w;
}

const INFER_INTERVAL_MS = 95;

export function HeroVoxelBackdrop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sceneApiRef = useRef<HeroVoxelSceneApi | null>(null);
  const inferTimerRef = useRef<number | null>(null);
  const depthApiRef = useRef<ReturnType<typeof createDepthInference> | null>(null);

  const { prefersReducedMotion, isLowEnd } = useDeviceCapabilities();
  const width = useViewportWidth();
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  const tier: HeroVoxelTier = useMemo(
    () =>
      tierForViewport({
        prefersReducedMotion,
        isLowEnd,
        width,
      }),
    [prefersReducedMotion, isLowEnd, width]
  );

  const stopCamera = useCallback(() => {
    const timerId = inferTimerRef.current;
    inferTimerRef.current = null;
    if (timerId !== null && typeof window !== 'undefined') {
      window.clearInterval(timerId);
    }
    depthApiRef.current?.dispose();
    depthApiRef.current = null;

    const v = videoRef.current;
    if (v?.srcObject) {
      const tracks = (v.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
      v.srcObject = null;
    }
    if (v?.parentElement) {
      v.parentElement.removeChild(v);
    }
    videoRef.current = null;

    sceneApiRef.current?.bindDepthBuffer(null);
    sceneApiRef.current?.setCameraActive(false);
    setCameraOn(false);
    setBusy(false);
  }, []);

  const stopCameraRef = useRef(stopCamera);
  stopCameraRef.current = stopCamera;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    let dispose: (() => void) | undefined;

    void (async () => {
      try {
        const { mountHeroVoxelScene } = await import('./heroVoxelScene');
        const api = await mountHeroVoxelScene(el, tier, {
          reducedMotion: prefersReducedMotion,
          tryWebGpuFirst: true,
        });
        if (cancelled) {
          api.dispose();
          return;
        }
        sceneApiRef.current = api;
        setSceneReady(true);
        dispose = api.dispose;
      } catch (e) {
        console.error('[HeroVoxelBackdrop] mount failed', e);
      }
    })();

    return () => {
      cancelled = true;
      setSceneReady(false);
      stopCameraRef.current();
      sceneApiRef.current = null;
      if (dispose) dispose();
    };
  }, [tier, prefersReducedMotion]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setBusy(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 30 },
        },
      });

      const video = document.createElement('video');
      videoRef.current = video;
      video.setAttribute('playsinline', '');
      video.muted = true;
      video.autoplay = true;
      video.style.cssText =
        'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px;top:0';
      document.body.appendChild(video);
      video.srcObject = stream;
      videoRef.current = video;
      try {
        await video.play();
      } catch {
        throw new Error('Video playback blocked');
      }

      const { gx, gz } = gridDimensionsForTier(tier);
      const depthInf = createDepthInference({
        video,
        gridX: gx,
        gridZ: gz,
      });
      depthApiRef.current = depthInf;

      sceneApiRef.current?.bindDepthBuffer(depthInf.getBuffer());
      sceneApiRef.current?.setCameraActive(true);
      setCameraOn(true);

      void depthInf.infer();

      inferTimerRef.current = window.setInterval(() => {
        void depthInf.infer();
      }, INFER_INTERVAL_MS);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Camera unavailable';
      setCameraError(msg);
      stopCamera();
    } finally {
      setBusy(false);
    }
  }, [tier, stopCamera]);

  const toggleCamera = useCallback(() => {
    if (cameraOn) stopCamera();
    else void startCamera();
  }, [cameraOn, startCamera, stopCamera]);

  return (
    <>
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0 z-[2] h-full min-h-[100dvh] w-full overflow-hidden"
        aria-hidden
      />
      <div className="pointer-events-auto absolute bottom-[7rem] left-1/2 z-[25] -translate-x-1/2 sm:bottom-[7.5rem]">
        <button
          type="button"
          onClick={() => void toggleCamera()}
          disabled={busy || !sceneReady}
          className="rounded-full border border-cyan-400/35 bg-black/40 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200/90 shadow-[0_0_24px_rgba(0,255,255,0.08)] backdrop-blur-md transition hover:border-cyan-300/55 hover:bg-black/50 disabled:opacity-50"
        >
          {busy
            ? 'Requesting…'
            : cameraOn
              ? 'Stop live depth'
              : 'Enable camera — live depth'}
        </button>
        {cameraError ? (
          <p className="mt-2 max-w-[min(90vw,20rem)] text-center font-mono text-[10px] text-red-300/90">
            {cameraError}
          </p>
        ) : null}
      </div>
    </>
  );
}
