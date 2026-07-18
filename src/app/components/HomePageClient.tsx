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
import DynamicChapter from './DynamicChapter';
import AlbumsReveal from './AlbumsReveal';
import TopSongsSection from './TopSongsSection';
import SiteFooter from '@/components/Footer';
import { Chapter as ApiChapter, FrontendAlbum } from '@/lib/api';
import AppLoader from '@/components/ui/AppLoader';

/**
 * Static "bookend" sections that always appear before / after the
 * dynamic API-driven chapters.
 *
 * index 0 → intro hero
 * index 1…N → dynamic chapters (sorted by `position` from the backend)
 * index N+1 → albums reveal
 * index N+2 → top songs
 * index N+3 → footer
 */
type StaticChapter = 'intro' | 'albums' | 'topsongs' | 'footer';
type ActiveSection = StaticChapter | `chapter-${number}`;

interface HomePageClientProps {
  initialChapters: ApiChapter[];
  initialAlbums: FrontendAlbum[];
}

export default function HomePageClient({ initialChapters, initialAlbums }: HomePageClientProps) {
  // Sort once by position (ascending), so admin reorder is reflected immediately
  const sortedChapters = [...initialChapters].sort((a, b) => a.position - b.position);

  const [activeSection, setActiveSection] = useState<ActiveSection>('intro');
  const [navScrolled, setNavScrolled] = useState(false);
  const [starOpacity, setStarOpacity] = useState(1);
  const [refractionOpacity, setRefractionOpacity] = useState(0);
  const [surfacePulse, setSurfacePulse] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const snapContainerRef = useRef<HTMLDivElement>(null);
  // We hold refs to ALL sections dynamically
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const heroSectionRef = useRef<HTMLElement>(null);

  // Total section count: intro + dynamic chapters + albums + topsongs + footer
  const totalSections = 1 + sortedChapters.length + 3;

  const handleSectionChange = useCallback(
    (sectionId: ActiveSection, sectionIndex: number) => {
      setActiveSection(sectionId);

      // Intro
      if (sectionId === 'intro') {
        setStarOpacity(1);
        setRefractionOpacity(0);
        return;
      }
      // Bookends
      if (sectionId === 'albums') { setStarOpacity(0.6); setRefractionOpacity(0); return; }
      if (sectionId === 'topsongs') { setStarOpacity(0.8); setRefractionOpacity(0); return; }
      if (sectionId === 'footer') { setStarOpacity(0.5); setRefractionOpacity(0); return; }

      // Dynamic chapters — cinematically progress through the scroll
      const chapterIdx = sectionIndex - 1; // 0-based among chapters
      const modVariant = chapterIdx % 4;

      let so = 1;
      let ro = 0;

      if (modVariant === 0) {
        so = 1;
        ro = 0;
      } else if (modVariant === 1) {
        so = 0.25;
        ro = 0.08;
      } else if (modVariant === 2) {
        so = 0.9;
        ro = 0;
        setSurfacePulse(true);
        setTimeout(() => setSurfacePulse(false), 400);
      } else if (modVariant === 3) {
        so = 0.75;
        ro = 0;
      }

      setStarOpacity(so);
      setRefractionOpacity(ro);
    },
    []
  );

  useEffect(() => {
    const container = snapContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      setNavScrolled(scrollTop > 50);
      const heroSection = heroSectionRef.current;
      if (heroSection) {
        setIsHeroVisible(scrollTop < heroSection.offsetHeight);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const sectionIds: ActiveSection[] = [
      'intro',
      ...sortedChapters.map((_, i) => `chapter-${i}` as ActiveSection),
      'albums',
      'topsongs',
      'footer',
    ];

    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const sectionId = sectionIds[i];
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
              handleSectionChange(sectionId, i);
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
  }, [handleSectionChange, sortedChapters]);

  const isChapterActive = (index: number) => activeSection === `chapter-${index}`;

  return (
    <div className="relative bg-void-black min-h-screen">
      <AppLoader fadeOut={true} />

      {/* ── Navigation ── */}
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
              activeSection !== 'intro'
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

      {/* ── Scroll snap container ── */}
      <div
        ref={snapContainerRef}
        className="scroll-snap-container relative z-10"
        style={{ height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory' }}
      >

        {/* ── Section 0: Intro hero ── */}
        <section
          ref={(el) => {
            sectionRefs.current[0] = el;
            heroSectionRef.current = el;
          }}
          className="scroll-snap-section relative"
          style={{ scrollSnapAlign: 'start', height: '100vh' }}
        >
          <CosmicBackground isVisible={isHeroVisible} />
          <TwinkleStarsCanvas isActive={isHeroVisible} />
          <WarpStarsCanvas isActive={isHeroVisible} />
          <ChapterIntro
            isActive={activeSection === 'intro'}
            onComplete={() => handleSectionChange('chapter-0', 1)}
            isHeroVisible={isHeroVisible}
          />
        </section>

        {/* ── Sections 1…N: Dynamic chapters (sorted by admin position) ── */}
        {sortedChapters.map((chapter, i) => (
          <section
            key={chapter.id}
            ref={(el) => {
              sectionRefs.current[1 + i] = el;
            }}
            className="scroll-snap-section"
            style={{ scrollSnapAlign: 'start', height: '100vh' }}
          >
            <DynamicChapter
              isActive={isChapterActive(i)}
              chapter={chapter}
              variant={i % 4}
            />
          </section>
        ))}

        {/* ── Section N+1: Albums reveal ── */}
        <section
          ref={(el) => {
            sectionRefs.current[1 + sortedChapters.length] = el;
          }}
          className="scroll-snap-section"
          style={{ scrollSnapAlign: 'start', height: '100vh' }}
        >
          <AlbumsReveal isActive={activeSection === 'albums'} initialAlbums={initialAlbums} />
        </section>

        {/* ── Section N+2: Top songs ── */}
        <section
          ref={(el) => {
            sectionRefs.current[2 + sortedChapters.length] = el;
          }}
          className="scroll-snap-section"
          style={{ scrollSnapAlign: 'start', height: '100vh' }}
        >
          <TopSongsSection isActive={activeSection === 'topsongs'} />
        </section>

        {/* ── Section N+3: Footer ── */}
        <section
          ref={(el) => {
            sectionRefs.current[3 + sortedChapters.length] = el;
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
