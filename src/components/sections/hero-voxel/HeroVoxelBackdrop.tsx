'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDeviceCapabilities } from '@/hooks/useReducedMotion';
import { createDepthInference } from './heroVoxelDepthInference';
import { useHeroLiveDepth } from './HeroLiveDepthContext';
import {
  gridDimensionsForTier,
  tierForViewport,
  type HeroVoxelTier,
} from './heroVoxelConfig';

type HeroVoxelSceneApi = {
  dispose: () => void;
  setCameraActive: (active: boolean) => void;
  bindDepthBuffer: (buffer: Float32Array | null) => void;
};

function useViewportWidth(): number {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setW(window.innerWidth);
      });
    };
    schedule();
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      window.removeEventListener('resize', schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return w;
}

/** Slightly lower cadence than 15 Hz to keep main thread headroom for 12K instance updates. */
const INFER_INTERVAL_MS = 90;
const INFER_INTERVAL_LOW_FPS_MS = 145;
const FPS_LOW_THRESHOLD = 24;

export function HeroVoxelBackdrop() {
  const { setLiveDepthActive } = useHeroLiveDepth();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sceneApiRef = useRef<HeroVoxelSceneApi | null>(null);
  const inferTimerRef = useRef<number | null>(null);
  const depthApiRef = useRef<ReturnType<typeof createDepthInference> | null>(null);
  /** Bumped on each new start attempt and on stop; in-flight `startCamera` aborts if stale. */
  const cameraSessionRef = useRef(0);

  const { prefersReducedMotion, isLowEnd } = useDeviceCapabilities();
  const width = useViewportWidth();
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [allowSceneBoot, setAllowSceneBoot] = useState(false);

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
    cameraSessionRef.current += 1;
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
    setLiveDepthActive(false);
  }, [setLiveDepthActive]);

  const stopCameraRef = useRef(stopCamera);
  stopCameraRef.current = stopCamera;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    const start = () => {
      if (!cancelled) setAllowSceneBoot(true);
    };
    const ric = (window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    }).requestIdleCallback;
    const cic = (window as Window & {
      cancelIdleCallback?: (id: number) => void;
    }).cancelIdleCallback;
    if (ric) {
      const id = ric(start, { timeout: 450 });
      return () => {
        cancelled = true;
        if (cic) cic(id);
      };
    }
    const id = window.setTimeout(start, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    if (!allowSceneBoot) return;
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    let dispose: (() => void) | undefined;

    void (async () => {
      try {
        const { mountHeroVoxelScene } = await import('./heroVoxelScene');
        const api = await mountHeroVoxelScene(el, tier, {
          reducedMotion: prefersReducedMotion,
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
  }, [allowSceneBoot, tier, prefersReducedMotion]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setBusy(true);
    cameraSessionRef.current += 1;
    const session = cameraSessionRef.current;
    let stream: MediaStream | null = null;
    let video: HTMLVideoElement | null = null;

    const abortIfStale = () => {
      if (session !== cameraSessionRef.current) {
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
          stream = null;
        }
        if (video?.parentElement) {
          video.parentElement.removeChild(video);
        }
        video = null;
        videoRef.current = null;
        return true;
      }
      return false;
    };

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 30 },
        },
      });
      if (abortIfStale()) return;

      video = document.createElement('video');
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
      if (abortIfStale()) return;

      const { gx, gz } = gridDimensionsForTier(tier);
      const depthInf = createDepthInference({
        video,
        gridX: gx,
        gridZ: gz,
      });
      depthApiRef.current = depthInf;

      if (abortIfStale()) {
        depthInf.dispose();
        depthApiRef.current = null;
        return;
      }

      sceneApiRef.current?.bindDepthBuffer(depthInf.getBuffer());
      sceneApiRef.current?.setCameraActive(true);
      setCameraOn(true);
      setLiveDepthActive(true);

      void depthInf.infer();

      // Adaptive cadence — sample FPS and back off if the page is heavy on a
      // mid-tier device. Inference stays decoupled from the render loop.
      let lastSampleAt = performance.now();
      let frameSamples = 0;
      let currentInterval = INFER_INTERVAL_MS;
      const fpsTick = () => {
        if (cameraSessionRef.current !== session) return;
        frameSamples += 1;
        const now = performance.now();
        if (now - lastSampleAt >= 1000) {
          const fps = (frameSamples * 1000) / (now - lastSampleAt);
          frameSamples = 0;
          lastSampleAt = now;
          const targetInterval =
            fps < FPS_LOW_THRESHOLD ? INFER_INTERVAL_LOW_FPS_MS : INFER_INTERVAL_MS;
          if (targetInterval !== currentInterval) {
            currentInterval = targetInterval;
            if (inferTimerRef.current !== null) {
              window.clearInterval(inferTimerRef.current);
            }
            inferTimerRef.current = window.setInterval(() => {
              void depthInf.infer();
            }, currentInterval);
          }
        }
        if (cameraSessionRef.current === session) {
          requestAnimationFrame(fpsTick);
        }
      };
      requestAnimationFrame(fpsTick);

      inferTimerRef.current = window.setInterval(() => {
        void depthInf.infer();
      }, currentInterval);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Camera unavailable';
      setCameraError(msg);
      stopCamera();
    } finally {
      setBusy(false);
    }
  }, [tier, stopCamera, setLiveDepthActive]);

  const toggleCamera = useCallback(() => {
    if (cameraOn) stopCamera();
    else void startCamera();
  }, [cameraOn, startCamera, stopCamera]);

  return (
    <>
      <div
        ref={containerRef}
        className={
          cameraOn
            ? 'pointer-events-auto absolute inset-0 z-[6] h-full min-h-[100dvh] w-full overflow-hidden [touch-action:none]'
            : 'pointer-events-none absolute inset-0 z-[4] h-full min-h-[100dvh] w-full overflow-hidden'
        }
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-[max(5.75rem,env(safe-area-inset-bottom))] z-[25] flex justify-center px-4 sm:bottom-[max(6.25rem,env(safe-area-inset-bottom))]">
        {/* Narrow pointer hit-target: full-width wrapper would block the hero bottom row (e.g. Latest Work). */}
        <div className="pointer-events-none inline-flex max-w-[min(92vw,22rem)] flex-col items-center text-center">
          <button
            type="button"
            onClick={() => void toggleCamera()}
            disabled={busy || !sceneReady}
            className="pointer-events-auto rounded-full border border-cyan-400/35 bg-black/40 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200/90 shadow-[0_0_24px_rgba(0,255,255,0.08)] backdrop-blur-md transition hover:border-cyan-300/55 hover:bg-black/50 disabled:opacity-50"
          >
            {busy
              ? 'Requesting…'
              : cameraOn
                ? 'Stop live depth'
                : 'Enable camera — live depth'}
          </button>
          {cameraError ? (
            <p className="mx-auto mt-2 max-w-[min(90vw,20rem)] text-center font-mono text-[10px] text-red-300/90">
              {cameraError}
            </p>
          ) : null}
          {cameraOn ? (
            <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-[#7A7A75]">
              Drag to orbit · Scroll to zoom · Shift-scroll depth scale
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
