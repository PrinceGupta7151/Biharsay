'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import styles from './not-found.module.css';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Bihar Say Application Error:', error);
  }, [error]);

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.badge} style={{ background: '#FEE2E2', color: '#991B1B' }}>
          <AlertTriangle size={14} color="#DC2626" />
          <span>Notice — Unexpected Issue</span>
        </div>

        <h1 className={styles.title} style={{ fontSize: '28px', marginTop: '12px' }}>
          Something went wrong
        </h1>
        <p className={styles.description}>
          We encountered an issue while retrieving this section. Our platform engineering team has been notified.
        </p>

        <div className={styles.actions}>
          <button onClick={() => reset()} className={styles.primaryBtn} style={{ cursor: 'pointer', border: 'none' }}>
            <RotateCcw size={16} />
            <span>Try Again</span>
          </button>
          <Link href="/" className={styles.secondaryBtn}>
            <Home size={16} />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
