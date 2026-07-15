'use client';

import React, { useEffect, useRef } from 'react';

interface RefractionLayerProps {
    opacity: number;
}

export default function RefractionLayer({ opacity }: RefractionLayerProps) {
    const layerRef = useRef<HTMLDivElement>(null);
    const currentOpacityRef = useRef(0);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const animate = () => {
            currentOpacityRef.current += (opacity - currentOpacityRef.current) * 0.04;
            if (layerRef.current) {
                layerRef.current.style.opacity = String(currentOpacityRef.current);
            }
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [opacity]);

    return (
        <div ref={layerRef} className="refraction-layer" aria-hidden="true">
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <filter id="refraction-filter">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.015 0.008"
                            numOctaves="3"
                            seed="2"
                            result="noise"
                        >
                            <animate
                                attributeName="baseFrequency"
                                values="0.015 0.008;0.018 0.012;0.015 0.008"
                                dur="8s"
                                repeatCount="indefinite"
                            />
                        </feTurbulence>
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale="6"
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>
            </svg>

            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--refraction-tint)',
                    filter: 'url(#refraction-filter)',
                }}
            />

            {/* Caustic streaks */}
            {[0, 1, 2, 3].map((i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: '1px',
                        top: `${20 + i * 22}%`,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(168,180,248,0.04) 30%, rgba(168,180,248,0.02) 70%, transparent 100%)',
                        animation: `caustic-${i} ${6 + i * 2}s ease-in-out infinite`,
                        transform: `translateY(${i * 8}px)`,
                    }}
                />
            ))}

            <style>{`
        @keyframes caustic-0 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(12px)} }
        @keyframes caustic-1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes caustic-2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(15px)} }
        @keyframes caustic-3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>
        </div>
    );
}