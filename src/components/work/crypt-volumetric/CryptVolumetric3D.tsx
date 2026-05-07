'use client';

/**
 * CryptVolumetric3D — True photorealistic volumetric depth sculpture from pre-recorded video.
 *
 * Architecture:
 *   • ~14 400 voxels (160 × 90, 16:9) rendered as a single InstancedMesh draw call.
 *   • VideoTexture: actual video pixel colors sampled at each voxel's UV → photorealistic, zero
 *     synthetic colour ramp.
 *   • Depth-Anything v2 (ONNX WASM) inferred every ~90 ms on the playing video frame; luminance
 *     fallback is instant so the sculpture never waits for model load.
 *   • Per-voxel `instanceDepth` attribute (DynamicDrawUsage) drives Z-extrusion in the vertex
 *     shader — near voxels push toward the camera, creating genuine 3-D parallax visible on orbit.
 *   • CPU-side exponential lerp (~60 Hz render ÷ ~11 Hz inference) keeps depth smooth between
 *     inference frames without artefacts.
 *   • Professional 3-light rig (key + fill + rim) in the fragment shader responds to real surface
 *     normals, making the depth relief feel physically solid.
 *   • Lite tier (low-end / reduced-motion): 80 × 45 = 3 600 voxels, no antialias, 1× pixel ratio.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useDeviceCapabilities } from '@/hooks/useReducedMotion';

// ── Grid dimensions (16:9 video aspect ratio) ─────────────────────────────────
const GX_FULL = 160;
const GZ_FULL = 90;
const GX_LITE = 80;
const GZ_LITE = 45;

// ── World-space extents ───────────────────────────────────────────────────────
const WORLD_W = 3.2;
const WORLD_H = 1.8;

// ── Depth inference ───────────────────────────────────────────────────────────
/** Depth-Anything v2 small — runs in WASM, ~11 Hz on modern hardware. */
const DEPTH_MODEL_ID = 'onnx-community/depth-anything-v2-small' as const;
/** Inference canvas dimensions — 16:9 kept small for fast WASM throughput. */
const INFER_W = 320;
const INFER_H = 180;
/** ms between inference calls; renderer runs at 60 Hz independently. */
const INFER_INTERVAL_MS = 90;

// ── Extrusion parameters ──────────────────────────────────────────────────────
/** World-space Z push for the nearest voxels (max depth). */
const EXTRUSION_NEAR = 3.6;
/** World-space Z push for background voxels (min depth). */
const EXTRUSION_FAR = 0.04;
/** Contrast exponent applied to normalised depth before extrusion. */
const DEPTH_POW = 1.18;
/** Exponential lerp factor per render frame — smooths depth transitions. */
const DEPTH_LERP = 0.13;

// ── Vertex Shader ─────────────────────────────────────────────────────────────
// Per-voxel `instanceDepth` (from depth inference) drives the Z push.
// `instanceUV` is a static UV into the video texture for this voxel's pixel.
// Result: each voxel is a small tile displaced in Z by its real scene depth;
//         orbiting the scene reveals true 3-D parallax.
// ─────────────────────────────────────────────────────────────────────────────
const VERTEX_SHADER = /* glsl */ `
attribute float instanceDepth;
attribute vec2 instanceUV;

uniform float uExtrusionNear;
uniform float uExtrusionFar;
uniform float uDepthPow;
uniform float uTime;

varying vec2 vVideoUV;
varying vec3 vNormalWorld;
varying vec3 vWorldPos;
varying float vDepthShaded;

void main() {
  float d  = clamp(instanceDepth, 0.0, 1.0);
  float ds = pow(d, uDepthPow);
  vDepthShaded = ds;

  // Subtle breath pulse — makes the sculpture feel alive
  float breathe = 1.0 + 0.032 * sin(uTime * 0.62);
  float zPush   = mix(uExtrusionFar, uExtrusionNear, ds) * breathe;

  // Move the entire voxel in +Z (toward camera) by its depth amount
  vec3 pos = vec3(position.x, position.y, position.z + zPush);

  vVideoUV = instanceUV;

  vec4 worldPos4 = modelMatrix * instanceMatrix * vec4(pos, 1.0);
  vWorldPos      = worldPos4.xyz;

  // Correct normal through instance + model matrices
  mat3 im        = mat3(instanceMatrix);
  vNormalWorld   = normalize(mat3(modelMatrix) * im * normal);

  gl_Position = projectionMatrix * viewMatrix * worldPos4;
}
`;

// ── Fragment Shader ───────────────────────────────────────────────────────────
// Samples the actual video frame at this voxel's UV → photorealistic base colour.
// Three-light rig (key + fill + rim) with wrap diffuse + Blinn-Phong specular.
// Near voxels receive a subtle brightness boost so foreground subjects pop.
// Filmic Reinhard rolloff keeps colours in sRGB range without crushing blacks.
// ─────────────────────────────────────────────────────────────────────────────
const FRAGMENT_SHADER = /* glsl */ `
uniform sampler2D uVideoTexture;
uniform float uTime;
uniform vec3  uKeyDir;
uniform vec3  uFillDir;
uniform vec3  uRimDir;
uniform float uKeyI;
uniform float uFillI;
uniform float uRimI;
uniform float uAmbient;

varying vec2  vVideoUV;
varying vec3  vNormalWorld;
varying vec3  vWorldPos;
varying float vDepthShaded;

void main() {
  // ── Photorealistic base colour — directly from the video frame ───────────
  vec3 base = texture2D(uVideoTexture, vVideoUV).rgb;

  vec3 N = normalize(vNormalWorld);
  vec3 V = normalize(cameraPosition - vWorldPos);

  // Key light: warm, wrap diffuse for soft volumetric feel
  vec3  Lk    = normalize(uKeyDir);
  float wrapK = (dot(N, Lk) + 0.38) / 1.38;
  float dk    = max(wrapK, 0.0) * uKeyI;
  vec3  Hk    = normalize(Lk + V);
  float sk    = pow(max(dot(N, Hk), 0.0), 52.0) * 0.16;

  // Fill light: cool, reduces harsh shadow side
  vec3  Lf    = normalize(uFillDir);
  float wrapF = (dot(N, Lf) + 0.28) / 1.28;
  float df    = max(wrapF, 0.0) * uFillI;

  // Rim light: depth-gated Fresnel edge — separates near subject from bg
  vec3  Lr      = normalize(uRimDir);
  float fresnel = pow(max(1.0 - dot(N, V), 0.0), 2.4);
  float dr      = max(dot(N, Lr), 0.0) * fresnel * vDepthShaded * uRimI;

  // Near-subject brightness boost
  float nearBoost = vDepthShaded * 0.11;

  // Assemble
  vec3 lit = base * (uAmbient + dk + df + nearBoost + dr) + vec3(sk);

  // Filmic Reinhard: compresses highlights, preserves video colour fidelity
  lit = lit / (lit + vec3(0.72));
  lit = pow(max(lit, vec3(0.0)), vec3(0.92));

  gl_FragColor = vec4(lit, 1.0);
}
`;

// ── Props ─────────────────────────────────────────────────────────────────────
interface CryptVolumetric3DProps {
  webmSrc?: string;
  mp4Src?: string;
  posterSrc?: string;
  /** Legacy — kept for backward compatibility; unused. */
  depthIntensity?: number;
  /** Legacy — kept for backward compatibility; unused. */
  depthV2Strength?: number;
  height?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CryptVolumetric3D({
  webmSrc = '',
  mp4Src = '',
  posterSrc,
  height = '70vh',
}: CryptVolumetric3DProps) {
  const mountRef      = useRef<HTMLDivElement>(null);
  const rootRef       = useRef<HTMLDivElement>(null);
  const canvasElRef   = useRef<HTMLCanvasElement | null>(null);
  const cleanupRef    = useRef<(() => void) | null>(null);
  const initFailedRef = useRef(false);

  const { isLowEnd, prefersReducedMotion } = useDeviceCapabilities();
  const lite = isLowEnd || prefersReducedMotion;

  const [isFullscreen,     setIsFullscreen]     = useState(false);
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false);
  const [showFallback,     setShowFallback]     = useState(false);
  const immersive = isFullscreen || pseudoFullscreen;

  // ── Fullscreen toggle ──────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(async () => {
    const root = rootRef.current;
    if (!root) return;

    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      msFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void> | void;
      msExitFullscreen?: () => Promise<void> | void;
    };
    const el = root as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
      msRequestFullscreen?: () => Promise<void> | void;
    };

    const nativeActive = Boolean(
      doc.fullscreenElement ?? doc.webkitFullscreenElement ?? doc.msFullscreenElement
    );

    if (pseudoFullscreen) {
      setPseudoFullscreen(false);
      document.body.style.overflow = '';
      requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
      return;
    }
    if (nativeActive) {
      try {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
        else if (doc.msExitFullscreen) await doc.msExitFullscreen();
      } finally {
        requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
      }
      return;
    }
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();
      else throw new Error('fullscreen unavailable');
    } catch {
      setPseudoFullscreen(true);
      document.body.style.overflow = 'hidden';
    }
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }, [pseudoFullscreen]);

  // ── Scene init ─────────────────────────────────────────────────────────────
  const initScene = useCallback(() => {
    const container = mountRef.current;
    if (!container) return;

    let aborted = false;

    (async () => {
      try {
        // ── Dynamic imports (Three.js is client-side only) ──────────────────
        const THREE = await import('three');
        if (aborted) return;
        const { OrbitControls } = await import(
          'three/examples/jsm/controls/OrbitControls.js'
        );
        if (aborted) return;

        // ── Grid dimensions for this performance tier ───────────────────────
        const gx    = lite ? GX_LITE : GX_FULL;
        const gz    = lite ? GZ_LITE : GZ_FULL;
        const count = gx * gz;

        // ── Renderer ────────────────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({
          antialias: !lite,
          alpha: false,
          powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1 : 1.5));
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x030303, 1);
        renderer.toneMapping        = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        renderer.domElement.style.cssText =
          'display:block;width:100%;height:100%;outline:none;vertical-align:top;';
        renderer.domElement.style.touchAction = 'pan-y';
        container.appendChild(renderer.domElement);
        canvasElRef.current = renderer.domElement as HTMLCanvasElement;

        // ── Scene + Camera ──────────────────────────────────────────────────
        const scene  = new THREE.Scene();
        const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
        const camera = new THREE.PerspectiveCamera(52, aspect, 0.01, 100);
        camera.position.set(0, 0, 5.5);
        camera.lookAt(0, 0, 0);

        // ── Orbit controls ──────────────────────────────────────────────────
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping   = true;
        controls.dampingFactor   = 0.06;
        controls.enableZoom      = true;
        controls.zoomSpeed       = 0.7;
        controls.minDistance     = 2.0;
        controls.maxDistance     = 9.0;
        controls.enablePan       = false;
        controls.autoRotate      = true;
        controls.autoRotateSpeed = 0.28;
        controls.maxPolarAngle   = Math.PI * 0.72;
        controls.minPolarAngle   = Math.PI * 0.28;
        controls.touches = {
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_ROTATE,
        };

        let autoRotateTimer: ReturnType<typeof setTimeout> | null = null;
        const pauseAutoRotate = () => {
          controls.autoRotate = false;
          if (autoRotateTimer) clearTimeout(autoRotateTimer);
          autoRotateTimer = setTimeout(() => {
            controls.autoRotate = true;
          }, 3500);
        };
        renderer.domElement.addEventListener('pointerdown', pauseAutoRotate);
        renderer.domElement.addEventListener('wheel', pauseAutoRotate, { passive: true });

        // ── Video element ────────────────────────────────────────────────────
        const video = document.createElement('video');
        video.autoplay    = true;
        video.muted       = true;
        video.loop        = true;
        video.playsInline = true;
        video.crossOrigin = 'anonymous';
        if (posterSrc) video.poster = posterSrc;

        let videoHasFrame = false;
        const onVideoLoaded = () => {
          videoHasFrame = true;
          if (!aborted && !initFailedRef.current) setShowFallback(false);
        };
        const onVideoError = () => {
          if (!aborted) setShowFallback(true);
        };
        video.addEventListener('loadeddata', onVideoLoaded);
        video.addEventListener('error', onVideoError);

        // Sources added before play() to prevent race conditions
        const sWebm = document.createElement('source');
        sWebm.src  = webmSrc;
        sWebm.type = 'video/webm';
        const sMp4 = document.createElement('source');
        sMp4.src   = mp4Src;
        sMp4.type  = 'video/mp4';
        video.appendChild(sWebm);
        video.appendChild(sMp4);

        const videoFailTimer = window.setTimeout(() => {
          if (!videoHasFrame && !aborted) setShowFallback(true);
        }, 3000);

        video.play().catch(() => {
          const resume = () => {
            video.play();
            container.removeEventListener('click', resume);
          };
          container.addEventListener('click', resume);
        });

        const videoTexture          = new THREE.VideoTexture(video);
        videoTexture.minFilter      = THREE.LinearFilter;
        videoTexture.magFilter      = THREE.LinearFilter;
        videoTexture.format         = THREE.RGBAFormat;

        // ── Voxel geometry: thin box (depth driven by shader Z push) ────────
        const voxW = WORLD_W / gx;
        const voxH = WORLD_H / gz;
        const voxD = Math.min(voxW, voxH) * 0.45; // thin tile
        const geo  = new THREE.BoxGeometry(voxW, voxH, voxD);
        // Pivot front face to z=0 so the Z push moves the voxel toward camera
        geo.translate(0, 0, -voxD * 0.5);

        // ── Per-instance attributes ──────────────────────────────────────────
        // instanceDepth: updated every frame from depth inference (DynamicDrawUsage)
        // instanceUV:    static UV into the video texture for this voxel's pixel
        const depthArr   = new Float32Array(count);       // target depth (from inference)
        const smoothArr  = new Float32Array(count).fill(0.35); // lerped depth (fed to GPU)
        const uvArr      = new Float32Array(count * 2);

        const voxSpacingX = WORLD_W / gx;
        const voxSpacingY = WORLD_H / gz;
        const offsetX     = WORLD_W * 0.5 - voxSpacingX * 0.5;
        const offsetY     = WORLD_H * 0.5 - voxSpacingY * 0.5;
        const dummy       = new THREE.Object3D();

        for (let i = 0; i < count; i++) {
          const ix = i % gx;
          const iz = Math.floor(i / gx);
          const x  =  ix * voxSpacingX - offsetX;
          const y  = -iz * voxSpacingY + offsetY;

          dummy.position.set(x, y, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();

          // UV: U left→right; V top→bottom (1 - iz/gz to match WebGL convention)
          uvArr[i * 2]     = (ix + 0.5) / gx;
          uvArr[i * 2 + 1] = 1.0 - (iz + 0.5) / gz;
        }

        const instanceDepthAttr = new THREE.InstancedBufferAttribute(smoothArr, 1);
        instanceDepthAttr.setUsage(THREE.DynamicDrawUsage);
        const instanceUVAttr = new THREE.InstancedBufferAttribute(uvArr, 2);
        geo.setAttribute('instanceDepth', instanceDepthAttr);
        geo.setAttribute('instanceUV',    instanceUVAttr);

        // ── Shader material: video colour + 3-light rig ──────────────────────
        const uniforms = {
          uVideoTexture:  { value: videoTexture },
          uExtrusionNear: { value: EXTRUSION_NEAR },
          uExtrusionFar:  { value: EXTRUSION_FAR  },
          uDepthPow:      { value: DEPTH_POW       },
          uTime:          { value: 0               },
          // Key: warm 45° upper-left front
          uKeyDir:  { value: new THREE.Vector3(0.52, 1.0, 0.80).normalize() },
          // Fill: cool 120° opposite side
          uFillDir: { value: new THREE.Vector3(-1.0, 0.5, 0.60).normalize() },
          // Rim: back-light for depth separation
          uRimDir:  { value: new THREE.Vector3(0.0, 0.2, -1.0).normalize() },
          uKeyI:    { value: 0.72 },
          uFillI:   { value: 0.36 },
          uRimI:    { value: 0.50 },
          uAmbient: { value: 0.30 },
        };

        const mat = new THREE.ShaderMaterial({
          uniforms,
          vertexShader:   VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
          side: THREE.FrontSide,
        });

        // ── Instanced mesh ───────────────────────────────────────────────────
        const mesh = new THREE.InstancedMesh(geo, mat, count);
        mesh.frustumCulled = false;
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        // Set static XY instance matrices (Z will be moved by the shader)
        for (let i = 0; i < count; i++) {
          const ix = i % gx;
          const iz = Math.floor(i / gx);
          const x  =  ix * voxSpacingX - offsetX;
          const y  = -iz * voxSpacingY + offsetY;
          dummy.position.set(x, y, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
        scene.add(mesh);

        // ── Atmospheric particle field ───────────────────────────────────────
        if (!lite) {
          const pCount = 360;
          const pPos   = new Float32Array(pCount * 3);
          for (let i = 0; i < pCount; i++) {
            pPos[i * 3]     = (Math.random() - 0.5) * 9;
            pPos[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
            pPos[i * 3 + 2] = (Math.random() - 0.5) * 7;
          }
          const pGeo = new THREE.BufferGeometry();
          pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
          const pMat = new THREE.PointsMaterial({
            color: 0x8899cc,
            size: 0.011,
            transparent: true,
            opacity: 0.18,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          scene.add(new THREE.Points(pGeo, pMat));
        }

        // ── Depth inference: Depth-Anything v2 (ONNX WASM) ──────────────────
        const inferCanvas   = document.createElement('canvas');
        inferCanvas.width   = INFER_W;
        inferCanvas.height  = INFER_H;
        const inferCtx      = inferCanvas.getContext('2d', { willReadFrequently: true });

        const lumCanvas  = document.createElement('canvas');
        lumCanvas.width  = gx;
        lumCanvas.height = gz;
        const lumCtx     = lumCanvas.getContext('2d', { willReadFrequently: true });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let depthPipeline: any    = null;
        let depthModelReady       = false;
        let depthBusy             = false;

        // Load model in the background — luminance fallback runs immediately
        void (async () => {
          try {
            const { pipeline, env } = await import('@huggingface/transformers');
            if (aborted) return;
            env.allowLocalModels = false;
            env.useBrowserCache  = true;
            const pipe = await pipeline('depth-estimation', DEPTH_MODEL_ID, {
              device: 'wasm',
              dtype:  'fp32',
            });
            if (aborted) {
              if (pipe && typeof (pipe as { dispose?: () => void }).dispose === 'function') {
                await (pipe as { dispose: () => Promise<void> }).dispose();
              }
              return;
            }
            depthPipeline    = pipe;
            depthModelReady  = true;
          } catch {
            depthModelReady = false;
          }
        })();

        /** Fast luminance proxy — runs immediately while the ONNX model loads. */
        function runLumFallback() {
          if (!lumCtx || !video.videoWidth) return;
          lumCtx.drawImage(video, 0, 0, gx, gz);
          const px  = lumCtx.getImageData(0, 0, gx, gz).data;
          let lo = 1, hi = 0;
          const lums = new Float32Array(count);
          for (let i = 0; i < count; i++) {
            const p = i * 4;
            const l = (0.299 * px[p] + 0.587 * px[p + 1] + 0.114 * px[p + 2]) / 255;
            lums[i] = l;
            if (l < lo) lo = l;
            if (l > hi) hi = l;
          }
          const span = Math.max(hi - lo, 0.01);
          for (let i = 0; i < count; i++) {
            depthArr[i] = Math.pow(Math.min(1, Math.max(0, (lums[i] - lo) / span)), 0.72);
          }
        }

        /**
         * Samples the depth tensor into our grid.
         * depth-anything v2 outputs relative (disparity-style) depth:
         * HIGHER value = NEARER to camera → no inversion needed.
         * No mirror for pre-recorded video (unlike webcam which flips X).
         */
        function sampleTensorToGrid(raw: Float32Array, dW: number, dH: number) {
          const n = raw.length;
          if (n === 0) return;
          const sorted = Float32Array.from(raw).sort();
          const dMin   = sorted[Math.max(0, Math.floor(n * 0.04))];
          const dMax   = sorted[Math.min(n - 1, Math.floor(n * 0.96))];
          const dRange = Math.max(dMax - dMin, 1e-6);
          for (let iz = 0; iz < gz; iz++) {
            for (let ix = 0; ix < gx; ix++) {
              const srcX = Math.min(Math.floor((ix / Math.max(gx - 1, 1)) * (dW - 1)), dW - 1);
              const srcY = Math.min(Math.floor((iz / Math.max(gz - 1, 1)) * (dH - 1)), dH - 1);
              const norm = Math.min(1, Math.max(0, (raw[srcY * dW + srcX] - dMin) / dRange));
              depthArr[iz * gx + ix] = norm;
            }
          }
        }

        async function runDepthInference() {
          if (depthBusy || !video.videoWidth) return;
          depthBusy = true;
          try {
            if (!depthModelReady || !depthPipeline || !inferCtx) {
              runLumFallback();
              return;
            }
            inferCtx.drawImage(video, 0, 0, INFER_W, INFER_H);
            const result = await (depthPipeline as (input: HTMLCanvasElement) => Promise<{
              predicted_depth?: { data: Float32Array | number[]; dims: number[] };
              depth?: { data: Float32Array | number[]; dims: number[] };
            }>)(inferCanvas);

            const tensor  = result.predicted_depth ?? result.depth;
            const rawData = tensor?.data;
            if (!rawData || !tensor?.dims) { runLumFallback(); return; }
            const dims = tensor.dims;
            const dH   = dims[dims.length - 2];
            const dW   = dims[dims.length - 1];
            const buf  = rawData instanceof Float32Array ? rawData : Float32Array.from(rawData);
            sampleTensorToGrid(buf, dW, dH);
          } catch {
            runLumFallback();
          } finally {
            depthBusy = false;
          }
        }

        const inferInterval = setInterval(() => {
          if (!aborted) void runDepthInference();
        }, INFER_INTERVAL_MS);

        // ── Resize handler ───────────────────────────────────────────────────
        const handleResize = () => {
          const w = container.clientWidth;
          const h = container.clientHeight;
          if (w < 2 || h < 2) return;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        const ro = new ResizeObserver(handleResize);
        ro.observe(container);
        window.visualViewport?.addEventListener('resize', handleResize);

        // ── Render loop ──────────────────────────────────────────────────────
        const clock = new THREE.Clock();
        let animId: number;

        const animate = () => {
          animId = requestAnimationFrame(animate);
          const elapsed = clock.getElapsedTime();
          uniforms.uTime.value = elapsed;

          // Exponential lerp: smooths depth between sparse inference frames
          for (let i = 0; i < count; i++) {
            smoothArr[i] += (depthArr[i] - smoothArr[i]) * DEPTH_LERP;
            (instanceDepthAttr.array as Float32Array)[i] = smoothArr[i];
          }
          instanceDepthAttr.needsUpdate = true;

          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        renderer.domElement.style.cursor = 'grab';
        renderer.domElement.addEventListener('pointerdown', () => {
          renderer.domElement.style.cursor = 'grabbing';
        });
        renderer.domElement.addEventListener('pointerup', () => {
          renderer.domElement.style.cursor = 'grab';
        });

        // ── Cleanup ──────────────────────────────────────────────────────────
        cleanupRef.current = () => {
          cancelAnimationFrame(animId);
          clearInterval(inferInterval);
          window.clearTimeout(videoFailTimer);
          video.removeEventListener('loadeddata', onVideoLoaded);
          video.removeEventListener('error', onVideoError);
          renderer.domElement.removeEventListener('pointerdown', pauseAutoRotate);
          renderer.domElement.removeEventListener('wheel', pauseAutoRotate);
          if (autoRotateTimer) clearTimeout(autoRotateTimer);
          ro.disconnect();
          window.visualViewport?.removeEventListener('resize', handleResize);
          geo.dispose();
          mat.dispose();
          videoTexture.dispose();
          video.pause();
          video.src = '';
          video.load();
          controls.dispose();
          renderer.dispose();
          if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
          canvasElRef.current = null;
          if (depthPipeline && typeof (depthPipeline as { dispose?: () => void }).dispose === 'function') {
            void (depthPipeline as { dispose: () => Promise<void> }).dispose();
          }
        };
      } catch {
        initFailedRef.current = true;
        if (!aborted) setShowFallback(true);
        cleanupRef.current?.();
        cleanupRef.current = null;
      }
    })();

    return () => {
      aborted = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []); // intentionally empty — Three.js scene initialises once

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  useEffect(() => {
    const handleChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element | null;
        msFullscreenElement?: Element | null;
      };
      const fs = Boolean(
        doc.fullscreenElement ?? doc.webkitFullscreenElement ?? doc.msFullscreenElement
      );
      setIsFullscreen(fs);
      if (fs) {
        setPseudoFullscreen(false);
        document.body.style.overflow = '';
      }
    };
    document.addEventListener('fullscreenchange', handleChange);
    document.addEventListener('webkitfullscreenchange', handleChange as EventListener);
    document.addEventListener('MSFullscreenChange', handleChange as EventListener);
    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      document.removeEventListener('webkitfullscreenchange', handleChange as EventListener);
      document.removeEventListener('MSFullscreenChange', handleChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasElRef.current;
    if (!canvas) return;
    canvas.style.touchAction = immersive ? 'none' : 'pan-y';
  }, [immersive]);

  useEffect(() => {
    if (!pseudoFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPseudoFullscreen(false);
        document.body.style.overflow = '';
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pseudoFullscreen]);

  useEffect(() => () => { document.body.style.overflow = ''; }, []);

  useEffect(() => {
    initFailedRef.current = false;
    return () => { initFailedRef.current = false; };
  }, []);

  return (
    <div
      ref={rootRef}
      onDoubleClick={() => void toggleFullscreen()}
      className={`relative w-full overflow-hidden group bg-[#030303] ${
        pseudoFullscreen
          ? 'fixed inset-0 z-[99999] m-0 h-[100dvh] w-screen max-w-none rounded-none'
          : 'rounded-xl'
      }`}
      style={{
        height:    pseudoFullscreen ? '100dvh' : height,
        maxHeight: pseudoFullscreen ? '100dvh' : undefined,
      }}
    >
      {/* Three.js canvas mounts here */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full"
        aria-label="Interactive volumetric depth sculpture — drag to orbit, scroll to zoom"
      />

      {/* Plain video fallback when WebGL/video init fails (e.g. mobile low-end) */}
      {showFallback && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 z-[3] h-full w-full object-cover"
          aria-label="Volumetric video playback fallback"
        >
          <source src={webmSrc} type="video/webm" />
          <source src={mp4Src}  type="video/mp4"  />
        </video>
      )}

      {/* CSS vignette — above fallback video */}
      <div
        className={`absolute inset-0 z-[4] pointer-events-none ${
          pseudoFullscreen ? 'rounded-none' : 'rounded-xl'
        }`}
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.60) 100%)',
        }}
      />

      {/* Orbit / zoom hint — fades on hover */}
      <div
        className="absolute bottom-4 left-1/2 z-[5] -translate-x-1/2 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/50 text-xs tracking-wider opacity-100 group-hover:opacity-0 transition-opacity duration-700"
        aria-hidden="true"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-70">
          <path
            d="M7 1.5C3.96 1.5 1.5 3.96 1.5 7s2.46 5.5 5.5 5.5 5.5-2.46 5.5-5.5"
            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
          />
          <path
            d="M10.5 1L12.5 3L10.5 5"
            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
        drag to orbit · scroll to zoom
      </div>

      {/* Fullscreen toggle */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); void toggleFullscreen(); }}
        className="absolute top-3 right-3 z-[5] flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-black/55 backdrop-blur-md text-white/80 hover:text-white hover:border-white/40 transition-colors shadow-lg shadow-black/40"
        aria-label={immersive ? 'Exit fullscreen volumetric viewer' : 'Enter fullscreen volumetric viewer'}
      >
        {immersive ? (
          <Minimize2 className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
        ) : (
          <Maximize2 className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
        )}
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase">
          {immersive ? 'Exit Fullscreen' : 'Fullscreen'}
        </span>
      </button>
    </div>
  );
}
