'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDeviceCapabilities } from '@/hooks/useReducedMotion';
import { createDepthInference } from './heroVoxelDepthInference';
import { getHeroVoxelGridDimensions, getHeroVoxelTier, type HeroVoxelTier } from './heroVoxelTypes';
import { mountHeroVoxelScene, type HeroVoxelSceneApi } from './heroVoxelScene';

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

async function detectWebGPU(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.gpu) return false;
  try {
    const adapter = await navigator.gpu.requestAdapter();
    return adapter != null;
  } catch {
    return false;
  }
}

const INFER_INTERVAL_MS = 95;

export function HeroVoxelBackdrop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sceneApiRef = useRef<HeroVoxelSceneApi | null>(null);
  const inferTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const depthApiRef = useRef<ReturnType<typeof createDepthInference> | null>(null);

  const { prefersReducedMotion, isLowEnd } = useDeviceCapabilities();
  const width = useViewportWidth();
  const [webgpuSupported, setWebgpuSupported] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void detectWebGPU().then((ok) => {
      if (!cancelled) setWebgpuSupported(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const tier: HeroVoxelTier = useMemo(
    () =>
      getHeroVoxelTier({
        webgpuSupported,
        prefersReducedMotion,
        isLowEnd,
        width,
      }),
    [webgpuSupported, prefersReducedMotion, isLowEnd, width]
  );

  const stopCamera = useCallback(() => {
    if (inferTimerRef.current) {
      clearInterval(inferTimerRef.current);
      inferTimerRef.current = null;
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
    if (!el || tier === 'off') return;

    let cancelled = false;
    let dispose: (() => void) | undefined;

    const pending = mountHeroVoxelScene(el, tier, {
      reducedMotion: prefersReducedMotion,
    });
    void pending.then((api) => {
      if (cancelled) {
        api.dispose();
        return;
      }
      sceneApiRef.current = api;
      setSceneReady(true);
      dispose = api.dispose;
    });

    return () => {
      cancelled = true;
      setSceneReady(false);
      stopCameraRef.current();
      sceneApiRef.current = null;
      if (dispose) dispose();
      else void pending.then((api) => api.dispose());
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
      try {
        await video.play();
      } catch {
        throw new Error('Video playback blocked');
      }

      const { gx, gz } = getHeroVoxelGridDimensions(tier);
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

      inferTimerRef.current = setInterval(() => {
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

  if (tier === 'off') return null;

  return (
    <>
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0 z-0 h-full min-h-[100dvh] w-full overflow-hidden"
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
