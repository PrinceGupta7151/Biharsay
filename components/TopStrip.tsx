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
            <span className={styles.highlightBadge}>
              <span className={styles.pulseDot} />
              LIVE COMMUNITY
            </span>
            <span className={styles.ctaText}>
              Join <strong className={styles.metricNumber}>15,000+ members</strong> &amp; <strong className={styles.metricNumber}>8.5 Lakh+ monthly readers</strong> exploring modern Bihar
            </span>
            <button 
              className={styles.ctaAction}
              onClick={() => isUserActive ? openSubmitModal() : openAuthModal()}
            >
              {isUserActive ? 'Share a Story →' : 'Join Now →'}
            </button>
          </div>

          <div className={styles.socials} aria-label="Official Social Channels">
            <a 
              href="https://wa.me/918050083233" 
              target="_blank" 
              rel="noreferrer noopener"
              title="Chat on WhatsApp (+91 8050083233)"
              aria-label="WhatsApp"
              className={`${styles.socialDot} ${styles.socialWhatsApp}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.979-.276-.1-.477-.15-.678.15-.2.301-.778.979-.954 1.18-.175.2-.351.226-.652.076-.301-.15-1.272-.469-2.423-1.496-.897-.799-1.503-1.786-1.68-2.087-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.2-.301.301-.502.1-.201.05-.376-.025-.526-.076-.151-.678-1.634-.929-2.237-.245-.588-.493-.508-.678-.518l-.578-.01c-.201 0-.527.075-.803.376s-1.054 1.029-1.054 2.509 1.08 2.91 1.23 3.111c.15.201 2.124 3.243 5.147 4.549.719.311 1.28.497 1.718.636.722.23 1.378.198 1.898.12.578-.087 1.782-.728 2.033-1.431.25-.704.25-1.307.175-1.432-.075-.125-.276-.201-.577-.351zM12.04 21.75c-1.748 0-3.415-.463-4.887-1.339l-.351-.208-3.633.953.97-3.541-.229-.365c-.961-1.53-1.468-3.308-1.468-5.138 0-5.376 4.374-9.75 9.75-9.75 2.604 0 5.053 1.014 6.895 2.855 1.842 1.842 2.855 4.291 2.855 6.895 0 5.376-4.374 9.75-9.75 9.75zm8.307-18.057C18.136 1.482 15.2 0 12.04 0 5.467 0 .12 5.347.12 11.92c0 2.1.547 4.148 1.587 5.955L0 24l6.305-1.654C8.04 23.27 9.99 23.84 12.04 23.84c6.573 0 11.92-5.347 11.92-11.92 0-3.16-1.23-6.13-3.613-8.227z"/>
              </svg>
            </a>
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
