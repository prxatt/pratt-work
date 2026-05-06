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
const VOXEL_SIZE = 0.19;
const VOXEL_RADIUS = 0.05;
const VOXEL_SEGMENTS = 1;
const VOXEL_SPACING = 0.27;
const WALL_ROOT_SCALE = 1.06;

// ── Idle wave field ────────────────────────────────────────────────────────
const IDLE_HEIGHT = 1.4;
const IDLE_HEIGHT_BIAS = 0.34; // never fully flatten — keeps grid readable
const IDLE_Z_SWELL = 0.82;
const IDLE_LERP_BASE = 0.056;

// ── Live volumetric extrusion ──────────────────────────────────────────────
const LIVE_Y_RELIEF = 12.2; // peak voxel height (perceived "thickness" toward camera)
const LIVE_Y_BIAS = 0.32; // minimum height for "far" voxels — keeps subject readable
const LIVE_Z_RELIEF = 8.2; // stronger forward parallax range
const LIVE_DEPTH_CONTRAST = 1.34; // slightly stronger local separation (detail)
const LIVE_DEPTH_SHAPE_LO = 0.14; // widen mid-band so fine depth reads on subject
const LIVE_DEPTH_SHAPE_HI = 0.86; // smoothstep high edge for shaped curve
const LIVE_DEPTH_SHAPE_MIX = 0.55; // mix(d1, d2, blend) — 0 = pure pow, 1 = pure smoothstep
const LIVE_LERP_BASE = 0.56;
const LIVE_INITIAL_BOOST = 1.4; // extrusion amplifier on activation

/** Baseline exposure for idle; live mode adjusts dynamically and must reset on exit. */
const DEFAULT_TONE_MAPPING_EXPOSURE = 1.58;

// ── Cinematic magical-realism palette ─────────────────────────────────────
const COLOR_FAR_SHADOW = new THREE.Color('#090b14');
const COLOR_FAR_INDIGO = new THREE.Color('#1d2d68');
const COLOR_MID_VIOLET = new THREE.Color('#6942a9');
const COLOR_NEAR_CYAN = new THREE.Color('#59dcff');
const COLOR_NEAR_GOLD = new THREE.Color('#ffd8a0');
const COLOR_SPEC = new THREE.Color('#fff3dc');

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
  if (t < 0.28) {
    out.copy(COLOR_FAR_SHADOW).lerp(COLOR_FAR_INDIGO, smoothstepScalar(0, 0.28, t));
  } else if (t < 0.6) {
    out
      .copy(COLOR_FAR_INDIGO)
      .lerp(COLOR_MID_VIOLET, smoothstepScalar(0.28, 0.6, t));
  } else if (t < 0.86) {
    out
      .copy(COLOR_MID_VIOLET)
      .lerp(COLOR_NEAR_CYAN, smoothstepScalar(0.6, 0.86, t));
  } else {
    out.copy(COLOR_NEAR_CYAN).lerp(COLOR_NEAR_GOLD, smoothstepScalar(0.86, 1, t));
  }
  out.lerp(COLOR_SPEC, glowMix);
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

type LiveLightRig = {
  key: THREE.DirectionalLight;
  fill: THREE.DirectionalLight;
  rim: THREE.DirectionalLight;
  subjectGlow: THREE.PointLight;
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
  renderer.toneMappingExposure = DEFAULT_TONE_MAPPING_EXPOSURE;
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
  controls.minAzimuthAngle = -Math.PI * 0.38;
  controls.maxAzimuthAngle = Math.PI * 0.38;
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
  const liveLightRig = createLights(scene);

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

  function updateLive(buf: Float32Array, dt: number, t: number) {
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

      const nearBoost = smoothstepScalar(0.52, 1, dFinal);
      const dShaped = THREE.MathUtils.clamp(dFinal * (1 + nearBoost * 0.32), 0, 1);
      const targetY = LIVE_Y_BIAS + dShaped * LIVE_Y_RELIEF * extrusionBoost;
      const targetZ = (dShaped * 1.15 - 0.2) * LIVE_Z_RELIEF * extrusionBoost;

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
      const glowMix = smoothstepScalar(0.5, 1, dShaped) * (0.1 + centerBias * 0.08);
      depthColor(tmpColor, dShaped, glowMix);
      voxels.mesh.setColorAt(i, tmpColor);
    }
    const dRange = dMax - dMin;
    const dAvg = dSum / Math.max(voxelCount, 1);
    updateLiveLights(liveLightRig, dAvg, dRange, t);
    const exposureTarget = THREE.MathUtils.clamp(
      1.46 + (0.48 - dAvg) * 0.18 + (0.24 - dRange) * 0.2,
      1.38,
      1.78
    );
    renderer.toneMappingExposure += (exposureTarget - renderer.toneMappingExposure) * 0.06;
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
    const cap = cameraMode ? (tier === 'medium' ? 0.85 : 0.9) : tier === 'medium' ? 1 : 1.2;
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
      updateLive(depthBuffer, dt, t);
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
      renderer.toneMappingExposure = DEFAULT_TONE_MAPPING_EXPOSURE;
      voxels.smoothDepths.fill(0.5);
      // Don't snap currentScale/currentZPush — let them lerp naturally from idle.
      controls.minDistance = 14;
      controls.maxDistance = 90;
      controls.minAzimuthAngle = -Math.PI * 0.38;
      controls.maxAzimuthAngle = Math.PI * 0.38;
      controls.rotateSpeed = 0.7;
      controls.zoomSpeed = 0.95;
    } else {
      extrusionBoost = 1;
      depthBuffer = null;
      renderer.toneMappingExposure = DEFAULT_TONE_MAPPING_EXPOSURE;
      idleCameraBase.set(0, 0, cameraDistanceForAspect(camera.aspect));
      camera.position.copy(idleCameraBase);
      controls.target.set(0, 0, 0);
      controls.minDistance = 14;
      controls.maxDistance = 60;
      controls.minAzimuthAngle = -Infinity;
      controls.maxAzimuthAngle = Infinity;
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
    emissive: new THREE.Color('#123547'),
    emissiveIntensity: 0.38,
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
  // Darker base keeps background legible while near voxels remain luminous.
  scene.add(new THREE.HemisphereLight(0x344168, 0x05070d, 0.56));
  scene.add(new THREE.AmbientLight(0x101522, 0.34));
  const key = new THREE.DirectionalLight(0xc8d4ff, 1.22);
  key.position.set(8, 26, 22);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x7a56cc, 0.68);
  fill.position.set(-18, 10, 12);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x57d8ff, 1.02);
  rim.position.set(0, 8, -36);
  scene.add(rim);
  const subjectGlow = new THREE.PointLight(0xffc78f, 0.42, 180);
  subjectGlow.position.set(0, 2, 20);
  scene.add(subjectGlow);
  return { key, fill, rim, subjectGlow };
}

function updateLiveLights(rig: LiveLightRig, dAvg: number, dRange: number, t: number) {
  const nearEnergy = smoothstepScalar(0.4, 0.78, dAvg);
  const detailEnergy = smoothstepScalar(0.12, 0.42, dRange);
  rig.key.intensity = 1.14 + nearEnergy * 0.44;
  rig.fill.intensity = 0.56 + detailEnergy * 0.42;
  rig.rim.intensity = 0.84 + nearEnergy * 0.58;
  rig.subjectGlow.intensity = 0.28 + nearEnergy * 0.6 + detailEnergy * 0.22;
  rig.subjectGlow.position.set(
    Math.sin(t * 0.72) * 5.5,
    3.2 + Math.sin(t * 0.51 + 1.2) * 1.4,
    20 + nearEnergy * 5.5
  );
}
