'use client';

import React, { useEffect, useState } from 'react';
import AppImage from '@/components/ui/AppImage';

interface ChapterTriumphProps {
    isActive: boolean;
}

const GOLD_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
    size: Math.random() * 4 + 2,
    left: `${20 + Math.random() * 60}%`,
    top: `${10 + Math.random() * 80}%`,
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 4,
    color: i % 3 === 0 ? 'var(--galaxy-gold)' : 'var(--star-white)',
}));

export default function ChapterTriumph({ isActive }: ChapterTriumphProps) {
    const [entered, setEntered] = useState(false);
    const [statsVisible, setStatsVisible] = useState(false);
    const [textVisible, setTextVisible] = useState(false);
    const [subtextVisible, setSubtextVisible] = useState(false);

    useEffect(() => {
        if (!isActive) {
            setEntered(false);
            setStatsVisible(false);
            setTextVisible(false);
            setSubtextVisible(false);
            return;
        }

        const t1 = setTimeout(() => setEntered(true), 50);
        const t2 = setTimeout(() => setStatsVisible(true), 800);
        const t3 = setTimeout(() => setTextVisible(true), 900);
        const t4 = setTimeout(() => setSubtextVisible(true), 1100);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, [isActive]);

    return (
        <div className="relative w-full h-full flex items-center z-10">
            {/* Golden radial glow */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse at 35% 50%, rgba(201,168,76,0.12) 0%, transparent 65%)',
                    pointerEvents: 'none',
                    opacity: entered ? 1 : 0,
                    transition: 'opacity 1.5s ease',
                }}
            />

            {/* Gold particles */}
            {isActive && GOLD_PARTICLES.map((p, i) => (
                <div
                    key={i}
                    className="gold-particle"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: p.left,
                        top: p.top,
                        background: p.color,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`,
                        opacity: entered ? 1 : 0,
                        transition: 'opacity 1s ease',
                    }}
                />
            ))}

            {/* Character — left-center */}
            <div
                className="absolute"
                style={{
                    left: '8%',
                    top: '50%',
                    transform: entered ? 'translateY(-50%)' : 'translateY(calc(-50% + 30px))',
                    opacity: entered ? 1 : 0,
                    transition: 'transform 0.8s ease-out, opacity 0.8s ease',
                    height: 'clamp(340px, 78vh, 620px)',
                    width: 'auto',
                    zIndex: 5,
                }}
            >
                <AppImage
                    src="/assets/images/Artboard_4-1781358319348.png"
                    alt="Anime character standing tall, mic raised high, triumphant smile in dark void"
                    height={620}
                    width={420}
                    className="character-art h-full w-auto object-contain"
                    priority
                />
            </div>

            {/* Achievement + Headline — right side */}
            <div
                className="absolute"
                style={{
                    right: '6%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    maxWidth: '440px',
                    textAlign: 'right',
                }}
            >
                {/* Eyebrow */}
                <div
                    style={{
                        opacity: statsVisible ? 1 : 0,
                        transform: statsVisible ? 'translateY(0)' : 'translateY(10px)',
                        transition: 'opacity 0.6s ease, transform 0.6s ease',
                    }}
                >
                    <span
                        className="font-display text-xs uppercase tracking-widest"
                        style={{ color: 'var(--ice-blue)' }}
                    >
                        Discography
                    </span>
                </div>

                {/* Large stat */}
                <div
                    style={{
                        opacity: statsVisible ? 1 : 0,
                        transform: statsVisible ? 'translateY(0)' : 'translateY(15px)',
                        transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s',
                    }}
                >
                    <h2
                        className="font-display font-bold"
                        style={{
                            fontSize: 'clamp(3rem, 8vw, 5rem)',
                            color: 'var(--star-white)',
                            lineHeight: 1,
                            marginTop: '0.25rem',
                        }}
                    >
                        5 ALBUMS
                    </h2>
                    <p
                        className="font-sans"
                        style={{
                            fontSize: 'clamp(1rem, 2.5vw, 1.375rem)',
                            fontWeight: 300,
                            color: 'rgba(232,234,255,0.6)',
                            marginTop: '0.25rem',
                        }}
                    >
                        Across the Cosmos
                    </p>
                </div>

                {/* Divider */}
                <div
                    style={{
                        height: 1,
                        background: 'rgba(168,180,248,0.2)',
                        margin: '1.5rem 0',
                        opacity: statsVisible ? 1 : 0,
                        transition: 'opacity 0.6s ease 0.2s',
                    }}
                />

                {/* Headline */}
                <h2
                    className="chapter-headline"
                    data-text="TRIUMPH"
                    style={{
                        fontSize: 'clamp(2.5rem, 8vw, 5.5rem)',
                        opacity: textVisible ? 1 : 0,
                        transform: textVisible ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)',
                    }}
                >
                    TRIUMPH
                </h2>

                <p
                    className="font-sans mt-4"
                    style={{
                        fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
                        fontWeight: 300,
                        color: 'rgba(232,234,255,0.6)',
                        opacity: subtextVisible ? 1 : 0,
                        transition: 'opacity 0.6s ease',
                    }}
                >
                    Everything I survived led here.
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
                        style={{ color: 'var(--galaxy-gold)', opacity: 0.8 }}
                    >
                        Chapter 04
                    </span>
                </div>
            </div>
        </div>
    );
}