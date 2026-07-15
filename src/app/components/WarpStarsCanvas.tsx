'use client';

import React, { useEffect, useRef } from 'react';

interface WarpStarsCanvasProps {
  isActive: boolean;
}

interface WarpStar {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
  angle: number;
  color: string;
  maxRadius: number;
  distance: number;
  trailLength: number;
}

/**
 * Approaching star particles for the landing page.
 * Particles originate from right-center and travel toward the viewer at ~20°.
 * Uses a low-alpha fill-rect trail effect instead of clearRect for motion streaks.
 * No cursor interaction — fully ambient/decorative.
 */
export default function WarpStarsCanvas({ isActive }: WarpStarsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<WarpStar[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const widthRef = useRef<number>(0);
  const heightRef = useRef<number>(0);
  const originXRef = useRef<number>(0);
  const originYRef = useRef<number>(0);

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

      // Origin: right-center of screen
      originXRef.current = widthRef.current * 0.85;
      originYRef.current = heightRef.current * 0.5;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#e8eaff', '#a8b4f8', '#ffffff', '#c8d0ff', '#b8c4f0', '#d0d8ff'];

    const createStar = (): WarpStar => {
      // 20° approach angle with spread
      const baseAngle = 20 * (Math.PI / 180);
      const spread = 25 * (Math.PI / 180);
      const angle = baseAngle + (Math.random() - 0.5) * spread;
      // Add PI to make them travel AWAY from origin (toward viewer)
      const travelAngle = angle + Math.PI;
      const speed = 0.5 + Math.random() * 1.5;
      const maxRadius = 1.5 + Math.random() * 4;
      const distance = -30 - Math.random() * 200;
      const trailLength = 5 + Math.random() * 15;

      return {
        x: originXRef.current,
        y: originYRef.current,
        radius: 0.2,
        opacity: 0,
        speed,
        angle: travelAngle,
        color: colors[Math.floor(Math.random() * colors.length)],
        maxRadius,
        distance,
        trailLength,
      };
    };

    starsRef.current = Array.from({ length: 400 }, createStar);

    const draw = (timestamp: number) => {
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (!isActive) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      // Keep the canvas transparent so the CosmicBackground beneath is visible
      ctx.clearRect(0, 0, widthRef.current, heightRef.current);

      starsRef.current.forEach((star) => {
        star.distance += star.speed * (delta / 16.67);

        const progress = Math.max(0, Math.min(star.distance / (widthRef.current * 1.8), 1));

        star.x = originXRef.current + Math.cos(star.angle) * star.distance;
        star.y = originYRef.current + Math.sin(star.angle) * star.distance;

        // Grow as they approach (depth simulation)
        star.radius = Math.max(0.1, 0.2 + (star.maxRadius - 0.2) * progress);
        star.opacity = Math.sin(progress * Math.PI) * 0.9;

        // Respawn when exiting viewport or at max distance
        if (
          progress >= 1 ||
          star.x < -star.radius * 2 ||
          star.x > widthRef.current + star.radius * 2 ||
          star.y < -star.radius * 2 ||
          star.y > heightRef.current + star.radius * 2
        ) {
          Object.assign(star, createStar());
          star.distance = -30 - Math.random() * 200;
          return;
        }

        // Draw trail manually instead of using fillRect (to preserve transparency)
        const trailSteps = Math.floor(star.trailLength);
        for (let i = 0; i < trailSteps; i++) {
          const trailProgress = progress - i * 0.02;
          if (trailProgress <= 0) break;

          const trailX =
            originXRef.current + Math.cos(star.angle) * (star.distance - i * star.speed * 3);
          const trailY =
            originYRef.current + Math.sin(star.angle) * (star.distance - i * star.speed * 3);
          const trailRadius = star.radius * (1 - i / trailSteps) * 0.6;
          const trailOpacity = star.opacity * (1 - i / trailSteps) * 0.4;

          ctx.beginPath();
          ctx.arc(trailX, trailY, Math.max(0.1, trailRadius), 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = Math.max(0, Math.min(1, trailOpacity));
          ctx.fill();
        }

        // Draw main star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, star.opacity));
        ctx.fill();

        // Draw glow for larger stars
        if (star.radius > 2) {
          const gradient = ctx.createRadialGradient(
            star.x,
            star.y,
            0,
            star.x,
            star.y,
            star.radius * 3
          );
          gradient.addColorStop(0, star.color);
          gradient.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.globalAlpha = Math.max(0, Math.min(1, star.opacity * 0.3));
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
    };
  }, [isActive]);

  return <canvas ref={canvasRef} className="warp-stars-canvas" aria-hidden="true" />;
}
