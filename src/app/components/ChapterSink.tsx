'use client';

import React, { useEffect, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import { Chapter } from '@/lib/api';

interface ChapterSinkProps {
    isActive: boolean;
    chapter?: Chapter;
}

const BUBBLES = [
    { size: 10, left: '52%', bottom: '28%', duration: 10, delay: 0 },
    { size: 7, left: '48%', bottom: '22%', duration: 12, delay: 2 },
    { size: 8, left: '55%', bottom: '32%', duration: 9, delay: 4 },
    { size: 6, left: '45%', bottom: '25%', duration: 11, delay: 1.5 },
    { size: 9, left: '58%', bottom: '20%', duration: 8, delay: 3 },
];

export default function ChapterSink({ isActive, chapter }: ChapterSinkProps) {
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

    const title = chapter ? chapter.title : "DESCENT";
    const description = chapter ? chapter.description : "Sinking deeper into the blue.";
    const label = chapter ? chapter.chapter_label : "Chapter 02";
    const image = chapter ? chapter.image : "/assets/images/Artboard_2-1781358319225.png";

    return (
        <div className="relative w-full h-full flex items-center justify-center z-10">
            {/* Character — center */}
            <div
                className="absolute"
                style={{
                    left: '50%',
                    top: '45%',
                    transform: entered
                        ? 'translate(-50%, -50%) rotate(-8deg) scale(0.92)'
                        : 'translate(-50%, calc(-50% - 20vh)) rotate(-8deg) scale(1)',
                    opacity: entered ? 1 : 0,
                    filter: 'none',
                    transition: 'transform 1.2s cubic-bezier(0.16,1,0.3,1), opacity 0.8s ease',
                    height: 'clamp(300px, 70vh, 560px)',
                    width: 'auto',
                    zIndex: 5,
                }}
            >
                <div className={entered ? 'char-sink' : ''}>
                    <AppImage
                        src={image}
                        alt="Anime character sinking, hair splayed outward, eyes closed in dark void"
                        height={560}
                        width={380}
                        className="character-art h-full w-auto object-contain"
                        priority
                    />
                </div>
            </div>

            {/* Bubbles — hard cap 5 */}
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

                <p
                    className="font-sans mt-4"
                    style={{
                        fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
                        fontWeight: 300,
                        color: 'rgba(232,234,255,0.6)',
                        opacity: subtextVisible ? 1 : 0,
                        transition: 'opacity 0.6s ease',
                        maxWidth: '300px',
                    }}
                >
                    {description}
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
                        {label}
                    </span>
                </div>
            </div>
        </div>
    );
}
