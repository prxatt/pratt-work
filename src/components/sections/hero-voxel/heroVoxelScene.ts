'use client';

/**
 * Homepage hero voxel field — WebGPU (TSL) when available, WebGL fallback for Safari / Vercel previews.
 * Idle: hash + wave extrusion + parallax Z. Camera: depth buffer drives height + colors.
 */
import * as THREE from 'three/webgpu';
import { WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  float,
  vec3,
  color,
  uniform,
  time,
  sin,
  cos,
  mix,
  smoothstep,
  instanceIndex,
  floor,
  uv,
  pow,
  attribute,
} from 'three/tsl';

export type HeroVoxelTier = 'full' | 'medium';

function gridDimensionsForTier(tier: HeroVoxelTier): { gx: number; gz: number } {
  if (tier === 'medium') return { gx: 88, gz: 66 };
  return { gx: 120, gz: 90 };
}

/** Finer columns read as depth relief, not giant pillars (scaled with grid density). */
const MAX_EXTRUSION = 3.85;
const MIN_EXTRUSION = 0.16;
const DEPTH_CONTRAST = 1.12;
/** Subtle Z push for volumetric depth — matches feed without extreme shearing. */
const LIVE_Z_RELIEF_BASE = 6.8;
/** Idle: slow waves on XZ + height tied to a third phase (reads as Y motion on the wall). */
const IDLE_Z_SWELL = 1.05;
const IDLE_HEIGHT_CAP = 3.35;

const VOXEL_BOX = 0.24;
const VOXEL_ROUND = 0.038;
const VOXEL_SEGMENTS = 2;
const VOXEL_SPACING = 0.3;
const VOXEL_PIVOT_Y = VOXEL_BOX * 0.5;
/** Keeps similar framing vs prior 96×72 @ 0.5 spacing + 1.48 scale. */
const WALL_ROOT_SCALE = 1.92;

function smoothstepScalar(edge0: number, edge1: number, x: number): number {
  const d = edge1 - edge0 || 1;
  const t = Math.max(0, Math.min(1, (x - edge0) / d));
  return t * t * (3 - 2 * t);
}

/** Slow interacting waves across X, Z, and a diagonal/depth phase (Y reads as column height). */
function idleWaveMix(nx: number, nz: number, t: number): number {
  const kx = nx * Math.PI * 2;
  const kz = nz * Math.PI * 2;
  const wXY =
    Math.sin(kx * 1.8 + t * 0.34) * Math.cos(kz * 1.8 + t * 0.29) * 0.5 + 0.5;
  const wDiag = Math.sin(kx + kz - t * 0.41) * 0.5 + 0.5;
  const wDepth = Math.sin(t * 0.36 + kx * 0.65 + kz * 0.65) * 0.5 + 0.5;
  return wXY * 0.45 + wDiag * 0.33 + wDepth * 0.22;
}

function idleZWave(nx: number, nz: number, t: number): number {
  const kx = nx * Math.PI * 2;
  const kz = nz * Math.PI * 2;
  return (
    Math.sin(kx * 1.4 + t * 0.31) * Math.cos(kz * 1.4 + t * 0.27) * 0.62 +
    Math.sin(kx * 0.9 + kz * 0.9 + t * 0.24) * 0.38
  );
}

function writeIdleColorJs(
  out: Float32Array,
  i: number,
  ix: number,
  iz: number,
  GRID_X: number,
  GRID_Z: number,
  t: number
) {
  const nx = ix / GRID_X;
  const nz = iz / GRID_Z;
  const waveMix = idleWaveMix(nx, nz, t);
  const c0 = { r: 0.06, g: 0.065, b: 0.07 };
  const c1 = { r: 0.12, g: 0.2, b: 0.22 };
  const c2 = { r: 0.82, g: 0.8, b: 0.76 };
  const a = {
    r: c0.r + (c1.r - c0.r) * smoothstepScalar(0, 0.55, waveMix),
    g: c0.g + (c1.g - c0.g) * smoothstepScalar(0, 0.55, waveMix),
    b: c0.b + (c1.b - c0.b) * smoothstepScalar(0, 0.55, waveMix),
  };
  const bCol = {
    r: a.r + (c2.r - a.r) * smoothstepScalar(0.55, 1, waveMix),
    g: a.g + (c2.g - a.g) * smoothstepScalar(0.55, 1, waveMix),
    b: a.b + (c2.b - a.b) * smoothstepScalar(0.55, 1, waveMix),
  };
  const pulse = Math.sin(t * 0.55 + nx * 2.1 + nz * 1.7) * 0.045 + 0.955;
  out[i * 3] = bCol.r * pulse;
  out[i * 3 + 1] = bCol.g * pulse;
  out[i * 3 + 2] = bCol.b * pulse;
}

/** Live depth: charcoal → cool teal → warm paper; restrained teal in mid-depths only. */
function writeDepthColor(
  instanceColorArray: Float32Array,
  i: number,
  depth01: number
) {
  const t = Math.max(0, Math.min(1, depth01));
  const c0 = { r: 0.045, g: 0.048, b: 0.05 };
  const c1 = { r: 0.1, g: 0.16, b: 0.168 };
  const c2 = { r: 0.94, g: 0.93, b: 0.905 };
  let r: number;
  let g: number;
  let b: number;
  if (t < 0.42) {
    const u = t / 0.42;
    r = c0.r + (c1.r - c0.r) * u;
    g = c0.g + (c1.g - c0.g) * u;
    b = c0.b + (c1.b - c0.b) * u;
  } else {
    const u = (t - 0.42) / 0.58;
    r = c1.r + (c2.r - c1.r) * u;
    g = c1.g + (c2.g - c1.g) * u;
    b = c1.b + (c2.b - c1.b) * u;
  }
  const accent = t > 0.38 && t < 0.66 ? 1 : 0;
  instanceColorArray[i * 3] = Math.min(1, r + 0.02 * accent);
  instanceColorArray[i * 3 + 1] = Math.min(1, g + 0.055 * accent);
  instanceColorArray[i * 3 + 2] = Math.min(1, b + 0.05 * accent);
}

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
  const tryWebGpuFirst = opts?.tryWebGpuFirst !== false;
  const { gx: GRID_X, gz: GRID_Z } = gridDimensionsForTier(tier);
  const voxelCount = GRID_X * GRID_Z;

  let depthBuffer: Float32Array | null = null;
  let cameraMode = false;
  let smoothDepth: Float32Array | null = null;
  let extrusionBoost = 1;
  /** Created per mount so TSL `uniform` is not evaluated at module load (safer for preview / strict runtimes). */
  const uCameraActive = uniform(0);

  const scene = new THREE.Scene();

  const measure = () => {
    const r = container.getBoundingClientRect();
    const w = Math.max(1, Math.floor(r.width || window.innerWidth));
    const h = Math.max(1, Math.floor(r.height || window.innerHeight));
    return { w, h };
  };

  let { w: cw, h: ch } = measure();
  const camAspect = cw / ch;

  const camera = new THREE.PerspectiveCamera(68, camAspect, 0.1, 500);
  camera.position.set(0, 4.85, 29.5);
  camera.lookAt(0, 4.85, 0);

  type Backend = 'webgpu' | 'webgl';
  let backend: Backend;
  let renderer: THREE.WebGPURenderer | WebGLRenderer;

  if (tryWebGpuFirst) {
    const wr = new THREE.WebGPURenderer({
      antialias: tier !== 'medium',
      alpha: true,
      powerPreference: 'high-performance',
    });
    try {
      await wr.init();
      renderer = wr;
      backend = 'webgpu';
    } catch {
      wr.dispose();
      renderer = new WebGLRenderer({
        antialias: tier !== 'medium',
        alpha: true,
        powerPreference: 'high-performance',
      });
      backend = 'webgl';
    }
  } else {
    renderer = new WebGLRenderer({
      antialias: tier !== 'medium',
      alpha: true,
      powerPreference: 'high-performance',
    });
    backend = 'webgl';
  }

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, tier === 'medium' ? 1.25 : 1.65)
  );
  renderer.setSize(cw, ch);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.domElement.style.cssText =
    'display:block;width:100%;height:100%;object-fit:cover;outline:none;vertical-align:top';
  container.appendChild(renderer.domElement);
  renderer.domElement.style.pointerEvents = 'none';

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableRotate = false;
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = reducedMotion ? 0 : 0.2;
  controls.target.set(0, 4.85, 0);
  controls.minDistance = 22;
  controls.maxDistance = 62;
  controls.maxPolarAngle = Math.PI * 0.55;
  controls.minPolarAngle = Math.PI * 0.32;

  const onWheelExtrusion = (e: WheelEvent) => {
    if (!cameraMode || !e.shiftKey) return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    extrusionBoost = Math.max(0.35, Math.min(2.85, extrusionBoost * factor));
  };
  renderer.domElement.addEventListener('wheel', onWheelExtrusion, { passive: false });

  if (backend === 'webgpu') {
    createBackgroundWebGPU(scene);
  } else {
    createBackgroundWebGL(scene);
  }

  const voxelPack =
    backend === 'webgpu'
      ? createVoxelGridWebGPU(scene, GRID_X, GRID_Z, voxelCount, uCameraActive)
      : createVoxelGridWebGL(scene, GRID_X, GRID_Z, voxelCount);

  const { voxelMesh, instanceColorAttr, instanceColorArray, wallRoot } = voxelPack;
  wallRoot.scale.setScalar(WALL_ROOT_SCALE);

  createLights(scene);

  const dummy = new THREE.Object3D();
  let lastTime = performance.now();

  const animate = () => {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    const ud = voxelMesh.userData as {
      basePositions: Float32Array;
      heightTargets: Float32Array;
      currentHeights: Float32Array;
    };
    const t = now * 0.001;
    const lerpSpeed = cameraMode ? 34 : 1.28;
    let colorDirty = false;

    const buf = cameraMode ? depthBuffer : null;
    const bufOk = buf && buf.length === voxelCount;

    for (let i = 0; i < voxelCount; i++) {
      const ix = i % GRID_X;
      const iz = Math.floor(i / GRID_X);
      const nx = ix / GRID_X;
      const nz = iz / GRID_Z;

      if (cameraMode && bufOk && smoothDepth) {
        const raw = buf[i];
        const target = raw;
        smoothDepth[i] += (target - smoothDepth[i]) * 0.52;
        const d = smoothDepth[i];
        const shaped = Math.pow(d, DEPTH_CONTRAST);
        const relief = shaped * 0.9 + d * 0.1;
        ud.heightTargets[i] =
          (MIN_EXTRUSION + relief * (MAX_EXTRUSION - MIN_EXTRUSION)) * extrusionBoost;
        writeDepthColor(instanceColorArray, i, d);
        colorDirty = true;
      } else {
        const waveMix = idleWaveMix(nx, nz, t);
        ud.heightTargets[i] = Math.min(
          IDLE_HEIGHT_CAP,
          0.2 + waveMix * (IDLE_HEIGHT_CAP - 0.2)
        );
        if (backend === 'webgl') {
          writeIdleColorJs(instanceColorArray, i, ix, iz, GRID_X, GRID_Z, t);
          colorDirty = true;
        }
      }

      ud.currentHeights[i] +=
        (ud.heightTargets[i] - ud.currentHeights[i]) * Math.min(lerpSpeed * dt, 1.0);

      const x = ud.basePositions[i * 3];
      const z = ud.basePositions[i * 3 + 2];
      const h = Math.max(ud.currentHeights[i], 0.05);
      let zOff = 0;
      if (cameraMode && bufOk && smoothDepth) {
        const d = smoothDepth[i];
        zOff = (d - 0.5) * 2 * LIVE_Z_RELIEF_BASE * extrusionBoost;
      } else {
        zOff = idleZWave(nx, nz, t) * IDLE_Z_SWELL;
      }

      dummy.position.set(x, 0, z + zOff);
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      voxelMesh.setMatrixAt(i, dummy.matrix);
    }

    voxelMesh.instanceMatrix.needsUpdate = true;
    if (colorDirty) instanceColorAttr.needsUpdate = true;

    controls.update();
    renderer.render(scene, camera);
  };

  renderer.setAnimationLoop(animate);

  const applySize = () => {
    const { w, h } = measure();
    if (w < 2 || h < 2) return;
    cw = w;
    ch = h;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    const cap =
      tier === 'medium'
        ? 1.2
        : cameraMode
          ? 1
          : Math.min(window.devicePixelRatio || 1, 1.65);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
  };

  const ro = new ResizeObserver(() => applySize());
  ro.observe(container);
  if (typeof window !== 'undefined' && window.visualViewport) {
    window.visualViewport.addEventListener('resize', applySize);
  }

  const setCameraActive = (active: boolean) => {
    cameraMode = active;
    uCameraActive.value = active ? 1 : 0;
    controls.enableRotate = active;
    controls.enableZoom = active;
    controls.enablePan = false;
    controls.autoRotate = !reducedMotion && !active;
    renderer.domElement.style.pointerEvents = active ? 'auto' : 'none';

    if (active) {
      smoothDepth = new Float32Array(voxelCount).fill(0.5);
      extrusionBoost = 1;
      controls.minDistance = 10;
      controls.maxDistance = 118;
      controls.rotateSpeed = 0.72;
      controls.zoomSpeed = 0.95;
    } else {
      smoothDepth = null;
      extrusionBoost = 1;
      camera.position.set(0, 4.85, 29.5);
      controls.target.set(0, 4.85, 0);
      wallRoot.rotation.set(-Math.PI / 2, 0, 0);
      controls.minDistance = 22;
      controls.maxDistance = 62;
      controls.rotateSpeed = 1;
      controls.zoomSpeed = 1;
      const udm = voxelMesh.userData as { heightTargets: Float32Array };
      for (let i = 0; i < voxelCount; i++) udm.heightTargets[i] = 0.22;
      depthBuffer = null;
    }

    const mat = voxelMesh.material;
    if (mat instanceof THREE.MeshStandardMaterial) {
      mat.metalness = active ? 0.4 : 0.68;
      mat.roughness = active ? 0.42 : 0.16;
      mat.emissiveIntensity = active ? 0.045 : 0.14;
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
    voxelMesh.geometry.dispose();
    const mat = voxelMesh.material;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose?.());
    else if (mat && 'dispose' in mat && typeof mat.dispose === 'function') mat.dispose();
    renderer.dispose();
    if (renderer.domElement.parentElement === container) {
      container.removeChild(renderer.domElement);
    }
  };

  requestAnimationFrame(applySize);

  return {
    dispose,
    setCameraActive,
    bindDepthBuffer,
  };
}

function createBackgroundWebGPU(scene: THREE.Scene) {
  const sphereGeo = new THREE.SphereGeometry(200, 24, 24);
  const sphereMat = new THREE.MeshBasicNodeMaterial({ side: THREE.BackSide, depthWrite: false });

  const sphereUV = uv();
  const cy = sphereUV.y;
  const cx = sphereUV.x.sub(0.5).mul(2.0);
  const radDist = pow(cx.mul(cx).add(cy.sub(0.4).mul(cy.sub(0.4))), float(0.5));

  const col1 = color(0x0c1016);
  const col2 = color(0x06080c);
  const col3 = color(0x020304);

  sphereMat.colorNode = mix(mix(col1, col2, smoothstep(0.0, 0.5, radDist)), col3, smoothstep(0.3, 1.0, radDist));
  scene.add(new THREE.Mesh(sphereGeo, sphereMat));
}

function createBackgroundWebGL(scene: THREE.Scene) {
  const sphereGeo = new THREE.SphereGeometry(200, 32, 24);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x0a0c10,
    side: THREE.BackSide,
    depthWrite: false,
  });
  scene.add(new THREE.Mesh(sphereGeo, sphereMat));
}

function createVoxelGridWebGPU(
  scene: THREE.Scene,
  GRID_X: number,
  GRID_Z: number,
  voxelCount: number,
  /** TSL `uniform(0|1)` — `mix()` typings don't accept `UniformNode` explicitly in this three version. */
  uCameraActive: unknown
) {
  const geo = new RoundedBoxGeometry(
    VOXEL_BOX,
    VOXEL_BOX,
    VOXEL_BOX,
    VOXEL_SEGMENTS,
    VOXEL_ROUND
  );
  geo.translate(0, VOXEL_PIVOT_Y, 0);

  const instanceColorArray = new Float32Array(voxelCount * 3);
  for (let i = 0; i < voxelCount; i++) {
    instanceColorArray[i * 3 + 1] = 1.0;
    instanceColorArray[i * 3 + 2] = 1.0;
  }
  const instanceColorAttr = new THREE.InstancedBufferAttribute(instanceColorArray, 3);
  geo.setAttribute('instanceColor', instanceColorAttr);

  const mat = new THREE.MeshStandardNodeMaterial({ metalness: 0.68, roughness: 0.16 });

  const tNode = time;
  const idxFloat = float(instanceIndex);
  const gridXF = float(GRID_X);
  const normX = idxFloat.mod(gridXF).div(gridXF);
  const normZ = floor(idxFloat.div(gridXF)).div(float(GRID_Z));
  const pi2 = float(6.28318530718);
  const kx = normX.mul(pi2);
  const kz = normZ.mul(pi2);
  const wXY = sin(kx.mul(1.8).add(tNode.mul(0.34)))
    .mul(cos(kz.mul(1.8).add(tNode.mul(0.29))))
    .mul(0.5)
    .add(0.5);
  const wDiag = sin(kx.add(kz).sub(tNode.mul(0.41))).mul(0.5).add(0.5);
  const wDepth = sin(tNode.mul(0.36).add(kx.mul(0.65)).add(kz.mul(0.65)))
    .mul(0.5)
    .add(0.5);
  const waveMix = wXY.mul(0.45).add(wDiag.mul(0.33)).add(wDepth.mul(0.22));

  const base = vec3(0.06, 0.065, 0.07);
  const teal = vec3(0.12, 0.2, 0.22);
  const paper = vec3(0.82, 0.8, 0.76);

  const colorWave = mix(
    mix(base, teal, smoothstep(0.0, 0.55, waveMix)),
    paper,
    smoothstep(0.55, 1.0, waveMix)
  );
  const idleColor = colorWave.mul(
    sin(tNode.mul(0.55).add(normX.mul(2.1)).add(normZ.mul(1.7))).mul(0.045).add(0.955)
  );

  const depthColor = attribute('instanceColor', 'vec3') as typeof idleColor;

  mat.colorNode = mix(idleColor, depthColor, uCameraActive as Parameters<typeof mix>[2]);
  mat.emissiveNode = mix(
    colorWave.mul(
      sin(tNode.mul(0.48).add(normX.mul(3.14)).add(normZ.mul(2.0))).mul(0.08).add(0.2)
    ),
    depthColor.mul(float(0.11)),
    uCameraActive as Parameters<typeof mix>[2]
  );

  return finalizeInstancedWall(scene, geo, mat, instanceColorAttr, instanceColorArray, GRID_X, GRID_Z, voxelCount, {
    bindInstanceColorOnGeometry: true,
  });
}

function createVoxelGridWebGL(
  scene: THREE.Scene,
  GRID_X: number,
  GRID_Z: number,
  voxelCount: number
) {
  const geo = new RoundedBoxGeometry(
    VOXEL_BOX,
    VOXEL_BOX,
    VOXEL_BOX,
    VOXEL_SEGMENTS,
    VOXEL_ROUND
  );
  geo.translate(0, VOXEL_PIVOT_Y, 0);

  const instanceColorArray = new Float32Array(voxelCount * 3);
  for (let i = 0; i < voxelCount; i++) {
    instanceColorArray[i * 3 + 1] = 1.0;
    instanceColorArray[i * 3 + 2] = 1.0;
  }
  const instanceColorAttr = new THREE.InstancedBufferAttribute(instanceColorArray, 3);

  const mat = new THREE.MeshStandardMaterial({
    metalness: 0.68,
    roughness: 0.16,
    vertexColors: true,
    emissive: 0x0a1218,
    emissiveIntensity: 0.14,
  });

  return finalizeInstancedWall(scene, geo, mat, instanceColorAttr, instanceColorArray, GRID_X, GRID_Z, voxelCount, {
    bindInstanceColorOnGeometry: false,
  });
}

function finalizeInstancedWall(
  scene: THREE.Scene,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  instanceColorAttr: THREE.InstancedBufferAttribute,
  instanceColorArray: Float32Array,
  GRID_X: number,
  GRID_Z: number,
  voxelCount: number,
  colorBind: { bindInstanceColorOnGeometry: boolean }
) {
  const voxelMesh = new THREE.InstancedMesh(geo, mat, voxelCount);
  voxelMesh.name = 'heroVoxelGrid';
  if (!colorBind.bindInstanceColorOnGeometry) {
    voxelMesh.instanceColor = instanceColorAttr;
  }

  const dummy = new THREE.Object3D();
  const spacingX = VOXEL_SPACING;
  const spacingZ = VOXEL_SPACING;
  const offsetX = (GRID_X - 1) * spacingX * 0.5;
  const offsetZ = (GRID_Z - 1) * spacingZ * 0.5;

  const basePositions = new Float32Array(voxelCount * 3);
  const heightTargets = new Float32Array(voxelCount);
  const currentHeights = new Float32Array(voxelCount);

  for (let i = 0; i < voxelCount; i++) {
    const ix = i % GRID_X;
    const iz = Math.floor(i / GRID_X);
    const x = ix * spacingX - offsetX;
    const z = iz * spacingZ - offsetZ;

    basePositions[i * 3] = x;
    basePositions[i * 3 + 2] = z;

    dummy.position.set(x, 0, z);
    dummy.scale.set(1, 0.22, 1);
    dummy.updateMatrix();
    voxelMesh.setMatrixAt(i, dummy.matrix);

    heightTargets[i] = 0.22;
    currentHeights[i] = 0.22;
  }

  voxelMesh.instanceMatrix.needsUpdate = true;
  voxelMesh.userData = { basePositions, heightTargets, currentHeights };

  const wallRoot = new THREE.Group();
  wallRoot.rotation.x = -Math.PI / 2;
  wallRoot.add(voxelMesh);
  scene.add(wallRoot);

  return { voxelMesh, instanceColorAttr, instanceColorArray, wallRoot };
}

function createLights(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0x2a3238, 0x06080c, 0.48));
  scene.add(new THREE.AmbientLight(0x1a1e24, 0.58));
  const dir = new THREE.DirectionalLight(0xd8e4f8, 1.08);
  dir.position.set(10, 32, 28);
  scene.add(dir);
  const fill = new THREE.DirectionalLight(0x8899b8, 0.42);
  fill.position.set(-18, 14, 22);
  scene.add(fill);
  const p1 = new THREE.PointLight(0x5a9aaa, 1.15, 130);
  p1.position.set(-22, 18, 18);
  scene.add(p1);
  const p2 = new THREE.PointLight(0x7a6a9c, 0.88, 130);
  p2.position.set(22, 18, 18);
  scene.add(p2);
  const rim = new THREE.DirectionalLight(0xf5efe4, 0.38);
  rim.position.set(0, 10, -42);
  scene.add(rim);
}
