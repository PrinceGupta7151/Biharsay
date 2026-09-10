'use client';

import React from 'react';
import { CategoryInfo, Story } from '@/types';
import StoryCard from './StoryCard';
import styles from './CategorySection.module.css';

interface CategorySectionProps {
  category: CategoryInfo;
  stories: Story[];
}

export default function CategorySection({ category, stories }: CategorySectionProps) {
  if (!stories || stories.length === 0) return null;

  // Display up to 3 stories in a uniform balanced grid
  const displayStories = stories.slice(0, 3);

  return (
    <section id={category.slug} className={`${styles.section} reveal`}>
      <div className="section-head">
        <h2>
          <span className={`dot ${category.dotClass}`} />
          <span>{category.name}</span>
        </h2>
        <div className="sub">{category.subtitle}</div>
      </div>

      <div className={styles.cardRow}>
        {displayStories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </section>
  );
}
