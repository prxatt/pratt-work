'use client';

/**
 * Homepage hero — single InstancedMesh voxel grid (~12K voxels @ tier 'full').
 *
 * Architecture:
 *   - One InstancedMesh + one RoundedBoxGeometry + one MeshPhysicalMaterial.
 *   - Idle: slow multi-axis wave drives per-instance Y scale + Z parallax.
 *   - Live: webcam depth (high = near after orientation) drives per-instance
 *           voxel HEIGHT and Z PARALLAX simultaneously for true layered relief.
 *
 * Orientation/polarity is canonicalized in `heroVoxelDepthInference.ts`. This
 * file consumes the depth buffer as "high = near" and never inverts it again.
 *
 * Performance notes:
 *   - Single draw call. Per-frame work is dominated by JS matrix composition
 *     (12K × ~16 floats/instance/frame ≈ 12 MB/s — well within budget).
 *   - `frustumCulled = false` because per-instance transforms invalidate the
 *     mesh's static bounding sphere.
 *   - `instanceMatrix` set to DynamicDrawUsage for cheap GPU re-uploads.
 *   - dt-compensated lerp keeps motion identical at 60 / 90 / 120 Hz.
 */

import * as THREE from 'three/webgpu';
import { WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { gridDimensionsForTier, type HeroVoxelTier } from './heroVoxelConfig';

// ── Voxel geometry ─────────────────────────────────────────────────────────
const VOXEL_SIZE = 0.135;
const VOXEL_RADIUS = 0.03;
const VOXEL_SEGMENTS = 2;
const VOXEL_SPACING = 0.235;
const WALL_ROOT_SCALE = 0.88;

// ── Idle wave field ────────────────────────────────────────────────────────
const IDLE_HEIGHT_BIAS = 0.34; // never fully flatten — keeps grid readable
const IDLE_Z_SWELL = 0.44;
const IDLE_LERP_BASE = 0.058;

// ── Live volumetric extrusion ──────────────────────────────────────────────
const LIVE_Z_RELIEF = 9.4; // forward/backward parallax range
const LIVE_Z_PIVOT = 0.42; // near regions protrude, far regions recede
const LIVE_SCALE_MIN = 0.86; // avoid needle-thin bars
const LIVE_SCALE_MAX = 1.18; // keep extrusion believable
const LIVE_DEPTH_CONTRAST = 1.4; // pow exponent — deeper midtone push
const LIVE_DEPTH_SHAPE_LO = 0.12; // smoothstep low edge for shaped curve
const LIVE_DEPTH_SHAPE_HI = 0.88; // smoothstep high edge for shaped curve
const LIVE_DEPTH_SHAPE_MIX = 0.62; // mix(d1, d2, blend) — 0 = pure pow, 1 = pure smoothstep
const LIVE_FOREGROUND_BOOST = 0.1; // selectively amplify near regions
const LIVE_FOREGROUND_THRESHOLD = 0.72; // start foreground amplification here
const LIVE_NORMALIZE_BLEND = 0.14; // blend global [0,1] with per-frame min/max remap
const LIVE_LERP_BASE = 0.42;
const LIVE_INITIAL_BOOST = 1.05; // extrusion amplifier on activation
const LIVE_EXPOSURE_BASE = 1.34;
const LIVE_EXPOSURE_MIN = 1.18;
const LIVE_EXPOSURE_MAX = 1.56;

// ── Brand palette ──────────────────────────────────────────────────────────
const COLOR_SHADOW = new THREE.Color('#1d313d');
const COLOR_MID = new THREE.Color('#2e5d6d');
const COLOR_TEAL_BRIGHT = new THREE.Color('#88ddec');
const COLOR_HIGHLIGHT = new THREE.Color('#f8fdff');

const IDLE_COLOR_LO = new THREE.Color('#1a2d39');
const IDLE_COLOR_MID = new THREE.Color('#274755');
const IDLE_COLOR_HI = new THREE.Color('#8bbbc4');

function smoothstepScalar(edge0: number, edge1: number, x: number): number {
  const d = edge1 - edge0 || 1;
  const t = Math.max(0, Math.min(1, (x - edge0) / d));
  return t * t * (3 - 2 * t);
}

function idleWaveMix(nx: number, nz: number, t: number): number {
  const kx = nx * Math.PI * 2;
  const kz = nz * Math.PI * 2;
  const wXY =
    Math.sin(kx * 1.55 + t * 0.24) * Math.cos(kz * 1.55 + t * 0.21) * 0.5 + 0.5;
  const wDiag = Math.sin(kx * 0.9 + kz * 0.9 - t * 0.28) * 0.5 + 0.5;
  const wDepth = Math.sin(t * 0.22 + kx * 0.52 - kz * 0.46) * 0.5 + 0.5;
  return wXY * 0.46 + wDiag * 0.34 + wDepth * 0.2;
}

function idleZWave(nx: number, nz: number, t: number): number {
  const kx = nx * Math.PI * 2;
  const kz = nz * Math.PI * 2;
  return (
    Math.sin(kx * 1.2 + t * 0.2) * Math.cos(kz * 1.2 + t * 0.18) * 0.65 +
    Math.sin(kx * 0.72 + kz * 0.72 + t * 0.16) * 0.35
  );
}

const tmpColor = new THREE.Color();

function idleColor(out: THREE.Color, mix01: number) {
  const m = THREE.MathUtils.clamp(mix01, 0, 1);
  if (m < 0.55) {
    out.copy(IDLE_COLOR_LO).lerp(IDLE_COLOR_MID, smoothstepScalar(0, 0.55, m));
  } else {
    out.copy(IDLE_COLOR_MID).lerp(IDLE_COLOR_HI, smoothstepScalar(0.55, 1, m));
  }
}

function depthColor(out: THREE.Color, depth01: number) {
  const t = THREE.MathUtils.clamp(depth01, 0, 1);
  // Cinematic tritone separation improves foreground/mid/background legibility.
  if (t < 0.34) {
    out.copy(COLOR_SHADOW).lerp(COLOR_MID, smoothstepScalar(0, 0.34, t));
  } else if (t < 0.74) {
    out
      .copy(COLOR_MID)
      .lerp(COLOR_TEAL_BRIGHT, smoothstepScalar(0.34, 0.74, t));
  } else {
    out.copy(COLOR_TEAL_BRIGHT).lerp(COLOR_HIGHLIGHT, smoothstepScalar(0.74, 1, t));
  }
}

type VoxelPack = {
  root: THREE.Group;
  mesh: THREE.InstancedMesh;
  basePositions: Float32Array; // (x, y, 0) per instance — fixed per frame
  smoothDepths: Float32Array; // per-frame smoothed depth in [0,1]
  currentScaleY: Float32Array; // dt-smoothed Y scale (voxel height)
  currentZPush: Float32Array; // dt-smoothed Z parallax (forward push)
  count: number;
};

export type HeroVoxelSceneApi = {
  dispose: () => void;
  setCameraActive: (active: boolean) => void;
  bindDepthBuffer: (buffer: Float32Array | null) => void;
};

export async function mountHeroVoxelScene(
  container: HTMLElement,
  tier: HeroVoxelTier,
  opts?: { reducedMotion?: boolean; tryWebGpuFirst?: boolean }
): Promise<HeroVoxelSceneApi> {
  const reducedMotion = opts?.reducedMotion ?? false;
  const { gx: GRID_X, gz: GRID_Z } = gridDimensionsForTier(tier);
  const voxelCount = GRID_X * GRID_Z;

  let depthBuffer: Float32Array | null = null;
  let cameraMode = false;
  let extrusionBoost = 1;

  const scene = new THREE.Scene();

  const measure = () => {
    const r = container.getBoundingClientRect();
    const w = Math.max(1, Math.floor(r.width || window.innerWidth));
    const h = Math.max(1, Math.floor(r.height || window.innerHeight));
    return { w, h };
  };

  let { w: cw, h: ch } = measure();

  const camera = new THREE.PerspectiveCamera(58, cw / ch, 0.1, 500);
  const cameraDistanceForAspect = (aspect: number) => (aspect < 1 ? 25.5 : 18.5);
  camera.position.set(0, 0, cameraDistanceForAspect(cw / ch));
  camera.lookAt(0, 0, 0);

  // Keep WebGL as canonical path: this scene relies on onBeforeCompile shader
  // customization for fresnel/rim behavior, which is not guaranteed on WebGPU.
  // Avoid initializing and disposing a WebGPU renderer each mount.
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, tier === 'medium' ? 1 : 1.25)
  );
  renderer.setSize(cw, ch);
  renderer.setClearColor(0x070d16, 0);
  if ('shadowMap' in renderer) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = LIVE_EXPOSURE_BASE;
  renderer.domElement.style.cssText =
    'display:block;width:100%;height:100%;object-fit:cover;outline:none;vertical-align:top';
  renderer.domElement.style.pointerEvents = 'none';
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableRotate = false;
  controls.autoRotate = false;
  controls.target.set(0, 0, 0);
  controls.minDistance = 18;
  controls.maxDistance = 52;
  controls.maxPolarAngle = Math.PI * 0.62;
  controls.minPolarAngle = Math.PI * 0.32;
  controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
  controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
  controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;

  const onWheelExtrusion = (e: WheelEvent) => {
    if (!cameraMode || !e.shiftKey) return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.94 : 1.06;
    extrusionBoost = Math.max(0.4, Math.min(3.4, extrusionBoost * factor));
  };
  renderer.domElement.addEventListener('wheel', onWheelExtrusion, {
    passive: false,
  });

  // No in-scene background sphere — the page's HeroAmbientScreen radial gradient
  // shows through the transparent canvas, preserving the cyber-void atmosphere.
  const voxels = createVoxelGrid(GRID_X, GRID_Z, voxelCount);
  voxels.root.scale.setScalar(WALL_ROOT_SCALE);
  scene.add(voxels.root);
  createLights(scene);

  const dummy = new THREE.Object3D();
  let lastTime = performance.now();
  // Mutable idle reference camera pose; updated on resize/aspect changes.
  const idleCameraBase = camera.position.clone();

  const frameLerp = (base: number, dt: number, floor: number) =>
    Math.min(1, base * (dt / (1 / 60)) + floor);

  function updateIdle(t: number, dt: number) {
    const lerp = frameLerp(IDLE_LERP_BASE, dt, 0.02);
    for (let i = 0; i < voxelCount; i++) {
      const ix = i % GRID_X;
      const iz = Math.floor(i / GRID_X);
      const nx = ix / Math.max(GRID_X - 1, 1);
      const nz = iz / Math.max(GRID_Z - 1, 1);
      const wave = idleWaveMix(nx, nz, t);
      const targetY = 0.82 + wave * 0.42;
      const targetZ = idleZWave(nx, nz, t) * IDLE_Z_SWELL;

      voxels.currentScaleY[i] += (targetY - voxels.currentScaleY[i]) * lerp;
      voxels.currentZPush[i] += (targetZ - voxels.currentZPush[i]) * lerp;

      const baseIdx = i * 3;
      const x = voxels.basePositions[baseIdx];
      const y = voxels.basePositions[baseIdx + 1];
      const sy = Math.max(0.05, voxels.currentScaleY[i]);
      const z = voxels.currentZPush[i];

      dummy.position.set(x, y, z);
      dummy.scale.set(1, 1, sy);
      dummy.updateMatrix();
      voxels.mesh.setMatrixAt(i, dummy.matrix);

      idleColor(tmpColor, wave);
      voxels.mesh.setColorAt(i, tmpColor);
    }
    voxels.mesh.instanceMatrix.needsUpdate = true;
    if (voxels.mesh.instanceColor) voxels.mesh.instanceColor.needsUpdate = true;
  }

  function updateLive(buf: Float32Array, dt: number) {
    const lerp = frameLerp(LIVE_LERP_BASE, dt, 0.08);
    let depthMin = Infinity;
    let depthMax = -Infinity;
    for (let i = 0; i < voxelCount; i++) {
      const v = THREE.MathUtils.clamp(buf[i], 0, 1);
      if (v < depthMin) depthMin = v;
      if (v > depthMax) depthMax = v;
    }
    const depthRange = Math.max(0.12, depthMax - depthMin);
    // Adaptive exposure: low depth range usually means flat/over-bright input,
    // so reduce exposure; richer depth range gets a gentle lift for readability.
    const rangeNorm = THREE.MathUtils.clamp((depthRange - 0.12) / 0.5, 0, 1);
    const targetExposure = THREE.MathUtils.clamp(
      LIVE_EXPOSURE_BASE + (rangeNorm - 0.5) * 0.3,
      LIVE_EXPOSURE_MIN,
      LIVE_EXPOSURE_MAX
    );
    renderer.toneMappingExposure +=
      (targetExposure - renderer.toneMappingExposure) * Math.min(1, lerp * 0.7);

    for (let i = 0; i < voxelCount; i++) {
      // Canonical "high = near" — orientation handled in inference layer.
      const raw = buf[i];
      voxels.smoothDepths[i] += (raw - voxels.smoothDepths[i]) * lerp;
      const dGlobal = THREE.MathUtils.clamp(voxels.smoothDepths[i], 0, 1);
      const dLocal = THREE.MathUtils.clamp(
        (dGlobal - depthMin) / depthRange,
        0,
        1
      );
      // Hybrid normalization improves face relief in varied lighting/backgrounds.
      const d0 = THREE.MathUtils.lerp(dGlobal, dLocal, LIVE_NORMALIZE_BLEND);
      const d1 = Math.pow(d0, LIVE_DEPTH_CONTRAST);
      const d2 = smoothstepScalar(LIVE_DEPTH_SHAPE_LO, LIVE_DEPTH_SHAPE_HI, d1);
      let dFinal = THREE.MathUtils.clamp(
        d1 * (1 - LIVE_DEPTH_SHAPE_MIX) + d2 * LIVE_DEPTH_SHAPE_MIX,
        0,
        1
      );
      // Suppress background spill so distant regions don't project toward camera.
      dFinal = smoothstepScalar(0.08, 0.96, dFinal);
      if (dFinal > LIVE_FOREGROUND_THRESHOLD) {
        const fg = smoothstepScalar(LIVE_FOREGROUND_THRESHOLD, 1, dFinal);
        dFinal = THREE.MathUtils.clamp(dFinal + fg * LIVE_FOREGROUND_BOOST, 0, 1);
      }

      const targetY =
        LIVE_SCALE_MIN +
        dFinal * (LIVE_SCALE_MAX - LIVE_SCALE_MIN) * (0.86 + 0.14 * extrusionBoost);
      // Position carries shape; scale adds subtle voxel thickness variation.
      const targetZ = (dFinal - LIVE_Z_PIVOT) * LIVE_Z_RELIEF * extrusionBoost;

      voxels.currentScaleY[i] += (targetY - voxels.currentScaleY[i]) * lerp;
      voxels.currentZPush[i] += (targetZ - voxels.currentZPush[i]) * lerp;

      const baseIdx = i * 3;
      const x = voxels.basePositions[baseIdx];
      const y = voxels.basePositions[baseIdx + 1];
      const sy = Math.max(0.05, voxels.currentScaleY[i]);
      const z = voxels.currentZPush[i];

      dummy.position.set(x, y, z);
      dummy.scale.set(1, 1, sy);
      dummy.updateMatrix();
      voxels.mesh.setMatrixAt(i, dummy.matrix);

      depthColor(tmpColor, dFinal);
      voxels.mesh.setColorAt(i, tmpColor);
    }
    voxels.mesh.instanceMatrix.needsUpdate = true;
    if (voxels.mesh.instanceColor) voxels.mesh.instanceColor.needsUpdate = true;
  }

  const applySize = () => {
    const { w, h } = measure();
    if (w < 2 || h < 2) return;
    cw = w;
    ch = h;
    const aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    if (!cameraMode) {
      idleCameraBase.set(0, 0, cameraDistanceForAspect(aspect));
      camera.position.copy(idleCameraBase);
      controls.target.set(0, 0, 0);
    }
    renderer.setSize(w, h);
    const cap = cameraMode ? 1 : tier === 'medium' ? 1 : 1.25;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
  };

  const ro = new ResizeObserver(() => applySize());
  ro.observe(container);
  if (typeof window !== 'undefined' && window.visualViewport) {
    window.visualViewport.addEventListener('resize', applySize);
  }

  // Subtle idle camera drift adds life without exposing the back of the grid.
  // Keep this mutable so resize/aspect changes don't restore stale distance.
  const updateIdleCameraDrift = (t: number) => {
    if (cameraMode || reducedMotion) return;
    const sweepX = Math.sin(t * 0.16) * 0.9;
    const sweepY = Math.sin(t * 0.13 + 1.1) * 0.45;
    camera.position.set(
      idleCameraBase.x + sweepX,
      idleCameraBase.y + sweepY,
      idleCameraBase.z
    );
    camera.lookAt(0, 0, 0);
  };

  const animate = () => {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const t = now * 0.001;

    if (cameraMode && depthBuffer && depthBuffer.length === voxelCount) {
      updateLive(depthBuffer, dt);
    } else {
      updateIdle(t, dt);
      updateIdleCameraDrift(t);
    }

    controls.update();
    renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(animate);

  const setCameraActive = (active: boolean) => {
    cameraMode = active;
    controls.enableRotate = active;
    controls.enableZoom = active;
    controls.enablePan = false;
    controls.autoRotate = false;
    renderer.domElement.style.pointerEvents = active ? 'auto' : 'none';
    renderer.domElement.style.touchAction = active ? 'none' : 'auto';

    if (active) {
      extrusionBoost = LIVE_INITIAL_BOOST;
      voxels.smoothDepths.fill(0.5);
      // Don't snap currentScale/currentZPush — let them lerp naturally from idle.
      controls.minDistance = 14;
      controls.maxDistance = 90;
      controls.rotateSpeed = 0.7;
      controls.zoomSpeed = 0.95;
    } else {
      extrusionBoost = 1;
      depthBuffer = null;
      idleCameraBase.set(0, 0, cameraDistanceForAspect(camera.aspect));
      camera.position.copy(idleCameraBase);
      controls.target.set(0, 0, 0);
      controls.minDistance = 18;
      controls.maxDistance = 52;
      controls.rotateSpeed = 1;
      controls.zoomSpeed = 1;
    }

    applySize();
  };

  const bindDepthBuffer = (buffer: Float32Array | null) => {
    depthBuffer = buffer;
  };

  const dispose = () => {
    renderer.domElement.removeEventListener('wheel', onWheelExtrusion);
    ro.disconnect();
    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', applySize);
    }
    renderer.setAnimationLoop(null);
    controls.dispose();
    voxels.mesh.geometry.dispose();
    const mat = voxels.mesh.material;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else (mat as THREE.Material).dispose();
    renderer.dispose();
    if (renderer.domElement.parentElement === container) {
      container.removeChild(renderer.domElement);
    }
  };

  requestAnimationFrame(applySize);

  return { dispose, setCameraActive, bindDepthBuffer };
}

function createVoxelGrid(
  GRID_X: number,
  GRID_Z: number,
  count: number
): VoxelPack {
  // Voxels live in local XY (Z=0). scale.z grows the voxel toward +Z, which
  // maps directly to "toward the camera" since the camera looks down -Z.
  const geometry = new RoundedBoxGeometry(
    VOXEL_SIZE,
    VOXEL_SIZE,
    VOXEL_SIZE,
    VOXEL_SEGMENTS,
    VOXEL_RADIUS
  );
  // Pivot at the back face (z = 0) so scale.z extrudes only forward.
  geometry.translate(0, 0, VOXEL_SIZE * 0.5);

  const material = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    metalness: 0.32,
    roughness: 0.26,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    reflectivity: 0.56,
    emissive: new THREE.Color('#08161c'),
    emissiveIntensity: 0.2,
  });
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <output_fragment>',
      `
      // Subtle fresnel rim to separate silhouette layers in motion.
      float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0), 2.3);
      vec3 rim = vec3(0.20, 0.52, 0.60) * fres * 0.24;
      gl_FragColor = vec4( outgoingLight + rim, diffuseColor.a );
      `
    );
  };
  material.needsUpdate = true;

  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.name = 'heroVoxelInstancedGrid';
  mesh.frustumCulled = false;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const basePositions = new Float32Array(count * 3);
  const smoothDepths = new Float32Array(count).fill(0.5);
  const currentScaleY = new Float32Array(count).fill(IDLE_HEIGHT_BIAS);
  const currentZPush = new Float32Array(count);

  const offsetX = (GRID_X - 1) * VOXEL_SPACING * 0.5;
  const offsetY = (GRID_Z - 1) * VOXEL_SPACING * 0.5;
  const dummy = new THREE.Object3D();
  const initialColor = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const ix = i % GRID_X;
    const iz = Math.floor(i / GRID_X);
    // iz=0 → top of screen (high local Y); iz=GRID_Z-1 → bottom.
    // This matches the webcam's row-0-on-top convention so vertical orientation
    // is preserved end-to-end.
    const x = ix * VOXEL_SPACING - offsetX;
    const y = offsetY - iz * VOXEL_SPACING;
    const baseIdx = i * 3;
    basePositions[baseIdx] = x;
    basePositions[baseIdx + 1] = y;
    basePositions[baseIdx + 2] = 0;

    const sy = IDLE_HEIGHT_BIAS;
    dummy.position.set(x, y, 0);
    dummy.scale.set(1, 1, sy);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    idleColor(initialColor, 0.4);
    mesh.setColorAt(i, initialColor);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  const root = new THREE.Group();
  root.add(mesh);

  return {
    root,
    mesh,
    basePositions,
    smoothDepths,
    currentScaleY,
    currentZPush,
    count,
  };
}

function createLights(scene: THREE.Scene) {
  // Hemisphere — soft sky/ground fill rooted in brand palette
  scene.add(new THREE.HemisphereLight(0x49697e, 0x0c1016, 0.62));
  // Ambient — bottom-floor light so deep shadows don't crush
  scene.add(new THREE.AmbientLight(0x1c2834, 0.42));
  // Key — bright warm-white from upper-right, drives primary specular
  const key = new THREE.DirectionalLight(0xf4f9ff, 1.45);
  key.position.set(8, 26, 22);
  key.castShadow = true;
  key.shadow.mapSize.width = 1024;
  key.shadow.mapSize.height = 1024;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 120;
  key.shadow.camera.left = -22;
  key.shadow.camera.right = 22;
  key.shadow.camera.top = 18;
  key.shadow.camera.bottom = -18;
  key.shadow.bias = -0.0008;
  scene.add(key);
  // Fill — cool blue from upper-left, opens shadows without crushing contrast
  const fill = new THREE.DirectionalLight(0x83a8ce, 0.52);
  fill.position.set(-18, 12, 14);
  scene.add(fill);
  // Rim — teal-cyan from behind, etches voxel silhouettes against dark void
  const rim = new THREE.DirectionalLight(0x6be8ff, 0.92);
  rim.position.set(0, 8, -36);
  rim.castShadow = true;
  rim.shadow.mapSize.width = 512;
  rim.shadow.mapSize.height = 512;
  rim.shadow.camera.near = 0.5;
  rim.shadow.camera.far = 120;
  rim.shadow.camera.left = -22;
  rim.shadow.camera.right = 22;
  rim.shadow.camera.top = 18;
  rim.shadow.camera.bottom = -18;
  rim.shadow.bias = -0.0006;
  scene.add(rim);
  // Warm accent point — adds occasional sparkle to clearcoat reflections
  const warm = new THREE.PointLight(0xf8e4b8, 0.38, 220);
  warm.position.set(18, 14, 26);
  scene.add(warm);
}
