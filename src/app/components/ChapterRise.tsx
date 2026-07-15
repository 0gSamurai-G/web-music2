'use client';

import React, { useEffect, useState } from 'react';
import AppImage from '@/components/ui/AppImage';

interface ChapterRiseProps {
    isActive: boolean;
}

const BUBBLES = [
    { size: 8, left: '48%', bottom: '40%', duration: 7, delay: 0 },
    { size: 6, left: '54%', bottom: '35%', duration: 6, delay: 1.5 },
    { size: 9, left: '42%', bottom: '38%', duration: 8, delay: 3 },
];

export default function ChapterRise({ isActive }: ChapterRiseProps) {
    const [entered, setEntered] = useState(false);
    const [textVisible, setTextVisible] = useState(false);
    const [subtextVisible, setSubtextVisible] = useState(false);

    useEffect(() => {
        if (!isActive) {
            setEntered(false);
            setTextVisible(false);
            setSubtextVisible(false);
            return;
        }

        const t1 = setTimeout(() => setEntered(true), 50);
        const t2 = setTimeout(() => setTextVisible(true), 900);
        const t3 = setTimeout(() => setSubtextVisible(true), 1100);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [isActive]);

    return (
        <div className="relative w-full h-full flex items-center justify-center z-10">
            {/* Character — center-right */}
            <div
                className="absolute"
                style={{
                    right: '12%',
                    top: '50%',
                    transform: entered
                        ? 'translateY(-50%) scale(1)'
                        : 'translateY(calc(-50% + 25vh)) scale(0.92)',
                    opacity: entered ? 1 : 0,
                    filter: 'none',
                    transition: 'transform 1.2s cubic-bezier(0.16,1,0.3,1), opacity 0.8s ease',
                    height: 'clamp(320px, 75vh, 580px)',
                    width: 'auto',
                    zIndex: 5,
                }}
            >
                <AppImage
                    src="/assets/images/Artboard_3-1781358319362.png"
                    alt="Anime character rising upward, arm reaching high with determination in dark void"
                    height={580}
                    width={390}
                    className="character-art h-full w-auto object-contain"
                    priority
                />
            </div>

            {/* Bubbles — hard cap 3 */}
            {isActive && BUBBLES.map((b, i) => (
                <div
                    key={i}
                    className="bubble"
                    style={{
                        width: b.size,
                        height: b.size,
                        left: b.left,
                        bottom: b.bottom,
                        animationDuration: `${b.duration}s`,
                        animationDelay: `${b.delay}s`,
                        zIndex: 6,
                    }}
                />
            ))}

            {/* Headline — left side */}
            <div
                className="absolute"
                style={{
                    left: '6%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                }}
            >
                <h2
                    className="chapter-headline"
                    data-text="SURFACE"
                    style={{
                        fontSize: 'clamp(3rem, 10vw, 6.5rem)',
                        opacity: textVisible ? 1 : 0,
                        transform: textVisible ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)',
                    }}
                >
                    SURFACE
                </h2>

                <p
                    className="font-sans mt-4"
                    style={{
                        fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
                        fontWeight: 300,
                        color: 'rgba(232,234,255,0.6)',
                        opacity: subtextVisible ? 1 : 0,
                        transition: 'opacity 0.6s ease',
                        maxWidth: '320px',
                    }}
                >
                    Breaking through with everything I have.
                </p>

                <div
                    className="mt-8"
                    style={{
                        opacity: subtextVisible ? 1 : 0,
                        transition: 'opacity 0.6s ease 0.2s',
                    }}
                >
                    <span
                        className="font-display text-xs uppercase tracking-widest"
                        style={{ color: 'var(--ice-blue)', opacity: 0.7 }}
                    >
                        Chapter 03
                    </span>
                </div>
            </div>
        </div>
    );
}