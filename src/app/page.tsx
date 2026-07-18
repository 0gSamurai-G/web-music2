import React from 'react';
import HomePageClient from './components/HomePageClient';
import { fetchChapters } from '@/lib/api';

export default async function HomePage() {
  let chapters = [];
  try {
    chapters = await fetchChapters();
  } catch (err) {
    console.error("Failed to fetch chapters on server", err);
  }

  return <HomePageClient initialChapters={chapters} />;
}
