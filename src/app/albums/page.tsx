'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import DualCoverImage from '@/components/ui/DualCoverImage';
import AppLogo from '@/components/ui/AppLogo';
import InteractiveStarfield from '../components/InteractiveStarfield';
import CustomCursor from '../components/CustomCursor';
import SiteFooter from '@/components/Footer';
import { ALBUMS } from '../components/AlbumsReveal';

export default function AlbumsPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative min-h-screen">
      <InteractiveStarfield opacity={0.8} />
      <CustomCursor />

      {/* Nav */}
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
            className="font-display text-xs uppercase tracking-widest text-ice-blue border-b border-ice-blue transition-colors"
          >
            Albums
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero stacked reveal */}
          <div ref={heroRef} className="mb-20">
            <span
              className="font-display text-xs uppercase tracking-widest block mb-4"
              style={{ color: 'var(--ice-blue)' }}
            >
              Full Discography
            </span>
            <h1
              className="font-display font-bold mb-12"
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                color: 'var(--star-white)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              All Albums
            </h1>

            {/* Grid view */}
            <div className="relative">
              <div
                className="grid gap-6"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
              >
                {ALBUMS.map((album, i) => (
                  <Link
                    key={album.id}
                    href="/album-detail"
                    data-cursor="album"
                    data-cursor-label="Explore"
                    className="opacity-100"
                  >
                      <div
                        className="glass-card group overflow-hidden"
                        style={{
                          transition:
                            'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease',
                          background: 'transparent !important',
                          backdropFilter: 'none !important',
                        }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = 'translateY(-6px)';
                        el.style.borderColor = 'rgba(168,180,248,0.3)';
                        el.style.boxShadow =
                          '0 16px 48px rgba(0,0,0,0.8), 0 0 40px rgba(107,95,228,0.25)';
                        el.style.background = 'rgba(255, 255, 255, 0.08)';
                        el.style.backdropFilter = 'blur(20px)';
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = 'translateY(0)';
                        el.style.borderColor = 'rgba(255,255,255,0.10)';
                        el.style.boxShadow =
                          '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)';
                        el.style.background = 'transparent';
                        el.style.backdropFilter = 'none';
                      }}
                    >
                      <div
                        className="overflow-hidden"
                        style={{ height: 220, position: 'relative' }}
                      >
                        <DualCoverImage
                          srcA="/assets/images/cover_1_a.png"
                          srcB="/assets/images/cover_1_b.png"
                          alt={`${album.title} album artwork`}
                          circleRadius={95}
                          ringRgb="168,180,248"
                          className="w-full"
                          style={{ height: '220px', display: 'block' }}
                        />
                      </div>
                      <div className="p-4">
                        <h3
                          className="font-display font-semibold"
                          style={{ fontSize: '1rem', color: 'var(--star-white)' }}
                        >
                          {album.title}
                        </h3>
                        <p
                          className="font-sans mt-1"
                          style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}
                        >
                          {album.year} · {album.tracks} tracks
                        </p>
                        <p
                          className="font-sans mt-3 line-clamp-2"
                          style={{
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.4)',
                            lineHeight: 1.5,
                          }}
                        >
                          {album.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '3rem' }}
          >
            {[
              { label: 'Albums', value: '5' },
              { label: 'Total Tracks', value: '50' },
              { label: 'Years Active', value: '3' },
              { label: 'Streams', value: '∞' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-6 text-center">
                <div
                  className="font-display font-bold"
                  style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'var(--star-white)' }}
                >
                  {stat.value}
                </div>
                <div
                  className="font-display text-xs uppercase tracking-widest mt-2"
                  style={{ color: 'var(--ice-blue)', opacity: 0.7 }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
