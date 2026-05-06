'use client';

/**
 * Homepage hero — single InstancedMesh voxel grid (~12K voxels @ tier 'full').
 *
 * Architecture:
 *   - One InstancedMesh + BoxGeometry + custom ShaderMaterial (single draw).
 *   - Per-instance `instanceDepth` + vertex shader pow() extrusion along local Z
 *     (DEPTH.ML-style GPU contrast), matching reference “scale along Z from depth”.
 *   - Idle: wave drives instanceDepth + matrix translation only.
 *   - Live: depth buffer drives instanceDepth; far field gated for clean subject cutout.
 *
 * Orientation/polarity is canonicalized in `heroVoxelDepthInference.ts`.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gridDimensionsForTier, type HeroVoxelTier } from './heroVoxelConfig';

// ── Voxel geometry ─────────────────────────────────────────────────────────
const VOXEL_SIZE = 0.17;
const VOXEL_SPACING = 0.27;
const WALL_ROOT_SCALE = 1.06;

/** Vertex extrusion: min/max local Z scale (pivot at back face). */
const EXTRUDE_Z_IDLE_MIN = 0.42;
const EXTRUDE_Z_IDLE_MAX = 2.05;
const EXTRUDE_Z_LIVE_MIN = 0.28;
const EXTRUDE_Z_LIVE_MAX = 14.2;

/** GPU depth contrast in vertex shader (reference-style pow). */
const VERTEX_DEPTH_POW_IDLE = 1.05;
const VERTEX_DEPTH_POW_LIVE = 2.18;

// ── Idle wave field ────────────────────────────────────────────────────────
const IDLE_HEIGHT = 1.4;
const IDLE_HEIGHT_BIAS = 0.34;
const IDLE_Z_SWELL = 0.82;
const IDLE_LERP_BASE = 0.056;

// ── Live depth shaping (CPU pre-pass before instanceDepth) ────────────────
const LIVE_DEPTH_CONTRAST = 1.34;
const LIVE_DEPTH_SHAPE_LO = 0.14;
const LIVE_DEPTH_SHAPE_HI = 0.86;
const LIVE_DEPTH_SHAPE_MIX = 0.55;
const LIVE_LERP_BASE = 0.56;
const LIVE_INITIAL_BOOST = 1.35;
/** Drop more of the far histogram so background does not print through (hand-in-front). */
const LIVE_FAR_REJECT_QUANTILE = 0.68;
const LIVE_SUBJECT_EDGE_SOFTNESS = 0.12;

const DEFAULT_TONE_MAPPING_EXPOSURE = 1.42;

// ── Background (navy gradient + subtle grid — not flat black) ─────────────
const BG_TOP = new THREE.Color('#1a4a9e');
const BG_BOTTOM = new THREE.Color('#0a1838');
const GRID_PLANE_Z = -72;
const GRID_SCALE = 220;

// ── Depth tint: bright subject vs readable blue field (no muddy blacks) ───
const TINT_FAR = new THREE.Color('#6cb0ff');
const TINT_MID = new THREE.Color('#b8e8ff');
const TINT_NEAR = new THREE.Color('#f2fdff');

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

const IDLE_COLOR_LO = new THREE.Color('#0c1116');
const IDLE_COLOR_MID = new THREE.Color('#1a2b32');
const IDLE_COLOR_HI = new THREE.Color('#88a9ad');

function idleColor(out: THREE.Color, mix01: number) {
  const m = THREE.MathUtils.clamp(mix01, 0, 1);
  if (m < 0.55) {
    out.copy(IDLE_COLOR_LO).lerp(IDLE_COLOR_MID, smoothstepScalar(0, 0.55, m));
  } else {
    out.copy(IDLE_COLOR_MID).lerp(IDLE_COLOR_HI, smoothstepScalar(0.55, 1, m));
  }
}

/** Live albedo tint from depth — light, high separation vs navy backdrop. */
function liveDepthTint(out: THREE.Color, depth01: number) {
  const t = THREE.MathUtils.clamp(depth01, 0, 1);
  if (t < 0.35) {
    out.copy(TINT_FAR).lerp(TINT_MID, smoothstepScalar(0.08, 0.35, t));
  } else if (t < 0.72) {
    out.copy(TINT_MID).lerp(TINT_NEAR, smoothstepScalar(0.35, 0.72, t));
  } else {
    out.copy(TINT_NEAR);
  }
}

type VoxelPack = {
  root: THREE.Group;
  mesh: THREE.InstancedMesh;
  basePositions: Float32Array;
  smoothDepths: Float32Array;
  currentZPush: Float32Array;
  workDepth: Float32Array;
  instanceDepth: THREE.InstancedBufferAttribute;
  voxelMaterial: THREE.ShaderMaterial;
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

const VOXEL_VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>

attribute mat4 instanceMatrix;
attribute vec3 instanceColor;
attribute float instanceDepth;

uniform float uDepthPow;
uniform float uZScaleMin;
uniform float uZScaleMax;

varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec3 vViewDir;
varying vec3 vColor;
varying float vDepthShaded;

void main() {
  vColor = instanceColor;

  float d = clamp(instanceDepth, 0.0, 1.0);
  vDepthShaded = pow(d, uDepthPow);
  float zScale = mix(uZScaleMin, uZScaleMax, vDepthShaded);

  vec3 transformed = vec3(position);
  transformed.z *= zScale;

  mat4 im = instanceMatrix;
  vec4 worldPos4 = modelMatrix * im * vec4(transformed, 1.0);
  vWorldPos = worldPos4.xyz;

  mat3 im3 = mat3(im);
  vec3 worldN = normalize(mat3(modelMatrix) * im3 * vec3(normal.x, normal.y, normal.z / max(zScale, 0.001)));
  vWorldNormal = worldN;

  vViewDir = normalize(cameraPosition - vWorldPos);

  vec4 mvPosition = viewMatrix * worldPos4;
  gl_Position = projectionMatrix * mvPosition;
#include <logdepthbuf_vertex>
}
`;

const VOXEL_FRAG = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_fragment>

uniform vec3 uLightDirA;
uniform vec3 uLightDirB;
uniform vec3 uLightDirC;
uniform vec3 uLightColorA;
uniform vec3 uLightColorB;
uniform vec3 uLightColorC;
uniform vec3 uAmbient;
uniform vec3 uEnvZenith;
uniform vec3 uEnvHorizon;
uniform vec3 uRimColor;
uniform float uWrap;
uniform float uShininess;
uniform float uClearcoat;
uniform float uFresnelPow;

varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec3 vViewDir;
varying vec3 vColor;
varying float vDepthShaded;

void main() {
  vec3 N = normalize(vWorldNormal);
  vec3 V = normalize(vViewDir);

  float wrap = uWrap;
  float diffA = max(0.0, (dot(N, uLightDirA) + wrap) / (1.0 + wrap));
  float diffB = max(0.0, (dot(N, uLightDirB) + wrap) / (1.0 + wrap));
  float diffC = max(0.0, (dot(N, uLightDirC) + wrap) / (1.0 + wrap));
  float hemi = N.y * 0.5 + 0.5;
  float fillCam = dot(N, V) * 0.5 + 0.5;
  float diffuse = diffA * 0.28 + diffB * 0.22 + diffC * 0.18 + fillCam * 0.14 + hemi * 0.12 + 0.14;

  vec3 Lm = normalize(uLightDirA + uLightDirB);
  vec3 H = normalize(Lm + V);
  float spec = pow(max(dot(N, H), 0.0), uShininess);
  float cc = pow(max(dot(N, H), 0.0), uShininess * 1.35) * uClearcoat;

  float fresnel = pow(clamp(1.0 - max(dot(N, V), 0.0), 0.0, 1.0), uFresnelPow);
  vec3 env = mix(uEnvHorizon, uEnvZenith, clamp(N.y * 0.5 + 0.5, 0.0, 1.0));
  vec3 R = reflect(-V, N);
  float envMix = fresnel * 0.55 + vDepthShaded * 0.12;
  vec3 envSpec = mix(env, uRimColor, fresnel * 0.4);

  vec3 base = vColor;
  vec3 lit = base * diffuse * (uLightColorA * diffA * 0.35 + uLightColorB * diffB * 0.25 + uLightColorC * 0.2 + uAmbient);
  lit += uLightColorA * spec * 0.45;
  lit += vec3(1.0) * cc * 0.35;
  lit += envSpec * envMix * 0.42;
  lit += uRimColor * fresnel * 0.95;

  gl_FragColor = vec4(lit, 1.0);
#include <logdepthbuf_fragment>
}
`;

const GRID_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const GRID_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uLine;
uniform float uGrid;
varying vec2 vUv;

void main() {
  vec2 g = abs(fract(vUv * uGrid) - 0.5) / fwidth(vUv * uGrid);
  float line = 1.0 - min(min(g.x, g.y), 1.0);
  line = pow(line, 0.65);
  vec3 col = mix(uColor, uLine, line * 0.22);
  gl_FragColor = vec4(col, 1.0);
}
`;

function createVoxelShaderMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uDepthPow: { value: VERTEX_DEPTH_POW_IDLE },
      uZScaleMin: { value: EXTRUDE_Z_IDLE_MIN },
      uZScaleMax: { value: EXTRUDE_Z_IDLE_MAX },
      uLightDirA: { value: new THREE.Vector3(0.45, 0.75, 0.48).normalize() },
      uLightDirB: { value: new THREE.Vector3(-0.62, 0.35, 0.42).normalize() },
      uLightDirC: { value: new THREE.Vector3(0.1, -0.2, 0.98).normalize() },
      uLightColorA: { value: new THREE.Color('#ffffff') },
      uLightColorB: { value: new THREE.Color('#bfe8ff') },
      uLightColorC: { value: new THREE.Color('#7ad0ff') },
      uAmbient: { value: new THREE.Color('#b8d9ff').multiplyScalar(0.38) },
      uEnvZenith: { value: new THREE.Color('#6eb6ff') },
      uEnvHorizon: { value: new THREE.Color('#1c3566') },
      uRimColor: { value: new THREE.Color('#e8fbff') },
      uWrap: { value: 0.42 },
      uShininess: { value: 96.0 },
      uClearcoat: { value: 0.85 },
      uFresnelPow: { value: 3.2 },
    },
    vertexShader: VOXEL_VERT,
    fragmentShader: VOXEL_FRAG,
  });
}

function createBackdropGrid(): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(GRID_SCALE, GRID_SCALE, 1, 1);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: BG_BOTTOM.clone().lerp(BG_TOP, 0.35) },
      uLine: { value: new THREE.Color('#9ec8ff') },
      uGrid: { value: 56.0 },
    },
    vertexShader: GRID_VERT,
    fragmentShader: GRID_FRAG,
    depthWrite: true,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, 0, GRID_PLANE_Z);
  mesh.renderOrder = -50;
  return mesh;
}

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
  const backdrop = createBackdropGrid();
  scene.add(backdrop);

  const measure = () => {
    const r = container.getBoundingClientRect();
    const w = Math.max(1, Math.floor(r.width || window.innerWidth));
    const h = Math.max(1, Math.floor(r.height || window.innerHeight));
    return { w, h };
  };

  let { w: cw, h: ch } = measure();

  const camera = new THREE.PerspectiveCamera(52, cw / ch, 0.1, 500);
  /** Pulled back vs prior builds — whole sculpture reads on first frame. */
  const cameraDistanceForAspect = (aspect: number) => (aspect < 1 ? 34 : 28);
  camera.position.set(0, 0, cameraDistanceForAspect(cw / ch));
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, tier === 'medium' ? 1 : 1.25)
  );
  renderer.setSize(cw, ch);
  renderer.setClearColor(BG_BOTTOM.clone().lerp(BG_TOP, 0.25), 1);
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
  controls.minDistance = 20;
  controls.maxDistance = 72;
  controls.maxPolarAngle = Math.PI * 0.62;
  controls.minPolarAngle = Math.PI * 0.32;
  controls.minAzimuthAngle = -Infinity;
  controls.maxAzimuthAngle = Infinity;
  controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
  controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
  controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;

  const onWheelExtrusion = (e: WheelEvent) => {
    if (!cameraMode || !e.shiftKey) return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.94 : 1.06;
    extrusionBoost = Math.max(0.45, Math.min(2.4, extrusionBoost * factor));
  };
  renderer.domElement.addEventListener('wheel', onWheelExtrusion, {
    passive: false,
  });

  const voxels = createVoxelGrid(GRID_X, GRID_Z, voxelCount);
  voxels.root.scale.setScalar(WALL_ROOT_SCALE);
  scene.add(voxels.root);
  const liveLightRig = createLights(scene);

  const dummy = new THREE.Object3D();
  const lightDirScratch = new THREE.Vector3();
  let lastTime = performance.now();
  const idleCameraBase = camera.position.clone();

  const frameLerp = (base: number, dt: number, floor: number) =>
    Math.min(1, base * (dt / (1 / 60)) + floor);

  function setLiveShaderMode(live: boolean) {
    const m = voxels.voxelMaterial;
    m.uniforms.uDepthPow.value = live ? VERTEX_DEPTH_POW_LIVE : VERTEX_DEPTH_POW_IDLE;
    m.uniforms.uZScaleMin.value = live ? EXTRUDE_Z_LIVE_MIN : EXTRUDE_Z_IDLE_MIN;
    const zMax = (live ? EXTRUDE_Z_LIVE_MAX : EXTRUDE_Z_IDLE_MAX) * (live ? extrusionBoost : 1);
    m.uniforms.uZScaleMax.value = zMax;
  }

  function updateIdle(t: number, dt: number) {
    setLiveShaderMode(false);
    const lerp = frameLerp(IDLE_LERP_BASE, dt, 0.02);
    for (let i = 0; i < voxelCount; i++) {
      const ix = i % GRID_X;
      const iz = Math.floor(i / GRID_X);
      const nx = ix / Math.max(GRID_X - 1, 1);
      const nz = iz / Math.max(GRID_Z - 1, 1);
      const wave = idleWaveMix(nx, nz, t);
      const targetZ = idleZWave(nx, nz, t) * IDLE_Z_SWELL;

      const depth01 = THREE.MathUtils.clamp(
        IDLE_HEIGHT_BIAS / 2.2 + wave * (IDLE_HEIGHT / 2.2),
        0,
        1
      );
      voxels.instanceDepth.array[i] += (depth01 - voxels.instanceDepth.array[i]) * lerp;

      voxels.currentZPush[i] += (targetZ - voxels.currentZPush[i]) * lerp;

      const baseIdx = i * 3;
      const x = voxels.basePositions[baseIdx];
      const y = voxels.basePositions[baseIdx + 1];
      const z = voxels.currentZPush[i];

      dummy.position.set(x, y, z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      voxels.mesh.setMatrixAt(i, dummy.matrix);

      idleColor(tmpColor, wave);
      voxels.mesh.setColorAt(i, tmpColor);
    }
    voxels.instanceDepth.needsUpdate = true;
    voxels.mesh.instanceMatrix.needsUpdate = true;
    if (voxels.mesh.instanceColor) voxels.mesh.instanceColor.needsUpdate = true;
  }

  function updateLive(buf: Float32Array, dt: number, t: number) {
    setLiveShaderMode(true);
    const lerp = frameLerp(LIVE_LERP_BASE, dt, 0.08);
    let dMin = 1;
    let dMax = 0;
    let dSum = 0;
    const histogram = new Uint16Array(32);
    for (let i = 0; i < voxelCount; i++) {
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
      voxels.workDepth[i] = dFinal;
      if (dFinal < dMin) dMin = dFinal;
      if (dFinal > dMax) dMax = dFinal;
      dSum += dFinal;
      const bin = Math.min(31, Math.max(0, Math.floor(dFinal * 31)));
      histogram[bin] += 1;
    }
    const rejectCount = Math.floor(voxelCount * LIVE_FAR_REJECT_QUANTILE);
    let acc = 0;
    let thresholdBin = 0;
    for (let i = 0; i < histogram.length; i++) {
      acc += histogram[i];
      if (acc >= rejectCount) {
        thresholdBin = i;
        break;
      }
    }
    const farCut = thresholdBin / 31;
    for (let i = 0; i < voxelCount; i++) {
      const dFinal = voxels.workDepth[i];
      const subjectMask = smoothstepScalar(
        farCut,
        Math.min(1, farCut + LIVE_SUBJECT_EDGE_SOFTNESS),
        dFinal
      );
      const dMasked = dFinal * subjectMask;
      const nearBoost = smoothstepScalar(0.5, 1, dFinal);
      const dShaped = THREE.MathUtils.clamp(dMasked * (1 + nearBoost * 0.38), 0, 1);

      voxels.instanceDepth.array[i] += (dShaped - voxels.instanceDepth.array[i]) * lerp;

      const targetZ = (dShaped - 0.5) * 2 * 3.8 * extrusionBoost;
      voxels.currentZPush[i] += (targetZ - voxels.currentZPush[i]) * lerp;

      const baseIdx = i * 3;
      const x = voxels.basePositions[baseIdx];
      const y = voxels.basePositions[baseIdx + 1];
      const z = voxels.currentZPush[i];

      dummy.position.set(x, y, z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      voxels.mesh.setMatrixAt(i, dummy.matrix);

      liveDepthTint(tmpColor, dShaped);
      voxels.mesh.setColorAt(i, tmpColor);
    }
    voxels.instanceDepth.needsUpdate = true;
    voxels.mesh.instanceMatrix.needsUpdate = true;
    if (voxels.mesh.instanceColor) voxels.mesh.instanceColor.needsUpdate = true;

    const dRange = dMax - dMin;
    const dAvg = dSum / Math.max(voxelCount, 1);
    updateLiveLights(liveLightRig, dAvg, dRange, t);
    const exposureTarget = THREE.MathUtils.clamp(
      1.38 + (0.48 - dAvg) * 0.14 + (0.22 - dRange) * 0.16,
      1.28,
      1.62
    );
    renderer.toneMappingExposure += (exposureTarget - renderer.toneMappingExposure) * 0.06;
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

    const u = voxels.voxelMaterial.uniforms;
    liveLightRig.key.getWorldDirection(lightDirScratch);
    u.uLightDirA.value.copy(lightDirScratch).negate().normalize();
    liveLightRig.fill.getWorldDirection(lightDirScratch);
    u.uLightDirB.value.copy(lightDirScratch).negate().normalize();
    liveLightRig.rim.getWorldDirection(lightDirScratch);
    u.uLightDirC.value.copy(lightDirScratch).negate().normalize();

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
      voxels.instanceDepth.array.fill(0.35);
      controls.minDistance = 22;
      controls.maxDistance = 110;
      controls.rotateSpeed = 0.7;
      controls.zoomSpeed = 0.95;
    } else {
      extrusionBoost = 1;
      depthBuffer = null;
      renderer.toneMappingExposure = DEFAULT_TONE_MAPPING_EXPOSURE;
      idleCameraBase.set(0, 0, cameraDistanceForAspect(camera.aspect));
      camera.position.copy(idleCameraBase);
      controls.target.set(0, 0, 0);
      controls.minDistance = 20;
      controls.maxDistance = 72;
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
    backdrop.geometry.dispose();
    (backdrop.material as THREE.Material).dispose();
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
  const geometry = new THREE.BoxGeometry(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE);
  geometry.translate(0, 0, VOXEL_SIZE * 0.5);

  const voxelMaterial = createVoxelShaderMaterial();
  const mesh = new THREE.InstancedMesh(geometry, voxelMaterial, count);
  mesh.name = 'heroVoxelInstancedGrid';
  mesh.frustumCulled = false;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const instanceDepth = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
  instanceDepth.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('instanceDepth', instanceDepth);

  const basePositions = new Float32Array(count * 3);
  const smoothDepths = new Float32Array(count).fill(0.5);
  const currentZPush = new Float32Array(count);
  const workDepth = new Float32Array(count);

  const offsetX = (GRID_X - 1) * VOXEL_SPACING * 0.5;
  const offsetY = (GRID_Z - 1) * VOXEL_SPACING * 0.5;
  const dummy = new THREE.Object3D();
  const initialColor = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const ix = i % GRID_X;
    const iz = Math.floor(i / GRID_X);
    const x = ix * VOXEL_SPACING - offsetX;
    const y = offsetY - iz * VOXEL_SPACING;
    const baseIdx = i * 3;
    basePositions[baseIdx] = x;
    basePositions[baseIdx + 1] = y;
    basePositions[baseIdx + 2] = 0;

    instanceDepth.array[i] = IDLE_HEIGHT_BIAS / 2.2 + 0.4 * 0.45;

    dummy.position.set(x, y, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    idleColor(initialColor, 0.4);
    mesh.setColorAt(i, initialColor);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  instanceDepth.needsUpdate = true;

  const root = new THREE.Group();
  root.add(mesh);

  return {
    root,
    mesh,
    basePositions,
    smoothDepths,
    currentZPush,
    workDepth,
    instanceDepth,
    voxelMaterial,
    count,
  };
}

/** Scene lights: very soft fill; shading is mostly in voxel shader — no harsh shadows. */
function createLights(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0xa8d4ff, 0x1a3058, 0.85));
  scene.add(new THREE.AmbientLight(0xc4e2ff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.55);
  key.position.set(8, 26, 22);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd5f0ff, 0.42);
  fill.position.set(-18, 11, 11);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xe8fbff, 0.48);
  rim.position.set(0, 8, -36);
  scene.add(rim);
  const subjectGlow = new THREE.PointLight(0xffffff, 0.35, 220);
  subjectGlow.position.set(0, 2, 20);
  scene.add(subjectGlow);
  return { key, fill, rim, subjectGlow };
}

function updateLiveLights(rig: LiveLightRig, dAvg: number, dRange: number, t: number) {
  const nearEnergy = smoothstepScalar(0.4, 0.78, dAvg);
  const detailEnergy = smoothstepScalar(0.12, 0.42, dRange);
  rig.key.intensity = 0.48 + nearEnergy * 0.22;
  rig.fill.intensity = 0.38 + detailEnergy * 0.28;
  rig.rim.intensity = 0.42 + nearEnergy * 0.28;
  rig.subjectGlow.intensity = 0.28 + nearEnergy * 0.35 + detailEnergy * 0.15;
  rig.subjectGlow.position.set(
    Math.sin(t * 0.72) * 5.5,
    3.2 + Math.sin(t * 0.51 + 1.2) * 1.4,
    20 + nearEnergy * 5.5
  );
}
