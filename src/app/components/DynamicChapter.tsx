'use client';

import React, { useEffect, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import { Chapter, API_BASE_URL } from '@/lib/api';

interface DynamicChapterProps {
    isActive: boolean;
    chapter: Chapter;
    /** visual style variant driven by position index (0-based) */
    variant?: number;
}

/** Normalise a raw image path from the backend into a full URL the browser can load */
function resolveImageUrl(raw: string | undefined | null): string | null {
    if (!raw) return null;
    if (raw.startsWith('http') || raw.startsWith('/')) return raw;
    // relative media path e.g. "media/chapters/chapter-1.png"
    return `${API_BASE_URL}/api/${raw}`;
}

/** Bubble configs per variant so each chapter stays visually distinct */
const BUBBLE_SETS = [
    [],
    [
        { size: 10, left: '52%', bottom: '28%', duration: 10, delay: 0 },
        { size: 7, left: '48%', bottom: '22%', duration: 12, delay: 2 },
        { size: 8, left: '55%', bottom: '32%', duration: 9, delay: 4 },
    ],
    [
        { size: 8, left: '48%', bottom: '40%', duration: 7, delay: 0 },
        { size: 6, left: '54%', bottom: '35%', duration: 6, delay: 1.5 },
        { size: 9, left: '42%', bottom: '38%', duration: 8, delay: 3 },
    ],
    [],
];

export default function DynamicChapter({ isActive, chapter, variant = 0 }: DynamicChapterProps) {
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

    const {
        title,
        description,
        chapter_label,
        eyebrow,
        stat_number,
        stat_label,
        accent_color,
        image_side,
        show_divider,
    } = chapter;

    const imageUrl = resolveImageUrl(chapter.image);
    const accentColor = accent_color || 'var(--ice-blue)';
    const textOnRight = image_side === 'left';   // image left → text right
    const bubbles = BUBBLE_SETS[variant % BUBBLE_SETS.length] || [];

    // Entrance animation transforms vary by variant for visual diversity
    const imageEnterTransforms = [
        `translateY(-50%)`,                                  // 0 – falls from top
        `translate(-50%, -50%) rotate(-8deg) scale(0.92)`,  // 1 – centre sink
        `translateY(-50%) scale(1)`,                         // 2 – rise from bottom
        `translateY(-50%)`,                                  // 3 – direct
    ];
    const imageExitTransforms = [
        `translateY(calc(-50% - 30vh))`,
        `translate(-50%, calc(-50% - 20vh)) rotate(-8deg) scale(1)`,
        `translateY(calc(-50% + 25vh)) scale(0.92)`,
        `translateY(calc(-50% + 30px))`,
    ];

    const imgStyle: React.CSSProperties = {
        position: 'absolute',
        top: variant === 1 ? '45%' : '50%',
        ...(image_side === 'left'
            ? variant === 1 ? { left: '50%' } : { left: variant === 0 ? '10%' : variant === 2 ? undefined : '8%' }
            : {}),
        ...(image_side === 'right' || variant === 2
            ? { right: variant === 2 ? '12%' : '10%' }
            : {}),
        transform: entered
            ? imageEnterTransforms[variant % imageEnterTransforms.length]
            : imageExitTransforms[variant % imageExitTransforms.length],
        opacity: entered ? 1 : 0,
        transition: 'transform 1.2s cubic-bezier(0.16,1,0.3,1), opacity 0.8s ease',
        // ── IMAGE SIZE FIX ──
        // Use viewport-relative height so images always fill the 100vh section.
        // clamp(min, preferred, max) keeps it readable on all screen sizes.
        height: 'clamp(280px, 70vh, 640px)',
        width: 'auto',
        maxWidth: '45vw',          // never crowd the text side
        zIndex: 5,
    };

    const textSide: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        ...(textOnRight ? { right: '6%', textAlign: 'right', maxWidth: '420px' } : { left: '6%', maxWidth: '420px' }),
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center z-10">

            {/* ── Character image ── */}
            {imageUrl && (
                <div style={imgStyle}>
                    <AppImage
                        src={imageUrl}
                        alt={`${title} – scrollytelling chapter artwork`}
                        height={640}
                        width={420}
                        className="character-art h-full w-auto object-contain"
                        priority
                        style={{ filter: 'none' } as React.CSSProperties}
                    />
                </div>
            )}

            {/* ── Bubbles (water/rise variants) ── */}
            {isActive && bubbles.map((b, i) => (
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

            {/* ── Text block ── */}
            <div style={textSide}>

                {/* Eyebrow */}
                {eyebrow && (
                    <div
                        style={{
                            opacity: subtextVisible ? 1 : 0,
                            transform: subtextVisible ? 'translateY(0)' : 'translateY(10px)',
                            transition: 'opacity 0.6s ease',
                            marginBottom: '0.5rem',
                        }}
                    >
                        <span
                            className="font-display text-xs uppercase tracking-widest"
                            style={{ color: accentColor }}
                        >
                            {eyebrow}
                        </span>
                    </div>
                )}

                {/* Stat number */}
                {stat_number && (
                    <div
                        style={{
                            opacity: subtextVisible ? 1 : 0,
                            transform: subtextVisible ? 'translateY(0)' : 'translateY(15px)',
                            transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s',
                        }}
                    >
                        <h2
                            className="font-display font-bold"
                            style={{
                                fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
                                color: 'var(--star-white)',
                                lineHeight: 1,
                                marginTop: '0.25rem',
                            }}
                        >
                            {stat_number}
                        </h2>
                        {stat_label && (
                            <p
                                className="font-sans"
                                style={{
                                    fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
                                    fontWeight: 300,
                                    color: 'rgba(232,234,255,0.6)',
                                    marginTop: '0.25rem',
                                }}
                            >
                                {stat_label}
                            </p>
                        )}
                    </div>
                )}

                {/* Optional divider */}
                {show_divider === 1 && (stat_number || eyebrow) && (
                    <div
                        style={{
                            height: 1,
                            background: 'rgba(168,180,248,0.2)',
                            margin: '1.25rem 0',
                            opacity: subtextVisible ? 1 : 0,
                            transition: 'opacity 0.6s ease 0.2s',
                        }}
                    />
                )}

                {/* Headline */}
                <h2
                    className="chapter-headline"
                    data-text={title}
                    style={{
                        fontSize: 'clamp(3rem, 10vw, 6.5rem)',
                        opacity: textVisible ? 1 : 0,
                        transform: textVisible ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)',
                    }}
                >
                    {title}
                </h2>

                {/* Description */}
                <p
                    className="font-sans mt-4"
                    style={{
                        fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
                        fontWeight: 300,
                        color: 'rgba(232,234,255,0.6)',
                        opacity: subtextVisible ? 1 : 0,
                        transition: 'opacity 0.6s ease',
                        maxWidth: '320px',
                        ...(textOnRight ? { marginLeft: 'auto' } : {}),
                    }}
                >
                    {description}
                </p>

                {/* Chapter label */}
                <div
                    className={`mt-8 ${textOnRight ? 'flex justify-end' : ''}`}
                    style={{
                        opacity: subtextVisible ? 1 : 0,
                        transition: 'opacity 0.6s ease 0.2s',
                    }}
                >
                    <span
                        className="font-display text-xs uppercase tracking-widest"
                        style={{ color: accentColor, opacity: 0.8 }}
                    >
                        {chapter_label}
                    </span>
                </div>
            </div>
        </div>
    );
}
