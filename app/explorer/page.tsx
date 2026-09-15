import React from 'react';
import type { Metadata } from 'next';
import { getAllStories } from '@/lib/db';
import ArticleExplorer from '@/components/ArticleExplorer';

export const metadata: Metadata = {
  title: '2025 Articles Explorer — Bihar Say',
  description: 'Search, filter by author, and sort through all 200 scraped 2025 articles on Bihar Say.',
};

export default async function ExplorerPage() {
  const stories = await getAllStories();

  return (
    <main style={{ minHeight: '80vh', padding: '20px 0' }}>
      <ArticleExplorer articles={stories} />
    </main>
  );
}
