'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

export interface Article {
  id: string;
  title: string;
  author: string;
  publishedDate?: string;
  date?: string;
  category?: string;
  summary?: string;
  imageUrl?: string;
  readingTimeMinutes?: number;
  url?: string;
}

interface Biharsay2025ArticlesProps {
  articles: Article[];
}

export default function Biharsay2025Articles({ articles }: Biharsay2025ArticlesProps) {
  // State management for filters, sorting & grouping
  const [searchTitle, setSearchTitle] = useState<string>('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'title-asc' | 'title-desc' | 'author-asc' | 'author-desc'>('title-asc');
  const [groupByAuthor, setGroupByAuthor] = useState<boolean>(false);

  // 1. Extract unique list of authors for the filter dropdown
  const authorsList = useMemo(() => {
    const set = new Set<string>();
    articles.forEach(art => {
      if (art.author && art.author.trim()) {
        set.add(art.author.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [articles]);

  // 2. Efficient Filtering & Sorting using useMemo
  const filteredAndSortedArticles = useMemo(() => {
    return articles
      .filter((article) => {
        const titleMatch =
          !searchTitle.trim() ||
          article.title.toLowerCase().includes(searchTitle.toLowerCase().trim());
        const authorMatch =
          selectedAuthor === 'ALL' ||
          article.author.toLowerCase().trim() === selectedAuthor.toLowerCase().trim();

        return titleMatch && authorMatch;
      })
      .sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        const authorA = a.author.toLowerCase();
        const authorB = b.author.toLowerCase();

        switch (sortBy) {
          case 'title-asc':
            return titleA.localeCompare(titleB);
          case 'title-desc':
            return titleB.localeCompare(titleA);
          case 'author-asc':
            return authorA.localeCompare(authorB);
          case 'author-desc':
            return authorB.localeCompare(authorA);
          default:
            return 0;
        }
      });
  }, [articles, searchTitle, selectedAuthor, sortBy]);

  // 3. Grouping Logic by Author using useMemo
  const groupedArticles = useMemo(() => {
    if (!groupByAuthor) return null;

    const groups: Record<string, Article[]> = {};
    filteredAndSortedArticles.forEach((article) => {
      const author = article.author || 'Unknown Author';
      if (!groups[author]) {
        groups[author] = [];
      }
      groups[author].push(article);
    });
    return groups;
  }, [filteredAndSortedArticles, groupByAuthor]);

  // Reset all active search filters
  const handleResetFilters = () => {
    setSearchTitle('');
    setSelectedAuthor('ALL');
    setSortBy('title-asc');
    setGroupByAuthor(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 font-sans">
      {/* Page Header & Filter Controls Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bihar Say 2025 Articles
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Explore, search by title, filter by author, and sort through the article dataset.
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 self-start md:self-auto">
            Total Articles: {articles.length}
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Requirement: Title Search Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title-search" className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Filter by Title
            </label>
            <div className="relative">
              <input
                id="title-search"
                type="text"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="Search title A-Z..."
                className="w-full h-11 px-3.5 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
              {searchTitle && (
                <button
                  onClick={() => setSearchTitle('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-sm font-bold"
                  title="Clear title search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Requirement: Author Filter Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="author-select" className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Filter by Author
            </label>
            <select
              id="author-select"
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition cursor-pointer"
            >
              <option value="ALL">All Authors ({authorsList.length})</option>
              {authorsList.map((author) => (
                <option key={author} value={author}>
                  {author}
                </option>
              ))}
            </select>
          </div>

          {/* Requirement: Sorting (A-Z Title & Author) */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sort-select" className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Sort Order
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition cursor-pointer"
            >
              <option value="title-asc">Title: Alphabetical (A to Z)</option>
              <option value="title-desc">Title: Alphabetical (Z to A)</option>
              <option value="author-asc">Author: Alphabetical (A to Z)</option>
              <option value="author-desc">Author: Alphabetical (Z to A)</option>
            </select>
          </div>

          {/* Requirement: Grouping Toggle */}
          <div className="flex flex-col gap-1.5 justify-end">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Data Grouping
            </label>
            <button
              onClick={() => setGroupByAuthor(!groupByAuthor)}
              className={`h-11 px-4 rounded-xl text-sm font-semibold border transition flex items-center justify-center gap-2 ${
                groupByAuthor
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-500 hover:text-blue-600'
              }`}
            >
              {groupByAuthor ? '✓ Grouped by Author' : 'Group by Author'}
            </button>
          </div>
        </div>

        {/* Results Counter & Reset Action */}
        <div className="mt-6 pt-4 border-t border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900 font-bold">{filteredAndSortedArticles.length}</strong> of{' '}
            {articles.length} articles
          </span>
          {(searchTitle || selectedAuthor !== 'ALL' || groupByAuthor) && (
            <button
              onClick={handleResetFilters}
              className="text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Requirement: Clean Empty State */}
      {filteredAndSortedArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center my-6">
          <div className="w-14 h-14 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-2xl mb-4">
            🔎
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Articles Found</h3>
          <p className="text-sm text-slate-500 max-w-md mb-6">
            We couldn't find any articles matching title query &ldquo;{searchTitle}&rdquo;
            {selectedAuthor !== 'ALL' ? ` and author "${selectedAuthor}"` : ''}.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition"
          >
            Clear Filters & Show All
          </button>
        </div>
      ) : groupByAuthor && groupedArticles ? (
        /* Requirement: Responsive Grouped Layout by Author */
        <div className="space-y-10">
          {Object.entries(groupedArticles).map(([authorName, authorArticles]) => (
            <div key={authorName} className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{authorName}</h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full">
                  {authorArticles.length} {authorArticles.length === 1 ? 'article' : 'articles'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {authorArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Requirement: Responsive Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

// Requirement: Article Card Component displaying Title, Author & Snippet Data
function ArticleCard({ article }: { article: Article }) {
  const formattedDate = article.publishedDate || article.date || '2025';
  const category = article.category || 'Bihar News';
  const summarySnippet = article.summary || 'Click below to read full article coverage on Bihar Say.';
  const readTime = article.readingTimeMinutes || 3;

  return (
    <div className="flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-blue-300 transition group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">
            {category}
          </span>
          <span className="text-slate-400 font-medium">{readTime} min read</span>
        </div>

        {/* Prominent Title */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug mb-2">
          <Link href={`/article/${article.id}`}>{article.title}</Link>
        </h3>

        {/* Snippet / Summary Data */}
        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
          {summarySnippet}
        </p>
      </div>

      {/* Footer: Prominent Author & Action Link */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-auto">
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate max-w-[70%]">
          <span className="text-blue-500">👤</span>
          <span className="truncate">{article.author}</span>
        </div>

        <Link
          href={`/article/${article.id}`}
          className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-0.5 transition"
        >
          Read <span className="text-sm">→</span>
        </Link>
      </div>
    </div>
  );
}
