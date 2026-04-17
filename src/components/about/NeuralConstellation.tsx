'use client';

import React, { useEffect, useRef, useMemo, useCallback } from 'react';

interface Node {
  x: number;
  y: number;
  z: number; // depth layer 0.3-1.0
  size: number;
  opacity: number;
  speedY: number;
  drift: number;
  pulsePhase: number;
  baseX: number;
  baseY: number;
}

interface Connection {
  from: Node;
  to: Node;
  distance: number;
}

export const NeuralConstellation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const frameCountRef = useRef(0);
  const connectionsRef = useRef<Connection[]>([]);
  const lastConnectionUpdate = useRef(0);

  // Create nodes on mount
  const nodes = useMemo(() => {
    const nodeCount = 100;
    const newNodes: Node[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      const x = Math.random();
      const y = Math.random();
      const z = Math.random() * 0.7 + 0.3; // 0.3-1.0 depth
      
      newNodes.push({
        x,
        y,
        z,
        size: 3 + z * 5, // 3-8px based on depth
        opacity: 0.5 + z * 0.4, // 0.5-0.9 based on depth
        speedY: (Math.random() * 0.0003 + 0.0001) * z, // Slower for background
        drift: Math.random() * Math.PI * 2,
        pulsePhase: Math.random() * Math.PI * 2,
        baseX: x,
        baseY: y,
      });
    }
    return newNodes;
  }, []);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Calculate connections between nearby nodes
  const updateConnections = useCallback(() => {
    const nodes = nodesRef.current;
    const connections: Connection[] = [];
    const maxDistance = 0.15; // 15% of screen
    const maxConnectionsPerNode = 3;
    
    for (let i = 0; i < nodes.length; i++) {
      const nodeA = nodes[i];
      let connectionCount = 0;
      
      for (let j = i + 1; j < nodes.length; j++) {
        if (connectionCount >= maxConnectionsPerNode) break;
        
        const nodeB = nodes[j];
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          connections.push({ from: nodeA, to: nodeB, distance });
          connectionCount++;
        }
      }
    }
    
    connectionsRef.current = connections;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Update connections on resize
      updateConnections();
    };
    resize();
    window.addEventListener('resize', resize);

    // Track mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Initial connection calculation
    updateConnections();

    const animate = () => {
      frameCountRef.current++;
      const time = Date.now() * 0.001;
      
      // Skip frames for performance (target 30fps)
      if (frameCountRef.current % 2 !== 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      
      // Clear with dark background
      ctx.fillStyle = '#0D0D0D';
      ctx.fillRect(0, 0, width, height);

      // Update connections every 10 frames (for performance)
      if (frameCountRef.current - lastConnectionUpdate.current > 10) {
        updateConnections();
        lastConnectionUpdate.current = frameCountRef.current;
      }

      // Mouse influence
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      // Update and draw nodes
      nodesRef.current.forEach((node) => {
        // Gentle floating motion
        const driftX = Math.sin(time * 0.5 + node.drift) * 0.002;
        node.x = node.baseX + driftX;
        node.y -= node.speedY;
        
        // Wrap around vertically
        if (node.y < -0.05) {
          node.y = 1.05;
          node.baseY = 1.05;
        }
        if (node.y > 1.05) {
          node.y = -0.05;
          node.baseY = -0.05;
        }
        
        // Mouse repulsion (gentle magnetic effect)
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.15 && dist > 0) {
          const force = (0.15 - dist) * 0.02 * node.z;
          node.x += (dx / dist) * force;
          node.y += (dy / dist) * force;
        }
        
        // Pulse effect
        const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.15 + 1;
        
        // Screen position
        const screenX = node.x * width;
        const screenY = node.y * height;
        const currentSize = node.size * pulse;
        
        // Draw connection lines first (behind nodes)
        ctx.strokeStyle = `rgba(245, 245, 243, ${0.08 * node.z})`;
        ctx.lineWidth = 0.5 * node.z;
        
        // Draw connections to nearby nodes
        connectionsRef.current.forEach((conn) => {
          if (conn.from === node || conn.to === node) {
            const other = conn.from === node ? conn.to : conn.from;
            const opacity = (1 - conn.distance / 0.15) * 0.2 * node.z * other.z;
            
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(other.x * width, other.y * height);
            ctx.strokeStyle = `rgba(245, 245, 243, ${opacity})`;
            ctx.stroke();
          }
        });
        
        // Draw node glow (outer)
        const gradient = ctx.createRadialGradient(
          screenX, screenY, 0,
          screenX, screenY, currentSize * 4
        );
        gradient.addColorStop(0, `rgba(245, 245, 243, ${node.opacity * 0.3})`);
        gradient.addColorStop(0.4, `rgba(245, 245, 243, ${node.opacity * 0.1})`);
        gradient.addColorStop(1, 'rgba(245, 245, 243, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, currentSize * 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw node glow (inner)
        const innerGradient = ctx.createRadialGradient(
          screenX, screenY, 0,
          screenX, screenY, currentSize * 2
        );
        innerGradient.addColorStop(0, `rgba(245, 245, 243, ${node.opacity * 0.8})`);
        innerGradient.addColorStop(0.5, `rgba(245, 245, 243, ${node.opacity * 0.4})`);
        innerGradient.addColorStop(1, 'rgba(245, 245, 243, 0)');
        
        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, currentSize * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw node core
        ctx.fillStyle = `rgba(255, 255, 255, ${node.opacity})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, currentSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Add subtle vignette
      const vignette = ctx.createRadialGradient(
        width * 0.5, height * 0.5, 0,
        width * 0.5, height * 0.5, Math.max(width, height) * 0.7
      );
      vignette.addColorStop(0, 'rgba(13, 13, 13, 0)');
      vignette.addColorStop(1, 'rgba(13, 13, 13, 0.4)');
      
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [updateConnections]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};
