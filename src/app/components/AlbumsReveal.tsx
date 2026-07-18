'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { fetchAlbums, FrontendAlbum, API_BASE_URL } from '@/lib/api';

const ALBUMS_FALLBACK = [
    {
        id: 'void-frequencies',
        title: 'Void Frequencies',
        year: 2024,
        tracks: 12,
        cover: '/assets/images/Artboard_4-1781358319348.png',
        description: 'The debut album that started everything. Deep space noir at its most raw.',
    },
    {
        id: 'nebula-drift',
        title: 'Nebula Drift',
        year: 2023,
        tracks: 10,
        cover: '/assets/images/Artboard_3-1781358319362.png',
        description: 'Drifting through star clusters and finding beauty in the between.',
    },
    {
        id: 'surface-tension',
        title: 'Surface Tension',
        year: 2023,
        tracks: 9,
        cover: '/assets/images/Artboard_2-1781358319225.png',
        description: 'The underwater chapter. Pressure, depth, and the will to rise.',
    },
    {
        id: 'starfall',
        title: 'Starfall',
        year: 2022,
        tracks: 11,
        cover: '/assets/images/Artboard_1-1781358319348.png',
        description: 'When stars fall, they leave trails. This album is the trail.',
    },
    {
        id: 'echo-protocol',
        title: 'Echo Protocol',
        year: 2022,
        tracks: 8,
        cover: '/assets/images/Artboard_4-1781358319348.png',
        description: "Signals sent into the void. Some echoed back. Some didn't.",
    },
    {
        id: 'abyssal-chorus',
        title: 'Abyssal Chorus',
        year: 2021,
        tracks: 14,
        cover: '/assets/images/Artboard_2-1781358319225.png',
        description: 'Deep below the pressure point, songs still echo.',
    },
    {
        id: 'neon-vanguard',
        title: 'Neon Vanguard',
        year: 2021,
        tracks: 7,
        cover: '/assets/images/Artboard_3-1781358319362.png',
        description: 'Fast, electric, unapologetic.',
    },
    {
        id: 'quantum-state',
        title: 'Quantum State',
        year: 2020,
        tracks: 9,
        cover: '/assets/images/Artboard_1-1781358319348.png',
        description: 'A study in uncertainty and sonic superpositions.',
    },
    {
        id: 'horizon-event',
        title: 'Horizon Event',
        year: 2020,
        tracks: 10,
        cover: '/assets/images/Artboard_4-1781358319348.png',
        description: 'The point of no return. You have been warned.',
    },
    {
        id: 'origin-story',
        title: 'Origin Story',
        year: 2019,
        tracks: 13,
        cover: '/assets/images/Artboard_2-1781358319225.png',
        description: 'Where it all began. The very first frequencies.',
    },
];

const CARD_STYLES: Record<number, { scale: number; blur: number; opacity: number; zIndex: number }> = {
    0: { scale: 1.0, blur: 0, opacity: 1.0, zIndex: 10 },
    1: { scale: 0.86, blur: 2, opacity: 0.65, zIndex: 7 },
    2: { scale: 0.72, blur: 4.5, opacity: 0.32, zIndex: 4 },
};

function mod(n: number, m: number) {
    return ((n % m) + m) % m;
}

interface AlbumsRevealProps {
    isActive?: boolean;
    initialAlbums?: FrontendAlbum[];
}

export default function AlbumsReveal({ isActive = true, initialAlbums }: AlbumsRevealProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const [spreadProgress, setSpreadProgress] = useState(0);
    const [centerIdx, setCenterIdx] = useState(0);
    const [heroVisible, setHeroVisible] = useState(false);
    const [albums, setAlbums] = useState<FrontendAlbum[]>(initialAlbums && initialAlbums.length > 0 ? initialAlbums : (ALBUMS_FALLBACK as any[]));
    const [loading, setLoading] = useState(!initialAlbums || initialAlbums.length === 0);
    const [fetchError, setFetchError] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchAlbums();
                if (data && data.length > 0) {
                    setAlbums(data);
                }
                setFetchError(false);
            } catch (err) {
                console.error("Failed to load albums for carousel", err);
                if (!initialAlbums || initialAlbums.length === 0) {
                    setFetchError(true);
                }
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [initialAlbums]);

    useEffect(() => {
        if (!isActive || loading || fetchError) {
            setSpreadProgress(0);
            setHeroVisible(false);
            return;
        }

        const t1 = setTimeout(() => setHeroVisible(true), 100);
        const t2 = setTimeout(() => setSpreadProgress(1), 2000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [isActive, loading, fetchError]);

    const TOTAL = albums.length;
    const FEATURED_COUNT = 5;

    const prev = useCallback(() => setCenterIdx((c) => mod(c - 1, TOTAL)), [TOTAL]);
    const next = useCallback(() => setCenterIdx((c) => mod(c + 1, TOTAL)), [TOTAL]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [prev, next]);

    const eased = spreadProgress === 1 ? 1 : 1 - Math.pow(1 - spreadProgress, 4);
    const showControls = spreadProgress > 0.5;
    const controlsOpacity = Math.min(1, (spreadProgress - 0.5) * 2);

    if (fetchError) {
        return (
            <section
                ref={sectionRef}
                className="relative z-10 h-screen w-full flex flex-col items-center justify-center overflow-hidden"
            >
                <div className="glass-card p-6 text-center max-w-md mx-auto">
                    <p className="text-red-400 font-display text-xs uppercase tracking-widest mb-2">✦ Frequencies Offline ✦</p>
                    <p className="text-star-white/60 text-sm font-sans">We couldn't reach the celestial database. Please check your signal.</p>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <section
                ref={sectionRef}
                className="relative z-10 h-screen w-full flex flex-col items-center justify-center overflow-hidden"
            >
                <div className="max-w-7xl mx-auto w-full px-6 md:px-12 flex flex-col items-center">
                    <div className="h-4 bg-white/5 w-32 rounded mb-3 animate-pulse" />
                    <div className="h-10 bg-white/5 w-64 rounded mb-12 animate-pulse" />

                    <div className="flex gap-6 justify-center items-center w-full max-w-4xl animate-pulse">
                        <div className="w-[180px] h-[280px] bg-white/5 rounded-2xl hidden md:block opacity-40" />
                        <div className="w-[260px] h-[360px] bg-white/5 rounded-2xl border border-white/10" />
                        <div className="w-[180px] h-[280px] bg-white/5 rounded-2xl hidden md:block opacity-40" />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            ref={sectionRef}
            className="relative z-10 h-screen w-full flex flex-col items-center justify-center overflow-hidden"
        >
            <div className="max-w-7xl mx-auto w-full px-6 md:px-12">
                <div
                    className="mb-12 text-center"
                    style={{
                        opacity: heroVisible ? 1 : 0,
                        transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s',
                    }}
                >
                    <span
                        className="font-display text-xs uppercase tracking-widest block mb-3"
                        style={{ color: 'var(--ice-blue)' }}
                    >
                        Full Discography
                    </span>
                    <h2
                        className="font-display font-bold"
                        style={{
                            fontSize: 'clamp(2rem, 6vw, 4rem)',
                            color: 'var(--star-white)',
                            letterSpacing: '-0.02em',
                            lineHeight: 1,
                        }}
                    >
                        Albums
                    </h2>
                </div>

                <div
                    className="relative flex items-center justify-center"
                    style={{ height: '440px', userSelect: 'none' }}
                >
                    {albums.map((album, albumIdx) => {
                        let offset = albumIdx - centerIdx;
                        if (offset > TOTAL / 2) offset -= TOTAL;
                        if (offset < -TOTAL / 2) offset += TOTAL;

                        const dist = Math.abs(offset);
                        const isVisible = dist <= 2;
                        const style = CARD_STYLES[dist] ?? { scale: 0.6, blur: 8, opacity: 0, zIndex: 0 };
                        const isCenter = offset === 0;

                        const targetTranslateX = offset * 235;
                        const startX = 0;
                        const currentTranslateX = startX + (targetTranslateX - startX) * eased;

                        const startScale = 1;
                        const currentScale = startScale + (style.scale - startScale) * eased;

                        const startOpacity = albumIdx < FEATURED_COUNT ? 1 : 0;
                        const currentOpacity = isVisible ? startOpacity + (style.opacity - startOpacity) * eased : 0;

                        const startBlur = albumIdx < FEATURED_COUNT ? 0 : 12;
                        const currentBlur = startBlur + (style.blur - startBlur) * eased;

                        const startZIndex = FEATURED_COUNT - albumIdx;
                        const currentZIndex = Math.round(startZIndex + (style.zIndex - startZIndex) * eased);

                        return (
                            <div
                                key={album.id}
                                className="absolute"
                                style={{
                                    width: '260px',
                                    transform: `translateX(${currentTranslateX}px) scale(${currentScale})`,
                                    opacity: currentOpacity,
                                    zIndex: currentZIndex,
                                    filter: currentBlur > 0.5 ? `blur(${currentBlur}px)` : 'none',
                                    pointerEvents: isCenter && showControls ? 'auto' : 'none',
                                    transition: 'transform 0.1s linear, opacity 0.1s linear, filter 0.1s linear',
                                }}
                            >
                                <Link
                                    href={`/album-detail?id=${album.id}`}
                                    data-cursor="album"
                                    data-cursor-label="Explore"
                                    tabIndex={isCenter && showControls ? 0 : -1}
                                    className="block"
                                >
                                    <div
                                        className="album-card overflow-hidden"
                                        style={{
                                            borderRadius: '20px',
                                            border: isCenter
                                                ? '1.5px solid rgba(168,180,248,0.35)'
                                                : '1px solid rgba(255,255,255,0.08)',
                                            background: isCenter
                                                ? 'rgba(255,255,255,0.08)'
                                                : 'rgba(255,255,255,0.05)',
                                            backdropFilter: 'blur(20px) saturate(150%)',
                                            WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                                            boxShadow: isCenter
                                                ? '0 24px 64px rgba(0,0,0,0.7), 0 0 40px rgba(107,95,228,0.15)'
                                                : '0 12px 32px rgba(0,0,0,0.5)',
                                            transition: 'box-shadow 0.4s ease, border-color 0.4s ease, background 0.4s ease',
                                            minHeight: '360px',
                                        }}
                                    >
                                        <div className="overflow-hidden relative" style={{ height: '220px', borderRadius: '20px 20px 0 0' }}>
                                            <img
                                                src={album.cover}
                                                alt={`${album.title} album cover artwork`}
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,5,15,0.6)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>

                                        <div className="p-5">
                                            <h3
                                                className="font-display font-semibold mb-1"
                                                style={{ fontSize: '1rem', color: 'var(--star-white)', lineHeight: 1.2 }}
                                            >
                                                {album.title}
                                            </h3>
                                            <p
                                                className="font-sans"
                                                style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}
                                            >
                                                {album.year} · {album.tracks} tracks
                                            </p>
                                            {isCenter && (
                                                <p
                                                    className="font-sans text-xs mt-3 line-clamp-2"
                                                    style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}
                                                >
                                                    {album.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}

                    <button
                        onClick={prev}
                        className="absolute glass-btn flex items-center justify-center z-20"
                        style={{
                            left: 'calc(50% - 730px / 2)',
                            top: '50%',
                            transform: `translateY(-50%) translateX(${(1 - controlsOpacity) * -30}px)`,
                            width: 48,
                            height: 80,
                            fontSize: '1.25rem',
                            background: 'rgba(5,5,15,0.65)',
                            opacity: controlsOpacity,
                            pointerEvents: showControls ? 'auto' : 'none',
                            transition: 'opacity 0.5s ease, transform 0.5s ease',
                            borderRadius: '16px',
                        }}
                        aria-label="Previous album"
                        data-cursor="hover"
                    >
                        ❮
                    </button>
                    <button
                        onClick={next}
                        className="absolute glass-btn flex items-center justify-center z-20"
                        style={{
                            right: 'calc(50% - 730px / 2)',
                            top: '50%',
                            transform: `translateY(-50%) translateX(${(1 - controlsOpacity) * 30}px)`,
                            width: 48,
                            height: 80,
                            fontSize: '1.25rem',
                            background: 'rgba(5,5,15,0.65)',
                            opacity: controlsOpacity,
                            pointerEvents: showControls ? 'auto' : 'none',
                            transition: 'opacity 0.5s ease, transform 0.5s ease',
                            borderRadius: '16px',
                        }}
                        aria-label="Next album"
                        data-cursor="hover"
                    >
                        ❯
                    </button>
                </div>

                <div className="flex justify-center gap-2 mt-2">
                    {albums.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCenterIdx(i)}
                            className="rounded-full"
                            style={{
                                width: i === centerIdx ? 24 : 6,
                                height: 6,
                                background: i === centerIdx ? 'var(--ice-blue)' : 'rgba(255,255,255,0.2)',
                                opacity: controlsOpacity,
                                transition: 'opacity 0.5s ease, width 0.3s ease, background 0.3s ease',
                            }}
                            aria-label={`Go to album ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
