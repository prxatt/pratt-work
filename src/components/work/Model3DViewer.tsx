'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  modelUrl: string;
  onLoad?: () => void;
  onError?: () => void;
}

function Model({ modelUrl, onLoad, onError }: ModelProps) {
  try {
    const { scene } = useGLTF(modelUrl);
    
    useEffect(() => {
      // Center and scale the model
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim; // Scale to fit in view
      
      scene.position.sub(center);
      scene.scale.multiplyScalar(scale);
      
      onLoad?.();
    }, [scene, onLoad]);

    return <primitive object={scene} dispose={null} />;
  } catch (error) {
    onError?.();
    return null;
  }
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#4A5568] border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-[10px] text-[#666] uppercase tracking-wider">Loading 3D...</span>
      </div>
    </Html>
  );
}

interface Model3DViewerProps {
  modelUrl: string;
  className?: string;
}

export const Model3DViewer: React.FC<Model3DViewerProps> = ({ 
  modelUrl,
  className = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Check if model exists
  useEffect(() => {
    fetch(modelUrl, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          setHasError(true);
        }
      })
      .catch(() => {
        setHasError(true);
      });
  }, [modelUrl]);

  // Show placeholder if model doesn't exist
  if (hasError) {
    return (
      <div className={`absolute inset-0 z-0 flex items-center justify-center bg-[#111] ${className}`}>
        <div className="text-center">
          <div 
            className="w-32 h-32 mx-auto mb-4 border-2 border-dashed flex items-center justify-center"
            style={{ borderColor: '#4A556830' }}
          >
            <span className="font-mono text-xs text-[#4A4A47]">[3D_MODEL]</span>
          </div>
          <span className="font-mono text-xs text-[#4A4A47] uppercase tracking-[0.3em]">Add boubyan-3d.glb</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 z-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]} // Responsive pixel ratio
        style={{ background: '#111' }}
      >
        <color attach="background" args={['#111']} />
        
        {/* Ambient lighting */}
        <ambientLight intensity={0.4} />
        
        {/* Main directional light */}
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1} 
          castShadow 
        />
        
        {/* Fill light */}
        <directionalLight 
          position={[-5, 0, 5]} 
          intensity={0.5} 
        />
        
        {/* Environment for PBR materials */}
        <Environment preset="studio" />
        
        <Suspense fallback={<LoadingSpinner />}>
          <Model modelUrl={modelUrl} onLoad={() => setIsLoaded(true)} />
        </Suspense>
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
          minDistance={1.5}
          maxDistance={6}
          dampingFactor={0.05}
          enableDamping={true}
        />
      </Canvas>
      
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#111] z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#4A5568] border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-[10px] text-[#666] uppercase tracking-wider">Loading 3D...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Preload the model for better performance
export const preloadModel = (url: string) => {
  useGLTF.preload(url);
};
