'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

import AppLogo from '@/components/ui/AppLogo';
import InteractiveStarfield from './InteractiveStarfield';
import CustomCursor from './CustomCursor';
import RefractionLayer from './RefractionLayer';
import CosmicBackground from './CosmicBackground';
import TwinkleStarsCanvas from './TwinkleStarsCanvas';
import WarpStarsCanvas from './WarpStarsCanvas';
import ChapterIntro from './ChapterIntro';
import ChapterFreeFall from './ChapterFreeFall';
import ChapterSink from './ChapterSink';
import ChapterRise from './ChapterRise';
import ChapterTriumph from './ChapterTriumph';
import AlbumsReveal from './AlbumsReveal';
import TopSongsSection from './TopSongsSection';
import SiteFooter from '@/components/Footer';
import { Chapter as ApiChapter } from '@/lib/api';
import AppLoader from '@/components/ui/AppLoader';

const CHAPTERS = ['intro', 'freefall', 'sink', 'rise', 'triumph', 'albums', 'topsongs', 'footer'] as const;
type Chapter = (typeof CHAPTERS)[number];

interface HomePageClientProps {
  initialChapters: ApiChapter[];
}

export default function HomePageClient({ initialChapters }: HomePageClientProps) {
  const [activeChapter, setActiveChapter] = useState<Chapter>('intro');
  const [navScrolled, setNavScrolled] = useState(false);
  const [starOpacity, setStarOpacity] = useState(0);
  const [refractionOpacity, setRefractionOpacity] = useState(0);
  const [surfacePulse, setSurfacePulse] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const snapContainerRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);
  const heroSectionRef = useRef<HTMLElement>(null);
  const [chapters] = useState<ApiChapter[]>(initialChapters);
  const [isInitialLoading, setIsInitialLoading] = useState(false); // No client hydration gap needed because chapters are pre-fetched on server!

  const activeChapterRef = useRef<Chapter>('intro');

  const handleChapterChange = useCallback((chapter: Chapter) => {
    if (activeChapterRef.current === chapter) return;
    activeChapterRef.current = chapter;
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

    let scrollRaf: number | null = null;

    const handleScroll = () => {
      if (scrollRaf !== null) return;
      scrollRaf = window.requestAnimationFrame(() => {
        scrollRaf = null;
        const scrollTop = container.scrollTop;
        setNavScrolled(scrollTop > 50);

        const heroSection = heroSectionRef.current;
        if (heroSection) {
          const heroHeight = heroSection.offsetHeight;
          setIsHeroVisible(scrollTop < heroHeight);
        }
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollRaf !== null) {
        window.cancelAnimationFrame(scrollRaf);
      }
    };
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

  const getChapterData = (id: string) => chapters.find(c => c.id === id);

  return (
    <div className="relative bg-void-black min-h-screen">
      <AppLoader fadeOut={!isInitialLoading} />

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
          <ChapterFreeFall isActive={activeChapter === 'freefall'} chapter={getChapterData('chapter-1')} />
        </section>

        <section
          ref={(el) => {
            chapterRefs.current[2] = el;
          }}
          className="scroll-snap-section"
          style={{ scrollSnapAlign: 'start', height: '100vh' }}
        >
          <ChapterSink isActive={activeChapter === 'sink'} chapter={getChapterData('chapter-2')} />
        </section>

        <section
          ref={(el) => {
            chapterRefs.current[3] = el;
          }}
          className="scroll-snap-section"
          style={{ scrollSnapAlign: 'start', height: '100vh' }}
        >
          <ChapterRise isActive={activeChapter === 'sink' ? false : activeChapter === 'rise'} chapter={getChapterData('chapter-3')} />
        </section>

        <section
          ref={(el) => {
            chapterRefs.current[4] = el;
          }}
          className="scroll-snap-section"
          style={{ scrollSnapAlign: 'start', height: '100vh' }}
        >
          <ChapterTriumph isActive={activeChapter === 'triumph'} chapter={getChapterData('chapter-4')} />
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
