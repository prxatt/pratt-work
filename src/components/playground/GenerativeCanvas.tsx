'use client';

import React, { useRef, useEffect } from 'react';

// Step 4: Cap particles to reduce O(n²) collision from 10,000 to 3,600 checks/frame
const MAX_PARTICLES = 60;

export const GenerativeCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Step 4: Visibility tracking refs
  const isInViewRef = useRef(true);
  const isTabVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let rafId: number | undefined;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = 'rgba(242, 242, 240, 0.5)';
      }

      update(width: number, height: number) {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > width) this.x = 0;
        else if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        else if (this.y < 0) this.y = height;
      }

      draw(context: CanvasRenderingContext2D) {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
      }
    }

    const init = () => {
      particles = [];
      const numberOfParticles = Math.min(
        (canvas.width * canvas.height) / 15000,
        MAX_PARTICLES  // Step 4: Cap at 60 particles
      );
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const animate = () => {
      // Step 4: Skip when off-screen or tab hidden
      // Keep RAF loop alive for instant resume, but skip expensive calculations
      if (!isInViewRef.current || !isTabVisibleRef.current) {
        rafId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(canvas.width, canvas.height);
        particles[i].draw(ctx);
        
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(242, 242, 240, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.closePath();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      init();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Step 4: IntersectionObserver - pause when not in viewport
    const observer = new IntersectionObserver(
      ([entry]) => { isInViewRef.current = entry.isIntersecting; },
      { threshold: 0.01 }  // Even 1% visible = keep running
    );
    observer.observe(canvas);

    // Step 4: Visibility change - pause when tab hidden
    const handleVisibility = () => {
      isTabVisibleRef.current = !document.hidden;
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
      } else if (!document.hidden && isInViewRef.current) {
        rafId = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full bg-card rounded-sm border border-border"
    />
  );
};
