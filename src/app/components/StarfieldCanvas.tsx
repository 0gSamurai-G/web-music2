'use client';

import React, { useEffect, useRef } from 'react';

interface StarfieldCanvasProps {
  opacity: number;
}

interface Star {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: string;
  parallaxFactor: number;
  velocityX: number;
  velocityY: number;
}

export default function StarfieldCanvas({ opacity }: StarfieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const currentOpacityRef = useRef<number>(0);
  const targetOpacityRef = useRef<number>(opacity);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const widthRef = useRef<number>(0);
  const heightRef = useRef<number>(0);

  useEffect(() => {
    targetOpacityRef.current = opacity;
  }, [opacity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      widthRef.current = window.innerWidth;
      heightRef.current = window.innerHeight;
      canvas.width = widthRef.current;
      canvas.height = heightRef.current;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#e8eaff', '#a8b4f8', '#ffffff', '#c8d0ff'];

    const initializeStars = () => {
      starsRef.current = Array.from({ length: 350 }, () => {
        const x = Math.random() * widthRef.current;
        const y = Math.random() * heightRef.current;
        return {
          x,
          y,
          baseX: x,
          baseY: y,
          radius: Math.random() * 1.5 + 0.3,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 2 + 1,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          parallaxFactor: Math.random() * 0.3 + 0.1,
          velocityX: 0,
          velocityY: 0,
        };
      });
    };

    initializeStars();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = null;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    const draw = (timestamp: number) => {
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      const diff = targetOpacityRef.current - currentOpacityRef.current;
      currentOpacityRef.current += diff * 0.03;

      if (delta < 16) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, widthRef.current, heightRef.current);

      const time = timestamp / 1000;

      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        const finalOpacity = star.opacity * twinkle * currentOpacityRef.current;

        if (mouseRef.current) {
          const dx = mouseRef.current.x - star.x;
          const dy = mouseRef.current.y - star.y;
          const distSQ = dx * dx + dy * dy;
          const interactionRadius = 180;
          const interactionRadiusSQ = interactionRadius * interactionRadius;

          if (distSQ < interactionRadiusSQ && distSQ > 1) {
            const force = (interactionRadiusSQ - distSQ) / interactionRadiusSQ;
            const angle = Math.atan2(dy, dx);
            const pushForce = force * 0.8;
            star.velocityX -= Math.cos(angle) * pushForce;
            star.velocityY -= Math.sin(angle) * pushForce;
          }
        }

        // Apply velocity
        star.x += star.velocityX;
        star.y += star.velocityY;

        // Spring back to base position
        const springForce = 0.02;
        const dxBase = star.baseX - star.x;
        const dyBase = star.baseY - star.y;
        star.velocityX += dxBase * springForce;
        star.velocityY += dyBase * springForce;

        // Damping
        star.velocityX *= 0.92;
        star.velocityY *= 0.92;

        // Wrap around screen edges for base positions
        if (star.baseX < 0) star.baseX += widthRef.current;
        if (star.baseX > widthRef.current) star.baseX -= widthRef.current;
        if (star.baseY < 0) star.baseY += heightRef.current;
        if (star.baseY > heightRef.current) star.baseY -= heightRef.current;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, finalOpacity));
        ctx.fill();

        // Add subtle glow for brighter stars
        if (star.opacity > 0.7 && star.radius > 1) {
          const gradient = ctx.createRadialGradient(
            star.x,
            star.y,
            0,
            star.x,
            star.y,
            star.radius * 4
          );
          gradient.addColorStop(0, star.color);
          gradient.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.globalAlpha = Math.max(0, Math.min(1, finalOpacity * 0.15));
          ctx.fill();
        }
      });

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield-canvas" aria-hidden="true" />;
}
