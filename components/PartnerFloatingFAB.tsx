'use client';

import React from 'react';
import { Sparkles, MessageCircle } from 'lucide-react';
import styles from './PartnerFloatingFAB.module.css';

interface PartnerFloatingFABProps {
  onOpen: () => void;
}

export default function PartnerFloatingFAB({ onOpen }: PartnerFloatingFABProps) {
  return (
    <div className={styles.fabWrapper}>
      {/* 1-Click WhatsApp Direct Floating Button */}
      <a
        href="https://wa.me/918050083233?text=Hi%20Bihar%20Say%20Team!%20I%20would%20like%20to%20connect."
        target="_blank"
        rel="noopener noreferrer"
        className={styles.fabWhatsAppBtn}
        aria-label="Chat with Bihar Say on WhatsApp (+91 8050083233)"
        title="Chat on WhatsApp (+91 8050083233)"
      >
        <MessageCircle size={17} />
        <span className={styles.whatsAppText}>WhatsApp</span>
      </a>

      {/* Partner & Commercial Inquiries Button */}
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
