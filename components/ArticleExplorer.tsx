'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, User, Filter, SortAsc, BookOpen, Calendar, ArrowRight, Layers, Clock } from 'lucide-react';
import StoryCard from '@/components/StoryCard';
import { Story } from '@/types';
import styles from './ArticleExplorer.module.css';

export interface ArticleItem {
  id: string;
  title: string;
  author?: string;
  authorName?: string;
  publishedDate?: string;
  date?: string;
  category?: string;
  categoryName?: string;
  summary?: string;
  metaDescription?: string;
  featuredImage?: string;
  imageUrl?: string;
  readingTimeMinutes?: number;
  wordCount?: number;
}

interface ArticleExplorerProps {
  articles: ArticleItem[];
}

export default function ArticleExplorer({ articles }: ArticleExplorerProps) {
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('ALL');
  const [sortBy, setSortBy] = useState<'title-asc' | 'title-desc' | 'author-asc' | 'author-desc' | 'date-desc'>('title-asc');
  const [groupByAuthor, setGroupByAuthor] = useState(false);

  // Extract unique authors list for dropdown filter
  const authorsList = useMemo(() => {
    const authorsSet = new Set<string>();
    articles.forEach(art => {
      const name = art.author || art.authorName || 'Bihar Say | Amrita';
      if (name.trim()) authorsSet.add(name.trim());
    });
    return Array.from(authorsSet).sort();
  }, [articles]);

  // Filter & Sort Logic using useMemo
  const filteredAndSortedArticles = useMemo(() => {
    return articles
      .filter(article => {
        const title = (article.title || '').toLowerCase();
        const author = (article.author || article.authorName || '').toLowerCase();

        const matchesTitle = searchTitle.trim() === '' || title.includes(searchTitle.toLowerCase().trim());
        const matchesAuthor = selectedAuthor === 'ALL' || author === selectedAuthor.toLowerCase().trim();

        return matchesTitle && matchesAuthor;
      })
      .sort((a, b) => {
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();
        const authorA = (a.author || a.authorName || '').toLowerCase();
        const authorB = (b.author || b.authorName || '').toLowerCase();

        if (sortBy === 'title-asc') {
          return titleA.localeCompare(titleB);
        } else if (sortBy === 'title-desc') {
          return titleB.localeCompare(titleA);
        } else if (sortBy === 'author-asc') {
          return authorA.localeCompare(authorB);
        } else if (sortBy === 'author-desc') {
          return authorB.localeCompare(authorA);
        } else if (sortBy === 'date-desc') {
          const dateA = new Date(a.publishedDate || a.date || 0).getTime();
          const dateB = new Date(b.publishedDate || b.date || 0).getTime();
          return dateB - dateA;
        }
        return 0;
      });
  }, [articles, searchTitle, selectedAuthor, sortBy]);

  // Grouping Logic by Author
  const groupedArticles = useMemo(() => {
    if (!groupByAuthor) return null;

    const groups: Record<string, ArticleItem[]> = {};
    filteredAndSortedArticles.forEach(art => {
      const author = art.author || art.authorName || 'Bihar Say | Amrita';
      if (!groups[author]) {
        groups[author] = [];
      }
      groups[author].push(art);
    });

    return groups;
  }, [filteredAndSortedArticles, groupByAuthor]);

  return (
    <div className={styles.explorerWrapper}>
      {/* Header & Controls Section */}
      <div className={styles.controlsHeader}>
        <div className={styles.titleArea}>
          <h2 className={styles.mainHeading}>Bihar Say 2025 Articles Explorer</h2>
          <p className={styles.subHeading}>
            Filter, search, and sort through all {articles.length} scraped 2025 articles.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className={styles.filterGrid}>
          {/* Search by Title Input */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <Search size={14} /> Search Title
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Filter by title (e.g. Metro, Rail, AI)..."
                value={searchTitle}
                onChange={e => setSearchTitle(e.target.value)}
                className={styles.textInput}
              />
              {searchTitle && (
                <button
                  onClick={() => setSearchTitle('')}
                  className={styles.clearBtn}
                  title="Clear title search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter by Author Dropdown */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <User size={14} /> Filter Author
            </label>
            <select
              value={selectedAuthor}
              onChange={e => setSelectedAuthor(e.target.value)}
              className={styles.selectInput}
            >
              <option value="ALL">All Authors ({authorsList.length})</option>
              {authorsList.map(auth => (
                <option key={auth} value={auth}>
                  {auth}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <SortAsc size={14} /> Sort By
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className={styles.selectInput}
            >
              <option value="title-asc">Title (A to Z)</option>
              <option value="title-desc">Title (Z to A)</option>
              <option value="author-asc">Author (A to Z)</option>
              <option value="author-desc">Author (Z to A)</option>
              <option value="date-desc">Published Date (Newest First)</option>
            </select>
          </div>

          {/* Grouping Toggle Button */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <Layers size={14} /> Grouping
            </label>
            <button
              type="button"
              onClick={() => setGroupByAuthor(prev => !prev)}
              className={`${styles.groupToggleBtn} ${groupByAuthor ? styles.activeToggle : ''}`}
            >
              {groupByAuthor ? 'Grouped by Author' : 'Flat List'}
            </button>
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className={styles.resultsBar}>
          <span>
            Showing <strong>{filteredAndSortedArticles.length}</strong> of {articles.length} articles
          </span>
          {(searchTitle || selectedAuthor !== 'ALL' || groupByAuthor) && (
            <button
              onClick={() => {
                setSearchTitle('');
                setSelectedAuthor('ALL');
                setSortBy('title-asc');
                setGroupByAuthor(false);
              }}
              className={styles.resetAllBtn}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content Feed / Results Grid */}
      {filteredAndSortedArticles.length === 0 ? (
        /* Empty State */
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyIcon}>🔍</div>
          <h3 className={styles.emptyTitle}>No Articles Found</h3>
          <p className={styles.emptySubtitle}>
            No articles match title search "{searchTitle}" {selectedAuthor !== 'ALL' ? `or author "${selectedAuthor}"` : ''}.
          </p>
          <button
            onClick={() => {
              setSearchTitle('');
              setSelectedAuthor('ALL');
            }}
            className={styles.emptyResetBtn}
          >
            Clear Search & Show All Articles
          </button>
        </div>
      ) : groupByAuthor && groupedArticles ? (
        /* Grouped View by Author */
        <div className={styles.groupedSection}>
          {Object.entries(groupedArticles).map(([authorName, authorArticles]) => (
            <div key={authorName} className={styles.authorBlock}>
              <div className={styles.authorHeader}>
                <div className={styles.authorBadgeIcon}>👤</div>
                <h3 className={styles.authorHeading}>{authorName}</h3>
                <span className={styles.articleCountBadge}>
                  {authorArticles.length} {authorArticles.length === 1 ? 'article' : 'articles'}
                </span>
              </div>

              <div className={styles.articlesGrid}>
                {authorArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Flat Grid View */
        <div className={styles.articlesGrid}>
          {filteredAndSortedArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}


function getArticleImage(article: ArticleItem): string {
  if (article.imageUrl && article.imageUrl.startsWith('/legacy-images/')) {
    return article.imageUrl;
  }
  const id = (article.id || '').toLowerCase();
  const title = (article.title || '').toLowerCase();

  if (id.includes('makhana') || title.includes('makhana')) return '/legacy-images/WhatsApp-Image-2026-09-01-at-5.23.42-PM.jpeg';
  if (id.includes('deled') || title.includes('deled') || title.includes('admission')) return '/legacy-images/WhatsApp-Image-2026-08-10-at-11.38.54-PM.jpeg';
  if (id.includes('wheat') || title.includes('wheat')) return '/legacy-images/Bihar-Say-Website-8.png';
  if (id.includes('solar') || title.includes('solar')) return '/legacy-images/Bihar-Say-Website-7.png';
  if (id.includes('cleanest-air') || title.includes('cleanest air') || title.includes('munger')) return '/legacy-images/Bihar-Say-Website-6.png';
  if (id.includes('result') || title.includes('result') || title.includes('10th')) return '/legacy-images/Bihar-Say-Website-4.png';
  if (id.includes('flight') || title.includes('flight') || title.includes('international flights')) return '/legacy-images/Bihar-Say-Website-1.png';
  if (id.includes('border-pillar') || title.includes('border pillar')) return '/legacy-images/Bihar-Say-Website.png';
  if (id.includes('lpg') || title.includes('lpg') || title.includes('एलपीजी')) return '/legacy-images/Bihar-Say-Website-84.png';
  if (id.includes('sportstar') || title.includes('sportstar')) return '/legacy-images/Bihar-Say-Website-82.png';
  if (id.includes('kabaddi') || title.includes('kabaddi')) return '/legacy-images/Bihar-Say-Website-81.png';
  if (id.includes('flood') || title.includes('flood') || id.includes('dbt')) return '/legacy-images/Bihar-Say-Website-80.png';
  if (id.includes('sonepur') || title.includes('sonepur')) return '/legacy-images/Bihar-Say-Website-79.png';
  if (id.includes('naxal') || title.includes('naxal')) return '/legacy-images/Bihar-Say-Website-78.png';
  if (id.includes('sasaram') || title.includes('sasaram')) return '/legacy-images/Bihar-Say-Website-77.png';
  if (id.includes('ai-growth') || title.includes('gcc') || title.includes('impact summit')) return '/legacy-images/Bihar-Say-Website-75.png';
  if (id.includes('cement') || title.includes('cement') || title.includes('buxar')) return '/legacy-images/Bihar-Say-Website-74.png';
  if (id.includes('kisan') || title.includes('kisan')) return '/legacy-images/Bihar-Say-Website-73.png';
  if (id.includes('nalanda') || title.includes('buddhist')) return '/legacy-images/Bihar-Say-Website-72.png';
  if (id.includes('bpsc') || title.includes('teacher') || title.includes('salary')) return '/legacy-images/Bihar-Say-Website-71.png';
  if (id.includes('bus') || title.includes('bsrtc')) return '/legacy-images/Bihar-Say-Website-70.png';
  if (id.includes('darbhanga') || title.includes('queen') || title.includes('maharani')) return '/legacy-images/Bihar-Say-Website-69.png';
  if (id.includes('shivlinga') || title.includes('shivlinga') || title.includes('ramayan')) return '/legacy-images/Bihar-Say-Website-68.png';
  if (id.includes('dubai') || title.includes('food festival')) return '/legacy-images/Bihar-Say-Website-67.png';
  if (id.includes('bhumi') || title.includes('land verification') || title.includes('property')) return '/legacy-images/Bihar-Say-Website-66.png';

  return '/legacy-images/Bihar-Say-Website-3.png';
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'September 2026';
  if (dateStr.includes('March') || dateStr.includes('Sept') || dateStr.includes('Aug') || dateStr.includes(',') || dateStr.includes('2026')) {
    return dateStr;
  }
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch { }
  return dateStr;
}

function ArticleCard({ article }: { article: ArticleItem }) {
  const story: Story = {
    id: article.id,
    title: article.title,
    summary: article.summary || article.metaDescription || '',
    content: article.summary || '',
    categorySlug: (article.category || 'education-social') as any,
    categoryName: article.category || article.categoryName || 'Education & Social',
    publishedDate: article.publishedDate || article.date || 'September 2026',
    readingTimeMinutes: article.readingTimeMinutes || 3,
    imageUrl: getArticleImage(article),
    authorName: article.author || article.authorName || 'Bihar Say Desk',
    category: article.category || article.categoryName || 'Education & Social',
    author: article.author || article.authorName || 'Bihar Say Desk',
    date: formatDate(article.publishedDate || article.date),
    readTime: `${article.readingTimeMinutes || 3} min read`,
  } as any;

  return <StoryCard story={story} />;
}
