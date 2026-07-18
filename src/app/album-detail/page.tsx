import React from 'react';
import { fetchAlbum, fetchAlbums } from '@/lib/api';
import AlbumDetailPageClient from '../components/AlbumDetailPageClient';
import Link from 'next/link';
import InteractiveStarfield from '../components/InteractiveStarfield';
import CustomCursor from '../components/CustomCursor';
import SiteFooter from '@/components/Footer';
import AppLogo from '@/components/ui/AppLogo';

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export const revalidate = 0; // Ensure dynamic rendering

export default async function AlbumDetailPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const id = resolvedParams.id || 'void-frequencies';

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

  try {
    const [album, albums] = await Promise.all([
      fetchAlbum(id),
      fetchAlbums()
    ]);

    if (!album) {
      throw new Error(`Album ${id} not found`);
    }

    return (
      <AlbumDetailPageClient
        initialAlbum={album}
        initialAlbums={albums}
      />
    );
  } catch (err) {
    console.error("Failed to load album details", err);
    return (
      <div className="relative min-h-screen">
        <InteractiveStarfield opacity={0.7} />
        <CustomCursor />
        <Nav />
        <main className="relative z-10 pt-32 pb-20 px-6 md:px-12">
          <div className="max-w-md mx-auto text-center glass-card p-8" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-red-400 font-display text-xs uppercase tracking-widest mb-2">✦ Album Offline ✦</p>
            <p className="text-star-white/60 text-sm font-sans mb-6">The frequencies of this album are temporarily lost in the dark matter.</p>
            <Link href="/albums" className="glass-btn px-6 py-2.5 text-xs font-display uppercase tracking-widest inline-block">Back to Albums</Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }
}
