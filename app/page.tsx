import React from 'react';
import { getAllStories } from '@/lib/db';
import HomeFeed from '@/components/HomeFeed';

// Enable Incremental Static Regeneration (ISR) with 60-second revalidation
// to serve high traffic smoothly while drastically reducing Firestore read costs.
export const revalidate = 60;

export default async function HomePage() {
  const allStories = await getAllStories();

  return (
    <HomeFeed initialStories={allStories} />
  );
}
