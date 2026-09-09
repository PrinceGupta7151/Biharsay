'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Story } from '@/types';
import { TrendingUp, Clock, Eye } from 'lucide-react';
import styles from './HeroPicks.module.css';

interface HeroPicksProps {
  featuredStory: Story;
  sideStories: Story[];
}

export default function HeroPicks({ featuredStory, sideStories }: HeroPicksProps) {
  return (
    <section className={styles.heroSection}>
      <div className="section-head">
        <h2>
          <TrendingUp size={24} color="#2563EB" />
          <span>Top Picks</span>
        </h2>
        <div className="sub">The stories setting the pace for Bihar this week.</div>
      </div>

      <div className={styles.heroGrid}>
        {/* Main Large Feature */}
        <Link href={`/article/${featuredStory.id}`} className={styles.featureMain}>
          <div className={styles.mainImgWrap}>
            {featuredStory.imageUrl && (
              <Image
                src={featuredStory.imageUrl}
                alt={featuredStory.title}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 65vw"
                className={styles.mainImg}
              />
            )}
          </div>

          <div className={styles.caption}>
            <div className={styles.topMeta}>
              <span className={styles.tag}>{featuredStory.category}</span>
              {featuredStory.readTime && (
                <span className={styles.readTime}>
                  <Clock size={12} /> {featuredStory.readTime}
                </span>
              )}
            </div>
            <h3>{featuredStory.title}</h3>
            <p className={styles.mainSummary}>{featuredStory.summary}</p>
            <div className={styles.meta}>
              <span className={styles.author}>By {featuredStory.author}</span>
              <span className={styles.dotSep}>·</span>
              <span>{featuredStory.date}</span>
            </div>
          </div>
        </Link>

        {/* Right Side Rail List */}
        <div className={styles.featureList}>
          {sideStories.map((story) => (
            <SideItem key={story.id} story={story} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SideItem({ story }: { story: Story }) {
  const [hasError, setHasError] = React.useState(false);

  return (
    <article className={styles.sideItem}>
      <Link href={`/article/${story.id}`} className={styles.sideThumbLink}>
        <div className={styles.sideThumb}>
          {story.imageUrl && !hasError ? (
            <Image
              src={story.imageUrl}
              alt={story.title}
              fill
              sizes="110px"
              className={styles.sideImg}
              onError={() => setHasError(true)}
            />
          ) : (
            <div className={styles.sideFallback} />
          )}
        </div>
      </Link>
      <div className={styles.sideBody}>
        <div className={styles.sideCat}>{story.category}</div>
        <h4 className={styles.sideTitle}>
          <Link href={`/article/${story.id}`}>{story.title}</Link>
        </h4>
        <div className={styles.sideMeta}>
          <span>{story.author}</span>
          {story.date && <span>· {story.date}</span>}
        </div>
      </div>
    </article>
  );
}
