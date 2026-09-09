'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getStoryReactions, toggleStoryLike } from '@/lib/db';
import { Heart, Sparkles } from 'lucide-react';
import styles from './ArticleReactions.module.css';

interface ArticleReactionsProps {
  storyId: string;
}

export default function ArticleReactions({ storyId }: ArticleReactionsProps) {
  const { user, openAuthModal } = useAuth();
  const [likesCount, setLikesCount] = useState<number>(12);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [animating, setAnimating] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    getStoryReactions(storyId, user?.uid).then((res) => {
      if (isMounted) {
        setLikesCount(res.likesCount);
        setIsLiked(res.isLiked);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [storyId, user?.uid]);

  const handleLike = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    const res = await toggleStoryLike(storyId, user.uid);
    setLikesCount(res.likesCount);
    setIsLiked(res.isLiked);
  };

  return (
    <div className={styles.reactionWrapper}>
      <button
        className={`${styles.reactionBtn} ${isLiked ? styles.liked : ''} ${animating ? styles.pulse : ''}`}
        onClick={handleLike}
        title={isLiked ? 'Unlike this story' : 'Applaud / Like this story'}
        aria-label="Like story"
      >
        <Heart
          size={20}
          fill={isLiked ? '#EF4444' : 'none'}
          color={isLiked ? '#EF4444' : '#64748B'}
          className={styles.heartIcon}
        />
        <span className={styles.count}>{likesCount}</span>
        <span className={styles.label}>{likesCount === 1 ? 'Applaud' : 'Applauds'}</span>
      </button>

      <span className={styles.reactionHint}>
        {isLiked 
          ? 'You applauded this story!' 
          : 'Inspired by this story? Give it an applause!'}
      </span>
    </div>
  );
}
