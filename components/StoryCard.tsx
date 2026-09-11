'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Story } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { toggleBookmark, getUserBookmarks } from '@/lib/db';
import { Bookmark, Clock } from 'lucide-react';
import styles from './StoryCard.module.css';

interface StoryCardProps {
  story: Story;
  isLead?: boolean;
  priority?: boolean;
}

export default function StoryCard({ story, isLead = false, priority = false }: StoryCardProps) {
  const { user, openAuthModal } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (user) {
      const bookmarks = getUserBookmarks(user.uid);
      setIsSaved(bookmarks.includes(story.id));
    } else {
      setIsSaved(false);
    }
  }, [user, story.id]);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openAuthModal();
      return;
    }
    const newState = await toggleBookmark(user.uid, story.id);
    setIsSaved(newState);
  };

  return (
    <article className={`${styles.card} ${isLead ? styles.leadCard : ''}`}>
      <Link href={`/article/${story.id}`} className={styles.thumbLink}>
        <div className={styles.thumb}>
          {story.imageUrl && !imgError ? (
            <Image
              src={story.imageUrl}
              alt={story.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 380px"
              priority={priority}
              className={styles.img}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={styles.fallbackThumb}>
              <span className={styles.thumbCategory}>{story.category}</span>
            </div>
          )}
          <button
            className={`${styles.bookmarkBtn} ${isSaved ? styles.saved : ''}`}
            onClick={handleBookmarkClick}
            aria-label={isSaved ? 'Remove Bookmark' : 'Save Story'}
            title={isSaved ? 'Saved to your profile' : 'Save story'}
          >
            <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </Link>

      <div className={styles.body}>
        <div className={styles.metaTop}>
          <span className={styles.cat}>{story.category}</span>
          {story.readTime && (
            <span className={styles.readTime}>
              <Clock size={11} /> {story.readTime}
            </span>
          )}
        </div>

        <h4 className={styles.title}>
          <Link href={`/article/${story.id}`}>{story.title}</Link>
        </h4>

        {story.summary && (
          <p className={styles.summary}>{story.summary}</p>
        )}

        <div className={styles.byline}>
          <span>{story.author}</span>
          {story.date && <span>· {story.date}</span>}
        </div>
      </div>
    </article>
  );
}
