'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import styles from './GoogleAdSlot.module.css';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface GoogleAdSlotProps {
  slotId?: string;
  format?: 'leaderboard' | 'inFeed' | 'inArticle';
  onInquire?: (serviceId?: string) => void;
  className?: string;
}

export default function GoogleAdSlot({
  slotId,
  format = 'leaderboard',
  onInquire,
  className = '',
}: GoogleAdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const adsenseClientId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || '';

  useEffect(() => {
    if (adsenseClientId && slotId && typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      } catch (e) {
        console.error('AdSense push error:', e);
      }
    }
  }, [adsenseClientId, slotId]);

  const formatClass = 
    format === 'inFeed' ? styles.inFeed :
    format === 'inArticle' ? styles.inArticle :
    styles.leaderboard;

  return (
    <div className={`${styles.adContainer} ${className} reveal`}>
      <span className={styles.adLabel}>Advertisement · Sponsored</span>

      <div className={`${styles.adFrame} ${formatClass}`}>
        {adsenseClientId && slotId ? (
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', textAlign: 'center', width: '100%' }}
            data-ad-client={adsenseClientId}
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          /* High-Converting Editorial Sponsor Card highlighting 8.5 Lakh+ Monthly Visitors */
          <div className={styles.sponsorFallback}>
            <div className={styles.sponsorInfo}>
              <div className={styles.sponsorTag}>
                <Sparkles size={13} />
                <span>Advertise with Bihar Say Media</span>
              </div>
              <h4 className={styles.sponsorHeadline}>
                Reach 8.5 Lakh+ Monthly Readers & High-Intent Hindi Heartland Buyers
              </h4>
              <p className={styles.sponsorSub}>
                Premium display banners, founder spotlight stories, and performance ads across Bihar, Jharkhand & Global Bihari Diaspora.
              </p>
            </div>

            <button
              className={styles.sponsorCta}
              onClick={() => {
                if (onInquire) {
                  onInquire('performance-marketing');
                } else if (typeof window !== 'undefined') {
                  window.location.hash = 'commercial-services';
                }
              }}
            >
              <span>Feature Your Brand</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
