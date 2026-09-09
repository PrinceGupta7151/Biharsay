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

  // The newest story in the category takes the lead position
  const leadStory = stories[0];
  const otherStories = stories.slice(1);

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
        {leadStory && (
          <StoryCard story={leadStory} isLead={true} />
        )}
        {otherStories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </section>
  );
}
