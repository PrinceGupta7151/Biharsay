'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

export interface ArticleItem {
  id: string;
  title: string;
  author?: string;
  authorName?: string;
  publishedDate?: string;
  date?: string;
  category?: string;
  categoryName?: string;
  categorySlug?: string;
  summary?: string;
  content?: string;
  imageUrl?: string;
  readingTimeMinutes?: number;
  url?: string;
}

export type CategoryId =
  | 'all'
  | 'culture-heritage'
  | 'startups-entrepreneurship'
  | 'investments-economy'
  | 'education-social'
  | 'industry-tech'
  | 'sports-youth'
  | 'commercial-partners'
  | 'about-biharsay'
  | 'uncategorized';

export interface CategoryDef {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
}

export const CATEGORIES_LIST: CategoryDef[] = [
  { id: 'all', name: 'All Articles', icon: '🌐', color: 'bg-slate-700 text-white' },
  { id: 'culture-heritage', name: 'Culture & Heritage', icon: '🏛️', color: 'bg-amber-600 text-amber-50' },
  { id: 'startups-entrepreneurship', name: 'Startups & Entrepreneurship', icon: '🚀', color: 'bg-emerald-600 text-emerald-50' },
  { id: 'investments-economy', name: 'Investments & Economy', icon: '📈', color: 'bg-blue-600 text-blue-50' },
  { id: 'education-social', name: 'Education & Social', icon: '🎓', color: 'bg-indigo-600 text-indigo-50' },
  { id: 'industry-tech', name: 'Industry & Tech / Innovation', icon: '⚙️', color: 'bg-purple-600 text-purple-50' },
  { id: 'sports-youth', name: 'Sports & Youth', icon: '🏆', color: 'bg-rose-600 text-rose-50' },
  { id: 'commercial-partners', name: 'Commercial Services & Partners', icon: '🤝', color: 'bg-cyan-600 text-cyan-50' },
  { id: 'about-biharsay', name: 'About Bihar Say', icon: '🌟', color: 'bg-teal-600 text-teal-50' },
  { id: 'uncategorized', name: 'General / Others', icon: '📰', color: 'bg-slate-600 text-slate-50' },
];

/**
 * Keyword-based auto-categorization fallback logic
 */
export function categorizeArticle(article: ArticleItem): CategoryId {
  const cat = (article.category || article.categoryName || article.categorySlug || '').toLowerCase();
  const title = (article.title || '').toLowerCase();
  const content = (article.summary || article.content || '').toLowerCase();
  const text = `${cat} ${title} ${content}`;

  // Direct category matching
  if (cat.includes('culture') || cat.includes('heritage')) return 'culture-heritage';
  if (cat.includes('startup') || cat.includes('entrepreneur')) return 'startups-entrepreneurship';
  if (cat.includes('investment') || cat.includes('economic') || cat.includes('economy')) return 'investments-economy';
  if (cat.includes('education') || cat.includes('social')) return 'education-social';
  if (cat.includes('industry') || cat.includes('innovation') || cat.includes('tech')) return 'industry-tech';
  if (cat.includes('sport') || cat.includes('youth')) return 'sports-youth';
  if (cat.includes('partner') || cat.includes('commercial') || cat.includes('service')) return 'commercial-partners';
  if (cat.includes('about') || cat.includes('community')) return 'about-biharsay';

  // Keyword parsing
  if (/\b(art|heritage|history|temple|museum|monument|rajgir|nalanda|festival|chhath|craft|sand art)\b/i.test(text)) {
    return 'culture-heritage';
  }
  if (/\b(startup|entrepreneur|founder|incubator|agritech|makhana cluster|litchi cluster|venture|msme)\b/i.test(text)) {
    return 'startups-entrepreneurship';
  }
  if (/\b(investment|crore|real estate|adani|britannia|gdp|budget|investor|industrial park|bank|dbt)\b/i.test(text)) {
    return 'investments-economy';
  }
  if (/\b(education|school|college|university|bpsc|bseb|sakshamta|exam|result|scholarship|student|teacher|doctor|aiims|health)\b/i.test(text)) {
    return 'education-social';
  }
  if (/\b(factory|chip|semiconductor|ai|tech|metro|doppler|radar|power plant|solar|greenfield|optic fiber|foxconn)\b/i.test(text)) {
    return 'industry-tech';
  }
  if (/\b(sports|stadium|cricket|ipl|hockey|athlete|tournament|trophy|championship|ranji|vaibhav)\b/i.test(text)) {
    return 'sports-youth';
  }
  if (/\b(partner|brand|sourcing|supplier|frootex|seller|sponsor|catalog|service)\b/i.test(text)) {
    return 'commercial-partners';
  }
  if (/\b(about biharsay|community|diaspora|bihari diaspora|milestone|bihar say desk)\b/i.test(text)) {
    return 'about-biharsay';
  }

  return 'uncategorized';
}

interface ComponentProps {
  articles: ArticleItem[];
}

export default function BiharSayCategorizedArticles({ articles }: ComponentProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Categorize all articles & calculate dynamic category counters
  const { categorizedMap, categoryCounts } = useMemo(() => {
    const map: Record<CategoryId, ArticleItem[]> = {
      'all': articles,
      'culture-heritage': [],
      'startups-entrepreneurship': [],
      'investments-economy': [],
      'education-social': [],
      'industry-tech': [],
      'sports-youth': [],
      'commercial-partners': [],
      'about-biharsay': [],
      'uncategorized': [],
    };

    const counts: Record<CategoryId, number> = {
      'all': articles.length,
      'culture-heritage': 0,
      'startups-entrepreneurship': 0,
      'investments-economy': 0,
      'education-social': 0,
      'industry-tech': 0,
      'sports-youth': 0,
      'commercial-partners': 0,
      'about-biharsay': 0,
      'uncategorized': 0,
    };

    articles.forEach(art => {
      const categoryId = categorizeArticle(art);
      map[categoryId].push(art);
      counts[categoryId] = (counts[categoryId] || 0) + 1;
    });

    return { categorizedMap: map, categoryCounts: counts };
  }, [articles]);

  // 2. Filter articles within active category by Search Query (Title or Author)
  const filteredArticles = useMemo(() => {
    const list = categorizedMap[activeCategory] || [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter(art => {
      const titleMatch = (art.title || '').toLowerCase().includes(q);
      const authorMatch = (art.author || art.authorName || '').toLowerCase().includes(q);
      return titleMatch || authorMatch;
    });
  }, [categorizedMap, activeCategory, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-400/30 mb-3">
              Bihar Say Categorized Feed
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Explore Articles by Category
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl">
              Discover stories on Culture, Startups, Investments, Education, Tech, and Sports across Bihar.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Total Collection</div>
              <div className="text-xl font-extrabold text-white">{articles.length} Articles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Category Filter Pills (Navigation Bar) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {CATEGORIES_LIST.map((cat) => {
          const count = categoryCounts[cat.id] || 0;
          const isActive = activeCategory === cat.id;

          // Don't render empty categories unless it's 'all'
          if (cat.id !== 'all' && count === 0) return null;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                isActive
                  ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar & Cross-Filtering Control */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by title or author in this category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 font-bold text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-semibold w-full sm:w-auto text-right">
          Showing <span className="text-slate-900 font-bold">{filteredArticles.length}</span> articles in{' '}
          <span className="text-blue-600 font-bold">
            {CATEGORIES_LIST.find((c) => c.id === activeCategory)?.name}
          </span>
        </div>
      </div>

      {/* Responsive Articles Grid / Empty State */}
      {filteredArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border border-dashed border-slate-300 rounded-3xl text-center my-6">
          <div className="w-16 h-16 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-3xl mb-4">
            🔍
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">No Articles Found</h3>
          <p className="text-sm text-slate-500 max-w-md mb-6">
            We couldn't find any articles matching &ldquo;{searchQuery}&rdquo; in this category.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition"
          >
            Reset Search & View All
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Modern Responsive Article Card with Tailwind CSS
 */
function ArticleCard({ article }: { article: ArticleItem }) {
  const authorName = article.author || article.authorName || 'Bihar Say Desk';
  const categoryName = article.category || article.categoryName || 'Education & Social';
  const summarySnippet = article.summary || article.content || 'Read full article details on Bihar Say.';
  const pubDate = article.publishedDate || article.date || 'September 2026';
  const readTime = article.readingTimeMinutes || 3;
  const imgSrc = article.imageUrl || '/legacy-images/Bihar-Say-Website-3.png';

  return (
    <div className="flex flex-col justify-between bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 group">
      {/* Featured Thumbnail */}
      <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
        <img
          src={imgSrc}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/legacy-images/Bihar-Say-Website-3.png';
          }}
        />
        <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md">
          {categoryName}
        </span>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
          <span>📅 {pubDate}</span>
          <span>⏱️ {readTime} min read</span>
        </div>

        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-3">
          <Link href={`/article/${article.id}`}>{article.title}</Link>
        </h3>

        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
          {summarySnippet}
        </p>

        {/* Footer Info */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-semibold truncate max-w-[65%]">
            <span className="text-blue-600">👤</span>
            <span className="truncate">{authorName}</span>
          </div>

          <Link
            href={`/article/${article.id}`}
            className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
          >
            Read <span className="text-sm">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
