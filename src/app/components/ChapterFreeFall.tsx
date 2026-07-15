'use client';

import React, { useEffect, useState } from 'react';
import AppImage from '@/components/ui/AppImage';

interface ChapterFreeFallProps {
    isActive: boolean;
}

export default function ChapterFreeFall({ isActive }: ChapterFreeFallProps) {
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
            {/* Character — left-center */}
            <div
                className="absolute"
                style={{
                    left: '10%',
                    top: '50%',
                    transform: entered
                        ? 'translateY(-50%)'
                        : 'translateY(calc(-50% - 30vh))',
                    opacity: entered ? 1 : 0,
                    transition: 'transform 1s cubic-bezier(0.16,1,0.3,1), opacity 0.8s ease',
                    height: 'clamp(320px, 75vh, 600px)',
                    width: 'auto',
                }}
            >
                <div className={entered ? 'char-freefall' : ''}>
                    <AppImage
                        src="/assets/images/Artboard_1-1781358319348.png"
                        alt="Anime character in free fall pose, arms spread wide against a dark void"
                        height={600}
                        width={400}
                        className="character-art h-full w-auto object-contain"
                        priority
                        style={{ filter: 'none' } as React.CSSProperties}
                    />
                </div>
            </div>

            {/* Headline — right side */}
            <div
                className="absolute"
                style={{
                    right: '6%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    textAlign: 'right',
                }}
            >
                <h2
                    className="chapter-headline"
                    data-text="FREE FALL"
                    style={{
                        fontSize: 'clamp(3rem, 10vw, 6.5rem)',
                        opacity: textVisible ? 1 : 0,
                        transform: textVisible ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)',
                    }}
                >
                    FREE FALL
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
                        marginLeft: 'auto',
                    }}
                >
                    The moment gravity becomes freedom.
                </p>

                <div
                    className="mt-8 flex justify-end"
                    style={{
                        opacity: subtextVisible ? 1 : 0,
                        transition: 'opacity 0.6s ease 0.2s',
                    }}
                >
                    <span
                        className="font-display text-xs uppercase tracking-widest"
                        style={{ color: 'var(--ice-blue)', opacity: 0.7 }}
                    >
                        Chapter 01
                    </span>
                </div>
            </div>
        </div>
    );
}