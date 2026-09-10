import React from 'react';
import Link from 'next/link';
import { Home, Compass, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.badge}>
          <Sparkles size={14} color="#D97706" />
          <span>404 — Story Lost in Transit</span>
        </div>

        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.description}>
          The page you are looking for doesn&apos;t exist, may have moved, or the story is still being documented.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.primaryBtn}>
            <Home size={16} />
            <span>Return to Home</span>
          </Link>
          <Link href="/#about-us" className={styles.secondaryBtn}>
            <Compass size={16} />
            <span>Discover Bihar Say</span>
          </Link>
        </div>

        <div className={styles.categoryGuide}>
          <span className={styles.guideTitle}>Explore Popular Sections:</span>
          <div className={styles.chips}>
            <Link href="/#entrepreneurship-startups" className={styles.chip}>Startups &amp; Founders</Link>
            <Link href="/#culture-heritage" className={styles.chip}>Culture &amp; Heritage</Link>
            <Link href="/#industry-innovation" className={styles.chip}>Industry &amp; Tech</Link>
            <Link href="/#investments-economic" className={styles.chip}>Economy &amp; Capital</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
