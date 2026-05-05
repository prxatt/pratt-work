'use client';

/**
 * Homepage hero WebGPU voxel field — from `webgpu-volumetric-voxel-grid-v/index.js`.
 * Idle: hash + wave extrusions. Camera: depth buffer drives height + instance colors.
 */
import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
import type { HeroVoxelTier } from './heroVoxelTypes';
import { getHeroVoxelGridDimensions } from './heroVoxelTypes';

const uCameraActive = uniform(0);

const MAX_EXTRUSION = 12.0;
const MIN_EXTRUSION = 0.08;
const DEPTH_CONTRAST = 1.6;
const Z_PUSH_FACTOR = -0.18;

function frac(x: number) {
  return x - Math.floor(x);
}

function hashNoise(n: number) {
  return frac(Math.sin(n) * 43758.5453123);
}

function writeDepthColor(
  instanceColorArray: Float32Array,
  i: number,
  depth01: number
) {
  let r: number;
  let g: number;
  let b: number;
  if (depth01 < 0.25) {
    const t = depth01 / 0.25;
    r = 0.02 + t * 0.35;
    g = 0.01;
    b = 0.18 + t * 0.55;
  } else if (depth01 < 0.65) {
    const t = (depth01 - 0.25) / 0.4;
    r = 0.37 + t * 0.53;
    g = 0.01;
    b = 0.73 - t * 0.1;
  } else {
    const t = (depth01 - 0.65) / 0.35;
    r = 0.9 - t * 0.9;
    g = t;
    b = 0.63 + t * 0.37;
  }
  instanceColorArray[i * 3] = r;
  instanceColorArray[i * 3 + 1] = g;
  instanceColorArray[i * 3 + 2] = b;
}

export type HeroVoxelSceneApi = {
  dispose: () => void;
  setCameraActive: (active: boolean) => void;
  /** Same Float32Array as depth inference (length gx×gz); null disables depth sampling */
  bindDepthBuffer: (buffer: Float32Array | null) => void;
};

export async function mountHeroVoxelScene(
  container: HTMLElement,
  tier: HeroVoxelTier,
  opts?: { reducedMotion?: boolean }
): Promise<HeroVoxelSceneApi> {
  const reducedMotion = opts?.reducedMotion ?? false;
  const { gx: GRID_X, gz: GRID_Z } = getHeroVoxelGridDimensions(tier);
  const voxelCount = GRID_X * GRID_Z;

  let depthBuffer: Float32Array | null = null;
  let cameraMode = false;

  const scene = new THREE.Scene();

  const measure = () => {
    const r = container.getBoundingClientRect();
    const w = Math.max(1, Math.floor(r.width || window.innerWidth));
    const h = Math.max(1, Math.floor(r.height || window.innerHeight));
    return { w, h };
  };

  let { w: cw, h: ch } = measure();
  const camAspect = cw / ch;

  /** Wide FOV + distance tuned so the vertical wall fills typical hero frames */
  const camera = new THREE.PerspectiveCamera(58, camAspect, 0.1, 500);
  camera.position.set(0, 6.4, 40);
  camera.lookAt(0, 6.4, 0);

  const renderer = new THREE.WebGPURenderer({
    antialias: tier !== 'medium',
    alpha: true,
    powerPreference: 'high-performance',
  });
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

  await renderer.init();

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableRotate = false;
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = reducedMotion ? 0 : 0.2;
  controls.target.set(0, 6.4, 0);
  controls.minDistance = 26;
  controls.maxDistance = 68;
  controls.maxPolarAngle = Math.PI * 0.52;
  controls.minPolarAngle = Math.PI * 0.34;

  createBackground(scene);
  const { voxelMesh, instanceColorAttr, instanceColorArray } = createVoxelGrid(
    scene,
    GRID_X,
    GRID_Z,
    voxelCount
  );
  createLights(scene);

  const dummy = new THREE.Object3D();
  let lastTime = performance.now();
  let frameIdx = 0;

  const animate = () => {
    frameIdx++;
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    const ud = voxelMesh.userData as {
      basePositions: Float32Array;
      heightTargets: Float32Array;
      currentHeights: Float32Array;
    };
    const t = now * 0.001;
    const lerpSpeed = cameraMode ? 8.0 : 2.85;
    let colorDirty = false;

    const buf = cameraMode ? depthBuffer : null;
    const bufOk = buf && buf.length === voxelCount;

    for (let i = 0; i < voxelCount; i++) {
      const ix = i % GRID_X;
      const iz = Math.floor(i / GRID_X);
      const nx = ix / GRID_X;
      const nz = iz / GRID_Z;

      if (cameraMode && bufOk) {
        const raw = buf[i];
        const contrast = Math.pow(raw, DEPTH_CONTRAST);
        ud.heightTargets[i] =
          MIN_EXTRUSION + contrast * (MAX_EXTRUSION - MIN_EXTRUSION);
        writeDepthColor(instanceColorArray, i, raw);
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
          5.2,
          0.1 +
            (wave * 1.2 + ripples * 0.28) *
              (2.0 + pulse * 2.2) *
              (0.55 + chaos * 0.62)
        );
      }

      ud.currentHeights[i] +=
        (ud.heightTargets[i] - ud.currentHeights[i]) * Math.min(lerpSpeed * dt, 1.0);

      const x = ud.basePositions[i * 3];
      const z = ud.basePositions[i * 3 + 2];
      const h = Math.max(ud.currentHeights[i], 0.05);
      const zOff =
        cameraMode && bufOk ? buf[i] * Z_PUSH_FACTOR * MAX_EXTRUSION : 0;

      dummy.position.set(x, 0, z + zOff);
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      voxelMesh.setMatrixAt(i, dummy.matrix);
    }

    voxelMesh.instanceMatrix.needsUpdate = true;
    if (colorDirty) instanceColorAttr.needsUpdate = true;
    // voxelMesh.computeBoundingSphere(); // Disabled for performance; frustum culling not needed for hero background

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
    controls.autoRotate = !reducedMotion && !active;
    if (!active) {
      const udm = voxelMesh.userData as {
        heightTargets: Float32Array;
      };
      for (let i = 0; i < voxelCount; i++) udm.heightTargets[i] = 0.35;
      depthBuffer = null;
    }
    applySize();
  };

  const bindDepthBuffer = (buffer: Float32Array | null) => {
    depthBuffer = buffer;
  };

  const dispose = () => {
    ro.disconnect();
    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', applySize);
    }
    renderer.setAnimationLoop(null);
    controls.dispose();
    voxelMesh.geometry.dispose();
    if ('dispose' in voxelMesh.material && typeof (voxelMesh.material as { dispose?: () => void }).dispose === 'function') {
      (voxelMesh.material as { dispose: () => void }).dispose();
    }
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

function createVoxelGrid(
  scene: THREE.Scene,
  GRID_X: number,
  GRID_Z: number,
  voxelCount: number
) {
  const geo = new THREE.BoxGeometry(0.38, 0.38, 0.38);
  geo.translate(0, 0.19, 0);

  const instanceColorArray = new Float32Array(voxelCount * 3);
  for (let i = 0; i < voxelCount; i++) {
    instanceColorArray[i * 3 + 1] = 1.0;
    instanceColorArray[i * 3 + 2] = 1.0;
  }
  const instanceColorAttr = new THREE.InstancedBufferAttribute(instanceColorArray, 3);
  geo.setAttribute('instanceColor', instanceColorAttr);

  const mat = new THREE.MeshStandardNodeMaterial({ metalness: 0.7, roughness: 0.18 });

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

  mat.colorNode = mix(idleColor, depthColor, uCameraActive);
  mat.emissiveNode = mix(
    colorWave.mul(sin(tNode.mul(1.8).add(normX.mul(3.14).add(normZ.mul(2.0)))).mul(0.2).add(0.3)),
    depthColor.mul(float(0.35)),
    uCameraActive
  );

  const voxelMesh = new THREE.InstancedMesh(geo, mat, voxelCount);
  voxelMesh.name = 'heroVoxelGrid';

  const dummy = new THREE.Object3D();
  const spacingX = 0.45;
  const spacingZ = 0.45;
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
    dummy.scale.set(1, 0.3, 1);
    dummy.updateMatrix();
    voxelMesh.setMatrixAt(i, dummy.matrix);

    heightTargets[i] = 0.3;
    currentHeights[i] = 0.3;
  }

  voxelMesh.instanceMatrix.needsUpdate = true;
  voxelMesh.userData = { basePositions, heightTargets, currentHeights };

  const wallRoot = new THREE.Group();
  wallRoot.rotation.x = -Math.PI / 2;
  wallRoot.add(voxelMesh);
  scene.add(wallRoot);

  return { voxelMesh, instanceColorAttr, instanceColorArray };
}

function createLights(scene: THREE.Scene) {
  scene.add(new THREE.AmbientLight(0x1a1a3e, 0.8));
  const dir = new THREE.DirectionalLight(0xaabbff, 1.0);
  dir.position.set(8, 28, 32);
  scene.add(dir);
  const p1 = new THREE.PointLight(0x00ffff, 2.0, 100);
  p1.position.set(-22, 18, 18);
  scene.add(p1);
  const p2 = new THREE.PointLight(0x8800ff, 2.0, 100);
  p2.position.set(22, 18, 18);
  scene.add(p2);
}
