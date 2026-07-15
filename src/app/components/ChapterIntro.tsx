'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ChapterIntroProps {
  isActive: boolean;
  onComplete: () => void;
  isHeroVisible: boolean;
}

const ARTIST_NAME = 'VOID FREQUENCIES';

export default function ChapterIntro({ isActive, onComplete, isHeroVisible }: ChapterIntroProps) {
  const [letters, setLetters] = useState<{ char: string; visible: boolean }[]>([]);
  const [phase, setPhase] = useState<'idle' | 'reveal' | 'hold'>('idle');
  const hasPlayedRef = useRef(false);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasPlayedRef.current) return;
    hasPlayedRef.current = true;

    const chars = ARTIST_NAME.split('').map((char) => ({ char, visible: false }));
    setLetters(chars);
    setPhase('reveal');

    chars.forEach((_, i) => {
      setTimeout(
        () => {
          setLetters((prev) => prev.map((l, idx) => (idx === i ? { ...l, visible: true } : l)));
        },
        300 + i * 40
      );
    });

    const holdTimeout = setTimeout(
      () => {
        setPhase('hold');
      },
      300 + chars.length * 40 + 200
    );

    return () => {
      clearTimeout(holdTimeout);
    };
  }, []);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.position = 'absolute';
      titleRef.current.style.top = '50%';
      titleRef.current.style.left = '50%';
      titleRef.current.style.transform = 'translate(-50%, -50%)';
      titleRef.current.style.width = '100%';
      titleRef.current.style.maxWidth = '100%';
      titleRef.current.style.zIndex = '20';
      titleRef.current.style.pointerEvents = 'none';
    }
  }, [isHeroVisible]);

  return (
    <div className="relative w-full h-full min-h-screen">
      <div
        ref={titleRef}
        className="hero-title-container"
        style={{
          opacity: 0.7,
          transform: 'scale(1)',
          transition: 'opacity 1.4s ease, transform 1.4s ease',
        }}
      >
        <h1
          className="font-display text-center uppercase"
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
            fontWeight: 700,
            color: 'var(--star-white)',
            letterSpacing: '0.3em',
            lineHeight: 1.1,
            textShadow: '0 0 40px rgba(168, 180, 248, 0.3), 0 0 80px rgba(168, 180, 248, 0.1)',
          }}
        >
          {letters.map((l, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: l.visible ? 1 : 0,
                transform: l.visible ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
                whiteSpace: l.char === ' ' ? 'pre' : 'normal',
                minWidth: l.char === ' ' ? '0.5em' : undefined,
              }}
            >
              {l.char}
            </span>
          ))}
        </h1>
        <p
          className="font-display text-center uppercase mt-6"
          style={{
            fontSize: 'clamp(0.7rem, 1.5vw, 0.875rem)',
            letterSpacing: '0.5em',
            color: 'var(--ice-blue)',
            opacity: phase === 'reveal' ? 0 : 0.7,
            transition: 'opacity 1s ease 0.5s',
            textShadow: '0 0 20px rgba(168, 180, 248, 0.2)',
          }}
        >
          Scroll to begin
        </p>
      </div>

      <div
        className="absolute bottom-12 left-1/2"
        style={{
          transform: 'translateX(-50%)',
          opacity: phase === 'hold' ? 0.6 : 0,
          transition: 'opacity 0.8s ease',
          zIndex: 20,
        }}
      >
        <div
          style={{
            width: 1,
            height: 48,
            background: 'linear-gradient(to bottom, var(--ice-blue), transparent)',
            margin: '0 auto',
          }}
        />
      </div>
    </div>
  );
}
