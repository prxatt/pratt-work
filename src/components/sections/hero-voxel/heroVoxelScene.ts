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
  if (tier === 'medium') return { gx: 64, gz: 48 };
  return { gx: 96, gz: 72 };
}

const MAX_EXTRUSION = 14.0;
const MIN_EXTRUSION = 0.12;
const DEPTH_CONTRAST = 1.45;
/** Max Z relief in live mode ≈10× prior single-sided push; scaled by user Shift-wheel. */
const LIVE_Z_RELIEF_BASE = 26;
/** Idle: parallax along Z (world) so the wall reads thicker / more volumetric */
const IDLE_Z_SWELL = 2.35;
const IDLE_HEIGHT_CAP = 10.8;

function smoothstepScalar(edge0: number, edge1: number, x: number): number {
  const d = edge1 - edge0 || 1;
  const t = Math.max(0, Math.min(1, (x - edge0) / d));
  return t * t * (3 - 2 * t);
}

function frac(x: number) {
  return x - Math.floor(x);
}

function hashNoise(n: number) {
  return frac(Math.sin(n) * 43758.5453123);
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
  const wave1 = Math.sin(nx * 6.28 + t * 1.5) * 0.5 + 0.5;
  const wave2 = Math.cos(nz * 6.28 + t * 1.2) * 0.5 + 0.5;
  const waveMix = wave1 * 0.6 + wave2 * 0.4;
  const c0 = { r: 0, g: 1, b: 1 };
  const c1 = { r: 0.55, g: 0, b: 1 };
  const c2 = { r: 0.9, g: 0, b: 0.8 };
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
  const pulse = Math.sin(t * 2 + i * 0.005) * 0.15 + 0.85;
  out[i * 3] = bCol.r * pulse;
  out[i * 3 + 1] = bCol.g * pulse;
  out[i * 3 + 2] = bCol.b * pulse;
}

/** Live depth: charcoal → cool teal shadow → warm paper (matches #0a0a0a / #F5F5F3 / cyan accents). */
function writeDepthColor(
  instanceColorArray: Float32Array,
  i: number,
  depth01: number
) {
  const t = Math.max(0, Math.min(1, depth01));
  const c0 = { r: 0.055, g: 0.054, b: 0.052 };
  const c1 = { r: 0.11, g: 0.17, b: 0.175 };
  const c2 = { r: 0.93, g: 0.92, b: 0.895 };
  let r: number;
  let g: number;
  let b: number;
  if (t < 0.48) {
    const u = t / 0.48;
    r = c0.r + (c1.r - c0.r) * u;
    g = c0.g + (c1.g - c0.g) * u;
    b = c0.b + (c1.b - c0.b) * u;
  } else {
    const u = (t - 0.48) / 0.52;
    r = c1.r + (c2.r - c1.r) * u;
    g = c1.g + (c2.g - c1.g) * u;
    b = c1.b + (c2.b - c1.b) * u;
  }
  const cyan = t > 0.34 && t < 0.72 ? 0.04 : 0;
  instanceColorArray[i * 3] = Math.min(1, r + cyan * 0.35);
  instanceColorArray[i * 3 + 1] = Math.min(1, g + cyan * 0.9);
  instanceColorArray[i * 3 + 2] = Math.min(1, b + cyan * 1.05);
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
  renderer.toneMappingExposure = 1.12;
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
    extrusionBoost = Math.max(0.2, Math.min(6, extrusionBoost * factor));
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
  wallRoot.scale.setScalar(1.48);

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
    const lerpSpeed = cameraMode ? 24 : 2.85;
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
        const target = 1 - raw;
        smoothDepth[i] += (target - smoothDepth[i]) * 0.35;
        const d = smoothDepth[i];
        const contrast = Math.pow(d, DEPTH_CONTRAST);
        ud.heightTargets[i] =
          (MIN_EXTRUSION + contrast * (MAX_EXTRUSION - MIN_EXTRUSION)) * extrusionBoost;
        writeDepthColor(instanceColorArray, i, d);
        colorDirty = true;
      } else {
        const wave =
          Math.sin(nx * 8 + t * 1.5) * Math.cos(nz * 6 + t * 1.2) * 0.5 + 0.5;
        const ripples =
          Math.sin(nx * 14 + t * 2.35) * 0.5 +
          0.5 +
          (Math.cos(nz * 12 + t * 1.85) * 0.5 + 0.5);
        const pulse = Math.sin(t * 1.05 + hashNoise(ix * 0.37 + iz * 0.53)) * 0.5 + 0.5;
        const hNoise = hashNoise(i * 0.031 + t * 0.41);
        const burst = Math.sin(t * 2.65 + hNoise * 12.9898) * 0.5 + 0.5;
        const wander = Math.sin(t * 0.73 + i * 0.0007) * 0.5 + 0.5;
        const chaos = 0.45 + pulse * 0.55 + hNoise * 0.85 + burst * 0.5 + wander * 0.35;
        ud.heightTargets[i] = Math.min(
          IDLE_HEIGHT_CAP,
          0.14 +
            (wave * 1.35 + ripples * 0.32) *
              (2.15 + pulse * 2.45) *
              (0.55 + chaos * 0.68)
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
      const h = Math.max(ud.currentHeights[i], 0.06);
      let zOff = 0;
      if (cameraMode && bufOk && smoothDepth) {
        const d = smoothDepth[i];
        zOff = (d - 0.5) * 2 * LIVE_Z_RELIEF_BASE * extrusionBoost;
      } else {
        const swell =
          Math.sin(nx * 10.5 + t * 1.05) * Math.cos(nz * 8.25 + t * 0.88);
        zOff = swell * IDLE_Z_SWELL;
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
      for (let i = 0; i < voxelCount; i++) udm.heightTargets[i] = 0.35;
      depthBuffer = null;
    }

    const mat = voxelMesh.material;
    if (mat instanceof THREE.MeshStandardMaterial) {
      mat.metalness = active ? 0.38 : 0.72;
      mat.roughness = active ? 0.44 : 0.2;
      mat.emissiveIntensity = active ? 0.06 : 0.18;
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

  const col1 = color(0x0a1628);
  const col2 = color(0x030812);
  const col3 = color(0x000000);

  sphereMat.colorNode = mix(mix(col1, col2, smoothstep(0.0, 0.5, radDist)), col3, smoothstep(0.3, 1.0, radDist));
  scene.add(new THREE.Mesh(sphereGeo, sphereMat));
}

function createBackgroundWebGL(scene: THREE.Scene) {
  const sphereGeo = new THREE.SphereGeometry(200, 32, 24);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x040814,
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
  const geo = new RoundedBoxGeometry(0.4, 0.4, 0.4, 3, 0.068);
  geo.translate(0, 0.2, 0);

  const instanceColorArray = new Float32Array(voxelCount * 3);
  for (let i = 0; i < voxelCount; i++) {
    instanceColorArray[i * 3 + 1] = 1.0;
    instanceColorArray[i * 3 + 2] = 1.0;
  }
  const instanceColorAttr = new THREE.InstancedBufferAttribute(instanceColorArray, 3);
  geo.setAttribute('instanceColor', instanceColorAttr);

  const mat = new THREE.MeshStandardNodeMaterial({ metalness: 0.72, roughness: 0.2 });

  const tNode = time;
  const idxFloat = float(instanceIndex);
  const gridXF = float(GRID_X);
  const normX = idxFloat.mod(gridXF).div(gridXF);
  const normZ = floor(idxFloat.div(gridXF)).div(float(GRID_Z));

  const wave1 = sin(normX.mul(6.28).add(tNode.mul(1.5))).mul(0.5).add(0.5);
  const wave2 = cos(normZ.mul(6.28).add(tNode.mul(1.2))).mul(0.5).add(0.5);
  const waveMix = wave1.mul(0.6).add(wave2.mul(0.4));

  const cyan = vec3(0.0, 1.0, 1.0);
  const violet = vec3(0.55, 0.0, 1.0);
  const magenta = vec3(0.9, 0.0, 0.8);

  const colorWave = mix(
    mix(cyan, violet, smoothstep(0.0, 0.55, waveMix)),
    magenta,
    smoothstep(0.55, 1.0, waveMix)
  );
  const idleColor = colorWave.mul(sin(tNode.mul(2.0).add(idxFloat.mul(0.005))).mul(0.15).add(0.85));

  const depthColor = attribute('instanceColor', 'vec3') as typeof idleColor;

  mat.colorNode = mix(idleColor, depthColor, uCameraActive as Parameters<typeof mix>[2]);
  mat.emissiveNode = mix(
    colorWave.mul(sin(tNode.mul(1.8).add(normX.mul(3.14).add(normZ.mul(2.0)))).mul(0.2).add(0.3)),
    depthColor.mul(float(0.14)),
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
  const geo = new RoundedBoxGeometry(0.4, 0.4, 0.4, 3, 0.068);
  geo.translate(0, 0.2, 0);

  const instanceColorArray = new Float32Array(voxelCount * 3);
  for (let i = 0; i < voxelCount; i++) {
    instanceColorArray[i * 3 + 1] = 1.0;
    instanceColorArray[i * 3 + 2] = 1.0;
  }
  const instanceColorAttr = new THREE.InstancedBufferAttribute(instanceColorArray, 3);

  const mat = new THREE.MeshStandardMaterial({
    metalness: 0.72,
    roughness: 0.2,
    vertexColors: true,
    emissive: 0x000000,
    emissiveIntensity: 0.18,
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
  const spacingX = 0.5;
  const spacingZ = 0.5;
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
    dummy.scale.set(1, 0.32, 1);
    dummy.updateMatrix();
    voxelMesh.setMatrixAt(i, dummy.matrix);

    heightTargets[i] = 0.32;
    currentHeights[i] = 0.32;
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
  scene.add(new THREE.AmbientLight(0x1a1a3e, 0.85));
  const dir = new THREE.DirectionalLight(0xaabbff, 1.05);
  dir.position.set(8, 28, 32);
  scene.add(dir);
  const p1 = new THREE.PointLight(0x00ffff, 2.2, 120);
  p1.position.set(-24, 20, 20);
  scene.add(p1);
  const p2 = new THREE.PointLight(0x8800ff, 2.2, 120);
  p2.position.set(24, 20, 20);
  scene.add(p2);
  const rim = new THREE.DirectionalLight(0xffeecc, 0.35);
  rim.position.set(0, 8, -40);
  scene.add(rim);
}
