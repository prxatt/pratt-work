'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VERT = /* glsl */ `#version 300 es
in vec3 position;
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `#version 300 es
precision highp float;

uniform vec3 iResolution;
uniform float iTime;

uniform float uTimeScale;
uniform float uWaveSpeed;
uniform float uWaveHeight;

uniform float uWave1Freq;
uniform float uWave1Amp;
uniform float uWave2Freq;
uniform float uWave2Amp;
uniform float uWave3FreqX;
uniform float uWave3FreqZ;
uniform float uWave3Amp;

uniform float uNoiseAmount;
uniform float uFoldingOffset;
uniform float uStepBase;
uniform float uGlowIntensity;
uniform float uGlowSpread;

uniform float uGradeLift;
uniform float uGradeExposure;

out vec4 fragColor;

float generateFineNoise(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 8.6231);
  p3 += dot(p3, p3.yzx + 67.92);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;

  vec3 rayDir = normalize(vec3(uv, 1.0));
  vec4 finalColor = vec4(0.0);
  float totalDistance = 0.0;
  float timeElapsed = iTime * uTimeScale;
  float pixelNoise = generateFineNoise(fragCoord) * uNoiseAmount;

  for (int i = 0; i < 38; i++) {
    vec3 currentPos = rayDir * totalDistance;
    currentPos.z -= 2.0;

    float wTime = timeElapsed * uWaveSpeed;
    float waveHeight = (
      sin(currentPos.x * uWave1Freq + wTime) * uWave1Amp +
      sin(currentPos.z * uWave2Freq - wTime * 0.6) * uWave2Amp +
      sin((currentPos.x * uWave3FreqX) - (currentPos.z * uWave3FreqZ) + (wTime * 1.6)) * uWave3Amp
    ) * uWaveHeight;

    float distToWave = abs(currentPos.y - waveHeight);
    currentPos /= uFoldingOffset;

    float stepSize = min(distToWave - 0.080, pixelNoise) + uStepBase;
    totalDistance += stepSize;

    float patternX = sin(currentPos.x + cos(currentPos.y) * cos(currentPos.z));
    float patternY = sin(currentPos.z + sin(currentPos.y) * cos(currentPos.x + timeElapsed));
    float basePattern = smoothstep(0.5, 0.7, patternX * patternY);

    float blendFactor = 0.15 / (distToWave * distToWave + 0.01);
    float mixedPattern = mix(basePattern, 1.0, blendFactor);

    float glowIntensity = uGlowIntensity / (uGlowSpread + stepSize);
    float distanceFade = smoothstep(36.5, 7.3, totalDistance);
    vec3 paletteColor = 1.0 + cos(totalDistance * 3.0 + vec3(0.0, 1.0, 2.0));

    finalColor.rgb += glowIntensity * mixedPattern * distanceFade * paletteColor;
  }

  float dither = (generateFineNoise(fragCoord + vec2(12.34, 56.78)) - 0.5) / 128.0;
  finalColor.rgb += vec3(dither);

  vec3 graded = finalColor.rgb * uGradeExposure;
  graded = pow(max(graded, vec3(0.0)), vec3(0.92));
  vec3 warmLift = vec3(0.96, 0.96, 0.94);
  graded = mix(graded, warmLift * length(graded) * 0.35, uGradeLift);

  fragColor = vec4(graded, 1.0);
}
`;

export type AboutHeroRayFieldProps = {
  dpr: number;
  reducedMotion: boolean;
  lowEnd: boolean;
};

export default function AboutHeroRayField({ dpr, reducedMotion, lowEnd }: AboutHeroRayFieldProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(dpr, lowEnd ? 1 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0x000000, 1);
    host.appendChild(renderer.domElement);

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3() },
      uTimeScale: { value: reducedMotion ? 0.22 : 0.5 },
      uWaveSpeed: { value: 1.0 },
      uWaveHeight: { value: 1.0 },
      uWave1Freq: { value: 4.8 },
      uWave1Amp: { value: 0.038 },
      uWave2Freq: { value: 0.3 },
      uWave2Amp: { value: -0.09 },
      uWave3FreqX: { value: -0.6 },
      uWave3FreqZ: { value: -0.7 },
      uWave3Amp: { value: 0.12 },
      uNoiseAmount: { value: lowEnd ? 0.003 : 0.004 },
      uFoldingOffset: { value: 9.291 },
      uStepBase: { value: lowEnd ? 0.16 : 0.146 },
      uGlowIntensity: { value: lowEnd ? 0.0072 : 0.0085 },
      uGlowSpread: { value: 5.1 },
      uGradeLift: { value: lowEnd ? 0.42 : 0.48 },
      uGradeExposure: { value: lowEnd ? 0.032 : 0.038 },
    };

    const material = new THREE.RawShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();
    let raf = 0;

    const updateResolution = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      renderer.setSize(w, h, false);
      const pr = renderer.getPixelRatio();
      uniforms.iResolution.value.set(w * pr, h * pr, 1);
    };

    const ro = new ResizeObserver(() => updateResolution());
    ro.observe(host);
    updateResolution();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      uniforms.iTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [dpr, reducedMotion, lowEnd]);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 h-full w-full [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full"
    />
  );
}
