'use client';

import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { useEffect, useRef, useState, useCallback } from 'react';
import './LineWaves.css';

// Pre-computed hex to RGB conversions for performance
const hexCache = new Map<string, number[]>();

function hexToVec3(hex: string): number[] {
  if (hexCache.has(hex)) return hexCache.get(hex)!;
  const h = hex.replace('#', '');
  const result = [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  ];
  hexCache.set(hex, result);
  return result;
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uInnerLines;
uniform float uOuterLines;
uniform float uWarpIntensity;
uniform float uRotation;
uniform float uEdgeFadeWidth;
uniform float uColorCycleSpeed;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;

#define HALF_PI 1.5707963

float hashF(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

float smoothNoise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hashF(i), hashF(i + 1.0), u);
}

float displaceA(float coord, float t) {
  float result = sin(coord * 2.123) * 0.2;
  result += sin(coord * 3.234 + t * 4.345) * 0.1;
  result += sin(coord * 0.589 + t * 0.934) * 0.5;
  return result;
}

float displaceB(float coord, float t) {
  float result = sin(coord * 1.345) * 0.3;
  result += sin(coord * 2.734 + t * 3.345) * 0.2;
  result += sin(coord * 0.189 + t * 0.934) * 0.3;
  return result;
}

vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

void main() {
  vec2 coords = gl_FragCoord.xy / uResolution.xy;
  coords = coords * 2.0 - 1.0;
  coords = rotate2D(coords, uRotation);

  float halfT = uTime * uSpeed * 0.5;
  float fullT = uTime * uSpeed;

  float mouseWarp = 0.0;
  if (uEnableMouse) {
    vec2 mPos = rotate2D(uMouse * 2.0 - 1.0, uRotation);
    float mDist = length(coords - mPos);
    mouseWarp = uMouseInfluence * exp(-mDist * mDist * 4.0);
  }

  float warpAx = coords.x + displaceA(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpAy = coords.y - displaceA(coords.x * cos(fullT) * 1.235, halfT) * uWarpIntensity;
  float warpBx = coords.x + displaceB(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpBy = coords.y - displaceB(coords.x * sin(fullT) * 1.235, halfT) * uWarpIntensity;

  vec2 fieldA = vec2(warpAx, warpAy);
  vec2 fieldB = vec2(warpBx, warpBy);
  vec2 blended = mix(fieldA, fieldB, mix(fieldA, fieldB, 0.5));

  float fadeTop = smoothstep(uEdgeFadeWidth, uEdgeFadeWidth + 0.4, blended.y);
  float fadeBottom = smoothstep(-uEdgeFadeWidth, -(uEdgeFadeWidth + 0.4), blended.y);
  float vMask = 1.0 - max(fadeTop, fadeBottom);

  float tileCount = mix(uOuterLines, uInnerLines, vMask);
  float scaledY = blended.y * tileCount;
  float nY = smoothNoise(abs(scaledY));

  float ridge = pow(
    step(abs(nY - blended.x) * 2.0, HALF_PI) * cos(2.0 * (nY - blended.x)),
    5.0
  );

  float lines = 0.0;
  for (float i = 1.0; i < 3.0; i += 1.0) {
    lines += pow(max(fract(scaledY), fract(-scaledY)), i * 2.0);
  }

  float pattern = vMask * lines;

  float cycleT = fullT * uColorCycleSpeed;
  float rChannel = (pattern + lines * ridge) * (cos(blended.y + cycleT * 0.234) * 0.5 + 1.0);
  float gChannel = (pattern + vMask * ridge) * (sin(blended.x + cycleT * 1.745) * 0.5 + 1.0);
  float bChannel = (pattern + lines * ridge) * (cos(blended.x + cycleT * 0.534) * 0.5 + 1.0);

  vec3 col = (rChannel * uColor1 + gChannel * uColor2 + bChannel * uColor3) * uBrightness;
  float alpha = clamp(length(col), 0.0, 1.0);

  gl_FragColor = vec4(col, alpha);
}
`;

interface LineWavesProps {
  speed?: number;
  innerLineCount?: number;
  outerLineCount?: number;
  warpIntensity?: number;
  rotation?: number;
  edgeFadeWidth?: number;
  colorCycleSpeed?: number;
  brightness?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  enableMouseInteraction?: boolean;
  mouseInfluence?: number;
  reducedMotion?: boolean;
}

export const LineWaves = ({
  speed = 0.3,
  innerLineCount = 24.0,
  outerLineCount = 28.0,
  warpIntensity = 1.0,
  rotation = -45,
  edgeFadeWidth = 0.0,
  colorCycleSpeed = 1.0,
  brightness = 0.2,
  color1 = '#F2F2F0',
  color2 = '#8A8A85',
  color3 = '#6366f1',
  enableMouseInteraction = true,
  mouseInfluence = 2.0,
  reducedMotion = false
}: LineWavesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.matchMedia('(pointer: coarse)').matches;
  });

  // Intersection Observer for visibility-based rendering
  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;
    
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1, rootMargin: '50px' }
    );
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Skip WebGL for reduced motion, mobile, or when not visible
    if (reducedMotion || isMobile || !isVisible || !containerRef.current) {
      setIsWebGLSupported(false);
      return;
    }

    const container = containerRef.current;
    
    // Check WebGL support
    const testCanvas = document.createElement('canvas');
    const glTest = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    if (!glTest) {
      setIsWebGLSupported(false);
      return;
    }

    let renderer: Renderer;
    let program: Program;
    let animationFrameId: number;
    let currentMouse = [0.5, 0.5];
    let targetMouse = [0.5, 0.5];
    let isActive = true;

    try {
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 1.5), // Cap DPR for performance
      });
      
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      gl.canvas.style.display = 'block';
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';

      // Disable mouse interaction on mobile/touch or when reduced motion
      const effectiveMouseInteraction = enableMouseInteraction && !isMobile && !reducedMotion;

      function handleMouseMove(e: MouseEvent) {
        if (!effectiveMouseInteraction) return;
        const rect = gl.canvas.getBoundingClientRect();
        targetMouse = [
          (e.clientX - rect.left) / rect.width,
          1.0 - (e.clientY - rect.top) / rect.height
        ];
      }

      function handleMouseLeave() {
        targetMouse = [0.5, 0.5];
      }

      function resize() {
        if (!container || !isActive) return;
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        if (program) {
          program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];
        }
      }

      window.addEventListener('resize', resize, { passive: true });
      resize();

      const geometry = new Triangle(gl);
      const rotationRad = (rotation * Math.PI) / 180;
      
      program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },
          uSpeed: { value: speed * (reducedMotion ? 0.1 : 1) },
          uInnerLines: { value: innerLineCount },
          uOuterLines: { value: outerLineCount },
          uWarpIntensity: { value: warpIntensity },
          uRotation: { value: rotationRad },
          uEdgeFadeWidth: { value: edgeFadeWidth },
          uColorCycleSpeed: { value: colorCycleSpeed * (reducedMotion ? 0.1 : 1) },
          uBrightness: { value: brightness },
          uColor1: { value: hexToVec3(color1) },
          uColor2: { value: hexToVec3(color2) },
          uColor3: { value: hexToVec3(color3) },
          uMouse: { value: new Float32Array([0.5, 0.5]) },
          uMouseInfluence: { value: mouseInfluence },
          uEnableMouse: { value: effectiveMouseInteraction }
        }
      });

      const mesh = new Mesh(gl, { geometry, program });
      container.appendChild(gl.canvas);

      if (effectiveMouseInteraction) {
        gl.canvas.addEventListener('mousemove', handleMouseMove, { passive: true });
        gl.canvas.addEventListener('mouseleave', handleMouseLeave, { passive: true });
      }

      // Adaptive frame capping based on device performance
      let lastFrameTime = 0;
      const baseFPS = reducedMotion ? 10 : isMobile ? 20 : 30;
      let targetFPS = baseFPS;
      let frameInterval = 1000 / targetFPS;
      let frameCount = 0;
      let lastCheck = 0;

      function update(time: number) {
        if (!isActive) return;
        
        animationFrameId = requestAnimationFrame(update);
        
        // Adaptive quality: reduce FPS if struggling
        frameCount++;
        if (time - lastCheck > 5000) { // Check every 5 seconds
          if (frameCount < targetFPS * 4) { // If underperforming
            targetFPS = Math.max(10, targetFPS - 5);
            frameInterval = 1000 / targetFPS;
          }
          frameCount = 0;
          lastCheck = time;
        }
        
        // Frame skipping
        const delta = time - lastFrameTime;
        if (delta < frameInterval) return;
        lastFrameTime = time - (delta % frameInterval);

        program.uniforms.uTime.value = time * 0.001;

        if (effectiveMouseInteraction) {
          currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
          currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
          program.uniforms.uMouse.value[0] = currentMouse[0];
          program.uniforms.uMouse.value[1] = currentMouse[1];
        }

        renderer.render({ scene: mesh });
      }
      
      animationFrameId = requestAnimationFrame(update);

      // Cleanup
      return () => {
        isActive = false;
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', resize);
        
        if (effectiveMouseInteraction) {
          gl.canvas.removeEventListener('mousemove', handleMouseMove);
          gl.canvas.removeEventListener('mouseleave', handleMouseLeave);
        }
        
        if (container.contains(gl.canvas)) {
          container.removeChild(gl.canvas);
        }
        
        // Lose WebGL context
        const ext = gl.getExtension('WEBGL_lose_context');
        ext?.loseContext();
      };
    } catch (error) {
      console.warn('LineWaves WebGL initialization failed:', error);
      setIsWebGLSupported(false);
      return;
    }
  }, [
    speed, innerLineCount, outerLineCount, warpIntensity, rotation,
    edgeFadeWidth, colorCycleSpeed, brightness, color1, color2, color3,
    enableMouseInteraction, mouseInfluence, reducedMotion, isMobile, isVisible
  ]);

  // Fallback for no WebGL or reduced motion
  if (!isWebGLSupported || reducedMotion) {
    return (
      <div 
        ref={containerRef} 
        className="line-waves-container"
        style={{
          background: reducedMotion 
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, transparent 50%, rgba(242, 242, 240, 0.03) 100%)'
            : 'linear-gradient(135deg, rgba(13, 13, 13, 1) 0%, rgba(20, 20, 20, 1) 50%, rgba(13, 13, 13, 1) 100%)'
        }}
      />
    );
  }

  return <div ref={containerRef} className="line-waves-container" />;
};

export default LineWaves;
