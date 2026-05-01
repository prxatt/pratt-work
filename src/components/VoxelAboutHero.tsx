'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
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

const StreakMaterial = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
  uniforms: {
    uOpacity: { value: 0.38 },
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vColor;

    void main() {
      vUv = uv;
      vColor = color;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vColor;

    uniform float uOpacity;
    uniform float uTime;

    // simple hash noise (cheap + stable)
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      vec2 u = f * f * (3.0 - 2.0 * f);

      return mix(a, b, u.x) +
             (c - a) * u.y * (1.0 - u.x) +
             (d - b) * u.x * u.y;
    }

    void main() {
      vec2 uv = vUv;

      // 🔥 heat shimmer (subtle horizontal distortion)
      float n = noise(vec2(uv.y * 8.0, uTime * 0.6));
      uv.x += (n - 0.5) * 0.08;

      // 🎯 vertical fade (core look)
      float fade = smoothstep(0.0, 0.25, uv.y);
      fade *= 1.0 - smoothstep(0.65, 1.0, uv.y);

      // 🌈 gradient shift along streak
      vec3 warm = vec3(1.0, 0.6, 0.25);
      vec3 cool = vColor;

      vec3 grad = mix(warm, cool, uv.y);

      // 🔆 core intensity boost
      float core = smoothstep(0.0, 0.4, uv.y);

      vec3 color = grad * (0.7 + core * 0.9);

      float alpha = fade * uOpacity;

      gl_FragColor = vec4(color, alpha);
    }
  `,
});

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

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
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} itemSize={3} />
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
  const tempColor = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    if (!meshRef.current) return;
    voxels.forEach((voxel, index) => {
      tempColor.copy(voxel.color).multiplyScalar(1.35);
      meshRef.current?.setColorAt(index, tempColor);
      streakRef.current?.setColorAt(index, tempColor);
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
    const streakMaterial = streakMesh.material as THREE.ShaderMaterial;
    if (streakMaterial.uniforms?.uTime) {
      streakMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    }

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
      const stretch = voxel.streakLen * (1.4 + eased * 2.6);
      tempObj.scale.set(
        isMobile ? 0.03 : 0.035,
        stretch,
        0.006,
      );
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
        <primitive object={StreakMaterial} attach="material" />
      </instancedMesh>
      <instancedMesh ref={meshRef} args={[undefined, undefined, voxels.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          vertexColors
          transparent
          opacity={0.95}
          roughness={0.1}
          metalness={0.05}
          transmission={0.25}
          thickness={0.6}
          emissive="#ffffff"
          emissiveIntensity={1.4}
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
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
    }

  });

  return (
    <>
      <color attach="background" args={['#020202']} />
      <fog attach="fog" args={['#000000', 14, 28]} />

      <DotGrid isMobile={isMobile} />

      <ambientLight intensity={0.08} />
      <directionalLight position={[-3, 3, 5]} intensity={0.75} color="#C9D4FF" />
      <directionalLight position={[4, 2, 3]} intensity={1.2} color="#FFB36D" />

      <group ref={groupRef}>
        <VoxelText voxels={voxels} progress={progress} isMobile={isMobile} />
      </group>

      {!isMobile && !reducedMotion && (
        <EffectComposer multisampling={0}>
          <Bloom
            luminanceThreshold={0.02}
            luminanceSmoothing={0.18}
            intensity={2.4}
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

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mq = window.matchMedia('(max-width: 768px)');
    const rmq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncFlags = () => {
      setIsMobile(mq.matches);
      setReducedMotion(rmq.matches);
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
  const useFallback = reducedMotion;

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
      className="relative min-h-[100dvh] w-full shrink-0 overflow-hidden bg-[#0D0D0D]"
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
            style={{ position: 'absolute', inset: 0 }}
            dpr={[1, isMobile ? 1.2 : 1.5]}
            camera={{ position: [0, 0.1, 6.2], fov: 42 }}
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

