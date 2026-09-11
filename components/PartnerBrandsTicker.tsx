'use client';

import React from 'react';
import Image from 'next/image';
import styles from './PartnerBrandsTicker.module.css';

export interface BrandPartner {
  id: string;
  name: string;
  category: string;
  url?: string;
  logoUrl?: string;
  accentBg: string;
  accentColor: string;
  iconSvg?: React.ReactNode;
}

export const PARTNER_BRANDS: BrandPartner[] = [
  {
    id: 'kuiklo',
    name: 'Kuiklo',
    category: 'Hyperlocal Quick Logistics',
    logoUrl: '/logos/kuiklo.png',
    accentBg: '#090D16',
    accentColor: '#FFFFFF',
  },
  {
    id: 'toymie',
    name: 'TOYMIE',
    category: 'Creative Toys & Play Learning',
    logoUrl: '/logos/toymie.png',
    accentBg: '#FFFFFF',
    accentColor: '#E11D48',
  },
  {
    id: 'bfc',
    name: 'BFC',
    category: 'Bihari Founders Club · Network',
    logoUrl: '/logos/bfc.png',
    accentBg: '#0F172A',
    accentColor: '#F59E0B',
  },
  {
    id: 'ecoban-yarn',
    name: 'Ecoban Yarn',
    category: 'Sustainable Banana Agro-Fiber',
    logoUrl: '/logos/ecoban-yarn.png',
    accentBg: '#FFFFFF',
    accentColor: '#16A34A',
  },
  {
    id: 'manpasand',
    name: 'Manpasand',
    category: 'Thekua',
    logoUrl: '/logos/manpasand.jpg',
    accentBg: '#FAF8F5',
    accentColor: '#5D3A1A',
  },
  {
    id: 'miraluk',
    name: 'MIRALUK',
    category: 'Media, Branding & Signage',
    logoUrl: '/logos/miraluk.png',
    accentBg: '#FFFFFF',
    accentColor: '#E11D48',
  },
  {
    id: 'frootex',
    name: 'FrooteX',
    category: 'B2B Agro Supply & Commerce',
    logoUrl: '/logos/frootex.png',
    accentBg: '#E0F2FE',
    accentColor: '#0284C7',
  },
  {
    id: 'reevoly',
    name: 'Reevoly',
    category: 'Next-Gen Commerce & Retail',
    logoUrl: '/logos/reevoly.png',
    accentBg: '#FFFFFF',
    accentColor: '#F97316',
  },
  {
    id: 'kridanta',
    name: 'KRIDANTA',
    category: 'Sports',
    logoUrl: '/logos/kridanta.png',
    accentBg: '#FFFFFF',
    accentColor: '#1D4ED8',
  },
];

export default function PartnerBrandsTicker() {
  // Render a brand item as an unclickable display badge
  const renderBrand = (brand: BrandPartner, keySuffix: string) => {
    return (
      <div key={`${brand.id}-${keySuffix}`} className={styles.brandCard}>
        <div 
          className={styles.logoBox} 
          style={{ backgroundColor: brand.accentBg, color: brand.accentColor }}
        >
          {brand.logoUrl ? (
            <img 
              src={brand.logoUrl} 
              alt={`${brand.name} logo`} 
              className={styles.logoImg}
            />
          ) : (
            brand.iconSvg || brand.name.charAt(0)
          )}
        </div>
        <div className={styles.brandDetails}>
          <div className={styles.brandNameRow}>
            <span className={styles.brandName}>{brand.name}</span>
          </div>
          <span className={styles.brandCategory}>{brand.category}</span>
        </div>
      </div>
    );
  };

  return (
    <section className={styles.tickerSection} id="partner-brands">
      {/* Glowing Top Accent Bar */}
      <div className={styles.topAccentBar} aria-hidden="true" />

      {/* Edge gradient masks for seamless infinite blend */}
      <div className={styles.maskLeft} aria-hidden="true" />
      <div className={styles.maskRight} aria-hidden="true" />

      {/* Highlighted Section Header */}
      <div className={styles.headerBlock}>
        <div className={styles.headerBadge}>
          <span className={styles.badgeSparkle}>✦</span>
          <span>TRUSTED ECOSYSTEM &amp; STRATEGIC PARTNERS</span>
        </div>
        <h3 className={styles.headingTitle}>
          Associated Brands &amp; Bihar&apos;s Growing Enterprises
        </h3>
        <p className={styles.headingSubtitle}>
          Collaborating with leading innovators, agritech pioneers, investor networks &amp; grassroots founders
        </p>
      </div>

      {/* Continuous Marquee Ticker Track */}
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeTrack}>
          {/* Primary Group */}
          <div className={styles.brandGroup}>
            {PARTNER_BRANDS.map((brand) => renderBrand(brand, 'group-1'))}
          </div>
          {/* Duplicate Group for seamless infinite looping */}
          <div className={styles.brandGroup} aria-hidden="true">
            {PARTNER_BRANDS.map((brand) => renderBrand(brand, 'group-2'))}
          </div>
        </div>
      </div>
    </section>
  );
}
