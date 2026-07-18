import React from 'react';
import HomePageClient from './components/HomePageClient';
import { fetchChapters, fetchAlbums, Chapter, FrontendAlbum } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let chapters: Chapter[] = [];
  let albums: FrontendAlbum[] = [];
  try {
    const [chaptersData, albumsData] = await Promise.all([
      fetchChapters(),
      fetchAlbums(),
    ]);
    chapters = chaptersData || [];
    albums = albumsData || [];
  } catch (err) {
    console.error("Failed to fetch chapters/albums on server", err);
  }

  return <HomePageClient initialChapters={chapters} initialAlbums={albums} />;
}
