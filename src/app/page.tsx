import React from 'react';
import HomePageClient from './components/HomePageClient';
import { fetchChapters, Chapter } from '@/lib/api';

export default async function HomePage() {
  let chapters: Chapter[] = [];
  try {
    chapters = await fetchChapters();
  } catch (err) {
    console.error("Failed to fetch chapters on server", err);
  }

  return <HomePageClient initialChapters={chapters} />;
}
