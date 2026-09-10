'use client';

import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  ExternalLink,
  Store,
  Sparkles
} from 'lucide-react';
import styles from './MsmeCommunityBanner.module.css';

interface MsmeCommunityBannerProps {
  onInquire?: (serviceId?: string) => void;
}

export default function MsmeCommunityBanner({ onInquire }: MsmeCommunityBannerProps) {
  const SELLER_URL = 'https://seller.frootex.com/';

  return (
    <section className={styles.msmeSection} id="msme-community">
      <div className="wrap">
        <div className={styles.bannerCard}>
          {/* Ambient Glow Orbs */}
          <div className={styles.glowTopRight} aria-hidden="true" />
          <div className={styles.glowBottomLeft} aria-hidden="true" />

          <div className={styles.bannerContent}>
            {/* Left: Headline, Value Proposition & CTA */}
            <div className={styles.leftCol}>
              <div className={styles.topPill}>
                <span className={styles.topPillDot} />
                <span>Flagship MSME Initiative · seller.frootex.com</span>
              </div>

              <h2 className={styles.headline}>
                Building Bihar &amp; Bharat’s{' '}
                <span className={styles.headlineGradient}>Largest MSME Community</span>
              </h2>

              <p className={styles.subheadline}>
                Are you a manufacturer, agro-processor, artisan, or trader in Bihar? 
                Register your business on the <strong>Frootex Seller Platform</strong> to digitize your catalog, 
                connect directly with verified bulk buyers nationwide, and scale your brand with zero upfront listing fees.
              </p>

              {/* 4 Feature Value Pillars */}
              <div className={styles.featuresGrid}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <Sparkles size={18} />
                  </div>
                  <div className={styles.featureText}>
                    <span className={styles.featureTitle}>3-Min Digital Onboarding</span>
                    <span className={styles.featureDesc}>Instant GST &amp; Udyam verification with assisted setup</span>
                  </div>
                </div>

                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <Users size={18} />
                  </div>
                  <div className={styles.featureText}>
                    <span className={styles.featureTitle}>Pan-India B2B Demand</span>
                    <span className={styles.featureDesc}>Direct access to retail chains, FMCG &amp; bulk buyers</span>
                  </div>
                </div>

                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <TrendingUp size={18} />
                  </div>
                  <div className={styles.featureText}>
                    <span className={styles.featureTitle}>0% Commission Listing</span>
                    <span className={styles.featureDesc}>Keep your hard-earned margins with transparent pricing</span>
                  </div>
                </div>

                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <ShieldCheck size={18} />
                  </div>
                  <div className={styles.featureText}>
                    <span className={styles.featureTitle}>Escrow Protected Payouts</span>
                    <span className={styles.featureDesc}>Guaranteed settlement cycles &amp; working capital assistance</span>
                  </div>
                </div>
              </div>

              {/* CTA Row */}
              <div className={styles.ctaRow}>
                <a 
                  href={SELLER_URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.btnRegisterPrimary}
                  title="Open Frootex Seller Portal in new window"
                >
                  <Store size={18} />
                  <span>Register on seller.frootex.com</span>
                  <ArrowRight size={18} />
                </a>

                <span className={styles.directUrlHint}>
                  Official portal:{' '}
                  <a href={SELLER_URL} target="_blank" rel="noopener noreferrer">
                    seller.frootex.com <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                  </a>
                </span>
              </div>
            </div>

            {/* Right: Seller App Preview & Live Ecosystem Status */}
            <div className={styles.rightCol}>
              <div className={styles.sellerBox}>
                <div className={styles.sellerBoxHeader}>
                  <div className={styles.brandIdentity}>
                    <div className={styles.frootexIcon}>F</div>
                    <div className={styles.brandTitles}>
                      <span className={styles.frootexName}>Frootex Seller App</span>
                      <span className={styles.frootexTag}>B2B Enterprise Portal</span>
                    </div>
                  </div>
                  <span className={styles.liveTag}>Live Platform</span>
                </div>

                {/* Micro Stats */}
                <div className={styles.statsRow}>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>5,000+</div>
                    <div className={styles.statLabel}>Active Sellers</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>38</div>
                    <div className={styles.statLabel}>Bihar Districts</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>100%</div>
                    <div className={styles.statLabel}>Verified Trade</div>
                  </div>
                </div>

                {/* 3 Step Quick Onboarding Flow */}
                <div className={styles.stepList}>
                  <div className={styles.stepItem}>
                    <span className={styles.stepBadge}>1</span>
                    <span>Sign up with mobile &amp; enter business GST / Udyam</span>
                  </div>
                  <div className={styles.stepItem}>
                    <span className={styles.stepBadge}>2</span>
                    <span>Upload your product catalog &amp; bulk pricing tiers</span>
                  </div>
                  <div className={styles.stepItem}>
                    <span className={styles.stepBadge}>3</span>
                    <span>Start receiving verified purchase orders &amp; dispatch nationwide</span>
                  </div>
                </div>

                {/* Quick Link Card Footer */}
                <div className={styles.appLinkBox}>
                  <span className={styles.appLinkText}>Join Bihar&apos;s fastest growing supplier hub</span>
                  <a 
                    href={SELLER_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.btnAppAction}
                  >
                    Open Portal ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
