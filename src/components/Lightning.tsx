'use client';

import { useRef, useEffect, useCallback } from 'react';
import './Lightning.css';

interface LightningProps {
  hue?: number;
  xOffset?: number;
  speed?: number;
  intensity?: number;
  size?: number;
  className?: string;
}

const Lightning = ({ 
  hue = 189, 
  xOffset = 0, 
  speed = 1.2, 
  intensity = 0.6, 
  size = 1,
  className = ''
}: LightningProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<{
    iResolution: WebGLUniformLocation | null;
    iTime: WebGLUniformLocation | null;
    uHue: WebGLUniformLocation | null;
    uXOffset: WebGLUniformLocation | null;
    uSpeed: WebGLUniformLocation | null;
    uIntensity: WebGLUniformLocation | null;
    uSize: WebGLUniformLocation | null;
  } | null>(null);
  const startTimeRef = useRef<number>(0);
  const isVisibleRef = useRef(true);
  const isMobileRef = useRef(false);
  const frameCountRef = useRef(0);

  // Check mobile once
  useEffect(() => {
    isMobileRef.current = window.matchMedia('(pointer: coarse)').matches;
  }, []);

  // Visibility observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || glRef.current) return;

    const dpr = Math.min(window.devicePixelRatio || 1, isMobileRef.current ? 1.5 : 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;

    const gl = canvas.getContext('webgl', { 
      alpha: true, 
      premultipliedAlpha: false, 
      antialias: false,
      powerPreference: 'high-performance'
    });
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    glRef.current = gl;

    const vertexShaderSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float uHue;
      uniform float uXOffset;
      uniform float uSpeed;
      uniform float uIntensity;
      uniform float uSize;
      
      #define OCTAVE_COUNT 8

      vec3 hsv2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
          return c.z * mix(vec3(1.0), rgb, c.y);
      }

      float hash11(float p) {
          p = fract(p * .1031);
          p *= p + 33.33;
          p *= p + p;
          return fract(p);
      }

      float hash12(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * .1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
      }

      mat2 rotate2d(float theta) {
          float c = cos(theta);
          float s = sin(theta);
          return mat2(c, -s, s, c);
      }

      float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 fp = fract(p);
          float a = hash12(ip);
          float b = hash12(ip + vec2(1.0, 0.0));
          float c = hash12(ip + vec2(0.0, 1.0));
          float d = hash12(ip + vec2(1.0, 1.0));
          
          vec2 t = smoothstep(0.0, 1.0, fp);
          return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
      }

      float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < OCTAVE_COUNT; ++i) {
              value += amplitude * noise(p);
              p *= rotate2d(0.35);
              p *= 2.0;
              amplitude *= 0.5;
          }
          return value;
      }

      void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
          vec2 uv = fragCoord / iResolution.xy;
          uv = 2.0 * uv - 1.0;
          uv.x *= iResolution.x / iResolution.y;
          uv.x += uXOffset;
          
          float time = iTime * uSpeed;
          vec2 q = vec2(0.0);
          q.x = fbm(uv * uSize + 0.5 * time);
          q.y = fbm(uv * uSize + vec2(1.0));
          
          vec2 r = vec2(0.0);
          r.x = fbm(uv * uSize + 1.0 * q + vec2(1.7, 9.2) + 0.15 * time);
          r.y = fbm(uv * uSize + 1.0 * q + vec2(8.3, 2.8) + 0.126 * time);
          
          float f = fbm(uv * uSize + 2.0 * r);
          
          uv += 2.0 * f - 1.0;
          
          float dist = abs(uv.x) + 0.05;
          vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.75, 0.9));
          
          float glow = smoothstep(0.4, 0.0, dist);
          float bolt = 0.07 / dist;
          
          vec3 col = baseColor * bolt * uIntensity * (1.0 + glow * 0.5);
          col += baseColor * glow * 0.3 * uIntensity;
          
          float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
          fragColor = vec4(col, a * 0.9);
      }

      void main() {
          mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

    const compileShader = (source: string, type: number): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);
    programRef.current = program;

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    uniformsRef.current = {
      iResolution: gl.getUniformLocation(program, 'iResolution'),
      iTime: gl.getUniformLocation(program, 'iTime'),
      uHue: gl.getUniformLocation(program, 'uHue'),
      uXOffset: gl.getUniformLocation(program, 'uXOffset'),
      uSpeed: gl.getUniformLocation(program, 'uSpeed'),
      uIntensity: gl.getUniformLocation(program, 'uIntensity'),
      uSize: gl.getUniformLocation(program, 'uSize'),
    };

    startTimeRef.current = performance.now();
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const gl = glRef.current;
      if (!canvas || !gl) return;
      
      const dpr = Math.min(window.devicePixelRatio || 1, isMobileRef.current ? 1.5 : 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main render loop
  useEffect(() => {
    initWebGL();
    const gl = glRef.current;
    const uniforms = uniformsRef.current;
    if (!gl || !uniforms) return;

    const render = () => {
      if (!isVisibleRef.current) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      frameCountRef.current++;
      // Skip frames on mobile: render at 30fps instead of 60fps
      if (isMobileRef.current && frameCountRef.current % 2 !== 0) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      const currentTime = performance.now();
      const elapsed = (currentTime - startTimeRef.current) / 1000.0;

      gl.uniform2f(uniforms.iResolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.iTime, elapsed);
      gl.uniform1f(uniforms.uHue, hue);
      gl.uniform1f(uniforms.uXOffset, xOffset);
      gl.uniform1f(uniforms.uSpeed, speed);
      gl.uniform1f(uniforms.uIntensity, intensity);
      gl.uniform1f(uniforms.uSize, size);
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [initWebGL, hue, xOffset, speed, intensity, size]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const gl = glRef.current;
      const program = programRef.current;
      if (gl && program) {
        gl.deleteProgram(program);
      }
      glRef.current = null;
      programRef.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} className={`lightning-container ${className}`} />;
};

export default Lightning;
