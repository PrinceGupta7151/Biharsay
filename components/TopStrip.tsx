'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import styles from './TopStrip.module.css';

export default function TopStrip() {
  const { user, openAuthModal, openSubmitModal } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isUserActive = mounted && Boolean(user);

  return (
    <div className={styles.topstrip}>
      <div className="wrap">
        <div className={styles.inner}>
          <div className={styles.ctaGroup}>
            <span className={styles.highlightBadge}>LIVE COMMUNITY</span>
            <span className={styles.ctaText}>
              Join 13,000+ members & 8.5 Lakh+ monthly readers exploring modern Bihar
            </span>
            <button 
              className={styles.ctaAction}
              onClick={() => isUserActive ? openSubmitModal() : openAuthModal()}
            >
              {isUserActive ? 'Share a Story →' : 'Get Started →'}
            </button>
          </div>

          <div className={styles.socials} aria-label="Official Social Channels">
            <a 
              href="https://www.facebook.com/BsayBihar?mibextid=LQQJ4d" 
              target="_blank" 
              rel="noreferrer noopener"
              title="Follow Bihar Say on Facebook"
              aria-label="Facebook"
              className={styles.socialDot}
            >
              <Facebook size={13} />
            </a>
            <a 
              href="https://www.instagram.com/bihar_say?igsh=MWRoMng4czJ1ZTFodA%3D%3D&utm_source=qr" 
              target="_blank" 
              rel="noreferrer noopener"
              title="Follow Bihar Say on Instagram"
              aria-label="Instagram"
              className={styles.socialDot}
            >
              <Instagram size={13} />
            </a>
            <a 
              href="https://www.linkedin.com/company/bihar-say/" 
              target="_blank" 
              rel="noreferrer noopener"
              title="Connect with Bihar Say on LinkedIn"
              aria-label="LinkedIn"
              className={styles.socialDot}
            >
              <Linkedin size={13} />
            </a>
            <a 
              href="https://x.com/bsaybihar" 
              target="_blank" 
              rel="noreferrer noopener"
              title="Follow Bihar Say on X (Twitter)"
              aria-label="X (Twitter)"
              className={styles.socialDot}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a 
              href="https://www.youtube.com/@biharsay5322" 
              target="_blank" 
              rel="noreferrer noopener"
              title="Subscribe to Bihar Say on YouTube"
              aria-label="YouTube"
              className={styles.socialDot}
            >
              <Youtube size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
