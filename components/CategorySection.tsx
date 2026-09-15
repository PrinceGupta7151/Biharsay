'use client';

import React, { useState } from 'react';
import { CategoryInfo, Story } from '@/types';
import StoryCard from './StoryCard';
import { ChevronDown, ChevronUp, Sparkles, Layers } from 'lucide-react';
import styles from './CategorySection.module.css';

interface CategorySectionProps {
  category: CategoryInfo;
  stories: Story[];
}

const INITIAL_BATCH = 6;
const INCREMENT_BATCH = 6;

export default function CategorySection({ category, stories }: CategorySectionProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);

  if (!stories || stories.length === 0) return null;

  const dotClass = (category as any).dotClass || (
    category.slug === 'culture-heritage' ? 'culture' :
    category.slug === 'education-social' ? 'edu' :
    category.slug === 'entrepreneurship-startups' ? 'startup' :
    category.slug === 'industry-innovation' ? 'industry' :
    category.slug === 'sports' ? 'sports' :
    'invest'
  );

  const subtitle = (category as any).subtitle || (category as any).tagline || '';
  const totalCount = stories.length;
  const isFullyExpanded = visibleCount >= totalCount;
  const currentBatch = stories.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + INCREMENT_BATCH, totalCount));
  };

  const handleViewAll = () => {
    setVisibleCount(totalCount);
  };

  const handleCollapse = () => {
    setVisibleCount(INITIAL_BATCH);
    // Smooth scroll back to category header
    const el = document.getElementById(category.slug);
    if (el) {
      const headerOffset = 84;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
    }
  };

  return (
    <section id={category.slug} className={`${styles.section} reveal`}>
      {/* Category Section Header */}
      <div className="section-head">
        <div>
          <h2>
            <span className={`dot ${dotClass}`} />
            <span>{category.name}</span>
            <span className={styles.countBadge}>
              {totalCount} {totalCount === 1 ? 'article' : 'articles'}
            </span>
          </h2>
          {subtitle && <div className="sub">{subtitle}</div>}
        </div>

        {totalCount > INITIAL_BATCH && (
          <div className={styles.headerControls}>
            <span className={styles.progressText}>
              Showing {Math.min(visibleCount, totalCount)} of {totalCount}
            </span>
            {!isFullyExpanded ? (
              <button
                type="button"
                onClick={handleViewAll}
                className={styles.quickViewAllBtn}
                title={`Expand all ${totalCount} articles in ${category.name}`}
              >
                <Layers size={13} />
                <span>View All ({totalCount})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCollapse}
                className={styles.quickCollapseBtn}
                title="Collapse back to top articles"
              >
                <ChevronUp size={13} />
                <span>Collapse</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid of Story Cards */}
      <div className={styles.cardRow}>
        {currentBatch.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>

      {/* Bottom Expansion Bar if category has more articles */}
      {totalCount > INITIAL_BATCH && (
        <div className={styles.actionRow}>
          {!isFullyExpanded ? (
            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleLoadMore}
                className={styles.loadMoreBtn}
              >
                <ChevronDown size={16} />
                <span>Load More ({Math.min(INCREMENT_BATCH, totalCount - visibleCount)} more)</span>
              </button>
              <button
                type="button"
                onClick={handleViewAll}
                className={styles.viewAllBtn}
              >
                <Sparkles size={15} />
                <span>View All {totalCount} Articles</span>
              </button>
            </div>
          ) : (
            <div className={styles.expandedFooter}>
              <span className={styles.allShownText}>
                All {totalCount} {category.name} articles displayed
              </span>
              <button
                type="button"
                onClick={handleCollapse}
                className={styles.collapseBtn}
              >
                <ChevronUp size={15} />
                <span>Show Top 6</span>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
