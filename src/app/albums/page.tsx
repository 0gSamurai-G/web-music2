import React from 'react';
import AlbumsPageClient from '../components/AlbumsPageClient';
import { fetchAlbums, fetchSettings } from '@/lib/api';

export default async function AlbumsPage() {
  let albums = [];
  let yearsActive = '3';
  let streams = '∞';

  try {
    const [albumsData, settingsData] = await Promise.all([
      fetchAlbums(),
      fetchSettings()
    ]);
    if (albumsData) {
      albums = albumsData;
    }
    if (settingsData) {
      const ya = settingsData.find(s => s.key === 'years_active');
      if (ya) yearsActive = ya.value;
      const st = settingsData.find(s => s.key === 'streams');
      if (st) streams = st.value;
    }
  } catch (err) {
    console.error("Failed to fetch albums/settings on server", err);
  }

  return (
    <AlbumsPageClient
      initialAlbums={albums}
      initialYearsActive={yearsActive}
      initialStreams={streams}
    />
  );
}
