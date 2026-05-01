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
  streakLen: number;
  streakAngle: number;
  streakOpacity: number;
};

const HERO_TEXT = 'MORE ABOUT ME';

const PALETTE = [
  '#6E78FF',
  '#7A5CFF',
  '#F6A74A',
  '#F7773C',
  '#FF7C5E',
  '#3E68FF',
  '#F9B36E',
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function detectLowPowerClient(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return cores <= 4 || memory <= 4;
}

function generateVoxelData(text: string, isMobile: boolean): Voxel[] {
  const map: Record<string, string[]> = {
    M: ['10001', '11011', '10101', '10001', '10001', '10001', '10001'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
    U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
    T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  };

  const cell = isMobile ? 0.15 : 0.13;
  const wordGap = 1.8;
  const charGap = 0.95;
  const rows = 7;
  const chars = text.split('');

  let cursor = 0;
  const positions: { x: number; y: number; xNorm: number }[] = [];
  const totalWidth = chars.reduce((acc, ch) => {
    if (ch === ' ') return acc + wordGap;
    return acc + 5 + charGap;
  }, 0);

  chars.forEach((ch) => {
    const pattern = map[ch] ?? map[' '];
    if (ch === ' ') {
      cursor += wordGap;
      return;
    }
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        if (pattern[row][col] !== '1') continue;
        const x = (cursor + col - totalWidth / 2) * cell;
        const y = ((rows - 1) / 2 - row) * cell;
        const xNorm = (cursor + col) / totalWidth;
        positions.push({ x, y, xNorm });
      }
    }
    cursor += 5 + charGap;
  });

  return positions.map(({ x, y, xNorm }) => {
    const useAccent = Math.random() < 0.72;
    const colorIndex = Math.floor(clamp(xNorm * (PALETTE.length - 1) + Math.random() * 1.5, 0, PALETTE.length - 1));
    const colorHex = useAccent ? PALETTE[colorIndex] : '#EDEFFF';
    return {
      position: new THREE.Vector3(x, y, 0),
      color: new THREE.Color(colorHex),
      delay: xNorm * 0.85 + Math.random() * 0.08,
      depth: 0.16 + Math.random() * 0.9,
      streakLen: 0.9 + Math.random() * 2.4,
      streakAngle: -0.34 + (Math.random() - 0.5) * 0.12,
      streakOpacity: 0.12 + Math.random() * 0.28,
    };
  });
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
    material.opacity = 0.07 + Math.sin(state.clock.elapsedTime * 0.25) * 0.015;
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
      <pointsMaterial color="#DDE5FF" size={isMobile ? 0.016 : 0.012} transparent opacity={0.08} />
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
  const streakRef = useRef<THREE.InstancedMesh>(null);
  const tempObj = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;
    voxels.forEach((voxel, index) => {
      meshRef.current?.setColorAt(index, voxel.color);
      streakRef.current?.setColorAt(index, voxel.color);
    });
    meshRef.current.instanceColor!.needsUpdate = true;
    if (streakRef.current?.instanceColor) {
      streakRef.current.instanceColor.needsUpdate = true;
    }
  }, [voxels]);

  useFrame((state) => {
    const mesh = meshRef.current;
    const streakMesh = streakRef.current;
    if (!mesh || !streakMesh) return;

    const t = progress.current;
    const pulse = 0.96 + Math.sin(state.clock.elapsedTime * 0.9) * 0.04;

    for (let i = 0; i < voxels.length; i += 1) {
      const voxel = voxels[i];
      const local = clamp((t - voxel.delay) / 0.22, 0, 1);
      const eased = local * local * (3 - 2 * local);

      tempObj.position.set(
        voxel.position.x,
        voxel.position.y,
        (1 - eased) * voxel.depth - (isMobile ? 0 : 0.02),
      );

      const base = isMobile ? 0.085 : 0.082;
      const scale = base * (0.3 + eased * 0.7) * pulse;
      tempObj.scale.set(scale, scale, isMobile ? 0.06 : 0.08);
      tempObj.rotation.set(0, 0, 0);
      tempObj.updateMatrix();
      mesh.setMatrixAt(i, tempObj.matrix);

      tempObj.position.set(
        voxel.position.x + 0.03,
        voxel.position.y - 0.2 - voxel.streakLen * 0.35,
        -0.55,
      );
      tempObj.scale.set(isMobile ? 0.06 : 0.07, voxel.streakLen * (0.2 + eased * 0.8), 0.018);
      tempObj.rotation.set(0, 0, voxel.streakAngle);
      tempObj.updateMatrix();
      streakMesh.setMatrixAt(i, tempObj.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    streakMesh.instanceMatrix.needsUpdate = true;
  });

  if (!voxels.length) return null;

  return (
    <group>
      <instancedMesh ref={streakRef} args={[undefined, undefined, voxels.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          vertexColors
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
      <instancedMesh ref={meshRef} args={[undefined, undefined, voxels.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          vertexColors
          transparent
          opacity={0.95}
          roughness={0.16}
          metalness={0.08}
          transmission={0.36}
          thickness={0.8}
        />
      </instancedMesh>
    </group>
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
      <color attach="background" args={['#020202']} />
      <fog attach="fog" args={['#030303', 8, 18]} />

      <DotGrid isMobile={isMobile} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[-3, 3, 5]} intensity={0.75} color="#C9D4FF" />
      <directionalLight position={[4, 2, 3]} intensity={1.2} color="#FFB36D" />

      <group ref={groupRef}>
        <VoxelText voxels={voxels} progress={progress} isMobile={isMobile} />
      </group>

      <mesh ref={sunRef} position={[4, 1.5, 2]}>
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshBasicMaterial color="#FFB86E" />
      </mesh>

      {!isMobile && !reducedMotion && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.05} luminanceSmoothing={0.2} intensity={1.3} />
          <GodRays
            sun={sunRef}
            blendFunction={BlendFunction.NORMAL}
            samples={52}
            density={0.95}
            decay={0.96}
            weight={0.72}
            exposure={0.42}
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
    progress.current = 0;
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
        <div className="relative min-h-[100dvh] w-full bg-[#050505]">
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                'radial-gradient(circle at center, rgba(255,255,255,0.6) 0.6px, transparent 0.6px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
            <h1 className="font-display text-[clamp(4.4rem,18vw,13rem)] leading-[0.88] tracking-tight text-[#F2F2F0]">
              {HERO_TEXT}
            </h1>
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

        </>
      )}
    </section>
  );
}

