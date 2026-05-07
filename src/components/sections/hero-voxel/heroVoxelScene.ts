'use client';

/**
 * Homepage hero — InstancedMesh voxel grid (~12K @ tier 'full').
 *
 * Idle: RoundedBoxGeometry + MeshPhysicalMaterial, wave-driven scale.z extrusion,
 *       transparent canvas (alpha), no grid backdrop.
 *
 * Live: BoxGeometry + ShaderMaterial (single draw call). Per-instance `instanceDepth`
 *       drives GPU pow() contrast and Z extrusion in the vertex shader — no matrix
 *       scale.z extrusion (avoids double extrusion). Directional light axes use
 *       normalize(light.position - light.target.position) for correct N·L.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { gridDimensionsForTier, type HeroVoxelTier } from './heroVoxelConfig';

// ── Voxel geometry ─────────────────────────────────────────────────────────
const VOXEL_SIZE = 0.18;
const VOXEL_RADIUS = 0.015;
const VOXEL_SEGMENTS = 1;
const VOXEL_SPACING = 0.27;
const WALL_ROOT_SCALE = 1.06;

// ── Idle wave field ────────────────────────────────────────────────────────
const IDLE_HEIGHT = 1.4;
const IDLE_HEIGHT_BIAS = 0.34;
const IDLE_Z_SWELL = 0.82;
const IDLE_LERP_BASE = 0.056;

// ── Live depth → instanceDepth (CPU shaping / masking only; GPU applies pow) ─
const LIVE_DEPTH_CONTRAST = 1.3;
const LIVE_DEPTH_SHAPE_LO = 0.06;
const LIVE_DEPTH_SHAPE_HI = 0.94;
const LIVE_DEPTH_SHAPE_MIX = 0.42;
const LIVE_EXTRUSION_NEAR = 5.0;
// Slow lerp keeps voxels stable between inference frames (runs ~11 Hz, render ~60 Hz).
const LIVE_LERP_BASE = 0.14;
const LIVE_INITIAL_BOOST = 1.1;
// Histogram cut: drop the farthest ~half of samples so flat walls stay recessed.
const LIVE_FAR_REJECT_QUANTILE = 0.68;
const LIVE_SUBJECT_EDGE_SOFTNESS = 0.2;
// Center-priority gating suppresses side/background planes while preserving
// subject detail in the central capture region.
const LIVE_CENTER_GATE_RADIAL_X_FACTOR = 1.25;
const LIVE_CENTER_GATE_EDGE_INNER = 0.5;
const LIVE_CENTER_GATE_EDGE_OUTER = 0.96;
const LIVE_CENTER_MASK_MIN = 0.34;
const LIVE_CENTER_MASK_EXP = 1.35;
// Near-boost gently lifts the nearest portion of the subject so depth remains
// readable without amplifying far noise.
const LIVE_NEAR_BOOST_EDGE = 0.62;
const LIVE_NEAR_BOOST_AMOUNT = 0.24;
// Occupancy hysteresis: stabilizes edge voxels and prevents dance/flicker.
const LIVE_OCCUPANCY_ON = 0.24;
const LIVE_OCCUPANCY_OFF = 0.17;
const LIVE_BG_COLLAPSE_SCALE = 0.002;

/** Z parallax added on top of shader extrusion — keep modest so the sculpture
 *  doesn't explode when orbiting. */
const LIVE_Z_RELIEF = 3.8;

/** Baseline exposure for idle; live mode adjusts dynamically and resets on exit. */
const DEFAULT_TONE_MAPPING_EXPOSURE = 1.58;

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

type VoxelPack = {
  root: THREE.Group;
  mesh: THREE.InstancedMesh;
  idleGeometry: THREE.BufferGeometry;
  liveGeometry: THREE.BufferGeometry;
  idleMaterial: THREE.MeshPhysicalMaterial;
  liveMaterial: THREE.ShaderMaterial;
  instanceDepth: THREE.InstancedBufferAttribute;
  basePositions: Float32Array;
  smoothDepths: Float32Array;
  currentScaleY: Float32Array;
  currentZPush: Float32Array;
  workDepth: Float32Array;
  centerWeights: Float32Array;
  voxelActive: Uint8Array;
  count: number;
};

type LiveLightRig = {
  key: THREE.DirectionalLight;
  fill: THREE.DirectionalLight;
  rim: THREE.DirectionalLight;
  subjectGlow: THREE.PointLight;
};

type LiveUniforms = Record<string, THREE.IUniform>;

export type HeroVoxelSceneApi = {
  dispose: () => void;
  setCameraActive: (active: boolean) => void;
  bindDepthBuffer: (buffer: Float32Array | null) => void;
};

const LIVE_VERTEX_SHADER = /* glsl */ `
attribute float instanceDepth;

uniform float uDepthPow;
uniform float uExtrusionFar;
uniform float uExtrusionNear;
uniform float uPinch;

varying vec3 vNormalWorld;
varying vec3 vWorldPos;
varying vec3 vViewDirWorld;
varying float vDepthShaded;

void main() {
  float d = clamp( instanceDepth, 0.0, 1.0 );
  float ds = pow( d, uDepthPow );
  vDepthShaded = ds;

  float zStretch = mix( uExtrusionFar, uExtrusionNear, ds );
  float pinch = mix( 1.0, uPinch, ds );

  vec3 pos = vec3( position.x * pinch, position.y * pinch, position.z * zStretch );

  vec3 norm = vec3(
    normal.x / max( pinch, 1e-4 ),
    normal.y / max( pinch, 1e-4 ),
    normal.z / max( zStretch, 1e-4 )
  );
  norm = normalize( norm );

#ifdef USE_INSTANCING
  mat3 im = mat3( instanceMatrix );
  vec3 nInst = normalize( im * norm );
  vec3 worldNormal = normalize( mat3( modelMatrix ) * nInst );
  vec4 worldPos4 = modelMatrix * instanceMatrix * vec4( pos, 1.0 );
#else
  vec3 worldNormal = normalize( mat3( modelMatrix ) * norm );
  vec4 worldPos4 = modelMatrix * vec4( pos, 1.0 );
#endif

  vNormalWorld = worldNormal;
  vWorldPos = worldPos4.xyz;
  vViewDirWorld = normalize( cameraPosition - vWorldPos );

  vec4 mvPosition = viewMatrix * worldPos4;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const LIVE_FRAGMENT_SHADER = /* glsl */ `
uniform vec3 uAmbient;
uniform vec3 uLightDirA;
uniform vec3 uLightDirB;
uniform vec3 uLightDirC;
uniform vec3 uLightColorA;
uniform vec3 uLightColorB;
uniform vec3 uLightColorC;
uniform float uLightIntensityA;
uniform float uLightIntensityB;
uniform float uLightIntensityC;
uniform float uWrap;
uniform float uSpecStrength;
uniform float uShininess;
uniform float uClearcoat;
uniform float uClearcoatRough;
uniform float uEnvReflectivity;
uniform float uDepthEnvBoost;
uniform vec3 uPointPos;
uniform vec3 uPointColor;
uniform float uPointIntensity;

varying vec3 vNormalWorld;
varying vec3 vWorldPos;
varying vec3 vViewDirWorld;
varying float vDepthShaded;

float schlickFresnel( float cosTheta, float F0 ) {
  return F0 + ( 1.0 - F0 ) * pow( 1.0 - cosTheta, 5.0 );
}

vec3 depthHueRamp( float t ) {
  // Cinematic multi-stop ramp:
  // deep indigo → cobalt → cyan → mint → warm peach highlight
  vec3 c0 = vec3( 0.10, 0.16, 0.36 );
  vec3 c1 = vec3( 0.16, 0.40, 0.78 );
  vec3 c2 = vec3( 0.30, 0.82, 0.96 );
  vec3 c3 = vec3( 0.62, 0.98, 0.84 );
  vec3 c4 = vec3( 1.00, 0.86, 0.66 );
  if ( t < 0.28 ) return mix( c0, c1, smoothstep( 0.0, 0.28, t ) );
  if ( t < 0.58 ) return mix( c1, c2, smoothstep( 0.28, 0.58, t ) );
  if ( t < 0.85 ) return mix( c2, c3, smoothstep( 0.58, 0.85, t ) );
  return mix( c3, c4, smoothstep( 0.85, 1.0, t ) );
}

void main() {
  vec3 N = normalize( vNormalWorld );
  vec3 V = normalize( vViewDirWorld );

  float depthGlow = pow( max( vDepthShaded, 0.0 ), 0.52 );
  // Multi-stop hue ramp avoids the blue→white-only feel.
  vec3 baseAlbedo = depthHueRamp( depthGlow );

  // Lifted ambient floor so deep face features (eye sockets, etc.) read as
  // shaded form rather than crushed black.
  vec3 ambientLo = vec3( 0.34, 0.40, 0.52 );
  vec3 ambientHi = vec3( 0.68, 0.78, 0.92 );
  vec3 litAmbient = uAmbient * mix( ambientLo, ambientHi, depthGlow );

  vec3 diffSum = vec3( 0.0 );
  vec3 specSum = vec3( 0.0 );

  vec3 Ls[3];
  vec3 Cs[3];
  float Is[3];
  Ls[0] = uLightDirA; Cs[0] = uLightColorA; Is[0] = uLightIntensityA;
  Ls[1] = uLightDirB; Cs[1] = uLightColorB; Is[1] = uLightIntensityB;
  Ls[2] = uLightDirC; Cs[2] = uLightColorC; Is[2] = uLightIntensityC;

  for ( int i = 0; i < 3; i ++ ) {
    vec3 L = normalize( Ls[i] );
    float nl = dot( N, L );
    float wrapDiff = max( ( nl + uWrap ) / ( 1.0 + uWrap ), 0.0 );
    vec3 H = normalize( L + V );
    float nh = max( dot( N, H ), 0.0 );
    float spec = pow( nh, uShininess );
    vec3 contrib = Cs[i] * Is[i];
    diffSum += contrib * wrapDiff;
    specSum += contrib * spec * uSpecStrength;
  }

  vec3 Pl = uPointPos - vWorldPos;
  float pDist = length( Pl );
  vec3 Lp = Pl / max( pDist, 1e-4 );
  float att = 1.0 / ( 1.0 + 0.06 * pDist + 0.02 * pDist * pDist );
  float nlp = max( ( dot( N, Lp ) + uWrap ) / ( 1.0 + uWrap ), 0.0 );
  vec3 Hp = normalize( Lp + V );
  float specp = pow( max( dot( N, Hp ), 0.0 ), uShininess );
  vec3 pointContrib = uPointColor * uPointIntensity * att;
  diffSum += pointContrib * nlp;
  specSum += pointContrib * specp * uSpecStrength * 0.85;

  vec3 R = reflect( -V, N );
  float sky = clamp( R.y * 0.5 + 0.5, 0.0, 1.0 );
  vec3 env = mix( vec3( 0.015, 0.03, 0.08 ), vec3( 0.38, 0.72, 1.0 ), sky );
  env *= uEnvReflectivity * ( 0.28 + vDepthShaded * uDepthEnvBoost );

  float NdotV = max( dot( N, V ), 0.0 );
  float fresnel = schlickFresnel( NdotV, 0.04 );

  vec3 keyL = normalize( uLightDirA );
  vec3 Hk = normalize( keyL + V );
  float ccPow = mix( 156.0, 18.0, clamp( uClearcoatRough, 0.0, 1.0 ) );
  float ccSpec = pow( max( dot( N, Hk ), 0.0 ), ccPow );
  vec3 clearcoatLayer = uLightColorA * uLightIntensityA * ccSpec * uClearcoat;

  // Depth-gated shadow floor: lifts only the subject (depthGlow > 0.15) so deep
  // face concavities read as form rather than black, while true background
  // voxels (depthGlow ~ 0) stay dark and invisible.
  float floorGate = smoothstep( 0.12, 0.38, depthGlow );
  vec3 shadowFloor = baseAlbedo * 0.22 * floorGate;

  vec3 color = baseAlbedo * litAmbient
             + diffSum * baseAlbedo
             + specSum
             + env * fresnel
             + clearcoatLayer
             + shadowFloor;

  gl_FragColor = vec4( color, 1.0 );
}
`;

function createLiveUniforms(): LiveUniforms {
  return THREE.UniformsUtils.merge([
    THREE.UniformsLib.common,
    {
      uDepthPow: { value: 1.36 },
      uExtrusionFar: { value: 0.08 },
      uExtrusionNear: { value: LIVE_EXTRUSION_NEAR },
      uPinch: { value: 0.86 },
      uAmbient: { value: new THREE.Color('#283850') },
      uLightDirA: { value: new THREE.Vector3(0, 1, 0) },
      uLightDirB: { value: new THREE.Vector3(0, 1, 0) },
      uLightDirC: { value: new THREE.Vector3(0, 1, 0) },
      uLightColorA: { value: new THREE.Color() },
      uLightColorB: { value: new THREE.Color() },
      uLightColorC: { value: new THREE.Color() },
      uLightIntensityA: { value: 1 },
      uLightIntensityB: { value: 1 },
      uLightIntensityC: { value: 1 },
      uWrap: { value: 0.62 },
      uSpecStrength: { value: 0.95 },
      uShininess: { value: 52 },
      uClearcoat: { value: 0.62 },
      uClearcoatRough: { value: 0.14 },
      uEnvReflectivity: { value: 1.15 },
      uDepthEnvBoost: { value: 1.35 },
      uPointPos: { value: new THREE.Vector3() },
      uPointColor: { value: new THREE.Color() },
      uPointIntensity: { value: 0 },
    },
  ]);
}

function createLiveShaderMaterial(uniforms: LiveUniforms): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: LIVE_VERTEX_SHADER,
    fragmentShader: LIVE_FRAGMENT_SHADER,
    lights: false,
    toneMapped: true,
    transparent: false,
  });
}

function directionalTowardLight(light: THREE.DirectionalLight, out: THREE.Vector3) {
  out.subVectors(light.position, light.target.position);
  if (out.lengthSq() < 1e-12) out.set(0, 1, 0);
  out.normalize();
}

function updateLiveLightUniforms(
  rig: LiveLightRig,
  uniforms: LiveUniforms,
  tmp: THREE.Vector3,
  dAvg: number,
  dRange: number,
  t: number
) {
  const nearEnergy = smoothstepScalar(0.42, 0.82, dAvg);
  const detailEnergy = smoothstepScalar(0.1, 0.42, dRange);

  rig.key.intensity = 1.05 + nearEnergy * 0.42;
  rig.fill.intensity = 0.62 + detailEnergy * 0.34;
  rig.rim.intensity = 0.92 + nearEnergy * 0.52;
  rig.subjectGlow.intensity = 0.52 + nearEnergy * 0.72 + detailEnergy * 0.24;
  rig.subjectGlow.position.set(
    Math.sin(t * 0.72) * 6,
    3.4 + Math.sin(t * 0.51 + 1.2) * 1.6,
    22 + nearEnergy * 6
  );

  uniforms.uLightIntensityA!.value = rig.key.intensity;
  uniforms.uLightIntensityB!.value = rig.fill.intensity;
  uniforms.uLightIntensityC!.value = rig.rim.intensity;

  uniforms.uLightColorA!.value.copy(rig.key.color);
  uniforms.uLightColorB!.value.copy(rig.fill.color);
  uniforms.uLightColorC!.value.copy(rig.rim.color);

  directionalTowardLight(rig.key, tmp);
  uniforms.uLightDirA!.value.copy(tmp);
  directionalTowardLight(rig.fill, tmp);
  uniforms.uLightDirB!.value.copy(tmp);
  directionalTowardLight(rig.rim, tmp);
  uniforms.uLightDirC!.value.copy(tmp);

  rig.subjectGlow.updateMatrixWorld();
  uniforms.uPointPos!.value.setFromMatrixPosition(rig.subjectGlow.matrixWorld);
  uniforms.uPointColor!.value.copy(rig.subjectGlow.color);
  uniforms.uPointIntensity!.value = rig.subjectGlow.intensity;
}

/** Vertical blue grid behind the sculpture (live only). */
function createLiveBackdropGrid(): THREE.LineSegments {
  const w = 110;
  const h = 92;
  const step = 2.1;
  const z = -42;
  const verts: number[] = [];
  const color = new THREE.Color('#2a6ebd');
  const cols: number[] = [];

  for (let x = -w / 2; x <= w / 2; x += step) {
    verts.push(x, -h / 2, z, x, h / 2, z);
    for (let k = 0; k < 2; k++) {
      cols.push(color.r, color.g, color.b, color.r, color.g, color.b);
    }
  }
  for (let y = -h / 2; y <= h / 2; y += step) {
    verts.push(-w / 2, y, z, w / 2, y, z);
    for (let k = 0; k < 2; k++) {
      cols.push(color.r, color.g, color.b, color.r, color.g, color.b);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));

  const mat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
  });

  const grid = new THREE.LineSegments(geo, mat);
  grid.frustumCulled = false;
  grid.visible = false;
  grid.renderOrder = -50;
  return grid;
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

  const measure = () => {
    const r = container.getBoundingClientRect();
    const w = Math.max(1, Math.floor(r.width || window.innerWidth));
    const h = Math.max(1, Math.floor(r.height || window.innerHeight));
    return { w, h };
  };

  let { w: cw, h: ch } = measure();

  const camera = new THREE.PerspectiveCamera(58, cw / ch, 0.1, 500);
  const cameraDistanceForAspect = (aspect: number) => (aspect < 1 ? 31 : 26);
  camera.position.set(0, 0, cameraDistanceForAspect(cw / ch));
  camera.lookAt(0, 0, 0);

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
  controls.minAzimuthAngle = -Infinity;
  controls.maxAzimuthAngle = Infinity;
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

  const backdropGrid = createLiveBackdropGrid();
  scene.add(backdropGrid);

  const liveUniforms = createLiveUniforms();

  const voxels = createVoxelGrid(GRID_X, GRID_Z, voxelCount, liveUniforms);
  voxels.root.scale.setScalar(WALL_ROOT_SCALE);
  scene.add(voxels.root);
  const liveLightRig = createLights(scene);

  const dummy = new THREE.Object3D();
  let lastTime = performance.now();
  const idleCameraBase = camera.position.clone();
  const lightDirScratch = new THREE.Vector3();

  const frameLerp = (base: number, dt: number, floor: number) =>
    Math.min(1, base * (dt / (1 / 60)) + floor);

  function applyIdleMaterialsAndGeometry() {
    voxels.mesh.geometry = voxels.idleGeometry;
    voxels.mesh.material = voxels.idleMaterial;
    backdropGrid.visible = false;
    renderer.setClearColor(0x000000, 0);
  }

  function applyLiveMaterialsAndGeometry() {
    voxels.mesh.geometry = voxels.liveGeometry;
    voxels.mesh.material = voxels.liveMaterial;
    backdropGrid.visible = true;
    renderer.setClearColor(0x000000, 1);
  }

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
    let centerSum = 0;
    let centerWeightSum = 0;
    const histogram = new Uint16Array(32);

    liveUniforms.uExtrusionNear!.value = LIVE_EXTRUSION_NEAR * extrusionBoost;

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
      const centerWeight = voxels.centerWeights[i];
      centerSum += dFinal * centerWeight;
      centerWeightSum += centerWeight;
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
    const farCutBase = thresholdBin / 31;
    const dAvg = dSum / Math.max(voxelCount, 1);
    const centerAvg = centerSum / Math.max(centerWeightSum, 1e-4);
    const centerDominance = Math.max(0, centerAvg - dAvg);
    const farCut = THREE.MathUtils.clamp(farCutBase + centerDominance * 0.22, 0, 1);

    for (let i = 0; i < voxelCount; i++) {
      const dFinal = voxels.workDepth[i];
      // Center-priority gating suppresses side/background planes (e.g. bright windows)
      // while keeping face/hands in the central capture volume.
      const centerWeight = voxels.centerWeights[i];
      const subjectMask = smoothstepScalar(
        farCut,
        Math.min(1, farCut + LIVE_SUBJECT_EDGE_SOFTNESS),
        dFinal
      );
      const centerMask = THREE.MathUtils.lerp(
        LIVE_CENTER_MASK_MIN,
        1,
        Math.pow(centerWeight, LIVE_CENTER_MASK_EXP)
      );
      const dMasked = dFinal * subjectMask * centerMask;
      // Gentle near-boost: only the very nearest 20% of the subject gets a lift
      // so the shape reads correctly without noise being inflated.
      const nearBoost = smoothstepScalar(LIVE_NEAR_BOOST_EDGE, 1, dMasked);
      const dShaped = THREE.MathUtils.clamp(
        dMasked * (1 + nearBoost * LIVE_NEAR_BOOST_AMOUNT),
        0,
        1
      );

      const baseIdx = i * 3;
      const x = voxels.basePositions[baseIdx];
      const y = voxels.basePositions[baseIdx + 1];
      const wasActive = voxels.voxelActive[i] === 1;
      const nowActive = wasActive ? dShaped > LIVE_OCCUPANCY_OFF : dShaped > LIVE_OCCUPANCY_ON;
      voxels.voxelActive[i] = nowActive ? 1 : 0;

      if (!nowActive) {
        voxels.currentZPush[i] += ((-LIVE_Z_RELIEF * 0.65) - voxels.currentZPush[i]) * lerp;
        dummy.position.set(x, y, voxels.currentZPush[i]);
        dummy.scale.set(LIVE_BG_COLLAPSE_SCALE, LIVE_BG_COLLAPSE_SCALE, LIVE_BG_COLLAPSE_SCALE);
        voxels.instanceDepth.array[i] = 0;
      } else {
        const targetZ = (dShaped - 0.5) * 2 * LIVE_Z_RELIEF * extrusionBoost;
        voxels.currentZPush[i] += (targetZ - voxels.currentZPush[i]) * lerp;
        dummy.position.set(x, y, voxels.currentZPush[i]);
        dummy.scale.set(1, 1, 1);
        voxels.instanceDepth.array[i] = dShaped;
      }

      dummy.updateMatrix();
      voxels.mesh.setMatrixAt(i, dummy.matrix);
    }

    const dRange = dMax - dMin;
    updateLiveLightUniforms(liveLightRig, liveUniforms, lightDirScratch, dAvg, dRange, t);

    const exposureTarget = THREE.MathUtils.clamp(
      1.48 + (0.46 - dAvg) * 0.16 + (0.26 - dRange) * 0.18,
      1.36,
      1.82
    );
    renderer.toneMappingExposure += (exposureTarget - renderer.toneMappingExposure) * 0.06;

    voxels.mesh.instanceMatrix.needsUpdate = true;
    voxels.instanceDepth.needsUpdate = true;
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

  applyIdleMaterialsAndGeometry();

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
      applyLiveMaterialsAndGeometry();
      controls.minDistance = 18;
      controls.maxDistance = 96;
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
      controls.rotateSpeed = 1;
      controls.zoomSpeed = 1;
      applyIdleMaterialsAndGeometry();
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
    voxels.idleGeometry.dispose();
    voxels.liveGeometry.dispose();
    voxels.idleMaterial.dispose();
    voxels.liveMaterial.dispose();
    backdropGrid.geometry.dispose();
    (backdropGrid.material as THREE.Material).dispose();
    renderer.dispose();
    if (renderer.domElement.parentElement === container) {
      container.removeChild(renderer.domElement);
    }
  };

  requestAnimationFrame(applySize);

  return { dispose, setCameraActive, bindDepthBuffer };
}

function translateBoxPivotZ(geo: THREE.BoxGeometry, dz: number) {
  geo.translate(0, 0, dz);
}

function createVoxelGrid(
  GRID_X: number,
  GRID_Z: number,
  count: number,
  liveUniforms: LiveUniforms
): VoxelPack {
  const idleGeometry = new RoundedBoxGeometry(
    VOXEL_SIZE,
    VOXEL_SIZE,
    VOXEL_SIZE,
    VOXEL_SEGMENTS,
    VOXEL_RADIUS
  );
  idleGeometry.translate(0, 0, VOXEL_SIZE * 0.5);

  const liveGeometry = new THREE.BoxGeometry(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE);
  translateBoxPivotZ(liveGeometry, VOXEL_SIZE * 0.5);

  const idleMaterial = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    metalness: 0.12,
    roughness: 0.5,
    clearcoat: 0.16,
    clearcoatRoughness: 0.62,
    reflectivity: 0.2,
    emissive: new THREE.Color('#0f3442'),
    emissiveIntensity: 0.24,
  });

  const liveMaterial = createLiveShaderMaterial(liveUniforms);

  const depthArray = new Float32Array(count);
  const instanceDepth = new THREE.InstancedBufferAttribute(depthArray, 1);
  instanceDepth.setUsage(THREE.DynamicDrawUsage);
  liveGeometry.setAttribute('instanceDepth', instanceDepth);

  const mesh = new THREE.InstancedMesh(idleGeometry, idleMaterial, count);
  mesh.name = 'heroVoxelInstancedGrid';
  mesh.frustumCulled = false;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const basePositions = new Float32Array(count * 3);
  const smoothDepths = new Float32Array(count).fill(0.5);
  const currentScaleY = new Float32Array(count).fill(IDLE_HEIGHT_BIAS);
  const currentZPush = new Float32Array(count);
  const workDepth = new Float32Array(count);
  const centerWeights = new Float32Array(count);
  const voxelActive = new Uint8Array(count);

  const offsetX = (GRID_X - 1) * VOXEL_SPACING * 0.5;
  const offsetY = (GRID_Z - 1) * VOXEL_SPACING * 0.5;
  const dummy = new THREE.Object3D();
  const initialColor = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const ix = i % GRID_X;
    const iz = Math.floor(i / GRID_X);
    const nx = ix / Math.max(GRID_X - 1, 1);
    const nz = iz / Math.max(GRID_Z - 1, 1);
    const dx = nx - 0.5;
    const dz = nz - 0.5;
    const radial = Math.sqrt(dx * dx * LIVE_CENTER_GATE_RADIAL_X_FACTOR + dz * dz);
    const x = ix * VOXEL_SPACING - offsetX;
    const y = offsetY - iz * VOXEL_SPACING;
    const baseIdx = i * 3;
    basePositions[baseIdx] = x;
    basePositions[baseIdx + 1] = y;
    basePositions[baseIdx + 2] = 0;
    centerWeights[i] =
      1 - smoothstepScalar(LIVE_CENTER_GATE_EDGE_INNER, LIVE_CENTER_GATE_EDGE_OUTER, radial);

    const sy = IDLE_HEIGHT_BIAS;
    dummy.position.set(x, y, 0);
    dummy.scale.set(1, 1, sy);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    idleColor(initialColor, 0.4);
    mesh.setColorAt(i, initialColor);
    depthArray[i] = 0;
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  const root = new THREE.Group();
  root.add(mesh);

  return {
    root,
    mesh,
    idleGeometry,
    liveGeometry,
    idleMaterial,
    liveMaterial,
    instanceDepth,
    basePositions,
    smoothDepths,
    currentScaleY,
    currentZPush,
    workDepth,
    centerWeights,
    voxelActive,
    count,
  };
}

function createLights(scene: THREE.Scene): LiveLightRig {
  scene.add(new THREE.HemisphereLight(0x6b88c8, 0x0a1020, 0.38));
  scene.add(new THREE.AmbientLight(0x2b3958, 0.44));

  const key = new THREE.DirectionalLight(0xffffff, 1.22);
  key.position.set(14, 36, 28);
  key.target.position.set(0, 0, 0);
  scene.add(key.target);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xa8d6ff, 0.72);
  fill.position.set(-28, 22, 18);
  fill.target.position.set(0, 0, 0);
  scene.add(fill.target);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0x7ae9ff, 1.08);
  rim.position.set(0, 14, -46);
  rim.target.position.set(0, 0, 0);
  scene.add(rim.target);
  scene.add(rim);

  const subjectGlow = new THREE.PointLight(0xdaf7ff, 0.55, 260);
  subjectGlow.position.set(0, 2.5, 24);
  scene.add(subjectGlow);

  return { key, fill, rim, subjectGlow };
}
