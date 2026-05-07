'use client';

/**
 * CryptVolumetric3D — Photorealistic volumetric depth from one composite master video.
 *
 * The source is a **single file** tiling six simultaneous captures (multi-angle RGB + Kinect-style
 * thermal depth). We **fuse** them — not six independent depth runs:
 *
 *   • **Colour**: weighted blend of the three RGB tiles at the same canonical subject UV.
 *   • **Depth**: Depth-Anything v2 runs **once** on the full composite, then each voxel samples
 *     normalized disparity at that subject UV inside **every** tile and merges them (weighted mean,
 *     max lift, and Kinect luminance overlay).
 *
 * Default layout: **3×2** — row 0 = three RGB angles, row 1 = three Kinect / thermal feeds
 * (see `defaultCryptCompositeCells()`).
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

// ── Six-tile composite fusion (single video file) ─────────────────────────────
type CompositeCellRole = 'rgb' | 'kinect';

export type CompositeCell = {
  u0: number;
  v0: number;
  u1: number;
  v1: number;
  role: CompositeCellRole;
};

/** 3×2 grid: top row RGB (3 angles), bottom row Kinect / thermal-style depth feeds. */
export function defaultCryptCompositeCells(): CompositeCell[] {
  const cols = 3;
  const rows = 2;
  const cells: CompositeCell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        u0: c / cols,
        v0: r / rows,
        u1: (c + 1) / cols,
        v1: (r + 1) / rows,
        role: r === 0 ? 'rgb' : 'kinect',
      });
    }
  }
  return cells;
}

const CRYPT_COMPOSITE_CELLS = defaultCryptCompositeCells();

/** ONNX disparity sample weights — Kinect tiles carry structured depth cues. */
const ONNX_FUSE_WEIGHT_RGB = 1.0;
const ONNX_FUSE_WEIGHT_KINECT = 1.72;
/** Blend mean vs max across views (higher = more conservative “nearest wins”). */
const ONNX_FUSE_MAX_LIFT = 0.4;
/** How strongly Kinect raw luminance modulates fused ONNX depth (thermal ≈ near). */
const KINECT_THERMAL_MOD = 0.38;

/** Downscaled full-frame read for bilinear fusion (keeps getImageData cost bounded). */
const FRAME_SNAP_MAX_W = 960;

function sampleBilinearFloatGrid(
  buf: Float32Array,
  dW: number,
  dH: number,
  tu: number,
  tv: number
): number {
  const u = Math.max(0, Math.min(1, tu));
  const v = Math.max(0, Math.min(1, tv));
  const x = u * (dW - 1);
  const y = v * (dH - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(dW - 1, x0 + 1);
  const y1 = Math.min(dH - 1, y0 + 1);
  const fx = x - x0;
  const fy = y - y0;
  const i00 = y0 * dW + x0;
  const i01 = y0 * dW + x1;
  const i10 = y1 * dW + x0;
  const i11 = y1 * dW + x1;
  return (
    buf[i00]! * (1 - fx) * (1 - fy) +
    buf[i01]! * fx * (1 - fy) +
    buf[i10]! * (1 - fx) * fy +
    buf[i11]! * fx * fy
  );
}

function sampleBilinearLumFromRgba(
  src: Uint8ClampedArray,
  sw: number,
  sh: number,
  tu: number,
  tv: number
): number {
  const u = Math.max(0, Math.min(1, tu));
  const v = Math.max(0, Math.min(1, tv));
  const x = u * (sw - 1);
  const y = v * (sh - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(sw - 1, x0 + 1);
  const y1 = Math.min(sh - 1, y0 + 1);
  const fx = x - x0;
  const fy = y - y0;

  const lumAt = (px: number, py: number) => {
    const i = (py * sw + px) * 4;
    const r = src[i]!;
    const g = src[i + 1]!;
    const b = src[i + 2]!;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  return (
    lumAt(x0, y0) * (1 - fx) * (1 - fy) +
    lumAt(x1, y0) * fx * (1 - fy) +
    lumAt(x0, y1) * (1 - fx) * fy +
    lumAt(x1, y1) * fx * fy
  );
}

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
// min.xy → max.zw in UV space for each RGB tile (top row of composite)
uniform vec4 uRgbUv0;
uniform vec4 uRgbUv1;
uniform vec4 uRgbUv2;

varying vec2  vVideoUV;
varying vec3  vNormalWorld;
varying vec3  vWorldPos;
varying float vDepthShaded;

void main() {
  // Canonical subject UV vVideoUV → three RGB angles, blended (center weighted)
  vec2 uv0 = mix(uRgbUv0.xy, uRgbUv0.zw, vVideoUV);
  vec2 uv1 = mix(uRgbUv1.xy, uRgbUv1.zw, vVideoUV);
  vec2 uv2 = mix(uRgbUv2.xy, uRgbUv2.zw, vVideoUV);
  vec3 c0 = texture2D(uVideoTexture, uv0).rgb;
  vec3 c1 = texture2D(uVideoTexture, uv1).rgb;
  vec3 c2 = texture2D(uVideoTexture, uv2).rgb;
  vec3 base = c0 * 0.38 + c1 * 0.34 + c2 * 0.28;

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
          // UV: U left→right; V top→bottom (1 - iz/gz to match WebGL convention)
          uvArr[i * 2]     = (ix + 0.5) / gx;
          uvArr[i * 2 + 1] = 1.0 - (iz + 0.5) / gz;
        }

        // Back smoothArr with WebGL so inference targets in depthArr are never overwritten.
        const instanceDepthAttr = new THREE.InstancedBufferAttribute(smoothArr, 1);
        instanceDepthAttr.setUsage(THREE.DynamicDrawUsage);
        const instanceUVAttr = new THREE.InstancedBufferAttribute(uvArr, 2);
        geo.setAttribute('instanceDepth', instanceDepthAttr);
        geo.setAttribute('instanceUV',    instanceUVAttr);

        const rgb0 = CRYPT_COMPOSITE_CELLS[0]!;
        const rgb1 = CRYPT_COMPOSITE_CELLS[1]!;
        const rgb2 = CRYPT_COMPOSITE_CELLS[2]!;

        // ── Shader material: video colour + 3-light rig ──────────────────────
        const uniforms = {
          uVideoTexture:  { value: videoTexture },
          uExtrusionNear: { value: EXTRUSION_NEAR },
          uExtrusionFar:  { value: EXTRUSION_FAR  },
          uDepthPow:      { value: DEPTH_POW       },
          uTime:          { value: 0               },
          uRgbUv0: {
            value: new THREE.Vector4(rgb0.u0, rgb0.v0, rgb0.u1, rgb0.v1),
          },
          uRgbUv1: {
            value: new THREE.Vector4(rgb1.u0, rgb1.v0, rgb1.u1, rgb1.v1),
          },
          uRgbUv2: {
            value: new THREE.Vector4(rgb2.u0, rgb2.v0, rgb2.u1, rgb2.v1),
          },
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

        // ── Depth inference: Depth-Anything v2 on full composite + multi-tile fusion ─
        const inferCanvas   = document.createElement('canvas');
        inferCanvas.width   = INFER_W;
        inferCanvas.height  = INFER_H;
        const inferCtx      = inferCanvas.getContext('2d', { willReadFrequently: true });

        const frameSnapCanvas = document.createElement('canvas');
        const frameSnapCtx    = frameSnapCanvas.getContext('2d', { willReadFrequently: true });

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

        /**
         * ~4th / ~96th percentile stretch (matches hero voxel intent) without O(n log n) sort.
         * Histogram over min→max → cumulative counts; O(n + BINS).
         */
        function depthPercentileMinMax(raw: Float32Array): { dMin: number; dMax: number } {
          const n = raw.length;
          if (n === 0) return { dMin: 0, dMax: 1 };
          let lo = Infinity;
          let hi = -Infinity;
          for (let i = 0; i < n; i++) {
            const v = raw[i]!;
            if (v < lo) lo = v;
            if (v > hi) hi = v;
          }
          const span = hi - lo;
          if (span < 1e-9) return { dMin: lo, dMax: lo + 1e-6 };

          const BINS = 256;
          const hist = new Uint32Array(BINS);
          const inv = BINS / span;
          for (let i = 0; i < n; i++) {
            const b = Math.min(BINS - 1, Math.max(0, Math.floor((raw[i]! - lo) * inv)));
            hist[b]!++;
          }

          const loTarget = Math.max(1, Math.floor(n * 0.04));
          const hiTarget = Math.max(loTarget, Math.floor(n * 0.96));
          let acc = 0;
          let lowBin = 0;
          for (let b = 0; b < BINS; b++) {
            acc += hist[b]!;
            if (acc >= loTarget) {
              lowBin = b;
              break;
            }
          }
          acc = 0;
          let highBin = BINS - 1;
          for (let b = 0; b < BINS; b++) {
            acc += hist[b]!;
            if (acc >= hiTarget) {
              highBin = b;
              break;
            }
          }

          const dMin = lo + (lowBin / BINS) * span;
          const dMax = lo + ((highBin + 1) / BINS) * span;
          return { dMin, dMax: Math.max(dMax, dMin + 1e-6) };
        }

        function captureFrameSnap():
          | { src: Uint8ClampedArray; sw: number; sh: number }
          | null {
          if (!frameSnapCtx || !video.videoWidth) return null;
          const vw = video.videoWidth;
          const vh = video.videoHeight;
          const sw = Math.min(FRAME_SNAP_MAX_W, vw);
          const sh = Math.max(1, Math.round((sw * vh) / vw));
          if (frameSnapCanvas.width !== sw) {
            frameSnapCanvas.width = sw;
            frameSnapCanvas.height = sh;
          }
          frameSnapCtx.drawImage(video, 0, 0, sw, sh);
          return {
            src: frameSnapCtx.getImageData(0, 0, sw, sh).data,
            sw,
            sh,
          };
        }

        /** Per-pixel normalized [0,1] ONNX disparity (higher = nearer). */
        function normalizeOnnxDepthTensor(raw: Float32Array): Float32Array {
          const { dMin, dMax } = depthPercentileMinMax(raw);
          const range = dMax - dMin;
          const out = new Float32Array(raw.length);
          for (let i = 0; i < raw.length; i++) {
            out[i] = Math.min(1, Math.max(0, (raw[i]! - dMin) / range));
          }
          return out;
        }

        /**
         * Merge Depth-Anything output from all six mosaic tiles at each subject UV,
         * then overlay Kinect thermal luminance so structured depth and raw IR agree.
         */
        function fuseOnnxMultiViewToGrid(
          normOnnx: Float32Array,
          dW: number,
          dH: number,
          snap: { src: Uint8ClampedArray; sw: number; sh: number } | null
        ) {
          const cells = CRYPT_COMPOSITE_CELLS;
          for (let iz = 0; iz < gz; iz++) {
            for (let ix = 0; ix < gx; ix++) {
              const su = (ix + 0.5) / gx;
              const sv = 1.0 - (iz + 0.5) / gz;
              let wAcc = 0;
              let sAcc = 0;
              let dMax = 0;
              let thermAcc = 0;
              let thermW = 0;
              for (const c of cells) {
                const tu = c.u0 + su * (c.u1 - c.u0);
                const tv = c.v0 + sv * (c.v1 - c.v0);
                const onnxVal = sampleBilinearFloatGrid(normOnnx, dW, dH, tu, tv);
                const w =
                  c.role === 'kinect' ? ONNX_FUSE_WEIGHT_KINECT : ONNX_FUSE_WEIGHT_RGB;
                sAcc += onnxVal * w;
                wAcc += w;
                if (onnxVal > dMax) dMax = onnxVal;
                if (snap && c.role === 'kinect') {
                  const lum = sampleBilinearLumFromRgba(
                    snap.src,
                    snap.sw,
                    snap.sh,
                    tu,
                    tv
                  );
                  thermAcc += lum * w;
                  thermW += w;
                }
              }
              let fused =
                (sAcc / wAcc) * (1 - ONNX_FUSE_MAX_LIFT) + dMax * ONNX_FUSE_MAX_LIFT;
              if (thermW > 0 && snap) {
                const therm01 = Math.pow(Math.min(1, thermAcc / thermW), 0.9);
                fused = fused * (1 - KINECT_THERMAL_MOD) + therm01 * KINECT_THERMAL_MOD;
                fused = Math.min(1, fused * (0.86 + 0.28 * therm01));
              }
              depthArr[iz * gx + ix] = Math.min(1, Math.max(0, fused));
            }
          }
        }

        /** Fast luminance-only multi-view fusion (no ONNX). */
        function runLumFallback() {
          const snap = captureFrameSnap();
          if (!snap) return;
          const cells = CRYPT_COMPOSITE_CELLS;
          for (let iz = 0; iz < gz; iz++) {
            for (let ix = 0; ix < gx; ix++) {
              const su = (ix + 0.5) / gx;
              const sv = 1.0 - (iz + 0.5) / gz;
              let rgbSum = 0;
              let rgbN = 0;
              let rgbMax = 0;
              let thermSum = 0;
              let thermN = 0;
              for (const c of cells) {
                const tu = c.u0 + su * (c.u1 - c.u0);
                const tv = c.v0 + sv * (c.v1 - c.v0);
                const lum = sampleBilinearLumFromRgba(
                  snap.src,
                  snap.sw,
                  snap.sh,
                  tu,
                  tv
                );
                if (c.role === 'kinect') {
                  thermSum += lum;
                  thermN++;
                } else {
                  rgbSum += lum;
                  rgbN++;
                  if (lum > rgbMax) rgbMax = lum;
                }
              }
              const meanRgb = rgbN ? rgbSum / rgbN : 0;
              const dRgb = rgbMax * 0.58 + meanRgb * 0.42;
              const thermMean = thermN ? thermSum / thermN : 0;
              const dTh = Math.pow(thermMean, 0.72);
              const fused = dTh * 0.52 + Math.max(dRgb, dTh * 0.88) * 0.48;
              depthArr[iz * gx + ix] = Math.pow(Math.min(1, fused), 0.7);
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
            const norm = normalizeOnnxDepthTensor(buf);
            const snap = captureFrameSnap();
            fuseOnnxMultiViewToGrid(norm, dW, dH, snap);
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

          // Exponential lerp: smooths depth between sparse inference frames (smoothArr backs GPU attr)
          for (let i = 0; i < count; i++) {
            smoothArr[i] += (depthArr[i] - smoothArr[i]) * DEPTH_LERP;
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
