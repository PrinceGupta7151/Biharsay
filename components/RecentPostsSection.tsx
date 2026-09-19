'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Story } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './RecentPostsSection.module.css';

interface RecentPostsSectionProps {
  stories: Story[];
  initialVisible?: number;
}

export default function RecentPostsSection({
  stories,
  initialVisible = 16,
}: RecentPostsSectionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!stories || stories.length === 0) return null;

  const visibleStories = expanded ? stories : stories.slice(0, initialVisible);
  const hasMore = stories.length > initialVisible;

  return (
    <section className={styles.section} id="recent-posts">
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>Recent Posts</h2>
          <span className={styles.badge}>{stories.length} updates</span>
        </div>
        <p className={styles.sub}>Latest reports, announcements, and dispatches across Bihar.</p>
      </div>

      <ul className={styles.list}>
        {visibleStories.map((story) => (
          <li key={story.id} className={styles.item}>
            <span className={styles.bullet}>•</span>
            <Link href={`/article/${story.id}`} className={styles.link}>
              {story.title}
            </Link>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.viewAllBtn}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <span>Show Fewer Posts</span>
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                <span>View All {stories.length} Recent Posts</span>
                <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
