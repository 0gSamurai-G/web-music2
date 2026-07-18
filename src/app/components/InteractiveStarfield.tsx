'use client';

import React, { useEffect, useRef } from 'react';

interface InteractiveStarfieldProps {
  opacity?: number;
}

interface Star {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: string;
  // Floating drift properties (some stars traverse the screen)
  isFloater: boolean;
  driftVx: number;
  driftVy: number;
  hasCrossShine: boolean;
}

/**
 * InteractiveStarfield — mounted on every page EXCEPT the landing route.
 *
 * Solid near-black background with 80-150 twinkling/floating stars.
 * Cursor repels nearby particles (60-100px radius), which smoothly
 * ease back to their home position when the cursor moves away.
 *
 * No nebula image. No warp stars. No scroll-locked title.
 */
export default function InteractiveStarfield({ opacity = 1 }: InteractiveStarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const currentOpacityRef = useRef<number>(0);
  const targetOpacityRef = useRef<number>(opacity);
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

    const colors = ['#e8eaff', '#a8b4f8', '#ffffff', '#c8d0ff', '#b8c4f0', '#d0d8ff', '#9aa8f0'];

    const createStars = () => {
      const area = widthRef.current * heightRef.current;
      const density = Math.min(Math.max(Math.round(area / 2000), 400), 1000);

      starsRef.current = Array.from({ length: density }, () => {
        const x = Math.random() * widthRef.current;
        const y = Math.random() * heightRef.current;
        const radius = Math.random() < 0.7
          ? Math.random() * 0.8 + 0.3
          : Math.random() * 2.0 + 1.0;
        const baseAlpha = Math.random() < 0.7
          ? Math.random() * 0.4 + 0.15
          : Math.random() * 0.5 + 0.5;
        const isFloater = Math.random() < 0.25; // ~25% of stars gently float
        // ~5% of stars have a cross shine, primarily larger ones
        const hasCrossShine = Math.random() < 0.05 && radius > 1.2;

        return {
          homeX: x,
          homeY: y,
          x,
          y,
          radius,
          baseAlpha,
          twinkleSpeed: Math.random() * 1.5 + 0.5,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          isFloater,
          driftVx: (Math.random() - 0.5) * 0.4, // -0.2 to +0.2 px per frame
          driftVy: (Math.random() - 0.5) * 0.4,
          hasCrossShine,
        };
      });
    };

    const resize = () => {
      widthRef.current = window.innerWidth;
      heightRef.current = window.innerHeight;
      canvas.width = widthRef.current;
      canvas.height = heightRef.current;
      createStars();
    };
    resize();
    window.addEventListener('resize', resize);

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
      // Solid near-black background
      ctx.fillStyle = '#05050f';
      ctx.fillRect(0, 0, widthRef.current, heightRef.current);

      const time = timestamp / 1000;

      starsRef.current.forEach((star) => {
        // Twinkle
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.2 + 0.8;
        const finalAlpha = star.baseAlpha * twinkle * currentOpacityRef.current;

        // Update floating drift
        if (star.isFloater) {
          star.homeX += star.driftVx;
          star.homeY += star.driftVy;

          // Wrap around edges gracefully
          if (star.homeX < -20) star.homeX = widthRef.current + 20;
          if (star.homeX > widthRef.current + 20) star.homeX = -20;
          if (star.homeY < -20) star.homeY = heightRef.current + 20;
          if (star.homeY > heightRef.current + 20) star.homeY = -20;
        }
        
        star.x = star.homeX;
        star.y = star.homeY;

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, finalAlpha));
        ctx.fill();

        // Glow and Cross Shine
        if (star.radius > 1.2 && finalAlpha > 0.3) {
          // Subtle circular glow
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.radius * 4
          );
          gradient.addColorStop(0, star.color);
          gradient.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.globalAlpha = Math.max(0, Math.min(1, finalAlpha * 0.15));
          ctx.fill();

          // Cross shine effect for specially flagged stars
          if (star.hasCrossShine) {
            ctx.globalAlpha = Math.max(0, Math.min(1, finalAlpha * 0.5));
            ctx.beginPath();
            // Horizontal line
            ctx.moveTo(star.x - star.radius * 5, star.y);
            ctx.lineTo(star.x + star.radius * 5, star.y);
            // Vertical line
            ctx.moveTo(star.x, star.y - star.radius * 5);
            ctx.lineTo(star.x, star.y + star.radius * 5);
            ctx.strokeStyle = star.color;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
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
  }, []);

  return <canvas ref={canvasRef} className="interactive-starfield" aria-hidden="true" />;
}
