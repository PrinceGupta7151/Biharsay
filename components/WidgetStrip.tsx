'use client';

import React from 'react';
import Link from 'next/link';
import { Story } from '@/types';
import styles from './WidgetStrip.module.css';

interface WidgetStripProps {
  topStories: Story[];
  popularStories: Story[];
}

export default function WidgetStrip({ topStories, popularStories }: WidgetStripProps) {
  return (
    <section className={`${styles.widgetStrip} reveal`}>
      <div className={styles.widgetCol}>
        <h5 className={styles.heading}>Top Posts</h5>
        <ol className={styles.list}>
          {topStories.slice(0, 4).map((story, idx) => (
            <li key={`top-${story.id}`} className={styles.item}>
              <span className={styles.num}>{idx + 1}</span>
              <div className={styles.content}>
                <Link href={`/article/${story.id}`} className={styles.titleLink}>
                  {story.title}
                </Link>
                {story.date && <span className={styles.date}>{story.date}</span>}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.widgetCol}>
        <h5 className={styles.heading}>Popular Entries</h5>
        <ol className={styles.list}>
          {popularStories.slice(0, 5).map((story, idx) => (
            <li key={`pop-${story.id}`} className={styles.item}>
              <span className={styles.num}>{idx + 1}</span>
              <div className={styles.content}>
                <Link href={`/article/${story.id}`} className={styles.titleLink}>
                  {story.title}
                </Link>
                <span className={styles.categoryBadge}>{story.category}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
