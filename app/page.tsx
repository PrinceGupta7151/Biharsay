import React from 'react';
import { getAllStories } from '@/lib/db';
import HomeFeed from '@/components/HomeFeed';

// Force dynamic rendering so every visit pulls latest Firestore updates
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const allStories = await getAllStories();

  return (
    <HomeFeed initialStories={allStories} />
  );
}
