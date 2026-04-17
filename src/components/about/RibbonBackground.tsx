'use client';

import { useEffect, useRef } from 'react';

export const RibbonBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

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

    // Optimized: Fewer ribbons, simpler colors, larger step size
    const baseHues = [240, 280, 320, 180, 45, 200];
    
    const ribbons = [
      { amplitude: 50, frequency: 0.0015, speed: 0.0003, phase: 0, yOffset: -120 },
      { amplitude: 40, frequency: 0.002, speed: 0.0004, phase: 1, yOffset: -60 },
      { amplitude: 55, frequency: 0.0018, speed: 0.00035, phase: 2, yOffset: 0 },
      { amplitude: 45, frequency: 0.0016, speed: 0.00045, phase: 3, yOffset: 60 },
      { amplitude: 60, frequency: 0.0012, speed: 0.0003, phase: 4, yOffset: 120 },
      { amplitude: 50, frequency: 0.0014, speed: 0.0004, phase: 5, yOffset: 180 },
    ];

    const animate = () => {
      timeRef.current += 16;
      const t = timeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerY = canvas.height * 0.5;

      ribbons.forEach((ribbon, index) => {
        const baseHue = baseHues[index];
        
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${baseHue}, 80%, 60%, 0.6)`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        // Shadow for glow effect
        ctx.shadowColor = `hsla(${baseHue}, 80%, 60%, 0.4)`;
        ctx.shadowBlur = 15;
        
        // Optimized: larger step size (5 instead of 2) for performance
        let firstPoint = true;
        for (let x = 0; x <= canvas.width; x += 5) {
          const wave1 = Math.sin(x * ribbon.frequency + t * ribbon.speed + ribbon.phase);
          const wave2 = Math.sin(x * ribbon.frequency * 1.5 + t * ribbon.speed * 0.5) * 0.4;
          const drift = Math.sin(t * 0.0002 + ribbon.phase) * 10;
          
          const y = centerY + ribbon.yOffset + drift + (wave1 + wave2) * ribbon.amplitude;
          
          if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 5 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.7 }}
      />
    </div>
  );
};

export default RibbonBackground;
