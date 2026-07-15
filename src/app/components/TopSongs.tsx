'use client';

import React, { useState, useRef, useEffect } from 'react';

const SONGS = [
    { id: 1, title: 'Free Fall', duration: '3:42', desc: 'The moment gravity becomes freedom' },
    { id: 2, title: 'Impact', duration: '4:15', desc: 'When you hit the surface and feel everything' },
    { id: 3, title: 'Descent', duration: '5:01', desc: 'Sinking deeper into the blue' },
    { id: 4, title: 'Bubble Up', duration: '3:28', desc: 'Rising from the dark' },
    { id: 5, title: 'Surface', duration: '4:44', desc: 'Breaking through with everything you have' },
    { id: 6, title: 'Void Walk', duration: '3:55', desc: 'Wandering between the stars' },
    { id: 7, title: 'Neon Depth', duration: '4:08', desc: 'Light bends strangely down here' },
    { id: 8, title: 'Orbit', duration: '3:33', desc: 'Circling what I cannot let go' },
    { id: 9, title: 'Resonance', duration: '4:50', desc: 'The frequency only you can hear' },
    { id: 10, title: 'Triumph', duration: '5:12', desc: 'Everything I survived led here' },
];

export default function TopSongs() {
    const [activeSong, setActiveSong] = useState(0);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) setVisible(true);
            },
            { threshold: 0.2 }
        );
        if (sectionRef?.current) observer?.observe(sectionRef?.current);
        return () => observer?.disconnect();
    }, []);

    const song = SONGS?.[activeSong];

    return (
        <section
            ref={sectionRef}
            className="relative z-10 py-20 px-6 md:px-12"
            style={{ minHeight: '80vh' }}
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-16">
                    <span
                        className="font-display text-xs uppercase tracking-widest block mb-3"
                        style={{ color: 'var(--ice-blue)' }}
                    >
                        04 / Top Tracks
                    </span>
                    <h2
                        className="font-display font-bold"
                        style={{
                            fontSize: 'clamp(2rem, 6vw, 4rem)',
                            color: 'var(--star-white)',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Top 10 Songs
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Arc / Track list — left 40% */}
                    <div
                        className="relative"
                        style={{
                            opacity: visible ? 1 : 0,
                            transition: 'opacity 0.8s ease',
                        }}
                    >
                        {/* Semicircular arc SVG background */}
                        <div className="relative">
                            <svg
                                viewBox="0 0 200 400"
                                className="absolute left-0 top-0 h-full"
                                style={{ width: 60, pointerEvents: 'none' }}
                                aria-hidden="true"
                            >
                                <path
                                    d="M 50 20 Q 0 200 50 380"
                                    fill="none"
                                    stroke="rgba(168,180,248,0.15)"
                                    strokeWidth="1"
                                />
                                {SONGS?.map((_, i) => {
                                    const t = i / (SONGS?.length - 1);
                                    const y = 20 + t * 360;
                                    const x = 50 - Math.sin(t * Math.PI) * 30;
                                    return (
                                        <circle
                                            key={i}
                                            cx={x}
                                            cy={y}
                                            r={i === activeSong ? 4 : 2.5}
                                            fill={i === activeSong ? 'var(--ice-blue)' : 'rgba(168,180,248,0.3)'}
                                            style={{ transition: 'all 0.3s ease' }}
                                        />
                                    );
                                })}
                            </svg>

                            {/* Song list */}
                            <div className="ml-16 space-y-1">
                                {SONGS?.map((s, i) => (
                                    <button
                                        key={s?.id}
                                        onClick={() => setActiveSong(i)}
                                        className={`w-full text-left py-3 px-4 mb-2 rounded-xl transition-all duration-300 group glass-card ${
                                            i === activeSong ? 'scale-[1.02]' : 'hover:scale-[1.01] opacity-70 hover:opacity-100'
                                        }`}
                                        style={{
                                            borderColor: i === activeSong ? 'rgba(168,180,248,0.4)' : 'rgba(255,255,255,0.1)',
                                            boxShadow: i === activeSong ? '0 8px 32px rgba(0,0,0,0.8), 0 0 20px rgba(107,95,228,0.1)' : '0 4px 16px rgba(0,0,0,0.4)',
                                            borderLeft: `4px solid ${i === activeSong ? 'var(--ice-blue)' : 'rgba(255,255,255,0.1)'}`,
                                        }}
                                        data-cursor="hover"
                                        data-cursor-label="Play"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span
                                                className="font-display font-medium"
                                                style={{
                                                    fontSize: '0.875rem',
                                                    color: i === activeSong ? 'var(--star-white)' : 'rgba(232,234,255,0.5)',
                                                    transition: 'color 0.3s ease',
                                                }}
                                            >
                                                <span
                                                    className="mr-3"
                                                    style={{
                                                        fontSize: '0.7rem',
                                                        color: i === activeSong ? 'var(--ice-blue)' : 'rgba(168,180,248,0.3)',
                                                    }}
                                                >
                                                    {String(i + 1)?.padStart(2, '0')}
                                                </span>
                                                {s?.title}
                                            </span>
                                            <span
                                                className="font-sans"
                                                style={{
                                                    fontSize: '0.75rem',
                                                    color: 'rgba(232,234,255,0.35)',
                                                    fontVariant: 'small-caps',
                                                }}
                                            >
                                                {s?.duration}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Song detail — right 60% */}
                    <div
                        className="glass-card p-8 md:p-10"
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'translateX(0)' : 'translateX(20px)',
                            transition: 'opacity 0.8s ease 0.2s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s',
                        }}
                    >
                        <div className="mb-2">
                            <span
                                className="font-display text-xs uppercase tracking-widest"
                                style={{ color: 'var(--ice-blue)', opacity: 0.7 }}
                            >
                                Track {String(activeSong + 1)?.padStart(2, '0')} · {song?.duration}
                            </span>
                        </div>

                        <h3
                            className="font-display font-bold mt-2"
                            style={{
                                fontSize: 'clamp(1.75rem, 5vw, 2.25rem)',
                                color: 'var(--star-white)',
                                letterSpacing: '-0.02em',
                                clipPath: 'inset(0 0 0% 0)',
                                transition: 'clip-path 0.5s ease',
                            }}
                        >
                            {song?.title}
                        </h3>

                        <div
                            style={{
                                height: 1,
                                background: 'rgba(168,180,248,0.2)',
                                margin: '1.5rem 0',
                            }}
                        />

                        <p
                            className="font-sans"
                            style={{
                                fontSize: '1rem',
                                lineHeight: 1.7,
                                color: 'rgba(255,255,255,0.65)',
                            }}
                        >
                            {song?.desc}
                        </p>

                        <div className="mt-8 flex items-center gap-4">
                            <button
                                className="glass-btn px-6 py-3 font-display text-xs uppercase tracking-widest flex items-center gap-2"
                                data-cursor="hover"
                                data-cursor-label="Play"
                            >
                                <span style={{ fontSize: '1rem' }}>▶</span>
                                Play Track
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}