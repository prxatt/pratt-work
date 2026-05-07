'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/** Ported from reference sketch — defaults frozen (no runtime GUI). */
const SETTINGS = {
  timeScale: 0.42,
  waveSpeed: 0.84,
  waveHeight: 0.92,
  wave1Freq: 4.2,
  wave1Amp: 0.032,
  wave2Freq: 0.24,
  wave2Amp: -0.07,
  wave3FreqX: -0.52,
  wave3FreqZ: -0.58,
  wave3Amp: 0.094,
  noiseAmount: 0.0022,
  foldingOffset: 9.291,
  stepBase: 0.146,
  glowIntensity: 0.0074,
  glowSpread: 5.8,
} as const;

const vertexShader = /* glsl */ `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
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

    // Cohesive site palette: neutral white field with a restrained cool accent.
    vec3 warmCore = vec3(0.93, 0.93, 0.91);
    vec3 coolAccent = vec3(0.48, 0.52, 0.84);
    float accentMix = smoothstep(0.12, 0.9, mixedPattern) * (0.42 + 0.58 * distanceFade);
    vec3 paletteColor = mix(warmCore, coolAccent, accentMix * 0.42);

    finalColor.rgb += glowIntensity * mixedPattern * distanceFade * paletteColor;
  }

  float dither = (generateFineNoise(fragCoord + vec2(12.34, 56.78)) - 0.5) / 192.0;
  finalColor.rgb += vec3(dither);

  gl_FragColor = vec4(finalColor.rgb, 1.0);
}
`;

export type AboutHeroRaymarchProps = {
  className?: string;
  /** Passed from parent (already capped for device). */
  dpr?: number;
  /** Scales elapsed time only (e.g. &lt; 1 for reduced motion). */
  motionScale?: number;
};

export default function AboutHeroRaymarch({
  className,
  dpr = 1,
  motionScale = 1,
}: AboutHeroRaymarchProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;';

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3() },
      uTimeScale: { value: SETTINGS.timeScale },
      uWaveSpeed: { value: SETTINGS.waveSpeed },
      uWaveHeight: { value: SETTINGS.waveHeight },
      uWave1Freq: { value: SETTINGS.wave1Freq },
      uWave1Amp: { value: SETTINGS.wave1Amp },
      uWave2Freq: { value: SETTINGS.wave2Freq },
      uWave2Amp: { value: SETTINGS.wave2Amp },
      uWave3FreqX: { value: SETTINGS.wave3FreqX },
      uWave3FreqZ: { value: SETTINGS.wave3FreqZ },
      uWave3Amp: { value: SETTINGS.wave3Amp },
      uNoiseAmount: { value: SETTINGS.noiseAmount },
      uFoldingOffset: { value: SETTINGS.foldingOffset },
      uStepBase: { value: SETTINGS.stepBase },
      uGlowIntensity: { value: SETTINGS.glowIntensity },
      uGlowSpread: { value: SETTINGS.glowSpread },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();
    let raf = 0;

    const updateResolution = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w < 1 || h < 1) return;
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      const pr = renderer.getPixelRatio();
      uniforms.iResolution.value.set(w * pr, h * pr, 1);
    };

    const ro = new ResizeObserver(() => updateResolution());
    ro.observe(container);
    updateResolution();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      uniforms.iTime.value = clock.getElapsedTime() * motionScale;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      material.dispose();
      geometry.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [dpr, motionScale]);

  return <div ref={containerRef} className={className} />;
}
