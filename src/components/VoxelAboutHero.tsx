'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, GodRays } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

type Voxel = {
  position: THREE.Vector3;
  color: THREE.Color;
  delay: number;
  depth: number;
};

const HERO_TEXT = 'MORE ABOUT ME';
const TAGLINE = 'PRODUCER. ARCHITECT. THINKER.';

const PALETTE = [
  '#74A8FF',
  '#8B5CF6',
  '#F59E0B',
  '#F97316',
  '#22D3EE',
  '#A855F7',
  '#F43F5E',
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function detectLowPowerClient(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return cores <= 4 || memory <= 4;
}

function generateVoxelData(text: string, isMobile: boolean): Voxel[] {
  if (typeof document === 'undefined') return [];

  const canvas = document.createElement('canvas');
  canvas.width = isMobile ? 900 : 1600;
  canvas.height = isMobile ? 300 : 420;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${isMobile ? 160 : 230}px Inter, Helvetica, Arial, sans-serif`;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const sampleStep = isMobile ? 8 : 6;
  const scale = isMobile ? 0.018 : 0.014;
  const halfW = canvas.width / 2;
  const halfH = canvas.height / 2;

  const voxels: Voxel[] = [];

  for (let y = 0; y < canvas.height; y += sampleStep) {
    for (let x = 0; x < canvas.width; x += sampleStep) {
      const alpha = imageData[(y * canvas.width + x) * 4 + 3];
      if (alpha < 160) continue;

      const nx = (x - halfW) * scale;
      const ny = (halfH - y) * scale;
      const horizontalProgress = (x / canvas.width) * 0.9;
      const depth = 0.2 + Math.random() * 1.8;
      const useAccent = Math.random() < 0.32;
      const colorHex = useAccent
        ? PALETTE[Math.floor(Math.random() * PALETTE.length)]
        : '#E8ECFF';

      voxels.push({
        position: new THREE.Vector3(nx, ny, 0),
        color: new THREE.Color(colorHex),
        delay: horizontalProgress + Math.random() * 0.18,
        depth,
      });
    }
  }

  return voxels;
}

function DotGrid({ isMobile }: { isMobile: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, count } = useMemo(() => {
    const spacing = isMobile ? 0.44 : 0.34;
    const width = isMobile ? 56 : 70;
    const height = isMobile ? 36 : 44;
    const arr = new Float32Array(width * height * 3);
    let ptr = 0;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        arr[ptr++] = (x - width / 2) * spacing;
        arr[ptr++] = (y - height / 2) * spacing;
        arr[ptr++] = -6;
      }
    }

    return { positions: arr, count: width * height };
  }, [isMobile]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.opacity = 0.14 + Math.sin(state.clock.elapsedTime * 0.35) * 0.025;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          itemSize={3}
          array={positions}
        />
      </bufferGeometry>
      <pointsMaterial color="#DDE5FF" size={isMobile ? 0.018 : 0.014} transparent opacity={0.14} />
    </points>
  );
}

function VoxelText({
  voxels,
  progress,
  isMobile,
}: {
  voxels: Voxel[];
  progress: React.MutableRefObject<number>;
  isMobile: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObj = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;
    voxels.forEach((voxel, index) => {
      meshRef.current?.setColorAt(index, voxel.color);
    });
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [voxels]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const t = progress.current;
    const pulse = 0.96 + Math.sin(state.clock.elapsedTime * 0.9) * 0.04;

    for (let i = 0; i < voxels.length; i += 1) {
      const voxel = voxels[i];
      const local = clamp((t - voxel.delay) / 0.22, 0, 1);
      const eased = local * local * (3 - 2 * local);

      tempObj.position.set(
        voxel.position.x,
        voxel.position.y,
        (1 - eased) * voxel.depth - (isMobile ? 0 : 0.04),
      );

      const base = isMobile ? 0.06 : 0.072;
      const scale = base * (0.3 + eased * 0.7) * pulse;
      tempObj.scale.setScalar(scale);
      tempObj.rotation.set(0, 0, 0);
      tempObj.updateMatrix();
      mesh.setMatrixAt(i, tempObj.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  if (!voxels.length) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, voxels.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial
        vertexColors
        transparent
        opacity={0.9}
        roughness={0.2}
        metalness={0.12}
        transmission={0.28}
        thickness={0.7}
      />
    </instancedMesh>
  );
}

function Scene({
  voxels,
  progress,
  isMobile,
  reducedMotion,
}: {
  voxels: Voxel[];
  progress: React.MutableRefObject<number>;
  isMobile: boolean;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const { camera, pointer } = useThree();

  useFrame((state, delta) => {
    const targetX = pointer.x * 0.35;
    const targetY = pointer.y * 0.18;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 3.2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 3.2, delta);
    camera.lookAt(0, 0, 0);

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        pointer.x * 0.12,
        3,
        delta,
      );
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        -pointer.y * 0.08,
        3,
        delta,
      );
    }

    if (sunRef.current && !reducedMotion) {
      sunRef.current.position.x = 4 + Math.sin(state.clock.elapsedTime * 0.45) * 0.8 + pointer.x * 0.6;
      sunRef.current.position.y = 1.3 + Math.cos(state.clock.elapsedTime * 0.35) * 0.5 + pointer.y * 0.35;
    }
  });

  return (
    <>
      <color attach="background" args={['#070707']} />
      <fog attach="fog" args={['#070707', 8, 20]} />

      <DotGrid isMobile={isMobile} />

      <ambientLight intensity={0.48} />
      <directionalLight position={[-3, 3, 5]} intensity={0.9} color="#DDE5FF" />
      <directionalLight position={[4, 2, 3]} intensity={1.05} color="#8AB1FF" />

      <group ref={groupRef}>
        <VoxelText voxels={voxels} progress={progress} isMobile={isMobile} />
      </group>

      <mesh ref={sunRef} position={[4, 1.5, 2]}>
        <sphereGeometry args={[0.36, 24, 24]} />
        <meshBasicMaterial color="#F7C27A" />
      </mesh>

      {!isMobile && !reducedMotion && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.08} luminanceSmoothing={0.35} intensity={0.9} />
          <GodRays
            sun={sunRef}
            blendFunction={BlendFunction.NORMAL}
            samples={48}
            density={0.92}
            decay={0.95}
            weight={0.6}
            exposure={0.34}
            clampMax={1}
            blur
          />
        </EffectComposer>
      )}
    </>
  );
}

export function VoxelAboutHero() {
  const containerRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mq = window.matchMedia('(max-width: 768px)');
    const rmq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncFlags = () => {
      setIsMobile(mq.matches);
      setReducedMotion(rmq.matches);
      setLowPower(detectLowPowerClient());
    };

    syncFlags();
    mq.addEventListener('change', syncFlags);
    rmq.addEventListener('change', syncFlags);

    return () => {
      mq.removeEventListener('change', syncFlags);
      rmq.removeEventListener('change', syncFlags);
    };
  }, []);

  const voxels = useMemo(() => generateVoxelData(HERO_TEXT, isMobile), [isMobile]);
  const useFallback = reducedMotion || lowPower;

  useEffect(() => {
    if (!containerRef.current || useFallback) return undefined;

    const state = { value: 0 };
    const tween = gsap.to(state, {
      value: 1,
      duration: 2.2,
      ease: 'power3.out',
      onUpdate: () => {
        progress.current = state.value;
      },
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 76%',
        once: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [useFallback]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0D0D0D]"
      aria-label="More about me voxel hero"
    >
      {useFallback ? (
        <div className="relative min-h-[100dvh] w-full bg-[#090909]">
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                'radial-gradient(circle at center, rgba(255,255,255,0.6) 0.6px, transparent 0.6px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
            <h1 className="font-display text-[clamp(4.2rem,17vw,13rem)] leading-[0.85] tracking-tight text-[#F2F2F0]">
              {HERO_TEXT}
            </h1>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-[#F2F2F0]/85">
              {TAGLINE}
            </p>
          </div>
        </div>
      ) : (
        <>
          {!ready && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0D0D0D]">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#F2F2F0]/75">
                Loading scene...
              </span>
            </div>
          )}

          <Canvas
            dpr={[1, isMobile ? 1.2 : 1.5]}
            camera={{ position: [0, 0, 7], fov: 44 }}
            gl={{ antialias: !isMobile, powerPreference: 'high-performance' }}
            onCreated={() => setReady(true)}
          >
            <Suspense fallback={null}>
              <Scene voxels={voxels} progress={progress} isMobile={isMobile} reducedMotion={reducedMotion} />
            </Suspense>
          </Canvas>

          <div className="pointer-events-none absolute inset-x-0 bottom-[10vh] z-10 px-6 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#F2F2F0]/85">
              {TAGLINE}
            </p>
          </div>
        </>
      )}
    </section>
  );
}

