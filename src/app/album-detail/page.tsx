'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import DualCoverImage from '@/components/ui/DualCoverImage';
import AppLogo from '@/components/ui/AppLogo';
import InteractiveStarfield from '../components/InteractiveStarfield';
import CustomCursor from '../components/CustomCursor';
import SiteFooter from '@/components/Footer';

const TRACKS = [
  { id: 1, title: 'Free Fall', duration: '3:42', seconds: 222 },
  { id: 2, title: 'Impact', duration: '4:15', seconds: 255 },
  { id: 3, title: 'Descent', duration: '5:01', seconds: 301 },
  { id: 4, title: 'Bubble Up', duration: '3:28', seconds: 208 },
  { id: 5, title: 'Surface', duration: '4:44', seconds: 284 },
  { id: 6, title: 'Void Walk', duration: '3:55', seconds: 235 },
  { id: 7, title: 'Neon Depth', duration: '4:08', seconds: 248 },
  { id: 8, title: 'Orbit', duration: '3:33', seconds: 213 },
  { id: 9, title: 'Resonance', duration: '4:50', seconds: 290 },
  { id: 10, title: 'Triumph', duration: '5:12', seconds: 312 },
  { id: 11, title: 'Echo Return', duration: '3:18', seconds: 198 },
  { id: 12, title: 'Void Signal', duration: '4:30', seconds: 270 },
];

const LYRICS_LINES = [
  'Falling through the void between the stars',
  'No ground beneath my feet, no ceiling far',
  'The silence wraps around like second skin',
  'I let go of everything that held me in',
  'Free fall, free fall',
  'Where the gravity dissolves',
  'Free fall, free fall',
  'Into everything that calls',
];

// Glassmorphic dual-cover wrapper — purple theme for album detail / music player
function GlassImageCover({ alt, className = '' }: { alt: string; className?: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${className}`}
      style={{
        border: hovered
          ? '1.5px solid rgba(168,180,248,0.6)'
          : '1.5px solid rgba(255,255,255,0.12)',
        boxShadow: hovered
          ? '0 0 0 4px rgba(107,95,228,0.12), 0 24px 64px rgba(0,0,0,0.7), 0 0 48px rgba(107,95,228,0.25)'
          : '0 12px 48px rgba(0,0,0,0.6)',
        transform: hovered ? 'scale(1.015)' : 'scale(1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <DualCoverImage
        srcA="/assets/images/cover_1_a.png"
        srcB="/assets/images/cover_1_b.png"
        alt={alt}
        circleRadius={150}
        ringRgb="168,180,248"
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}

export default function AlbumDetailPage() {
  const [activeTrack, setActiveTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [lyricsVisible, setLyricsVisible] = useState(false);
  const [activeLyricLine, setActiveLyricLine] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [screen, setScreen] = useState<'album' | 'player'>('album');
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lyricIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const track = TRACKS[activeTrack];
  const progressPercent = (currentTime / track.seconds) * 100;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= track.seconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
      lyricIntervalRef.current = setInterval(() => {
        setActiveLyricLine((prev) => (prev + 1) % LYRICS_LINES.length);
      }, 3000);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (lyricIntervalRef.current) clearInterval(lyricIntervalRef.current);
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (lyricIntervalRef.current) clearInterval(lyricIntervalRef.current);
    };
  }, [isPlaying, track.seconds]);

  const handleSelectTrack = (index: number) => {
    setActiveTrack(index);
    setCurrentTime(0);
    setIsPlaying(true);
    setScreen('player');
  };

  const handlePrev = () => {
    setActiveTrack((prev) => Math.max(0, prev - 1));
    setCurrentTime(0);
  };
  const handleNext = () => {
    setActiveTrack((prev) => Math.min(TRACKS.length - 1, prev + 1));
    setCurrentTime(0);
  };
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setCurrentTime(Math.floor(ratio * track.seconds));
  };

  const Nav = () => (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-5"
      style={{
        backdropFilter: 'blur(20px)',
        background: 'rgba(5,5,15,0.7)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-3">
        <AppLogo size={32} />
        <span className="font-display text-star-white text-lg font-semibold tracking-tight hidden sm:block">
          VoidFrequencies
        </span>
      </div>
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="font-display text-xs uppercase tracking-widest text-star-white opacity-70 hover:opacity-100 hover:text-ice-blue transition-colors"
        >
          Home
        </Link>
        <Link
          href="/albums"
          className="font-display text-xs uppercase tracking-widest text-star-white opacity-70 hover:opacity-100 hover:text-ice-blue transition-colors"
        >
          Albums
        </Link>
      </div>
    </nav>
  );

  return (
        <div className="relative min-h-screen">
            <InteractiveStarfield opacity={0.7} />
            <CustomCursor />
            <Nav />

      {/* ─── ALBUM DESCRIPTION SCREEN ─────────────────────────── */}
      {screen === 'album' && (
        <main className="relative z-10 pt-28 pb-20 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <Link
              href="/albums"
              className="inline-flex items-center gap-4 mb-12 group"
              style={{ textDecoration: 'none' }}
              data-cursor="hover"
              data-cursor-label="Back"
            >
              {/* Circle arrow */}
              <span
                className="flex items-center justify-center rounded-full transition-all duration-300"
                style={{
                  width: 40,
                  height: 40,
                  border: '1.5px solid rgba(168,180,248,0.35)',
                  background: 'rgba(107,95,228,0.0)',
                  color: 'rgba(168,180,248,0.7)',
                  fontSize: '1rem',
                  boxShadow: '0 0 0 0 rgba(107,95,228,0)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.border = '1.5px solid rgba(168,180,248,0.9)';
                  el.style.background = 'rgba(107,95,228,0.18)';
                  el.style.color = 'rgba(168,180,248,1)';
                  el.style.boxShadow = '0 0 16px 4px rgba(107,95,228,0.25)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.border = '1.5px solid rgba(168,180,248,0.35)';
                  el.style.background = 'rgba(107,95,228,0.0)';
                  el.style.color = 'rgba(168,180,248,0.7)';
                  el.style.boxShadow = '0 0 0 0 rgba(107,95,228,0)';
                }}
              >
                ←
              </span>
              <span
                className="font-display text-xs uppercase tracking-widest transition-colors duration-300"
                style={{ color: 'rgba(168,180,248,0.55)' }}
              >
                Back to Albums
              </span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
              {/* Left — Album Cover */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full" style={{ aspectRatio: '1', maxWidth: '420px' }}>
                  <GlassImageCover alt="Void Frequencies album cover" className="w-full h-full" />
                </div>
              </div>

              {/* Right — Info + Tracklist */}
              <div className="lg:col-span-7 flex flex-col gap-8">
                {/* Album info */}
                <div className="glass-card p-8" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                  <span
                    className="font-display text-xs uppercase tracking-widest block mb-3"
                    style={{ color: 'var(--ice-blue)' }}
                  >
                    2024 · 12 Tracks
                  </span>
                  <h1
                    className="font-display font-bold mb-6"
                    style={{
                      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                      color: 'var(--star-white)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.05,
                    }}
                  >
                    Void Frequencies
                  </h1>
                  <p
                    className="font-sans"
                    style={{
                      fontSize: '0.9375rem',
                      lineHeight: 1.8,
                      color: 'rgba(255,255,255,0.65)',
                      marginBottom: '1.25rem',
                    }}
                  >
                    The debut album that started everything. Twelve tracks of deep space noir,
                    recorded in the quiet hours between midnight and dawn. Each song is a frequency
                    sent into the void — some came back, some didn&apos;t.
                  </p>
                  <p
                    className="font-sans"
                    style={{
                      fontSize: '0.9375rem',
                      lineHeight: 1.8,
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    Engineered in total darkness. Mixed with the kind of silence that only comes
                    after everything loud has faded away. The album drifts between neo-classical
                    ambient and hard-edged electronic noir, carving out its own gravitational field.
                  </p>
                  <div className="flex gap-4 mt-8 flex-wrap">
                    <span
                      className="px-4 py-1.5 rounded-full font-display text-xs"
                      style={{
                        background: 'rgba(107,95,228,0.15)',
                        border: '1px solid rgba(107,95,228,0.3)',
                        color: 'var(--ice-blue)',
                      }}
                    >
                      Ambient
                    </span>
                    <span
                      className="px-4 py-1.5 rounded-full font-display text-xs"
                      style={{
                        background: 'rgba(107,95,228,0.15)',
                        border: '1px solid rgba(107,95,228,0.3)',
                        color: 'var(--ice-blue)',
                      }}
                    >
                      Electronic Noir
                    </span>
                    <span
                      className="px-4 py-1.5 rounded-full font-display text-xs"
                      style={{
                        background: 'rgba(107,95,228,0.15)',
                        border: '1px solid rgba(107,95,228,0.3)',
                        color: 'var(--ice-blue)',
                      }}
                    >
                      Space
                    </span>
                  </div>
                </div>

                {/* Tracklist */}
                <div className="glass-card p-4" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                  <div className="mb-4 px-4">
                    <span
                      className="font-display text-xs uppercase tracking-widest"
                      style={{ color: 'var(--ice-blue)', opacity: 0.7 }}
                    >
                      Tracklist — Click to play
                    </span>
                  </div>
                  {TRACKS.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTrack(i)}
                      className="w-full text-left px-4 py-3 rounded-lg group transition-all duration-200"
                      style={{
                        background: 'transparent',
                        borderLeft: '2px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          'rgba(168,180,248,0.06)';
                        (e.currentTarget as HTMLElement).style.borderLeftColor = 'var(--ice-blue)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.borderLeftColor = 'transparent';
                      }}
                      data-cursor="hover"
                      data-cursor-label="Play"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className="font-sans"
                            style={{
                              fontSize: '0.75rem',
                              color: 'rgba(255,255,255,0.3)',
                              minWidth: 20,
                            }}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span
                            className="font-display font-medium"
                            style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}
                          >
                            {t.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="font-sans opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ fontSize: '0.7rem', color: 'var(--ice-blue)' }}
                          >
                            ▶ Play
                          </span>
                          <span
                            className="font-sans"
                            style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}
                          >
                            {t.duration}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ─── MUSIC PLAYER SCREEN ──────────────────────────────── */}
      {screen === 'player' && (
        <main className="relative z-10 pt-28 pb-20 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => setScreen('album')}
              className="inline-flex items-center gap-4 mb-12 group"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              data-cursor="hover"
              data-cursor-label="Back"
            >
              {/* Circle arrow */}
              <span
                className="flex items-center justify-center rounded-full transition-all duration-300"
                style={{
                  width: 40,
                  height: 40,
                  border: '1.5px solid rgba(168,180,248,0.35)',
                  background: 'rgba(107,95,228,0.0)',
                  color: 'rgba(168,180,248,0.7)',
                  fontSize: '1rem',
                  boxShadow: '0 0 0 0 rgba(107,95,228,0)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.border = '1.5px solid rgba(168,180,248,0.9)';
                  el.style.background = 'rgba(107,95,228,0.18)';
                  el.style.color = 'rgba(168,180,248,1)';
                  el.style.boxShadow = '0 0 16px 4px rgba(107,95,228,0.25)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.border = '1.5px solid rgba(168,180,248,0.35)';
                  el.style.background = 'rgba(107,95,228,0.0)';
                  el.style.color = 'rgba(168,180,248,0.7)';
                  el.style.boxShadow = '0 0 0 0 rgba(107,95,228,0)';
                }}
              >
                ←
              </span>
              <span
                className="font-display text-xs uppercase tracking-widest transition-colors duration-300"
                style={{ color: 'rgba(168,180,248,0.55)' }}
              >
                Back to Album
              </span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Left — Song Image + Controls */}
              <div className="lg:col-span-5 flex flex-col items-center">
                {/* Song artwork with glass border */}
                <div className="w-full" style={{ aspectRatio: '1', maxWidth: '380px' }}>
                  <GlassImageCover alt={`${track.title} artwork`} className="w-full h-full" />
                </div>

                {/* Playback controls */}
                <div className="mt-8 w-full max-w-sm">
                  {/* Progress bar */}
                  <div
                    className="w-full h-1 rounded-full mb-3 overflow-hidden cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                    onClick={handleProgressClick}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${progressPercent}%`,
                        background: 'var(--ice-blue)',
                        transition: 'width 0.5s linear',
                      }}
                    />
                  </div>

                  {/* Time */}
                  <div className="flex justify-between mb-6">
                    <span className="font-sans text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {formatTime(currentTime)}
                    </span>
                    <span className="font-sans text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {track.duration}
                    </span>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={handlePrev}
                      className="glass-btn w-10 h-10 flex items-center justify-center"
                      data-cursor="hover"
                      data-cursor-label="Prev"
                      aria-label="Previous track"
                    >
                      <span style={{ fontSize: '1rem' }}>⏮</span>
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="flex items-center justify-center rounded-full font-display transition-all"
                      style={{
                        width: 56,
                        height: 56,
                        background: isPlaying ? 'rgba(168,180,248,0.15)' : 'var(--ice-blue)',
                        border: '1px solid var(--glass-border)',
                        color: isPlaying ? 'var(--ice-blue)' : 'var(--void-black)',
                        fontSize: '1.25rem',
                      }}
                      data-cursor="hover"
                      data-cursor-label="Play"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? '⏸' : '▶'}
                    </button>
                    <button
                      onClick={handleNext}
                      className="glass-btn w-10 h-10 flex items-center justify-center"
                      data-cursor="hover"
                      data-cursor-label="Next"
                      aria-label="Next track"
                    >
                      <span style={{ fontSize: '1rem' }}>⏭</span>
                    </button>
                  </div>

                  {/* Volume */}
                  <div className="flex items-center gap-3 mt-6">
                    <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}>🔈</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="flex-1"
                      aria-label="Volume"
                    />
                    <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}>🔊</span>
                  </div>
                </div>
              </div>

              {/* Right — Song Info + Lyrics */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Song info card */}
                <div
                  className="glass-card p-8 transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = 'rgba(255,255,255,0.12)';
                    el.style.borderColor = 'rgba(168,180,248,0.4)';
                    el.style.boxShadow =
                      '0 16px 48px rgba(0,0,0,0.6), 0 0 40px rgba(107,95,228,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = 'rgba(255,255,255,0.08)';
                    el.style.borderColor = 'rgba(255,255,255,0.15)';
                    el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)';
                  }}
                >
                  <span
                    className="font-display text-xs uppercase tracking-widest block mb-3"
                    style={{ color: 'var(--ice-blue)' }}
                  >
                    Track {activeTrack + 1} of {TRACKS.length}
                  </span>
                  <h1
                    className="font-display font-bold mb-2"
                    style={{
                      fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                      color: 'var(--star-white)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.05,
                    }}
                  >
                    {track.title}
                  </h1>
                  <p
                    className="font-sans mt-1 mb-6"
                    style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)' }}
                  >
                    Void Frequencies — 2024
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: isPlaying ? 'var(--ice-blue)' : 'rgba(255,255,255,0.3)',
                        boxShadow: isPlaying ? '0 0 8px var(--ice-blue)' : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    />
                    <span
                      className="font-display text-xs uppercase tracking-widest"
                      style={{ color: isPlaying ? 'var(--ice-blue)' : 'rgba(255,255,255,0.35)' }}
                    >
                      {isPlaying ? 'Now Playing' : 'Paused'}
                    </span>
                  </div>
                </div>

                {/* All tracks — in-player mini list */}
                <div
                  className="glass-card p-4 transition-all duration-300"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = 'rgba(255,255,255,0.1)';
                    el.style.borderColor = 'rgba(168,180,248,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = 'rgba(255,255,255,0.08)';
                    el.style.borderColor = 'rgba(255,255,255,0.15)';
                  }}
                  style={{ maxHeight: '260px', overflowY: 'auto', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                >
                  <div className="mb-3 px-4">
                    <span
                      className="font-display text-xs uppercase tracking-widest"
                      style={{ color: 'var(--ice-blue)', opacity: 0.7 }}
                    >
                      Queue
                    </span>
                  </div>
                  {TRACKS.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTrack(i)}
                      className="w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200"
                      style={{
                        background: i === activeTrack ? 'rgba(168,180,248,0.10)' : 'transparent',
                        borderLeft: `2px solid ${i === activeTrack ? 'var(--ice-blue)' : 'transparent'}`,
                      }}
                      data-cursor="hover"
                      data-cursor-label="Play"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className="font-sans"
                            style={{
                              fontSize: '0.7rem',
                              color:
                                i === activeTrack ? 'var(--ice-blue)' : 'rgba(255,255,255,0.3)',
                              minWidth: 20,
                            }}
                          >
                            {i === activeTrack && isPlaying ? '♫' : String(i + 1).padStart(2, '0')}
                          </span>
                          <span
                            className="font-display font-medium"
                            style={{
                              fontSize: '0.8rem',
                              color:
                                i === activeTrack ? 'var(--star-white)' : 'rgba(255,255,255,0.55)',
                            }}
                          >
                            {t.title}
                          </span>
                        </div>
                        <span
                          className="font-sans"
                          style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}
                        >
                          {t.duration}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Lyrics toggle */}
                <button
                  onClick={() => setLyricsVisible(!lyricsVisible)}
                  className="w-full glass-btn py-2.5 font-display text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  data-cursor="hover"
                  data-cursor-label="Lyrics"
                >
                  <span style={{ color: 'var(--galaxy-gold)' }}>✦</span>
                  {lyricsVisible ? 'Hide Lyrics' : 'Show Lyrics'}
                </button>

                {lyricsVisible && (
                  <div className="glass-card p-6 text-center">
                    {LYRICS_LINES.slice(Math.max(0, activeLyricLine - 1), activeLyricLine + 2).map(
                      (line, i) => (
                        <p
                          key={i}
                          className="font-display"
                          style={{
                            fontSize: '0.95rem',
                            lineHeight: 1.9,
                            color: i === 1 ? 'var(--star-white)' : 'rgba(255,255,255,0.3)',
                            fontWeight: i === 1 ? 600 : 400,
                            transition: 'all 0.4s ease',
                          }}
                        >
                          {line}
                        </p>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      <SiteFooter />
    </div>
  );
}
