'use client';

import React, { useRef, useState, useCallback } from 'react';

interface DualCoverImageProps {
    srcA: string; // Default (blue) image
    srcB: string; // Hover-reveal image
    alt: string;
    circleRadius?: number; // px radius of the reveal circle
    /** RGB values for the reveal circle ring & glow, e.g. '168,180,248' for purple */
    ringRgb?: string;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * DualCoverImage
 *
 * - Normally shows srcA
 * - On hover, a circle follows the cursor revealing srcB cleanly
 * - The area outside the circle gets a soft glassmorphic blur+tint overlay
 * - The circle itself is perfectly crisp — no blur inside
 * - Ring colour is controlled via `ringRgb` (default: warm orange-red)
 */
export default function DualCoverImage({
    srcA,
    srcB,
    alt,
    circleRadius = 130,
    ringRgb = '255,90,50',
    className = '',
    style,
}: DualCoverImageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }, []);

    const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setHovered(true);
    }, []);

    const { x, y } = mousePos;

    // srcB clipped to circle only
    const clipPathB = `circle(${circleRadius}px at ${x}px ${y}px)`;

    // Glassmorphic mask: transparent inside circle, opaque outside
    const glassMask = `radial-gradient(circle ${circleRadius}px at ${x}px ${y}px, transparent 0%, transparent ${circleRadius - 1}px, black ${circleRadius + 0.5}px)`;

    // Glow ring just outside the circle edge
    const ringMask = `radial-gradient(circle ${circleRadius + 4}px at ${x}px ${y}px, transparent ${circleRadius - 1}px, rgba(${ringRgb},0.85) ${circleRadius}px, rgba(${ringRgb},0.85) ${circleRadius + 2.5}px, transparent ${circleRadius + 4}px)`;

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden ${className}`}
            style={style}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setHovered(false)}
            onMouseMove={handleMouseMove}
        >
            {/* Layer 1: srcA — always visible base */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={srcA}
                alt={alt}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ display: 'block' }}
                draggable={false}
            />

            {/* Layer 2: Glassmorphic overlay — covers srcA outside the circle */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backdropFilter: hovered ? 'blur(5px) brightness(0.75) saturate(0.8)' : 'none',
                    WebkitBackdropFilter: hovered ? 'blur(5px) brightness(0.75) saturate(0.8)' : 'none',
                    background: hovered ? 'rgba(8,8,28,0.35)' : 'transparent',
                    maskImage: hovered ? glassMask : 'none',
                    WebkitMaskImage: hovered ? glassMask : 'none',
                    transition: hovered ? 'none' : 'opacity 0.3s ease',
                }}
            />

            {/* Layer 3: srcB — revealed inside the circle, perfectly crisp */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={srcB}
                alt={`${alt} — alternate`}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={{
                    clipPath: hovered ? clipPathB : 'circle(0px at 50% 50%)',
                    transition: hovered ? 'none' : 'clip-path 0.35s cubic-bezier(0.4,0,0.2,1)',
                    filter: 'none',
                }}
                draggable={false}
            />

            {/* Layer 4: Glowing ring border around the circle edge */}
            {hovered && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        maskImage: ringMask,
                        WebkitMaskImage: ringMask,
                        background: `rgba(${ringRgb},0.9)`,
                        boxShadow: `0 0 16px 6px rgba(${ringRgb},0.35)`,
                    }}
                />
            )}
        </div>
    );
}
