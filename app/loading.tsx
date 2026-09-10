import React from 'react';
import styles from './loading.module.css';

export default function Loading() {
  return (
    <div className={styles.loadingWrapper}>
      {/* Hero Banner Skeleton */}
      <div className={`${styles.heroSkeleton} ${styles.shimmer}`} />

      {/* Section Header Skeleton */}
      <div className={styles.sectionHeader}>
        <div>
          <div className={`${styles.sectionTitle} ${styles.shimmer}`} />
          <div className={`${styles.sectionSubtitle} ${styles.shimmer}`} />
        </div>
      </div>

      {/* Story Cards Grid Skeleton */}
      <div className={styles.grid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={styles.cardSkeleton}>
            <div className={`${styles.imageSkeleton} ${styles.shimmer}`} />
            <div className={styles.bodySkeleton}>
              <div className={`${styles.tagSkeleton} ${styles.shimmer}`} />
              <div className={`${styles.titleSkeleton} ${styles.shimmer}`} />
              <div className={`${styles.lineSkeleton} ${styles.shimmer}`} />
              <div className={`${styles.lineShortSkeleton} ${styles.shimmer}`} />
              <div className={styles.metaRow}>
                <div className={`${styles.metaItem} ${styles.shimmer}`} />
                <div className={`${styles.metaItem} ${styles.shimmer}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
