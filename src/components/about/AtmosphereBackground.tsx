'use client';

import React, { useEffect, useRef, useMemo } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number; // depth layer
  size: number;
  speedY: number;
  opacity: number;
  drift: number;
}

export const AtmosphereBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameCountRef = useRef(0);

  // Create particles on mount
  const particles = useMemo(() => {
    const particleCount = 60; // Optimized count for performance
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: Math.random(), // 0-1 percentage of width
        y: Math.random(), // 0-1 percentage of height
        z: Math.random() * 0.5 + 0.5, // depth 0.5-1
        size: Math.random() * 2 + 1, // 1-3px
        speedY: Math.random() * 0.0002 + 0.0001, // Very slow upward drift
        opacity: Math.random() * 0.3 + 0.1, // 0.1-0.4
        drift: Math.random() * Math.PI * 2, // Random starting phase
      });
    }
    return newParticles;
  }, []);

  useEffect(() => {
    particlesRef.current = particles;
  }, [particles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Track mouse for subtle parallax
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const animate = () => {
      frameCountRef.current++;
      
      // Skip every other frame for 30fps animation (performance optimization)
      if (frameCountRef.current % 2 !== 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const time = Date.now() * 0.0005;

      particlesRef.current.forEach((particle) => {
        // Update position - very slow upward drift
        particle.y -= particle.speedY;
        if (particle.y < -0.1) particle.y = 1.1; // Wrap around

        // Subtle horizontal drift (sine wave based on time)
        const driftX = Math.sin(time + particle.drift) * 0.02;

        // Parallax based on mouse position and depth
        const parallaxX = (mouseRef.current.x - 0.5) * particle.z * 30;
        const parallaxY = (mouseRef.current.y - 0.5) * particle.z * 20;

        // Calculate screen position
        const screenX = particle.x * width + driftX * width + parallaxX;
        const screenY = particle.y * height + parallaxY;

        // Draw particle with glow
        const baseSize = particle.size * particle.z;
        
        // Outer glow
        ctx.beginPath();
        ctx.arc(screenX, screenY, baseSize * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 245, 243, ${particle.opacity * 0.1})`;
        ctx.fill();

        // Inner glow
        ctx.beginPath();
        ctx.arc(screenX, screenY, baseSize * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 245, 243, ${particle.opacity * 0.3})`;
        ctx.fill();

        // Core particle
        ctx.beginPath();
        ctx.arc(screenX, screenY, baseSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 245, 243, ${particle.opacity})`;
        ctx.fill();
      });

      // Draw subtle scan lines (referencing video/film production)
      const scanLineOpacity = 0.02;
      const scanLineCount = 3;
      for (let i = 0; i < scanLineCount; i++) {
        const lineY = ((time * 0.1 + i / scanLineCount) % 1) * height;
        const gradient = ctx.createLinearGradient(0, lineY - 50, 0, lineY + 50);
        gradient.addColorStop(0, 'rgba(245, 245, 243, 0)');
        gradient.addColorStop(0.5, `rgba(245, 245, 243, ${scanLineOpacity})`);
        gradient.addColorStop(1, 'rgba(245, 245, 243, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, lineY - 50, width, 100);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {/* Base gradient - subtle depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 100%, rgba(26, 26, 26, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 30% 20%, rgba(245, 245, 243, 0.02) 0%, transparent 50%),
            #0D0D0D
          `,
        }}
      />
      
      {/* Canvas for particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.8 }}
      />
      
      {/* Noise texture overlay - film grain aesthetic */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Vignette overlay for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(13, 13, 13, 0.6) 100%)',
        }}
      />
    </div>
  );
};
