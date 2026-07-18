'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
}

const SONGS: Song[] = [
  {
    id: 1,
    title: 'Free Fall',
    artist: 'VoidFrequencies',
    album: 'Void Frequencies',
    duration: '3:42',
  },
  {
    id: 2,
    title: 'Impact',
    artist: 'VoidFrequencies',
    album: 'Void Frequencies',
    duration: '4:15',
  },
  {
    id: 3,
    title: 'Descent',
    artist: 'VoidFrequencies',
    album: 'Void Frequencies',
    duration: '5:01',
  },
  {
    id: 4,
    title: 'Bubble Up',
    artist: 'VoidFrequencies',
    album: 'Void Frequencies',
    duration: '3:28',
  },
  {
    id: 5,
    title: 'Surface',
    artist: 'VoidFrequencies',
    album: 'Void Frequencies',
    duration: '4:44',
  },
  {
    id: 6,
    title: 'Void Walk',
    artist: 'VoidFrequencies',
    album: 'Void Frequencies',
    duration: '3:55',
  },
  {
    id: 7,
    title: 'Neon Depth',
    artist: 'VoidFrequencies',
    album: 'Void Frequencies',
    duration: '4:08',
  },
  { id: 8, title: 'Orbit', artist: 'VoidFrequencies', album: 'Void Frequencies', duration: '3:33' },
  {
    id: 9,
    title: 'Resonance',
    artist: 'VoidFrequencies',
    album: 'Void Frequencies',
    duration: '4:50',
  },
  {
    id: 10,
    title: 'Triumph',
    artist: 'VoidFrequencies',
    album: 'Void Frequencies',
    duration: '5:12',
  },
];

interface TrackRowProps {
  song: Song;
  index: number;
  isActive: boolean;
  onClick: () => void;
  delay: number;
  visible: boolean;
}

function TrackRow({ song, index, isActive, onClick, delay, visible }: TrackRowProps) {
  const rank = String(index + 1).padStart(2, '0');

  return (
    <button
      onClick={onClick}
      className="relative w-full transition-all duration-300 rounded-full px-4 py-2.5 md:px-6 md:py-3 text-left group"
      style={{
        background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
        backdropFilter: isActive ? 'blur(16px) saturate(140%)' : 'none',
        WebkitBackdropFilter: isActive ? 'blur(16px) saturate(140%)' : 'none',
        border: isActive ? '1px solid rgba(255,255,255,0.12)' : 'none',
        borderRadius: '9999px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-30px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, background 0.3s ease, border 0.3s ease`,
      }}
      aria-pressed={isActive}
      aria-label={`Play ${song.title}`}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div
          className="flex-shrink-0 flex items-center justify-center font-display font-bold transition-all duration-300"
          style={{
            width: isActive ? '32px' : '28px',
            height: isActive ? '32px' : '28px',
            borderRadius: '9999px',
            background: isActive ? 'var(--cosmos-purple)' : 'rgba(255,255,255,0.06)',
            color: isActive ? 'var(--star-white)' : 'rgba(255,255,255,0.35)',
            fontSize: isActive ? '0.75rem' : '0.65rem',
            border: isActive ? 'none' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: isActive ? '0 4px 16px rgba(107,95,228,0.4)' : 'none',
          }}
        >
          {rank}
        </div>
        <span
          className="font-display transition-all duration-300 truncate"
          style={{
            fontSize: '0.85rem',
            fontWeight: isActive ? 500 : 400,
            color: isActive ? 'var(--star-white)' : 'rgba(255,255,255,0.45)',
          }}
        >
          {song.title}
        </span>
      </div>
      {!isActive && (
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        />
      )}
    </button>
  );
}

interface NowPlayingCardProps {
  song: Song;
  isPlaying: boolean;
  onPrev: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  coverVisible: boolean;
  infoVisible: boolean;
  controlsVisible: boolean;
}

function NowPlayingCard({
  song,
  isPlaying,
  onPrev,
  onPlayPause,
  onNext,
  coverVisible,
  infoVisible,
  controlsVisible,
}: NowPlayingCardProps) {
  const [progress, _setProgress] = useState(35);
  const [currentTime, _setCurrentTime] = useState('1:18');
  const totalTime = song.duration;

  return (
    <div
      className="flex flex-col items-center w-full h-full justify-center"
      style={{
        opacity: coverVisible ? 1 : 0,
        transform: coverVisible ? 'scale(1)' : 'scale(0.92)',
        filter: coverVisible ? 'blur(0)' : 'blur(12px)',
        transition: 'opacity 0.9s ease 1.2s, transform 0.9s ease 1.2s, filter 0.9s ease 1.2s',
      }}
    >
      <div
        className="relative w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden ambient-cover"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow:
            '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(107,95,228,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(107,95,228,0.4) 0%, rgba(201,168,76,0.2) 50%, rgba(168,180,248,0.3) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)]" />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontSize: '3rem' }}
        >
          🎵
        </div>
      </div>

      <div
        className="text-center mt-5"
        style={{
          opacity: infoVisible ? 1 : 0,
          transform: infoVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease 1.35s, transform 0.6s ease 1.35s',
        }}
      >
        <h3
          className="font-display font-bold"
          style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
            color: 'var(--star-white)',
            letterSpacing: '-0.01em',
          }}
        >
          {song.title}
        </h3>
        <p
          className="font-sans mt-1"
          style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}
        >
          {song.artist}
        </p>
      </div>

      <div
        className="w-full max-w-[280px] mt-4"
        style={{
          opacity: infoVisible ? 1 : 0,
          transform: infoVisible ? 'translateY(0)' : 'translateY(15px)',
          transition: 'opacity 0.5s ease 1.45s, transform 0.5s ease 1.45s',
        }}
      >
        <div
          className="flex items-center justify-between mb-1"
          style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}
        >
          <span>{currentTime}</span>
          <span>-{totalTime}</span>
        </div>
        <div
          className="relative h-1 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--cosmos-purple), var(--ice-blue))',
            }}
          />
        </div>
      </div>

      <div
        className="flex items-center justify-center gap-5 mt-4"
        style={{
          opacity: controlsVisible ? 1 : 0,
          transform: controlsVisible ? 'translateY(0)' : 'translateY(15px)',
          transition: 'opacity 0.5s ease 1.5s, transform 0.5s ease 1.5s',
        }}
      >
        <button
          onClick={onPrev}
          className="p-2 rounded-full transition-all duration-200 hover:opacity-70 hover:scale-110"
          style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}
          aria-label="Previous track"
        >
          ⏮
        </button>

        <button
          onClick={onPlayPause}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 glow-button"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(16px) saturate(140%)',
            WebkitBackdropFilter: 'blur(16px) saturate(140%)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'var(--star-white)',
            fontSize: '1.25rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(107,95,228,0.2)',
          }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button
          onClick={onNext}
          className="p-2 rounded-full transition-all duration-200 hover:opacity-70 hover:scale-110"
          style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}
          aria-label="Next track"
        >
          ⏭
        </button>
      </div>

      <div
        className="flex items-center justify-center gap-3 mt-4 w-full max-w-[280px]"
        style={{
          opacity: controlsVisible ? 1 : 0,
          transform: controlsVisible ? 'translateY(0)' : 'translateY(15px)',
          transition: 'opacity 0.5s ease 1.6s, transform 0.5s ease 1.6s',
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>🔊</span>
        <div
          className="relative flex-1 h-1 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              width: '70%',
              background: 'linear-gradient(90deg, var(--cosmos-purple), var(--ice-blue))',
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface TopSongsSectionProps {
  isActive?: boolean;
}

export default function TopSongsSection({ isActive = true }: TopSongsSectionProps) {
  const [songs, setSongs] = useState<Song[]>(SONGS);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [moonVisible, setMoonVisible] = useState(false);
  const [songListVisible, setSongListVisible] = useState(false);
  const [coverVisible, setCoverVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        let albumData = null;

        // 1. Try exact slug match for 'void-frequencies'
        try {
          const res = await fetch(`${API_BASE_URL}/api/albums/void-frequencies`, { cache: 'no-store' });
          if (res.ok) {
            albumData = await res.json();
          }
        } catch (e) {
          console.log("Direct 'void-frequencies' lookup failed, trying fallback...", e);
        }

        // 2. Fallback to first album by position
        if (!albumData) {
          try {
            const res = await fetch(`${API_BASE_URL}/api/albums`, { cache: 'no-store' });
            if (res.ok) {
              const allAlbums = await res.json();
              if (allAlbums && allAlbums.length > 0) {
                albumData = allAlbums[0];
              }
            }
          } catch (e) {
            console.log("Fallback all-albums fetch failed:", e);
          }
        }

        if (albumData && albumData.songs && albumData.songs.length > 0) {
          const sortedSongs = [...albumData.songs].sort((a, b) => a.track_number - b.track_number);
          const mapped: Song[] = sortedSongs.slice(0, 10).map((song: any) => ({
            id: song.id,
            title: song.title,
            artist: 'VoidFrequencies',
            album: albumData.title,
            duration: song.duration
          }));
          setSongs(mapped);
          setFetchError(false);
        } else {
          setFetchError(true);
        }
      } catch (err) {
        console.error("Failed to load Top Songs dynamically:", err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleTrackClick = useCallback((index: number) => {
    setActiveIndex(index);
    setIsPlaying(true);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? songs.length - 1 : prev - 1));
    setIsPlaying(true);
  }, [songs]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === songs.length - 1 ? 0 : prev + 1));
    setIsPlaying(true);
  }, [songs]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isActive || loading || fetchError) {
      setMoonVisible(false);
      setSongListVisible(false);
      setCoverVisible(false);
      setInfoVisible(false);
      setControlsVisible(false);
      return;
    }

    const t1 = setTimeout(() => setMoonVisible(true), 100);
    const t2 = setTimeout(() => setSongListVisible(true), 500);
    const t3 = setTimeout(() => setCoverVisible(true), 1200);
    const t4 = setTimeout(() => setInfoVisible(true), 1350);
    const t5 = setTimeout(() => setControlsVisible(true), 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isActive, loading, fetchError]);

  const activeSong = songs[activeIndex] || SONGS[0];

  if (fetchError) {
    return (
      <section
        ref={sectionRef}
        className="relative z-10 h-screen w-full flex items-center justify-center"
      >
        <div className="glass-card p-6 text-center max-w-md mx-auto">
          <p className="text-red-400 font-display text-xs uppercase tracking-widest mb-2">✦ Connection Offline ✦</p>
          <p className="text-star-white/60 text-sm font-sans">The top frequencies are temporarily drifting. Please check back later.</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section
        ref={sectionRef}
        className="relative z-10 h-screen w-full flex items-center justify-center"
      >
        <div className="max-w-7xl mx-auto w-full px-6 md:px-12 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          <div className="relative flex flex-col items-center lg:flex-row gap-8 lg:gap-16 w-full animate-pulse">
            <div className="relative flex items-center justify-center">
              <div
                className="rounded-full bg-void-black border border-glass-border flex flex-col items-center justify-center p-8 gap-4"
                style={{
                  width: 'clamp(300px, 45vw, 520px)',
                  height: 'clamp(300px, 45vw, 520px)',
                  background: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="h-10 w-4/5 rounded-full bg-white/5" />
                ))}
              </div>
            </div>
            <div className="flex-1 w-full flex flex-col items-center justify-center lg:items-start gap-4">
              <div className="w-[280px] aspect-square rounded-2xl bg-white/5" />
              <div className="h-6 w-48 rounded bg-white/5 mt-4" />
              <div className="h-4 w-32 rounded bg-white/5" />
              <div className="h-2 w-[280px] rounded bg-white/5 mt-4" />
              <div className="flex gap-4 mt-4">
                <div className="h-10 w-10 rounded-full bg-white/5" />
                <div className="h-14 w-14 rounded-full bg-white/5" />
                <div className="h-10 w-10 rounded-full bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative z-10 h-screen w-full flex items-center justify-center"
    >
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        <div className="relative flex flex-col items-center lg:flex-row gap-8 lg:gap-16 w-full">
          <div className="relative flex items-center justify-center">
            <div
              className="relative ambient-moon"
              style={{
                width: 'clamp(300px, 45vw, 520px)',
                height: 'clamp(300px, 45vw, 520px)',
                transform: moonVisible ? 'translateX(0)' : 'translateX(-120vw)',
                opacity: moonVisible ? 1 : 0,
                transition: 'transform 1.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.8s ease',
              }}
            >
              <img
                src="/assets/images/moon.png"
                alt=""
                className="w-full h-full object-contain"
                style={{ filter: 'drop-shadow(0 0 80px rgba(168,180,248,0.2))' }}
              />
              <div
                className="absolute inset-0 flex flex-col items-center justify-center px-8 py-12 overflow-hidden"
                style={{ top: '8%', height: '84%' }}
              >
                <div className="w-full max-h-full overflow-y-auto scroll-smooth pr-1">
                  <div className="flex flex-col gap-2">
                    {songs.map((song, index) => (
                      <TrackRow
                        key={song.id}
                        song={song}
                        index={index}
                        isActive={index === activeIndex}
                        onClick={() => handleTrackClick(index)}
                        delay={400 + index * 80}
                        visible={songListVisible}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="flex-1 w-full flex items-center justify-center lg:justify-start"
            style={{ minHeight: 'clamp(300px, 45vw, 520px)' }}
          >
            <NowPlayingCard
              song={activeSong}
              isPlaying={isPlaying}
              onPrev={handlePrev}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              coverVisible={coverVisible}
              infoVisible={infoVisible}
              controlsVisible={controlsVisible}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export { SONGS };
