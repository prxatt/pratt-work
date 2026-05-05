'use client';

/**
 * Homepage hero field — lightweight dots at idle, continuous depth mesh when live camera is on.
 * WebGPU is attempted first, with WebGL fallback for Safari / preview environments.
 */
import * as THREE from 'three/webgpu';
import { WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gridDimensionsForTier, type HeroVoxelTier } from './heroVoxelConfig';

const DOT_SPACING = 0.255;
const WALL_ROOT_SCALE = 1.82;

const IDLE_HEIGHT = 0.86;
const IDLE_Z_SWELL = 0.62;
const IDLE_LERP = 0.08;

const LIVE_Y_RELIEF = 10.8;
const LIVE_Z_RELIEF = 9.25;
/** Extra amplification on protruding regions (beyond linear depth). */
const LIVE_DEPTH_SHAPE = 1.38;
const LIVE_LERP = 0.55;
const DEPTH_CONTRAST = 1.18;

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
  return wXY * 0.44 + wDiag * 0.34 + wDepth * 0.22;
}

function idleZWave(nx: number, nz: number, t: number): number {
  const kx = nx * Math.PI * 2;
  const kz = nz * Math.PI * 2;
  return (
    Math.sin(kx * 1.2 + t * 0.2) * Math.cos(kz * 1.2 + t * 0.18) * 0.64 +
    Math.sin(kx * 0.72 + kz * 0.72 + t * 0.16) * 0.36
  );
}

function writeIdleColor(out: Float32Array, i: number, waveMix: number) {
  const c0 = { r: 0.055, g: 0.06, b: 0.065 };
  const c1 = { r: 0.11, g: 0.18, b: 0.195 };
  const c2 = { r: 0.76, g: 0.75, b: 0.71 };
  let r: number;
  let g: number;
  let b: number;
  if (waveMix < 0.58) {
    const u = smoothstepScalar(0, 0.58, waveMix);
    r = c0.r + (c1.r - c0.r) * u;
    g = c0.g + (c1.g - c0.g) * u;
    b = c0.b + (c1.b - c0.b) * u;
  } else {
    const u = smoothstepScalar(0.58, 1, waveMix);
    r = c1.r + (c2.r - c1.r) * u;
    g = c1.g + (c2.g - c1.g) * u;
    b = c1.b + (c2.b - c1.b) * u;
  }
  out[i * 3] = r;
  out[i * 3 + 1] = g;
  out[i * 3 + 2] = b;
}

function writeDepthColor(out: Float32Array, i: number, depth01: number) {
  const t = Math.max(0, Math.min(1, depth01));
  const shadow = { r: 0.04, g: 0.043, b: 0.046 };
  const teal = { r: 0.12, g: 0.2, b: 0.21 };
  const paper = { r: 0.92, g: 0.91, b: 0.875 };
  let r: number;
  let g: number;
  let b: number;
  if (t < 0.48) {
    const u = smoothstepScalar(0, 0.48, t);
    r = shadow.r + (teal.r - shadow.r) * u;
    g = shadow.g + (teal.g - shadow.g) * u;
    b = shadow.b + (teal.b - shadow.b) * u;
  } else {
    const u = smoothstepScalar(0.48, 1, t);
    r = teal.r + (paper.r - teal.r) * u;
    g = teal.g + (paper.g - teal.g) * u;
    b = teal.b + (paper.b - teal.b) * u;
  }
  out[i * 3] = r;
  out[i * 3 + 1] = g;
  out[i * 3 + 2] = b;
}

type HeroSurfacePack = {
  root: THREE.Group;
  idlePoints: THREE.Points;
  liveMesh: THREE.Mesh;
  idlePositions: Float32Array;
  idleColors: Float32Array;
  livePositions: Float32Array;
  liveColors: Float32Array;
  liveDepths: Float32Array;
  basePositions: Float32Array;
  idlePositionAttr: THREE.BufferAttribute;
  idleColorAttr: THREE.BufferAttribute;
  livePositionAttr: THREE.BufferAttribute;
  liveColorAttr: THREE.BufferAttribute;
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
  const tryWebGpuFirst = opts?.tryWebGpuFirst !== false;
  const { gx: GRID_X, gz: GRID_Z } = gridDimensionsForTier(tier);
  const pointCount = GRID_X * GRID_Z;

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
  const camera = new THREE.PerspectiveCamera(64, cw / ch, 0.1, 500);
  camera.position.set(0, 4.85, 30);
  camera.lookAt(0, 4.85, 0);

  let renderer: THREE.WebGPURenderer | WebGLRenderer;
  if (tryWebGpuFirst) {
    const wr = new THREE.WebGPURenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });
    try {
      await wr.init();
      renderer = wr;
    } catch {
      wr.dispose();
      renderer = new WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
      });
    }
  } else {
    renderer = new WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier === 'medium' ? 1 : 1.35));
  renderer.setSize(cw, ch);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;
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
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = reducedMotion ? 0 : 0.08;
  controls.target.set(0, 4.85, 0);
  controls.minDistance = 22;
  controls.maxDistance = 58;
  controls.maxPolarAngle = Math.PI * 0.55;
  controls.minPolarAngle = Math.PI * 0.32;

  const onWheelExtrusion = (e: WheelEvent) => {
    if (!cameraMode || !e.shiftKey) return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.94 : 1.06;
    extrusionBoost = Math.max(0.5, Math.min(3.25, extrusionBoost * factor));
  };
  renderer.domElement.addEventListener('wheel', onWheelExtrusion, { passive: false });

  createBackground(scene);
  const surface = createSurface(scene, GRID_X, GRID_Z, pointCount);
  surface.root.scale.setScalar(WALL_ROOT_SCALE);
  createLights(scene);

  let lastTime = performance.now();

  const animate = () => {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const t = now * 0.001;

    const buf = cameraMode ? depthBuffer : null;
    const bufOk = buf && buf.length === pointCount;

    if (cameraMode && bufOk) {
      updateLiveMesh(surface, buf, pointCount, dt);
    } else {
      updateIdleDots(surface, GRID_X, GRID_Z, t, dt);
    }

    controls.update();
    renderer.render(scene, camera);
  };

  function updateIdleDots(
    pack: HeroSurfacePack,
    gridX: number,
    gridZ: number,
    t: number,
    dt: number
  ) {
    const lerp = Math.min(1, IDLE_LERP * (dt / (1 / 60)) + 0.02);
    for (let i = 0; i < pointCount; i++) {
      const ix = i % gridX;
      const iz = Math.floor(i / gridX);
      const nx = ix / Math.max(gridX - 1, 1);
      const nz = iz / Math.max(gridZ - 1, 1);
      const base = i * 3;
      const wave = idleWaveMix(nx, nz, t);
      const targetY = 0.03 + wave * IDLE_HEIGHT;
      const targetZ = pack.basePositions[base + 2] + idleZWave(nx, nz, t) * IDLE_Z_SWELL;

      pack.idlePositions[base + 1] += (targetY - pack.idlePositions[base + 1]) * lerp;
      pack.idlePositions[base + 2] += (targetZ - pack.idlePositions[base + 2]) * lerp;
      writeIdleColor(pack.idleColors, i, wave);
    }
    pack.idlePositionAttr.needsUpdate = true;
    pack.idleColorAttr.needsUpdate = true;
  }

  function updateLiveMesh(
    pack: HeroSurfacePack,
    buf: Float32Array,
    count: number,
    dt: number
  ) {
    const lerp = Math.min(1, LIVE_LERP * (dt / (1 / 60)) + 0.08);
    for (let i = 0; i < count; i++) {
      const raw = buf[i];
      pack.liveDepths[i] += (raw - pack.liveDepths[i]) * lerp;
      const dn = THREE.MathUtils.clamp(pack.liveDepths[i], 0, 1);
      const shaped = Math.pow(dn, DEPTH_CONTRAST);
      const d = THREE.MathUtils.clamp(Math.pow(shaped, LIVE_DEPTH_SHAPE), 0, 1);
      const base = i * 3;
      const y = d * LIVE_Y_RELIEF * extrusionBoost;
      const z = pack.basePositions[base + 2] + (d - 0.5) * 2 * LIVE_Z_RELIEF * extrusionBoost;
      pack.livePositions[base + 1] = y;
      pack.livePositions[base + 2] = z;
      writeDepthColor(pack.liveColors, i, dn);
    }
    pack.livePositionAttr.needsUpdate = true;
    pack.liveColorAttr.needsUpdate = true;
  }

  renderer.setAnimationLoop(animate);

  const applySize = () => {
    const { w, h } = measure();
    if (w < 2 || h < 2) return;
    cw = w;
    ch = h;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    const cap = cameraMode ? 1 : tier === 'medium' ? 1 : 1.35;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
  };

  const ro = new ResizeObserver(() => applySize());
  ro.observe(container);
  if (typeof window !== 'undefined' && window.visualViewport) {
    window.visualViewport.addEventListener('resize', applySize);
  }

  const setCameraActive = (active: boolean) => {
    cameraMode = active;
    surface.idlePoints.visible = !active;
    surface.liveMesh.visible = active;
    controls.enableRotate = active;
    controls.enableZoom = active;
    controls.enablePan = false;
    controls.autoRotate = !reducedMotion && !active;
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
    controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
    renderer.domElement.style.pointerEvents = active ? 'auto' : 'none';
    renderer.domElement.style.touchAction = active ? 'none' : 'auto';

    if (active) {
      extrusionBoost = 1.22;
      surface.liveDepths.fill(0.5);
      surface.livePositions.set(surface.basePositions);
      controls.minDistance = 13;
      controls.maxDistance = 86;
      controls.rotateSpeed = 0.62;
      controls.zoomSpeed = 0.85;
    } else {
      extrusionBoost = 1;
      depthBuffer = null;
      camera.position.set(0, 4.85, 30);
      controls.target.set(0, 4.85, 0);
      surface.root.rotation.set(-Math.PI / 2, 0, 0);
      controls.minDistance = 22;
      controls.maxDistance = 58;
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
    disposeSurface(surface);
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

function createBackground(scene: THREE.Scene) {
  const sphereGeo = new THREE.SphereGeometry(200, 24, 18);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x090b0f,
    side: THREE.BackSide,
    depthWrite: false,
  });
  scene.add(new THREE.Mesh(sphereGeo, sphereMat));
}

function createSurface(
  scene: THREE.Scene,
  GRID_X: number,
  GRID_Z: number,
  pointCount: number
): HeroSurfacePack {
  const basePositions = new Float32Array(pointCount * 3);
  const idlePositions = new Float32Array(pointCount * 3);
  const idleColors = new Float32Array(pointCount * 3);
  const livePositions = new Float32Array(pointCount * 3);
  const liveColors = new Float32Array(pointCount * 3);
  const liveDepths = new Float32Array(pointCount).fill(0.5);

  const offsetX = (GRID_X - 1) * DOT_SPACING * 0.5;
  const offsetZ = (GRID_Z - 1) * DOT_SPACING * 0.5;

  for (let i = 0; i < pointCount; i++) {
    const ix = i % GRID_X;
    const iz = Math.floor(i / GRID_X);
    const x = ix * DOT_SPACING - offsetX;
    const z = iz * DOT_SPACING - offsetZ;
    const base = i * 3;
    basePositions[base] = x;
    basePositions[base + 1] = 0;
    basePositions[base + 2] = z;
    idlePositions[base] = x;
    idlePositions[base + 1] = 0.08;
    idlePositions[base + 2] = z;
    livePositions[base] = x;
    livePositions[base + 1] = 0;
    livePositions[base + 2] = z;
    writeIdleColor(idleColors, i, 0.45);
    writeDepthColor(liveColors, i, 0.5);
  }

  const idleGeometry = new THREE.BufferGeometry();
  const idlePositionAttr = new THREE.BufferAttribute(idlePositions, 3);
  const idleColorAttr = new THREE.BufferAttribute(idleColors, 3);
  idleGeometry.setAttribute('position', idlePositionAttr);
  idleGeometry.setAttribute('color', idleColorAttr);

  const idleMaterial = new THREE.PointsMaterial({
    size: 0.028,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
  });
  const idlePoints = new THREE.Points(idleGeometry, idleMaterial);
  idlePoints.name = 'heroFineIdleDots';

  const liveGeometry = new THREE.BufferGeometry();
  const livePositionAttr = new THREE.BufferAttribute(livePositions, 3);
  const liveColorAttr = new THREE.BufferAttribute(liveColors, 3);
  liveGeometry.setAttribute('position', livePositionAttr);
  liveGeometry.setAttribute('color', liveColorAttr);
  liveGeometry.setIndex(createGridIndex(GRID_X, GRID_Z));
  liveGeometry.computeVertexNormals();

  const liveMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
    metalness: 0.26,
    roughness: 0.62,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.93,
    emissive: 0x071017,
    emissiveIntensity: 0.1,
  });
  const liveMesh = new THREE.Mesh(liveGeometry, liveMaterial);
  liveMesh.name = 'heroLiveDepthMesh';
  liveMesh.visible = false;

  const root = new THREE.Group();
  root.rotation.x = -Math.PI / 2;
  root.add(idlePoints);
  root.add(liveMesh);
  scene.add(root);

  return {
    root,
    idlePoints,
    liveMesh,
    idlePositions,
    idleColors,
    livePositions,
    liveColors,
    liveDepths,
    basePositions,
    idlePositionAttr,
    idleColorAttr,
    livePositionAttr,
    liveColorAttr,
  };
}

function createGridIndex(gridX: number, gridZ: number): THREE.BufferAttribute {
  const indices = new Uint32Array((gridX - 1) * (gridZ - 1) * 6);
  let p = 0;
  for (let z = 0; z < gridZ - 1; z++) {
    for (let x = 0; x < gridX - 1; x++) {
      const a = z * gridX + x;
      const b = a + 1;
      const c = a + gridX;
      const d = c + 1;
      indices[p++] = a;
      indices[p++] = c;
      indices[p++] = b;
      indices[p++] = b;
      indices[p++] = c;
      indices[p++] = d;
    }
  }
  return new THREE.BufferAttribute(indices, 1);
}

function disposeSurface(pack: HeroSurfacePack) {
  pack.idlePoints.geometry.dispose();
  const idleMat = pack.idlePoints.material;
  if (Array.isArray(idleMat)) idleMat.forEach((m) => m.dispose());
  else idleMat.dispose();

  pack.liveMesh.geometry.dispose();
  const liveMat = pack.liveMesh.material;
  if (Array.isArray(liveMat)) liveMat.forEach((m) => m.dispose());
  else liveMat.dispose();
}

function createLights(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0x2a3238, 0x06080c, 0.55));
  scene.add(new THREE.AmbientLight(0x1a1e24, 0.5));
  const dir = new THREE.DirectionalLight(0xd8e4f8, 1.0);
  dir.position.set(10, 32, 28);
  scene.add(dir);
  const fill = new THREE.DirectionalLight(0x8aa4b8, 0.44);
  fill.position.set(-18, 14, 22);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xf5efe4, 0.36);
  rim.position.set(0, 10, -42);
  scene.add(rim);
}
