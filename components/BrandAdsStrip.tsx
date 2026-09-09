'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles, CheckCircle, Package, Monitor, Leaf, TrendingUp, Users } from 'lucide-react';
import styles from './BrandAdsStrip.module.css';

interface BrandAdItem {
  id: string;
  serviceId: string;
  tag: string;
  badge: string;
  headline: string;
  description: string;
  benefits: string[];
  ctaText: string;
  imageUrl: string;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  accentColor: string;
}

export const BRAND_ADS: BrandAdItem[] = [
  {
    id: 'ad-makhana',
    serviceId: 'makhana-sample',
    tag: 'B2B Sourcing · Mithila Harvest',
    badge: 'Farm-Gate Export Grade',
    headline: 'GI-Tagged Premium Mithila Makhana (Foxnuts) Bulk Samples',
    description: 'Direct-from-grower supply of hand-graded jumbo (5+ & 6+ suta) foxnuts for FMCG brands, snacks manufacturers, and international exporters.',
    benefits: ['100% Organic & Chemical Free', 'Direct Farmer-Producer Pricing', 'Global Export Packaging Compliant'],
    ctaText: 'Request Free Sample Kit',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    icon: Package,
    accentColor: '#10B981',
  },
  {
    id: 'ad-banana-fibre',
    serviceId: 'banana-fibre',
    tag: 'Eco-Packaging · Made in Bihar',
    badge: '100% Biodegradable',
    headline: 'Handcrafted Banana Fibre Bags & Sustainable Packaging',
    description: 'Replace single-use plastics with tear-resistant, zero-carbon shopping and gifting bags crafted from agro-waste fibers by rural artisan clusters in Katihar & Hajipur.',
    benefits: ['Natural Antibacterial Fibres', 'Supports Rural Women Cooperatives', 'Custom Brand Logo Printing'],
    ctaText: 'Order Packaging Catalog',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    icon: Leaf,
    accentColor: '#059669',
  },
  {
    id: 'ad-digital-standee',
    serviceId: 'digital-standee',
    tag: 'Retail & Event Displays',
    badge: '4K Ultra-HD Smart Displays',
    headline: 'Commercial Digital Standees & Interactive Kiosks',
    description: 'Captivate shoppers and conference attendees across Patna & Bihar with plug-and-play vertical smart displays with remote cloud content management.',
    benefits: ['Bright IPS Panels (Daylight Visible)', 'Cloud Remote Scheduling', 'On-Site Delivery & Setup Across Bihar'],
    ctaText: 'Get Standee Pricing',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    icon: Monitor,
    accentColor: '#1D6FD8',
  },
  {
    id: 'ad-performance-marketing',
    serviceId: 'performance-marketing',
    tag: 'B2B Growth & Ads Agency',
    badge: 'Tier-2/3 Market Penetration',
    headline: 'Performance Marketing & Google Ads for the Hindi Heartland',
    description: 'High-ROI search, YouTube, and Meta ad campaigns engineered specifically to convert regional audiences across Bihar, Jharkhand, and Eastern UP.',
    benefits: ['Dialect & Cultural Nuance Messaging', 'Transparent CPL / ROAS Tracking', 'End-to-End Creative & Landing Pages'],
    ctaText: 'Claim Free Growth Audit',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    icon: TrendingUp,
    accentColor: '#6366F1',
  },
  {
    id: 'ad-influencer-marketing',
    serviceId: 'influencer-marketing',
    tag: 'Creator Economy · Bihar Say Network',
    badge: '10M+ Verified Reach',
    headline: 'Influencer Marketing With Top Regional Creators & Voices',
    description: 'Collaborate with verified Bihari creators, grassroots YouTubers, podcasters, and cultural leaders to build authentic affinity and virality.',
    benefits: ['Vetted Brand-Safe Creators', 'High Engagement Local Communities', 'Full Contract & Content Rights Management'],
    ctaText: 'Explore Creator Roster',
    imageUrl: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&w=800&q=80',
    icon: Users,
    accentColor: '#8B5CF6',
  },
];

interface BrandAdsStripProps {
  onInquire: (serviceId: string) => void;
}

export default function BrandAdsStrip({ onInquire }: BrandAdsStripProps) {
  const [activeTab, setActiveTab] = useState<string>(BRAND_ADS[0].id);

  const activeAd = BRAND_ADS.find(ad => ad.id === activeTab) || BRAND_ADS[0];
  const IconComponent = activeAd.icon;

  return (
    <section className={`${styles.container} reveal`}>
      <div className={styles.sectionHead}>
        <div className={styles.headLeft}>
          <div className={styles.tag}>
            <Sparkles size={14} color="#1D6FD8" />
            <span>Bihar Say Commercial & Sourcing Desk</span>
          </div>
          <h2>Featured Brand Partners & Sourcing Catalogs</h2>
          <p className={styles.subtext}>
            Connect directly with certified Bihar producers, sustainable innovators, and our regional growth marketing agency.
          </p>
        </div>

        <button 
          className={styles.inquireAllBtn}
          onClick={() => onInquire('founder-story')}
        >
          <span>Feature Your Brand With Us</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Interactive Tabs */}
      <div className={styles.tabScroll}>
        {BRAND_ADS.map((ad) => {
          const TabIcon = ad.icon;
          const isActive = ad.id === activeTab;
          return (
            <button
              key={ad.id}
              className={`${styles.tabBtn} ${isActive ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(ad.id)}
            >
              <TabIcon size={16} />
              <span>{ad.badge}</span>
            </button>
          );
        })}
      </div>

      {/* Active Featured Showcase Card */}
      <div className={styles.adCard}>
        <div className={styles.cardContent}>
          <div className={styles.cardMeta}>
            <span className={styles.metaCategory} style={{ color: activeAd.accentColor }}>
              {activeAd.tag}
            </span>
            <span className={styles.metaBadge}>
              {activeAd.badge}
            </span>
          </div>

          <h3 className={styles.cardTitle}>{activeAd.headline}</h3>
          <p className={styles.cardDescription}>{activeAd.description}</p>

          <div className={styles.benefitsList}>
            {activeAd.benefits.map((benefit, idx) => (
              <div key={idx} className={styles.benefitItem}>
                <CheckCircle size={15} color={activeAd.accentColor} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className={styles.cardActions}>
            <button
              className={styles.primaryCta}
              style={{ backgroundColor: activeAd.accentColor }}
              onClick={() => onInquire(activeAd.serviceId)}
            >
              <span>{activeAd.ctaText}</span>
              <ArrowRight size={16} />
            </button>

            <span className={styles.guaranteeText}>
              Direct connect · Response within 4 business hours
            </span>
          </div>
        </div>

        <div className={styles.cardVisual}>
          <div className={styles.imgWrap}>
            <Image
              src={activeAd.imageUrl}
              alt={activeAd.headline}
              fill
              sizes="(max-width: 900px) 100vw, 420px"
              className={styles.img}
            />
            <div className={styles.scrim} />
          </div>

          <div className={styles.visualBadge}>
            <IconComponent size={20} color="#FFFFFF" />
            <div>
              <strong>Bihar Say Verified</strong>
              <span>Direct Commercial Pipeline</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
