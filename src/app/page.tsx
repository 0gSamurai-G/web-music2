'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

import AppLogo from '@/components/ui/AppLogo';
import InteractiveStarfield from './components/InteractiveStarfield';
import CustomCursor from './components/CustomCursor';
import RefractionLayer from './components/RefractionLayer';
import CosmicBackground from './components/CosmicBackground';
import TwinkleStarsCanvas from './components/TwinkleStarsCanvas';
import WarpStarsCanvas from './components/WarpStarsCanvas';
import ChapterIntro from './components/ChapterIntro';
import ChapterFreeFall from './components/ChapterFreeFall';
import ChapterSink from './components/ChapterSink';
import ChapterRise from './components/ChapterRise';
import ChapterTriumph from './components/ChapterTriumph';
import AlbumsReveal from './components/AlbumsReveal';
import TopSongsSection from './components/TopSongsSection';
import SiteFooter from '@/components/Footer';

const CHAPTERS = ['intro', 'freefall', 'sink', 'rise', 'triumph', 'albums', 'topsongs', 'footer'] as const;
type Chapter = (typeof CHAPTERS)[number];

export default function HomePage() {
  const [activeChapter, setActiveChapter] = useState<Chapter>('intro');
  const [navScrolled, setNavScrolled] = useState(false);
  const [starOpacity, setStarOpacity] = useState(0);
  const [refractionOpacity, setRefractionOpacity] = useState(0);
  const [surfacePulse, setSurfacePulse] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const snapContainerRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);
  const heroSectionRef = useRef<HTMLElement>(null);

  const handleChapterChange = useCallback((chapter: Chapter) => {
    setActiveChapter(chapter);

    switch (chapter) {
      case 'intro':
        setStarOpacity(1);
        setRefractionOpacity(0);
        break;
      case 'freefall':
        setStarOpacity(1);
        setRefractionOpacity(0);
        break;
      case 'sink':
        setStarOpacity(0.25);
        setRefractionOpacity(0.08);
        break;
      case 'rise':
        setStarOpacity(0.9);
        setRefractionOpacity(0);
        setSurfacePulse(true);
        setTimeout(() => setSurfacePulse(false), 400);
        break;
      case 'triumph':
        setStarOpacity(0.75);
        setRefractionOpacity(0);
        break;
      case 'albums':
        setStarOpacity(0.6);
        setRefractionOpacity(0);
        break;
      case 'topsongs':
        setStarOpacity(0.8);
        setRefractionOpacity(0);
        break;
      case 'footer':
        setStarOpacity(0.5);
        setRefractionOpacity(0);
        break;
    }
  }, []);

  useEffect(() => {
    const container = snapContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      setNavScrolled(scrollTop > 50);

      const heroSection = heroSectionRef.current;
      if (heroSection) {
        const heroHeight = heroSection.offsetHeight;
        setIsHeroVisible(scrollTop < heroHeight);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    chapterRefs.current.forEach((el, i) => {
      if (!el) return;
      const chapter = CHAPTERS[i];
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
              handleChapterChange(chapter);
            }
          });
        },
        {
          root: snapContainerRef.current,
          threshold: 0.5,
        }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [handleChapterChange]);

  return (
    <div className="relative bg-void-black min-h-screen">
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-5 nav-reveal transition-all duration-500"
        style={{
          backdropFilter: navScrolled ? 'blur(20px)' : 'none',
          background: navScrolled ? 'rgba(5,5,15,0.7)' : 'transparent',
          borderBottom: navScrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
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
            className={`font-display text-xs uppercase tracking-widest transition-colors ${
              activeChapter !== 'intro'
                ? 'text-ice-blue border-b border-ice-blue'
                : 'text-star-white opacity-70 hover:opacity-100'
            }`}
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

      <InteractiveStarfield opacity={starOpacity} />
      <RefractionLayer opacity={refractionOpacity} />
      <CustomCursor />

      {surfacePulse && (
        <div className="surface-pulse" style={{ opacity: 0.15, transition: 'opacity 0.3s ease' }} />
      )}

      <div
        ref={snapContainerRef}
        className="scroll-snap-container relative z-10"
        style={{ height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory' }}
      >
        <section
          ref={(el) => {
            chapterRefs.current[0] = el;
            heroSectionRef.current = el;
          }}
          className="scroll-snap-section relative"
          style={{ scrollSnapAlign: 'start', height: '100vh' }}
        >
          <CosmicBackground isVisible={isHeroVisible} />
          <TwinkleStarsCanvas isActive={isHeroVisible} />
          <WarpStarsCanvas isActive={isHeroVisible} />

          <ChapterIntro
            isActive={activeChapter === 'intro'}
            onComplete={() => handleChapterChange('freefall')}
            isHeroVisible={isHeroVisible}
          />
        </section>

        <section
          ref={(el) => {
            chapterRefs.current[1] = el;
          }}
          className="scroll-snap-section"
          style={{ scrollSnapAlign: 'start', height: '100vh' }}
        >
          <ChapterFreeFall isActive={activeChapter === 'freefall'} />
        </section>

        <section
          ref={(el) => {
            chapterRefs.current[2] = el;
          }}
          className="scroll-snap-section"
          style={{ scrollSnapAlign: 'start', height: '100vh' }}
        >
          <ChapterSink isActive={activeChapter === 'sink'} />
        </section>

        <section
          ref={(el) => {
            chapterRefs.current[3] = el;
          }}
          className="scroll-snap-section"
          style={{ scrollSnapAlign: 'start', height: '100vh' }}
        >
          <ChapterRise isActive={activeChapter === 'rise'} />
        </section>

        <section
          ref={(el) => {
            chapterRefs.current[4] = el;
          }}
          className="scroll-snap-section"
          style={{ scrollSnapAlign: 'start', height: '100vh' }}
        >
          <ChapterTriumph isActive={activeChapter === 'triumph'} />
        </section>

        <section
          ref={(el) => {
            chapterRefs.current[5] = el;
          }}
          className="scroll-snap-section"
          style={{ scrollSnapAlign: 'start', height: '100vh' }}
        >
          <AlbumsReveal isActive={activeChapter === 'albums'} />
        </section>

        <section
          ref={(el) => {
            chapterRefs.current[6] = el;
          }}
          className="scroll-snap-section"
          style={{ scrollSnapAlign: 'start', height: '100vh' }}
        >
          <TopSongsSection isActive={activeChapter === 'topsongs'} />
        </section>

        <section
          ref={(el) => {
            chapterRefs.current[7] = el;
          }}
          className="scroll-snap-section"
          style={{ scrollSnapAlign: 'start', minHeight: '100vh' }}
        >
          <SiteFooter />
        </section>
      </div>
    </div>
  );
}