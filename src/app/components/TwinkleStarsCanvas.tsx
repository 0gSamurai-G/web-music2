'use client';

import React, { useEffect, useRef } from 'react';

interface TwinkleStarsCanvasProps {
  isActive: boolean;
}

interface TwinkleStar {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

/**
 * Twinkling background stars for the landing page cosmic layer.
 * ~130 small particles with independent random opacity oscillation.
 * Purely ambient — no cursor interaction.
 */
export default function TwinkleStarsCanvas({ isActive }: TwinkleStarsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<TwinkleStar[]>([]);
  const animFrameRef = useRef<number>(0);
  const widthRef = useRef<number>(0);
  const heightRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = ['#e8eaff', '#a8b4f8', '#ffffff', '#c8d0ff', '#d0d8ff', '#b8c4f0'];

    const createStars = () => {
      const count = 135;
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * widthRef.current,
        y: Math.random() * heightRef.current,
        radius: Math.random() * 1.2 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.15,
        twinkleSpeed: Math.random() * 1.8 + 0.6,
        twinklePhase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
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
      if (!isActive) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, widthRef.current, heightRef.current);

      const time = timestamp / 1000;

      starsRef.current.forEach((star) => {
        // Independent twinkle: oscillate opacity with unique speed & phase
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.4 + 0.6;
        const alpha = star.baseAlpha * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fill();

        // Subtle glow for brighter/larger stars
        if (star.baseAlpha > 0.4 && star.radius > 0.8) {
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.radius * 4
          );
          gradient.addColorStop(0, star.color);
          gradient.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 0.15));
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

  return (
    <canvas
      ref={canvasRef}
      className="twinkle-stars-canvas"
      aria-hidden="true"
      style={{ opacity: isActive ? 1 : 0, transition: 'opacity 0.8s ease' }}
    />
  );
}
