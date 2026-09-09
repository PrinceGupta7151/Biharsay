'use client';

import React from 'react';
import { Search, X, ChevronDown, Flame } from 'lucide-react';
import { CATEGORIES } from '@/data/seedStories';
import { CategorySlug } from '@/types';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  query: string;
  selectedCategory: CategorySlug | 'all';
  onSearchChange: (query: string, category: CategorySlug | 'all') => void;
  resultCount?: number;
  isFiltering?: boolean;
}

const TRENDING_TAGS = [
  { label: 'Makhana', query: 'makhana' },
  { label: 'Patna Metro', query: 'metro' },
  { label: 'Startups', query: 'startup' },
  { label: 'Indoor Stadium', query: 'stadium' },
  { label: 'Sonpur Mela', query: 'sonpur' },
  { label: 'Litchi', query: 'litchi' },
];

export default function SearchBar({ 
  query, 
  selectedCategory, 
  onSearchChange, 
  resultCount, 
  isFiltering 
}: SearchBarProps) {
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value, selectedCategory);
  };

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSearchChange(query, e.target.value as CategorySlug | 'all');
  };

  const handleTagClick = (tagQuery: string) => {
    onSearchChange(tagQuery, selectedCategory);
  };

  const handleClear = () => {
    onSearchChange('', 'all');
  };

  return (
    <div className={styles.searchSection}>
      {/* Consolidated Single Search Bar with Category Dropdown */}
      <div className={styles.inputWrapper}>
        {/* Integrated Category Dropdown Filter */}
        <div className={styles.categorySelectWrap}>
          <select
            value={selectedCategory}
            onChange={handleCategorySelect}
            className={styles.categorySelect}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className={styles.selectChevron} />
        </div>

        <div className={styles.divider} />

        {/* Text Input */}
        <div className={styles.textInputWrap}>
          <Search size={17} className={styles.searchIcon} />
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search stories, founders, topics (e.g. makhana, metro, stadium)..."
            className={styles.inputField}
            aria-label="Search stories"
          />
          {query && (
            <button 
              className={styles.clearBtn} 
              onClick={() => onSearchChange('', selectedCategory)} 
              aria-label="Clear search text"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Trending Search Tags (Contextual Discovery instead of duplicate navbar pills) */}
      <div className={styles.trendingRow}>
        <span className={styles.trendingLabel}>
          <Flame size={13} color="#EF4444" />
          <span>Trending:</span>
        </span>
        <div className={styles.tagsScroll}>
          {TRENDING_TAGS.map((tag) => {
            const isActive = query.toLowerCase() === tag.query.toLowerCase();
            return (
              <button
                key={tag.label}
                type="button"
                className={`${styles.trendTag} ${isActive ? styles.activeTag : ''}`}
                onClick={() => handleTagClick(isActive ? '' : tag.query)}
              >
                #{tag.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Summary Bar */}
      {isFiltering && (
        <div className={styles.filterStatus}>
          <span>
            Showing <strong>{resultCount}</strong> {resultCount === 1 ? 'story' : 'stories'}
            {query && <span> for &ldquo;{query}&rdquo;</span>}
            {selectedCategory !== 'all' && (
              <span> in <strong>{CATEGORIES.find(c => c.slug === selectedCategory)?.name}</strong></span>
            )}
          </span>
          <button className={styles.resetBtn} onClick={handleClear}>
            Reset Filter <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
