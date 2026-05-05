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
 *   - WebGLRenderer only (no WebGPU probe) for faster mount and a smaller module graph.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { gridDimensionsForTier, type HeroVoxelTier } from './heroVoxelConfig';

// ── Voxel geometry ─────────────────────────────────────────────────────────
const VOXEL_SIZE = 0.22;
const VOXEL_RADIUS = 0.05;
const VOXEL_SEGMENTS = 1;
const VOXEL_SPACING = 0.34;
const WALL_ROOT_SCALE = 0.92;

// ── Idle wave field ────────────────────────────────────────────────────────
const IDLE_HEIGHT = 1.4;
const IDLE_HEIGHT_BIAS = 0.34; // never fully flatten — keeps grid readable
const IDLE_Z_SWELL = 0.82;
const IDLE_LERP_BASE = 0.056;

// ── Live volumetric extrusion ──────────────────────────────────────────────
const LIVE_Y_RELIEF = 10.2; // peak voxel height (perceived "thickness" toward camera)
const LIVE_Y_BIAS = 0.28; // minimum height for "far" voxels — avoid invisible cells
const LIVE_Z_RELIEF = 6.2; // forward/backward parallax range
const LIVE_DEPTH_CONTRAST = 1.32; // pow exponent — bites mid-tones outward
const LIVE_DEPTH_SHAPE_LO = 0.18; // smoothstep low edge for shaped curve
const LIVE_DEPTH_SHAPE_HI = 0.82; // smoothstep high edge for shaped curve
const LIVE_DEPTH_SHAPE_MIX = 0.55; // mix(d1, d2, blend) — 0 = pure pow, 1 = pure smoothstep
const LIVE_LERP_BASE = 0.48;
const LIVE_INITIAL_BOOST = 1.4; // extrusion amplifier on activation

// ── Brand palette ──────────────────────────────────────────────────────────
const COLOR_SHADOW = new THREE.Color('#121a26');
const COLOR_TEAL_DEEP = new THREE.Color('#1f3f58');
const COLOR_TEAL_BRIGHT = new THREE.Color('#4dd2f3');
const COLOR_PAPER = new THREE.Color('#f2e9d7');

const IDLE_COLOR_LO = new THREE.Color('#0c1116');
const IDLE_COLOR_MID = new THREE.Color('#1a2b32');
const IDLE_COLOR_HI = new THREE.Color('#88a9ad');

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

function depthColor(out: THREE.Color, depth01: number, glowMix: number) {
  const t = THREE.MathUtils.clamp(depth01, 0, 1);
  if (t < 0.42) {
    out.copy(COLOR_SHADOW).lerp(COLOR_TEAL_DEEP, smoothstepScalar(0, 0.42, t));
  } else if (t < 0.78) {
    out
      .copy(COLOR_TEAL_DEEP)
      .lerp(COLOR_TEAL_BRIGHT, smoothstepScalar(0.42, 0.78, t));
  } else {
    out.copy(COLOR_TEAL_BRIGHT).lerp(COLOR_PAPER, smoothstepScalar(0.78, 1, t));
  }
  out.lerp(COLOR_PAPER, glowMix);
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
  opts?: { reducedMotion?: boolean }
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
  // Slightly farther than the pre–PR-42 tight framing so near extrusion + shift-boost
  // does not punch through the perspective near plane.
  const cameraDistanceForAspect = (aspect: number) => (aspect < 1 ? 26 : 20.8);
  camera.position.set(0, 0, cameraDistanceForAspect(cw / ch));
  camera.lookAt(0, 0, 0);

  // WebGL only: avoids WebGPU init latency on every load and keeps the hero
  // voxel path on the well-supported MeshPhysicalMaterial pipeline.
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, tier === 'medium' ? 1 : 1.25)
  );
  renderer.setSize(cw, ch);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
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
  controls.minDistance = 14;
  controls.maxDistance = 60;
  controls.maxPolarAngle = Math.PI * 0.62;
  controls.minPolarAngle = Math.PI * 0.32;
  controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
  controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
  controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;

  const onWheelExtrusion = (e: WheelEvent) => {
    if (!cameraMode || !e.shiftKey) return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.94 : 1.06;
    extrusionBoost = Math.max(0.4, Math.min(2.65, extrusionBoost * factor));
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
      const targetY = IDLE_HEIGHT_BIAS + wave * IDLE_HEIGHT;
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
    let dMin = 1;
    let dMax = 0;
    let dSum = 0;
    for (let i = 0; i < voxelCount; i++) {
      // Canonical "high = near" — orientation handled in inference layer.
      const raw = buf[i];
      voxels.smoothDepths[i] += (raw - voxels.smoothDepths[i]) * lerp;
      const d0 = THREE.MathUtils.clamp(voxels.smoothDepths[i], 0, 1);
      const d1 = Math.pow(d0, LIVE_DEPTH_CONTRAST);
      const d2 = smoothstepScalar(LIVE_DEPTH_SHAPE_LO, LIVE_DEPTH_SHAPE_HI, d1);
      const dFinal = THREE.MathUtils.clamp(
        d1 * (1 - LIVE_DEPTH_SHAPE_MIX) + d2 * LIVE_DEPTH_SHAPE_MIX,
        0,
        1
      );
      if (dFinal < dMin) dMin = dFinal;
      if (dFinal > dMax) dMax = dFinal;
      dSum += dFinal;

      const targetY = LIVE_Y_BIAS + dFinal * LIVE_Y_RELIEF * extrusionBoost;
      const targetZ = (dFinal - 0.5) * 2 * LIVE_Z_RELIEF * extrusionBoost;

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

      const centerBias = 1 - Math.abs((i % GRID_X) / Math.max(GRID_X - 1, 1) - 0.5) * 2;
      const glowMix = smoothstepScalar(0.55, 1, dFinal) * (0.08 + centerBias * 0.07);
      depthColor(tmpColor, dFinal, glowMix);
      voxels.mesh.setColorAt(i, tmpColor);
    }
    const dRange = dMax - dMin;
    const dAvg = dSum / Math.max(voxelCount, 1);
    const exposureTarget = THREE.MathUtils.clamp(
      1.16 + (0.45 - dAvg) * 0.36 + (0.32 - dRange) * 0.42,
      1.02,
      1.48
    );
    renderer.toneMappingExposure += (exposureTarget - renderer.toneMappingExposure) * 0.08;
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
    const cap = cameraMode ? 0.9 : tier === 'medium' ? 1 : 1.2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
  };

  let resizeRaf = 0;
  const ro = new ResizeObserver(() => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      applySize();
    });
  });
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
      controls.minDistance = 14;
      controls.maxDistance = 60;
      controls.rotateSpeed = 1;
      controls.zoomSpeed = 1;
    }

    applySize();
  };

  const bindDepthBuffer = (buffer: Float32Array | null) => {
    depthBuffer = buffer;
  };

  const dispose = () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
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
    metalness: 0.3,
    roughness: 0.34,
    clearcoat: 0.45,
    clearcoatRoughness: 0.3,
    reflectivity: 0.5,
    emissive: new THREE.Color('#08161c'),
    emissiveIntensity: 0.16,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.name = 'heroVoxelInstancedGrid';
  mesh.frustumCulled = false;
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
  scene.add(new THREE.HemisphereLight(0x3a4e60, 0x070b10, 0.64));
  // Ambient — bottom-floor light so deep shadows don't crush
  scene.add(new THREE.AmbientLight(0x18202a, 0.42));
  // Key — bright warm-white from upper-right, drives primary specular
  const key = new THREE.DirectionalLight(0xf0f4ff, 1.36);
  key.position.set(8, 26, 22);
  scene.add(key);
  // Fill — cool blue from upper-left, opens shadows without crushing contrast
  const fill = new THREE.DirectionalLight(0x7f9fc6, 0.54);
  fill.position.set(-18, 12, 14);
  scene.add(fill);
  // Rim — teal-cyan from behind, etches voxel silhouettes against dark void
  const rim = new THREE.DirectionalLight(0x5fd3e6, 0.78);
  rim.position.set(0, 8, -36);
  scene.add(rim);
  // Warm accent point — adds occasional sparkle to clearcoat reflections
  const warm = new THREE.PointLight(0xf7dfb0, 0.32, 220);
  warm.position.set(18, 14, 26);
  scene.add(warm);
}
