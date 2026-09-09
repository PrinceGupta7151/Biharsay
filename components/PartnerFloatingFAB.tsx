'use client';

import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import styles from './PartnerFloatingFAB.module.css';

interface PartnerFloatingFABProps {
  onOpen: () => void;
}

export default function PartnerFloatingFAB({ onOpen }: PartnerFloatingFABProps) {
  return (
    <div className={styles.fabWrapper}>
      <button 
        className={styles.fabBtn} 
        onClick={onOpen}
        aria-label="Partner with Bihar Say"
      >
        <span className={styles.beacon} />
        <Sparkles size={16} className={styles.icon} />
        <span className={styles.label}>Partner / Feature Brand</span>
      </button>
    </div>
  );
}
