'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getVideoUrl } from '@/lib/media';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CryptVolumetric3DProps {
  /** Primary video source — prefer WebM for size */
  webmSrc?: string;
  /** MP4 fallback for Safari */
  mp4Src?: string;
  /** Optional poster frame shown before video loads */
  posterSrc?: string;
  /** Displacement intensity: 0 = flat, 1 = max depth. Default: 0.38 */
  depthIntensity?: number;
  /** Height of the component. Default: '70vh' */
  height?: string;
}

// ---------------------------------------------------------------------------
// Vertex Shader
// ---------------------------------------------------------------------------
// Samples the video texture at each vertex UV, computes luminance, and
// displaces the vertex toward the camera by (luminance * uDisplacement).
// The result: bright areas (wireframe lines, glowing particles) pop forward;
// dark background stays flat. This matches the visual structure of Depthkit-
// style and volumetric software output perfectly.
// ---------------------------------------------------------------------------
const VERTEX_SHADER = /* glsl */ `
  uniform sampler2D uVideoTexture;
  uniform float uDisplacement;
  uniform float uScanLine;
  uniform float uTime;

  varying vec2 vUv;
  varying float vLuminance;
  varying float vScanEffect;

  void main() {
    vUv = uv;

    // Sample the video texture at this vertex position
    vec4 texel = texture2D(uVideoTexture, uv);

    // Compute perceptual luminance (ITU-R BT.709)
    float lum = dot(texel.rgb, vec3(0.2126, 0.7152, 0.0722));
    vLuminance = lum;

    // Scan-line ripple effect (subtle, adds temporal energy)
    float scanDist = abs(uv.y - uScanLine);
    float scan = smoothstep(0.12, 0.0, scanDist) * 0.08;
    vScanEffect = scan;

    // Displace vertex along its normal (Z axis for a flat plane)
    vec3 displaced = position + normal * (lum * uDisplacement + scan * uDisplacement * 0.3);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// Fragment Shader
// ---------------------------------------------------------------------------
// Renders the video texture with additive scan-line glow and a slight
// luminance boost on bright areas to make wireframes feel emissive.
// ---------------------------------------------------------------------------
const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uVideoTexture;
  uniform float uTime;
  uniform float uScanLine;

  varying vec2 vUv;
  varying float vLuminance;
  varying float vScanEffect;

  void main() {
    vec4 color = texture2D(uVideoTexture, vUv);

    // Emissive boost on bright (wireframe/glow) pixels
    float emissive = smoothstep(0.3, 0.9, vLuminance) * 0.25;
    color.rgb += color.rgb * emissive;

    // Scan line glow (cyan tint to match volumetric aesthetic)
    float scanGlow = vScanEffect * 2.0;
    color.rgb += vec3(0.0, scanGlow * 0.6, scanGlow * 0.8);

    // Subtle edge vignette per-fragment (secondary to the CSS vignette)
    vec2 uvCenter = vUv - 0.5;
    float vignette = 1.0 - dot(uvCenter, uvCenter) * 1.2;
    color.rgb *= clamp(vignette, 0.0, 1.0);

    gl_FragColor = color;
  }
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CryptVolumetric3D({
  webmSrc = getVideoUrl('/work/crypt-demo.webm'),
  mp4Src = getVideoUrl('/work/crypt-demo.mp4'),
  posterSrc,
  depthIntensity = 0.38,
  height = '70vh',
}: CryptVolumetric3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  // We store a cleanup fn returned from the effect
  const cleanupRef = useRef<(() => void) | null>(null);

  // Stable callback — avoids linter warnings while keeping empty dep array
  const initScene = useCallback(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dynamically import Three.js to avoid SSR issues in Next.js
    // All Three.js logic lives inside this async block
    (async () => {
      // -----------------------------------------------------------------------
      // Lazy imports — Next.js will bundle Three.js client-side only
      // -----------------------------------------------------------------------
      const THREE = await import('three');
      // @ts-ignore — OrbitControls is in three/examples, types exist if installed
      const { OrbitControls } = await import(
        'three/examples/jsm/controls/OrbitControls.js'
      );

      // -----------------------------------------------------------------------
      // Renderer
      // -----------------------------------------------------------------------
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,           // transparent background — page bg shows through
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      container.appendChild(renderer.domElement);

      // -----------------------------------------------------------------------
      // Scene + Camera
      // -----------------------------------------------------------------------
      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        55,
        container.clientWidth / container.clientHeight,
        0.01,
        100
      );
      // Start at a dramatic angle — will ease to (0, 0, 2.6) on load
      camera.position.set(1.8, 1.2, 3.2);
      camera.lookAt(0, 0, 0);

      // -----------------------------------------------------------------------
      // Orbit Controls
      // -----------------------------------------------------------------------
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;        // silky smooth drag
      controls.dampingFactor = 0.06;
      controls.enableZoom = true;
      controls.zoomSpeed = 0.8;
      controls.minDistance = 1.0;           // can't clip into the mesh
      controls.maxDistance = 6.0;           // can't orbit too far back
      controls.autoRotate = true;           // gentle auto-rotation on idle
      controls.autoRotateSpeed = 0.4;
      controls.enablePan = false;           // no panning — keeps subject centered
      // Touch: one-finger orbit, two-finger zoom
      controls.touches = {
        ONE: (THREE as any).TOUCH?.ROTATE ?? 0,
        TWO: (THREE as any).TOUCH?.DOLLY_ROTATE ?? 2,
      };
      // Stop auto-rotate when user interacts, resume after 3s idle
      let autoRotateTimeout: ReturnType<typeof setTimeout> | null = null;
      const pauseAutoRotate = () => {
        controls.autoRotate = false;
        if (autoRotateTimeout) clearTimeout(autoRotateTimeout);
        autoRotateTimeout = setTimeout(() => {
          controls.autoRotate = true;
        }, 3000);
      };
      renderer.domElement.addEventListener('pointerdown', pauseAutoRotate);
      renderer.domElement.addEventListener('wheel', pauseAutoRotate, { passive: true });

      // -----------------------------------------------------------------------
      // Video Element + Texture
      // -----------------------------------------------------------------------
      const video = document.createElement('video');
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';
      if (posterSrc) video.poster = posterSrc;

      // WebM first, MP4 fallback
      const sourceWebm = document.createElement('source');
      sourceWebm.src = webmSrc;
      sourceWebm.type = 'video/webm';
      video.appendChild(sourceWebm);

      const sourceMp4 = document.createElement('source');
      sourceMp4.src = mp4Src;
      sourceMp4.type = 'video/mp4';
      video.appendChild(sourceMp4);

      // Attempt autoplay (browsers may block until user gesture)
      video.play().catch(() => {
        // If autoplay blocked, play on first click
        const playOnClick = () => {
          video.play();
          container.removeEventListener('click', playOnClick);
        };
        container.addEventListener('click', playOnClick);
      });

      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.format = THREE.RGBAFormat;

      // -----------------------------------------------------------------------
      // Displaced Video Mesh
      // -----------------------------------------------------------------------
      // High subdivision count for smooth displacement. 200x200 segments
      // gives 40,000 quads — sufficient resolution for the displacement without
      // destroying mobile performance (tested on iPhone 13).
      const planeGeo = new THREE.PlaneGeometry(
        3.2,    // width  — 16:9 ratio
        1.8,    // height
        200,    // widthSegments
        200     // heightSegments
      );

      const planeMat = new THREE.ShaderMaterial({
        uniforms: {
          uVideoTexture: { value: videoTexture },
          uDisplacement:  { value: depthIntensity },
          uTime:          { value: 0 },
          uScanLine:      { value: 0.5 },
        },
        vertexShader:   VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        side: THREE.DoubleSide,
      });

      const planeMesh = new THREE.Mesh(planeGeo, planeMat);
      scene.add(planeMesh);

      // -----------------------------------------------------------------------
      // Ambient Particle Field
      // -----------------------------------------------------------------------
      // 1,200 particles distributed in a sphere around the scene.
      // Mirrors the point-cloud aesthetic visible in the original footage
      const particleCount = 1200;
      const pPositions = new Float32Array(particleCount * 3);
      const pSizes = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        // Fibonacci sphere distribution for even coverage
        const theta = Math.acos(1 - 2 * (i + 0.5) / particleCount);
        const phi = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = 2.5 + Math.random() * 1.8;
        pPositions[i * 3 + 0] = r * Math.sin(theta) * Math.cos(phi);
        pPositions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
        pPositions[i * 3 + 2] = r * Math.cos(theta);
        pSizes[i] = Math.random() * 2.5 + 0.5;
      }

      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
      pGeo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));

      const pMat = new THREE.PointsMaterial({
        color: 0xaaccff,
        size: 0.012,
        transparent: true,
        opacity: 0.35,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);

      // -----------------------------------------------------------------------
      // Camera Entry Animation
      // -----------------------------------------------------------------------
      const targetPos = new THREE.Vector3(0, 0, 2.6);
      let entryProgress = 0;          // 0 → 1 over ~2 seconds
      const entryDuration = 2.0;      // seconds
      let entryDone = false;

      // -----------------------------------------------------------------------
      // Resize Handler
      // -----------------------------------------------------------------------
      const handleResize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);

      // -----------------------------------------------------------------------
      // Render Loop
      // -----------------------------------------------------------------------
      let animId: number;
      const clock = new THREE.Clock();

      const animate = () => {
        animId = requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const elapsed = clock.getElapsedTime();

        // Update shader uniforms
        (planeMat.uniforms.uTime as any).value = elapsed;
        // Scan-line travels down the mesh over ~4 seconds
        (planeMat.uniforms.uScanLine as any).value = (elapsed * 0.25) % 1.0;

        // Gentle particle rotation
        particles.rotation.y = elapsed * 0.04;
        particles.rotation.x = Math.sin(elapsed * 0.02) * 0.06;

        // Camera entry animation
        if (!entryDone) {
          entryProgress += delta / entryDuration;
          if (entryProgress >= 1) {
            entryProgress = 1;
            entryDone = true;
          }
          // Ease-out cubic
          const t = 1 - Math.pow(1 - entryProgress, 3);
          camera.position.lerp(targetPos, t * 0.1);
        }

        controls.update();
        renderer.render(scene, camera);
      };

      animate();

      // -----------------------------------------------------------------------
      // Custom Cursor
      // -----------------------------------------------------------------------
      renderer.domElement.style.cursor = 'grab';
      renderer.domElement.addEventListener('pointerdown', () => {
        renderer.domElement.style.cursor = 'grabbing';
      });
      renderer.domElement.addEventListener('pointerup', () => {
        renderer.domElement.style.cursor = 'grab';
      });

      // -----------------------------------------------------------------------
      // Cleanup — CRITICAL for Next.js page navigation
      // -----------------------------------------------------------------------
      cleanupRef.current = () => {
        cancelAnimationFrame(animId);
        resizeObserver.disconnect();
        renderer.domElement.removeEventListener('pointerdown', pauseAutoRotate);
        renderer.domElement.removeEventListener('wheel', pauseAutoRotate);
        if (autoRotateTimeout) clearTimeout(autoRotateTimeout);

        // Dispose geometry, materials, textures
        planeGeo.dispose();
        planeMat.dispose();
        videoTexture.dispose();
        pGeo.dispose();
        pMat.dispose();

        // Stop video + remove DOM element
        video.pause();
        video.src = '';
        video.load();

        controls.dispose();
        renderer.dispose();

        // Remove the canvas from the DOM
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    })();

    // Return synchronous cleanup that calls the async-populated ref
    return () => {
      cleanupRef.current?.();
    };
  }, []); // intentionally empty — Three.js scene initializes once

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black group"
         style={{ height }}>

      {/* Three.js canvas mounts here */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full"
        aria-label="Interactive volumetric capture — drag to orbit, scroll to zoom"
      />

      {/* CSS vignette */}
      <div
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      {/* UI hint */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none
                   flex items-center gap-2 px-3 py-1.5 rounded-full
                   bg-white/5 backdrop-blur-sm border border-white/10
                   text-white/50 text-xs tracking-wider
                   opacity-100 group-hover:opacity-0 transition-opacity duration-700"
        aria-hidden="true"
      >
        {/* Orbit icon */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-70">
          <path
            d="M7 1.5C3.96 1.5 1.5 3.96 1.5 7s2.46 5.5 5.5 5.5 5.5-2.46 5.5-5.5"
            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
          />
          <path
            d="M10.5 1L12.5 3L10.5 5"
            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
        drag to orbit · scroll to zoom
      </div>
    </div>
  );
}
